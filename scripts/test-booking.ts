import { getDatabaseService } from "../lib/database";
import "dotenv/config";

async function main() {
    console.log("🔍 Testing getBookingByCode...");

    // Use a hardcoded Code from the seed (e.g., HM25-00001) or a known one
    const bookingCode = "HM25-00001";

    try {
        const databaseService = getDatabaseService();
        const booking = await databaseService.getBookingByCode(bookingCode);

        if (booking) {
            console.log("✅ Booking found!");
            console.log("Code:", booking.bookingCode);
            console.log("ID:", booking.bookingId);
            console.log("Customer:", booking.customerName);
            console.log("Payment Method:", booking.paymentMethod);
            console.log("Status:", booking.statusDisplayName);
        } else {
            console.log("⚠️ Booking not found. Try running seeds first?");
        }
    } catch (error) {
        console.error("❌ Error fetching booking:");
        console.error(error);
    }

    process.exit(0);
}

main();
