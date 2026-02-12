import "dotenv/config";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { bookingPayments } from "@/server/db/schema/bookings/bookingPayments";
import { transportationDetails } from "@/server/db/schema/transportation/transportationDetails";
import { transportationLegs } from "@/server/db/schema/transportation/transportationLegs";
import { bookingActivityLog } from "@/server/db/schema/bookings/bookingActivityLog";
import { housemaidEarnings } from "@/server/db/schema/housemaid/housemaidEarnings";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { eq, inArray } from "drizzle-orm";

const TARGET_HOUSEMAID_CODE = "HMAID25-00002";

async function main() {
    console.log(`🔥 Resetting bookings data for housemaid: ${TARGET_HOUSEMAID_CODE}...`);

    try {
        // 1. Get Housemaid ID
        const housemaid = await db.query.housemaids.findFirst({
            where: eq(housemaids.housemaidCode, TARGET_HOUSEMAID_CODE),
            columns: {
                housemaidId: true
            }
        });

        if (!housemaid) {
            console.log(`⚠️ Housemaid ${TARGET_HOUSEMAID_CODE} not found. Nothing to delete.`);
            process.exit(0);
        }

        const housemaidId = housemaid.housemaidId;
        console.log(`   Found Housemaid ID: ${housemaidId}`);

        // 2. Get all bookings for this housemaid
        const housemaidBookings = await db.query.bookings.findMany({
            where: eq(bookings.housemaidId, housemaidId),
            columns: {
                bookingId: true
            }
        });

        if (housemaidBookings.length === 0) {
            console.log(`⚠️ No bookings found for ${TARGET_HOUSEMAID_CODE}.`);
        } else {
            const bookingIds = housemaidBookings.map(b => b.bookingId);
            console.log(`   Found ${bookingIds.length} bookings to delete.`);

            // 3. Delete Child Tables (using bookingIds)

            // Booking Activity Logs
            const deletedLogs = await db.delete(bookingActivityLog)
                .where(inArray(bookingActivityLog.bookingId, bookingIds))
                .returning({ id: bookingActivityLog.bookingActivityId });
            console.log(`   Deleted ${deletedLogs.length} booking audit logs...`);

            // Booking Payments
            const deletedPayments = await db.delete(bookingPayments)
                .where(inArray(bookingPayments.bookingId, bookingIds))
                .returning({ id: bookingPayments.paymentId });
            console.log(`   Deleted ${deletedPayments.length} booking payments...`);

            // Housemaid Earnings (linked by bookingId)
            const deletedEarnings = await db.delete(housemaidEarnings)
                .where(inArray(housemaidEarnings.bookingId, bookingIds))
                .returning({ id: housemaidEarnings.earningId });
            console.log(`   Deleted ${deletedEarnings.length} housemaid earnings...`);

            // Also check for earnings that might be linked only by housemaidId but not bookingId (unlikely in this context but good for cleanup)
            const deletedOrphanedEarnings = await db.delete(housemaidEarnings)
                .where(eq(housemaidEarnings.housemaidId, housemaidId))
                .returning({ id: housemaidEarnings.earningId });
            if (deletedOrphanedEarnings.length > deletedEarnings.length) {
                console.log(`   Deleted ${deletedOrphanedEarnings.length - deletedEarnings.length} additional orphaned earnings...`);
            }

            // Transportation
            // First get transportation IDs linked to these bookings
            const transports = await db.query.transportationDetails.findMany({
                where: inArray(transportationDetails.bookingId, bookingIds),
                columns: {
                    transportationId: true
                }
            });

            if (transports.length > 0) {
                const transportIds = transports.map(t => t.transportationId);

                // Delete Legs
                const deletedLegs = await db.delete(transportationLegs)
                    .where(inArray(transportationLegs.transportationId, transportIds))
                    .returning({ id: transportationLegs.transportationLegId });
                console.log(`   Deleted ${deletedLegs.length} transportation legs...`);

                // Delete Details
                const deletedTransDetails = await db.delete(transportationDetails)
                    .where(inArray(transportationDetails.transportationId, transportIds))
                    .returning({ id: transportationDetails.transportationId });
                console.log(`   Deleted ${deletedTransDetails.length} transportation details...`);
            }

            // 4. Delete Bookings
            const deletedBookings = await db.delete(bookings)
                .where(inArray(bookings.bookingId, bookingIds))
                .returning({ id: bookings.bookingId });
            console.log(`   Deleted ${deletedBookings.length} bookings...`);
        }

        console.log(`\n✅ Successfully removed data for ${TARGET_HOUSEMAID_CODE}.`);

    } catch (error) {
        console.error("❌ Error resetting bookings:", error);
        process.exit(1);
    }

    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
});
