import { getDatabaseService } from "../lib/database";
import "dotenv/config";

async function main() {
    console.log("🔍 Diagnosing booking HM26-00180...");

    const bookingCode = "HM26-00180";

    try {
        const databaseService = getDatabaseService();
        const booking = await databaseService.getBookingByCode(bookingCode);

        if (booking) {
            console.log("✅ Booking found!");
            console.log(JSON.stringify({
                bookingCode: booking.bookingCode,
                bookingId: booking.bookingId,
                statusCode: booking.statusCode,
                statusDisplayName: booking.statusDisplayName,
                serviceDate: booking.serviceDate,
                parsedServiceDate: booking.parsedServiceDate,
                time: booking.time,
                customerName: booking.customerName,
            }, null, 2));
        } else {
            console.log("⚠️ Booking not found.");
        }
    } catch (error) {
        console.error("❌ Error fetching booking:");
        console.error(error);
    }

    process.exit(0);
}

main();
