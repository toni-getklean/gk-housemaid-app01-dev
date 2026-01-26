import { db } from "@/server/db";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { asensoTransactions } from "@/server/db/schema/housemaid/asensoTransactions";
import { eq, and, sql } from "drizzle-orm";

export class AsensoService {
    private static POINTS_MAP: Record<string, number> = {
        "TRIAL": 150,
        "ONE_TIME": 150,
        "FLEXI": 300
    };

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
        if (booking.statusCode !== "completed") return; // Only award on completion
        if (!booking.housemaidId) return; // Need a housemaid to award

        const bookingType = booking.bookingTypeCode; // Ensure this field is populated in DB
        const pointsToAward = this.POINTS_MAP[bookingType || "ONE_TIME"] || 0; // Default or 0? Spec says 150/300.

        if (pointsToAward === 0) return;

        // 2. Idempotency Check
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

        // 3. Transaction Block (Insert + Update Balance)
        await db.transaction(async (tx) => {
            // Create Ledger Entry
            await tx.insert(asensoTransactions).values({
                housemaidId: booking.housemaidId!,
                bookingId: booking.bookingId,
                points: pointsToAward,
                transactionType: "EARN_BOOKING",
                notes: `Completed ${bookingType} booking`,
            });

            // Update Housemaid Balance
            await tx.update(housemaids)
                .set({
                    asensoPointsBalance: sql`${housemaids.asensoPointsBalance} + ${pointsToAward}`
                })
                .where(eq(housemaids.housemaidId, booking.housemaidId!));

            // Update Booking metadata
            await tx.update(bookings)
                .set({ asensoPointsAwarded: pointsToAward })
                .where(eq(bookings.bookingId, bookingId));
        });

        console.log(`Awarded ${pointsToAward} points to Housemaid ${booking.housemaidId}`);
    }
}
