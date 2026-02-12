import "dotenv/config";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { bookingPayments } from "@/server/db/schema/bookings/bookingPayments";
import { transportationDetails } from "@/server/db/schema/transportation/transportationDetails";
import { transportationLegs } from "@/server/db/schema/transportation/transportationLegs";
import { bookingActivityLog } from "@/server/db/schema/bookings/bookingActivityLog";
import { housemaidEarnings } from "@/server/db/schema/housemaid/housemaidEarnings";

async function main() {
    console.log("🔥 resetting bookings data...");

    try {
        // Delete in order to respect Foreign Key constraints

        // 1. Child tables first
        console.log("Deleting booking audit logs...");
        await db.delete(bookingActivityLog);

        console.log("Deleting booking payments...");
        await db.delete(bookingPayments);

        console.log("Deleting housemaid earnings...");
        await db.delete(housemaidEarnings);

        console.log("Deleting transportation legs...");
        await db.delete(transportationLegs);

        console.log("Deleting transportation details...");
        await db.delete(transportationDetails);

        // 2. Parent table last
        console.log("Deleting bookings...");
        await db.delete(bookings);

        console.log("\n✅ All booking records and related data have been removed.");
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
