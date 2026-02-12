import { db } from "@/server/db";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { asensoTransactions } from "@/server/db/schema/housemaid/asensoTransactions";
import { asensoPointsConfig } from "@/server/db/schema/housemaid/asensoPointsConfig";
import { housemaidEarnings } from "@/server/db/schema/housemaid/housemaidEarnings";
import { eq, and, sql } from "drizzle-orm";

export class AsensoService {
    // Simple in-memory cache for points config
    private static pointsCache: Record<string, number> | null = null;
    private static cacheTimestamp: number = 0;
    private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

    /**
     * Loads points-per-booking-type from the asenso_points_config DB table.
     * Cached for 5 minutes to avoid repeated queries.
     */
    private static async getPointsMap(): Promise<Record<string, number>> {
        const now = Date.now();
        if (this.pointsCache && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
            return this.pointsCache;
        }

        const rows = await db.select().from(asensoPointsConfig);
        const map: Record<string, number> = {};
        for (const row of rows) {
            map[row.bookingTypeCode] = row.pointsAwarded;
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
        // 1. Fetch Booking Details
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.bookingId, bookingId),
        });

        if (!booking) throw new Error(`Booking ${bookingId} not found`);
        // if (booking.statusCode != "completed") return; // Only award on completion
        if (!booking.housemaidId) return; // Need a housemaid to award

        // 2. Get points from DB config
        const pointsMap = await this.getPointsMap();
        const bookingType = booking.bookingTypeCode;
        const pointsToAward = pointsMap[bookingType || "ONE_TIME"] || 150; // Fallback to 150

        if (pointsToAward === 0) return;

        // 3. Idempotency Check
        const existingTx = await db.query.asensoTransactions.findFirst({
            where: and(
                eq(asensoTransactions.bookingId, bookingId),
                eq(asensoTransactions.transactionType, "EARN_BOOKING")
            )
        });

        if (existingTx) {
            console.log(`Points already awarded for booking ${bookingId}`);
            return;
        }

        // 4. Transaction Block (Insert + Update Balance)
        // NOTE: Removed db.transaction() because neon-http driver does not support it.
        // Executing sequentially instead.

        // Create Ledger Entry
        await db.insert(asensoTransactions).values({
            housemaidId: booking.housemaidId!,
            bookingId: booking.bookingId,
            points: pointsToAward,
            transactionType: "EARN_BOOKING",
            notes: `Completed ${bookingType} booking`,
        });

        // Update Housemaid Balance
        await db.update(housemaids)
            .set({
                asensoPointsBalance: sql`${housemaids.asensoPointsBalance} + ${pointsToAward}`
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

