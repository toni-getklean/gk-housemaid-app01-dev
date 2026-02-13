
import "dotenv/config";
import { db } from "../server/db/client";
import { bookings, bookingPayments, transportationDetails, housemaidEarnings, customerProfiles, housemaids } from "../server/db/schema";
import { getDatabaseService } from "../lib/database";
import { HousemaidEarningsService } from "../server/services/HousemaidEarningsService";
import { eq, desc } from "drizzle-orm";

import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const logPath = path.join(process.cwd(), 'scripts', 'verify-earnings.log');
    const log = (msg: string) => {
        console.log(msg); // Keep console log
        fs.appendFileSync(logPath, msg + '\n');
    };

    fs.writeFileSync(logPath, "🚀 Starting Earnings Verification...\n"); // Reset log
    log("🚀 Starting Earnings Verification...");

    // Log DB URL (Partial)
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    log(`DB URL Configured: ${dbUrl.startsWith("postgres") ? "Yes (postgres...)" : "No (" + dbUrl + ")"}`);

    const databaseService = getDatabaseService();

    // Timeout safety
    setTimeout(() => {
        log("❌ Script timed out after 30s");
        process.exit(1);
    }, 30000);

    try {
        log("🔍 Fetching Housemaid and Customer...");
        // 1. Get a Housemaid and Customer using select() for reliability
        const housemaidsList = await db.select().from(housemaids).limit(1);
        log(`✅ Housemaids fetched: ${housemaidsList.length}`);

        const customersList = await db.select().from(customerProfiles).limit(1);
        log(`✅ Customers fetched: ${customersList.length}`);

        if (housemaidsList.length === 0 || customersList.length === 0) {
            log("❌ No housemaid or customer found. Run seeds.");
            process.exit(1);
        }

        const housemaid = housemaidsList[0];
        const customer = customersList[0];

        log(`👤 Using Housemaid: ${housemaid.name} (ID: ${housemaid.housemaidId})`);

        // 2. Create a Test Booking
        const bookingCode = `TEST-EARN-${Date.now()}`;
        log(`📅 Creating Booking: ${bookingCode}`);

        const [newBooking] = await db.insert(bookings).values({
            bookingCode: bookingCode,
            customerId: customer.customerId,
            housemaidId: housemaid.housemaidId,
            duration: "WHOLE_DAY", // Replaces serviceType
            bookingTypeCode: "ONE_TIME", // Replaces bookingType
            serviceDate: new Date().toISOString().split('T')[0],
            time: "08:00:00",
            statusCode: "pending", // Replaces status
        }).returning();

        // 3. Add Payment (Paid)
        log("💰 Adding Payment Record...");
        await db.insert(bookingPayments).values({
            bookingId: newBooking.bookingId,
            paymentMethodCode: "CASH",
            paymentStatusCode: "PAYMENT_RECEIVED",
            totalAmount: "1390.00",
            paymentDate: new Date(), // Replaces transactionDate
        });

        // 4. Add Transportation (Paid)
        log("🚗 Adding Transportation Record...");
        await db.insert(transportationDetails).values({
            bookingId: newBooking.bookingId,
            housemaidId: housemaid.housemaidId, // Added missing required field
            totalTransportationCost: "150.00",
            paymentStatus: "paid",
            // transportationId removed (generated identity)
        });

        // 5. Complete Booking (Triggers Earnings)
        console.log("✅ Completing Booking (Triggering Earnings Logic)...");
        // This calls HousemaidEarningsService.createEarningFromBooking internally
        await databaseService.updateBookingStatus(newBooking.bookingId, "completed");

        // 6. Verify Earnings
        console.log("🔍 Verifying Earnings Record...");
        const earnings = await db.select().from(housemaidEarnings)
            .where(eq(housemaidEarnings.bookingId, newBooking.bookingId));

        if (earnings.length === 0) {
            console.error("❌ No earning record found!");
        } else {
            const earning = earnings[0];
            console.log("✅ Earning Record Created:");
            console.log(`   ID: ${earning.earningId}`);
            console.log(`   HM Share (Service): ₱${earning.serviceAmount}`);
            console.log(`   Transportation (Direct): ₱${earning.transportationAmount}`);
            console.log(`   Total Earnings (Service Only): ₱${earning.totalAmount}`);
            console.log(`   Points Earned: ${earning.pointsEarned}`);

            // 7. Test Service Retrieval
            console.log("🔍 Testing Service Retrieval...");
            const details = await HousemaidEarningsService.getEarningDetails(earning.earningId);
            if (details) {
                console.log("✅ Service Retrieval Successful!");
                console.log("   Breakdown:", details.calculation);
            } else {
                console.error("❌ Failed to retrieve details via service.");
            }
        }

    } catch (error) {
        console.error("❌ Verification Failed:", error);
    } finally {
        process.exit(0);
    }
}

main();
