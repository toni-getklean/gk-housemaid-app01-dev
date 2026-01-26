
import { db } from "../server/db";
import { bookings } from "../server/db/schema";
import { eq } from "drizzle-orm";
import * as fs from 'fs';

async function checkBooking(code: string) {
    const logPath = 'booking_check.log';
    fs.writeFileSync(logPath, `Checking booking ${code}...\n`);

    try {
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.bookingCode, code)
        });

        if (!booking) {
            fs.appendFileSync(logPath, "Booking not found\n");
            return;
        }

        fs.appendFileSync(logPath, "Booking Details:\n");
        fs.appendFileSync(logPath, `- ID: ${booking.bookingId}\n`);
        fs.appendFileSync(logPath, `- Status: ${booking.statusCode}\n`);
        fs.appendFileSync(logPath, `- Asenso Points Awarded: ${booking.asensoPointsAwarded}\n`);
        fs.appendFileSync(logPath, `- Booking Type: ${booking.bookingTypeCode}\n`);

    } catch (error) {
        fs.appendFileSync(logPath, `Error: ${error}\n`);
    }
    process.exit(0);
}

const code = process.argv[2];
checkBooking(code || 'HM26-00003');
