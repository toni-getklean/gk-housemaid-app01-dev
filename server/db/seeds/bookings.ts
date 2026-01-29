import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { bookingPayments } from "@/server/db/schema/bookings/bookingPayments";
import { customerProfiles } from "@/server/db/schema/customer/customerProfiles";
import { customerAddresses } from "@/server/db/schema/customer/customerAddresses";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { getDatabaseService } from "@/lib/database";
import { userAuthAttempts } from "@/server/db/schema/auth/userAuthAttempts";
import { bookingActivityLog } from "@/server/db/schema/bookings/bookingActivityLog";
import { BOOKING_TRACKING_MESSAGES } from "@/lib/bookings";

// Target housemaid ID
const TARGET_HOUSEMAID_ID = "HMAID25-00002";

// Test bookings with different statuses for the workflow
const testBookings = [
    // Existing bookings...
    // Booking 1: NEEDS CONFIRMATION
    {
        customerAccount: "ACC-2024-001",
        statusCode: "needs_confirmation",
        housemaidId: null,
        housemaidName: null,
        serviceDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        time: "9:00AM - 1:00PM",
        serviceTypeCode: "general_cleaning",
        duration: "HALF_DAY", // formerly categoryCode: "4_hours"
        notes: "Test booking - needs_confirmation status",
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1090.00",
        // Pricing V2
        location: "NCR",
        tierCode: "REGULAR",
        bookingType: "ONE_TIME",
        dayType: "WEEKDAY"
    },
    // Booking 2: PENDING REVIEW
    {
        customerAccount: "ACC-2024-002",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        time: "1:00PM - 5:00PM",
        serviceTypeCode: "deep_cleaning",
        duration: "HALF_DAY",
        notes: "Test booking - pending_review status",
        paymentStatus: "AWAITING_PAYMENT",
        location: "CAVITE",
        totalAmount: "900.00"
    },
    // Booking 3: ACCEPTED
    {
        customerAccount: "ACC-2024-001",
        statusCode: "accepted",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        time: "9:00AM - 1:00PM",
        serviceTypeCode: "general_cleaning",
        duration: "HALF_DAY",
        notes: "Test booking - accepted status",
        housemaidAcceptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1090.00"
    },
    // Booking 4: DISPATCHED
    {
        customerAccount: "ACC-2024-003",
        statusCode: "dispatched",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(),
        time: "9:00AM - 1:00PM",
        serviceTypeCode: "office_cleaning",
        duration: "HALF_DAY",
        notes: "Test booking - dispatched status",
        housemaidAcceptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        housemaidDispatchedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        paymentStatus: "PAYMENT_RECEIVED",
        totalAmount: "1090.00"
    },
    // 5 New PENDING REVIEW Bookings
    {
        customerAccount: "ACC-2024-001",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        time: "8:00AM - 12:00PM",
        serviceTypeCode: "general_cleaning",
        duration: "HALF_DAY",
        notes: "Additional Pending Review 1",
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1090.00"
    },
    {
        customerAccount: "ACC-2024-002",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000),
        time: "1:00PM - 5:00PM",
        serviceTypeCode: "deep_cleaning",
        duration: "HALF_DAY",
        notes: "Additional Pending Review 2",
        paymentStatus: "AWAITING_PAYMENT",
        location: "CAVITE",
        totalAmount: "900.00"
    },
    {
        customerAccount: "ACC-2024-003",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        time: "9:00AM - 1:00PM",
        serviceTypeCode: "post_construction",
        duration: "WHOLE_DAY", // Changed to Whole Day for test variety
        notes: "Additional Pending Review 3 - WHOLE_DAY NCR",
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1390.00"
    },
    {
        customerAccount: "ACC-2024-001",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
        time: "2:00PM - 6:00PM",
        serviceTypeCode: "general_cleaning",
        duration: "WHOLE_DAY", // Changed to Whole Day Cavite
        location: "CAVITE",
        notes: "Additional Pending Review 4 - WHOLE_DAY CAVITE",
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1190.00"
    },
    {
        customerAccount: "ACC-2024-002",
        statusCode: "pending_review",
        housemaidId: TARGET_HOUSEMAID_ID,
        housemaidName: "ROSE PANGANIBAN",
        serviceDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        time: "8:00AM - 12:00PM",
        serviceTypeCode: "general_cleaning",
        duration: "HALF_DAY",
        notes: "Additional Pending Review 5",
        paymentStatus: "AWAITING_PAYMENT",
        totalAmount: "1090.00"
    }
];

async function main() {
    console.log("🌱 Seeding bookings and payments...\n");

    // Verify housemaid exists
    const housemaid = await db
        .select()
        .from(housemaids)
        .where(eq(housemaids.housemaidCode, TARGET_HOUSEMAID_ID))
        .limit(1);

    if (housemaid.length === 0) {
        console.error(`❌ Housemaid ${TARGET_HOUSEMAID_ID} not found!`);
        console.log("   Please run: npm run db:seed:housemaids first");
        process.exit(1);
    }

    console.log(`✓ Found housemaid: ${housemaid[0].name} (${TARGET_HOUSEMAID_ID})\n`);

    for (const booking of testBookings) {
        try {
            // Get customer by account number
            const customer = await db
                .select()
                .from(customerProfiles)
                .where(eq(customerProfiles.accountNumber, booking.customerAccount))
                .limit(1);

            if (customer.length === 0) {
                console.log(`⏭️ Skipped: Customer ${booking.customerAccount} not found`);
                continue;
            }

            const customerId = customer[0].customerId;

            // Get customer's primary address
            const customerAddress = await db
                .select()
                .from(customerAddresses)
                .where(eq(customerAddresses.customerId, customerId))
                .limit(1);

            const customerAddressId = customerAddress.length > 0
                ? customerAddress[0].customerAddressId
                : null;

            const now = new Date();

            // Generate Booking Code (e.g., HM25-00001)
            const currentYear = new Date().getFullYear();
            const yy = currentYear.toString().slice(-2);
            const databaseService = getDatabaseService();
            const bookingCode = await databaseService.generateCode(`HM${yy}`);

            // Insert into DB
            const [insertedBooking] = await db.insert(bookings).values({
                bookingCode,
                customerId,
                customerAddressId,

                createdByAdminId: null,
                handledByAdminId: null,
                lastUpdatedByType: "SYSTEM",
                lastUpdatedById: null,

                acquisitionCode: "referral",
                segmentCode: customer[0].primarySegmentCode || "residential",
                branchCode: "MNL",

                bookingDate: now.toISOString().split('T')[0],
                serviceDate: booking.serviceDate.toISOString().split('T')[0],
                originalServiceDate: null,
                rescheduledCount: 0,

                serviceTypeCode: booking.serviceTypeCode,
                duration: booking.duration,
                time: booking.time,

                statusCode: booking.statusCode,
                substatusCode: booking.statusCode === "pending_review" ? "awaiting_housemaid_response" : null,
                substatusNotes: null,

                // Pricing & Specs V2 Fields
                location: (booking as any).location || "NCR",
                tierCode: (booking as any).tierCode || "REGULAR",
                bookingTypeCode: (booking as any).bookingType || "ONE_TIME",
                dayType: (booking as any).dayType || "WEEKDAY",

                asensoPointsAwarded: ['completed'].includes(booking.statusCode) ? 150 : null,

                pricingBreakdown: {
                    basePrice: parseFloat(booking.totalAmount),
                    surgeAmount: 0,
                    currency: "PHP"
                },

                housemaidId: booking.housemaidId ? housemaid[0].housemaidId : null,
                housemaidName: booking.housemaidName,

                // Timestamps based on status
                housemaidAcceptedAt: ['accepted', 'dispatched', 'on_the_way', 'arrived', 'in_progress', 'completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() // Accepted 1 day ago
                    : null,
                housemaidDispatchedAt: ['dispatched', 'on_the_way', 'arrived', 'in_progress', 'completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // Dispatched 2 hours ago
                    : null,
                housemaidDepartedAt: ['on_the_way', 'arrived', 'in_progress', 'completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 90 * 60 * 1000).toISOString() // Departed 1.5 hours ago
                    : null,
                housemaidArrivedAt: ['arrived', 'in_progress', 'completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 60 * 60 * 1000).toISOString() // Arrived 1 hour ago
                    : null,
                housemaidCheckInTime: ['in_progress', 'completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 45 * 60 * 1000).toISOString() // Checked in 45 mins ago
                    : null,
                housemaidCheckOutTime: ['completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 15 * 60 * 1000).toISOString() // Checked out 15 mins ago
                    : null,
                housemaidCompletedAt: ['completed'].includes(booking.statusCode)
                    ? new Date(now.getTime() - 15 * 60 * 1000).toISOString() // Completed 15 mins ago
                    : null,

                proofOfArrivalImg: null,
                proofOfArrivalData: null,
                transportationId: null,

                notes: booking.notes,
                extraNotes: null,

                createdAt: now,
                updatedAt: now,
                dateModified: now,
            }).returning({ bookingId: bookings.bookingId });

            console.log(`✓ Created Booking: ${bookingCode}`);

            // Create Booking Payment Record
            if (insertedBooking) {
                await db.insert(bookingPayments).values({
                    bookingId: insertedBooking.bookingId,

                    paymentSourceCode: "CUSTOMER_DIRECT",
                    paymentMethodCode: "CASH",
                    paymentStatusCode: booking.paymentStatus,
                    validationStatusCode: "PENDING",

                    settlementTypeCode: "DIRECT_TO_HM",

                    originalAmount: booking.totalAmount,
                    totalAmount: booking.totalAmount,
                    amountPaid: booking.paymentStatus === "PAYMENT_RECEIVED" ? booking.totalAmount : "0.00",
                    balanceAmount: booking.paymentStatus === "PAYMENT_RECEIVED" ? "0.00" : booking.totalAmount,

                    createdAt: now,
                    updatedAt: now
                });
                console.log(`  ✓ Created Payment Record`);
            }

            // 3. Populate Activity Log History
            if (insertedBooking) {
                const statusWorkflow = ['needs_confirmation', 'pending_review', 'accepted', 'dispatched', 'on_the_way', 'arrived', 'in_progress', 'completed'];
                const currentIndex = statusWorkflow.indexOf(booking.statusCode);

                if (currentIndex !== -1) {
                    for (let i = 0; i <= currentIndex; i++) {
                        const historyStatus = statusWorkflow[i];
                        const msgDef = BOOKING_TRACKING_MESSAGES[historyStatus];

                        // Skip if no message defined (though all should have one)
                        if (!msgDef) continue;

                        let logTime = now;
                        // Match timestamps with those used in booking creation
                        if (historyStatus === 'accepted') logTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                        if (historyStatus === 'dispatched') logTime = new Date(now.getTime() - 2 * 60 * 60 * 1000);
                        if (historyStatus === 'on_the_way') logTime = new Date(now.getTime() - 90 * 60 * 1000); // departed
                        if (historyStatus === 'arrived') logTime = new Date(now.getTime() - 60 * 60 * 1000);
                        if (historyStatus === 'in_progress') logTime = new Date(now.getTime() - 45 * 60 * 1000);
                        if (historyStatus === 'completed') logTime = new Date(now.getTime() - 15 * 60 * 1000);

                        // For statuses before 'accepted', assume some prior time
                        if (historyStatus === 'needs_confirmation') logTime = new Date(now.getTime() - 48 * 60 * 60 * 1000);
                        if (historyStatus === 'pending_review') logTime = new Date(now.getTime() - 36 * 60 * 60 * 1000);

                        await db.insert(bookingActivityLog).values({
                            bookingId: insertedBooking.bookingId,
                            actorType: historyStatus === 'needs_confirmation' || historyStatus === 'pending_review' ? "system" : "housemaid",
                            actorId: historyStatus === 'needs_confirmation' || historyStatus === 'pending_review' ? "0" : (housemaid[0]?.housemaidId?.toString() || "0"),
                            audience: "housemaid",
                            action: "STATUS_CHANGE",
                            statusCode: historyStatus,
                            title: msgDef.title,
                            message: msgDef.message,
                            createdAt: logTime
                        });
                    }
                    console.log(`  ✓ Populated Activity Logs up to ${booking.statusCode}`);
                }
            }

        } catch (error) {
            console.error(`❌ Error creating booking/payment:`, error);
        }
    }

    console.log("✅ Bookings and Payments seed complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding bookings:", err);
    process.exit(1);
});
