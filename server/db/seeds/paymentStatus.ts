import "dotenv/config";

import { db } from "@/server/db/client";
import { paymentStatus } from "@/server/db/schema/lookups/paymentStatus";
import { eq } from "drizzle-orm";

const paymentStatusData = [
    {
        statusCode: "PENDING",
        displayName: "Pending",
        statusType: "Pending",
        statusDescription: "Awaiting confirmation or bank clearance.",
    },
    {
        statusCode: "FOR_BILLING",
        displayName: "For Billing",
        statusType: "Pending",
        statusDescription: "Invoice sent, awaiting payment receipt.",
    },
    {
        statusCode: "AWAITING_PAYMENT",
        displayName: "Awaiting Payment",
        statusType: "Pending",
        statusDescription: "Service done, waiting for payment.",
    },
    {
        statusCode: "PAYMENT_RECEIVED",
        displayName: "Payment Received",
        statusType: "Pending",
        statusDescription: "Payment has been received but not yet validated.",
    },
    {
        statusCode: "PAYMENT_UNDER_VERIFICATION",
        displayName: "Payment Under Verification",
        statusType: "Pending",
        statusDescription: "Payment is currently being verified.",
    },
    {
        statusCode: "PAYMENT_VERIFIED",
        displayName: "Payment Verified",
        statusType: "Success",
        statusDescription: "Full payment has been verified.",
    },
    {
        statusCode: "PAYMENT_REFUNDED",
        displayName: "Payment Refunded",
        statusType: "Failure", // Or Refund
        statusDescription: "Full payment was refunded.",
    },
    {
        statusCode: "FAILED",
        displayName: "Failed",
        statusType: "Failure",
        statusDescription: "Payment attempt failed or declined.",
    },
    {
        statusCode: "OVERDUE",
        displayName: "Overdue",
        statusType: "Failure",
        statusDescription: "Payment is past due date.",
    },
];

async function main() {
    console.log("🌱 Seeding payment_status...");

    for (const row of paymentStatusData) {
        const existing = await db
            .select()
            .from(paymentStatus)
            .where(eq(paymentStatus.statusCode, row.statusCode));

        if (existing.length === 0) {
            await db.insert(paymentStatus).values(row);
            console.log(`Inserted → ${row.statusCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.statusCode}`);
        }
    }

    console.log("✅ Seed complete: payment_status");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding payment_status:", err);
    process.exit(1);
});
