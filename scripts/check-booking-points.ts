
import { getDatabaseService } from "../lib/database";
import { bookings } from "../server/db/schema";
import { eq } from "drizzle-orm";
import { db } from "../server/db";

async function checkBooking(code: string) {
    console.log(`Checking booking ${code}...`);
    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.bookingCode, code)
        });

        if (!booking) {
            console.log("Booking not found");
            return;
        }

        console.log("Booking Details:");
        console.log(`- ID: ${booking.bookingId}`);
        console.log(`- Status: ${booking.statusCode}`);
        console.log(`- Asenso Points Awarded: ${booking.asensoPointsAwarded}`);
        console.log(`- Booking Type: ${booking.bookingTypeCode}`);

    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

const code = process.argv[2];
if (!code) {
    console.log("Please provide a booking code");
    process.exit(1);
}

checkBooking(code);
