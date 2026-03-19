import { db } from "@/server/db";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { asensoTransactions } from "@/server/db/schema/housemaid/asensoTransactions";
import { asensoPointsConfig } from "@/server/db/schema/housemaid/asensoPointsConfig";
import { housemaidEarnings } from "@/server/db/schema/housemaid/housemaidEarnings";
import { eq, and, desc, sql } from "drizzle-orm";

type AsensoConfigEntry = {
    id: number;
    pointsAwarded: number;
};

export class AsensoService {
    // Simple in-memory cache for points config, keyed by "eventType:bookingTypeCode:serviceType"
    private static pointsCache: Record<string, AsensoConfigEntry> | null = null;
    private static cacheTimestamp: number = 0;
    private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    /**
     * Loads points-per-booking-type from the asenso_points_config DB table.
     * Cached for 5 minutes to avoid repeated queries.
     */
    private static async getPointsMap(): Promise<Record<string, AsensoConfigEntry>> {
        const now = Date.now();
        if (this.pointsCache && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
            return this.pointsCache;
        }

        const rows = await db.select().from(asensoPointsConfig);
        const map: Record<string, AsensoConfigEntry> = {};
        for (const row of rows) {
            const key = `${row.eventType}:${row.bookingTypeCode || 'any'}:${row.serviceType || 'any'}`.toLowerCase();
            map[key] = {
                id: row.id,
                pointsAwarded: row.pointsAwarded
            };
        }

        this.pointsCache = map;
        this.cacheTimestamp = now;
        console.log("[AsensoService] Points config loaded from DB:", map);
        return map;
    }

    /**
     * Awards points to a housemaid for a completed booking.
     * Idempotent: safe to call multiple times for the same booking.
     */
    static async awardPointsForBooking(bookingId: number) {
        // 1. Fetch Booking Details and associated Housemaid
        const bookingData = await db
            .select({
                booking: bookings,
                housemaid: housemaids
            })
            .from(bookings)
            .leftJoin(housemaids, eq(bookings.housemaidId, housemaids.housemaidId))
            .where(eq(bookings.bookingId, bookingId))
            .limit(1);

        if (bookingData.length === 0) throw new Error(`Booking ${bookingId} not found`);
        
        const booking = bookingData[0].booking;
        const housemaid = bookingData[0].housemaid;

        // if (booking.statusCode != "completed") return; // Only award on completion
        if (!booking.housemaidId || !housemaid) return; // Need a housemaid to award

        // 2. Get points from DB config
        const pointsMap = await this.getPointsMap();
        const bookingType = booking.bookingTypeCode || "ONE_TIME";
        
        // Match user requested tier codes from serviceSkus to matching text (Regular, Plus, All-in -> regular, plus, all_in)
        let serviceType = "regular";
        if (housemaid.currentServiceTierCode === "PLUS") serviceType = "plus";
        if (housemaid.currentServiceTierCode === "ALL_IN") serviceType = "all_in";

        const cacheKey = `booking_completed:${bookingType}:${serviceType}`.toLowerCase();
        const configEntry = pointsMap[cacheKey] || pointsMap[`booking_completed:any:any`];
        
        const pointsToAward = configEntry?.pointsAwarded || 0;
        const configId = configEntry?.id || null;

        if (pointsToAward === 0) return;

        // 3. Idempotency Check
        const existingTx = await db.query.asensoTransactions.findFirst({
            where: and(
                eq(asensoTransactions.bookingId, bookingId),
                eq(asensoTransactions.eventType, "BOOKING_COMPLETED")
            )
        });

        if (existingTx) {
            console.log(`Points already awarded for booking ${bookingId}`);
            return;
        }

        // 4. Calculate Final Balance 
        const newBalance = (housemaid.asensoPointsBalance || 0) + pointsToAward;

        // 5. Transaction Block (Insert + Update Balance)
        // NOTE: Executing sequentially instead since neon-http driver does not support transaction().

        // Create Ledger Entry
        await db.insert(asensoTransactions).values({
            housemaidId: booking.housemaidId!,
            bookingId: booking.bookingId,
            points: pointsToAward,
            eventType: "BOOKING_COMPLETED",
            bookingTypeCode: bookingType,
            serviceType: serviceType,
            configId: configId,
            transactionType: "EARN",
            balanceAfter: newBalance,
            notes: `Completed ${bookingType} booking - ${serviceType} tier`,
        });

        // Update Housemaid Balance
        await db.update(housemaids)
            .set({
                asensoPointsBalance: newBalance
            })
            .where(eq(housemaids.housemaidId, booking.housemaidId!));

        // Update Booking metadata
        await db.update(bookings)
            .set({ asensoPointsAwarded: pointsToAward })
            .where(eq(bookings.bookingId, bookingId));

        // Update Housemaid Earnings Record
        await db.update(housemaidEarnings)
            .set({ pointsEarned: pointsToAward })
            .where(eq(housemaidEarnings.bookingId, bookingId));

        console.log(`Awarded ${pointsToAward} points to Housemaid ${booking.housemaidId}`);
    }
}

