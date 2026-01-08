import "dotenv/config";
import { db } from "@/server/db/client";
import { bookingDeclineReason } from "@/server/db/schema/lookups/bookingDeclineReason";
import { eq } from "drizzle-orm";

const bookingDeclineReasonData = [
    { code: "NOT_AVAILABLE", displayName: "Not Available" },
    { code: "SCHEDULE_CONFLICT", displayName: "Schedule Conflict" },
    { code: "LOCATION_TOO_FAR", displayName: "Location Too Far" },
    { code: "PERSONAL_REASON", displayName: "Personal Reason" },
    { code: "OTHER", displayName: "Other" },
];

async function main() {
    console.log("🌱 Seeding booking_decline_reason...");

    for (const row of bookingDeclineReasonData) {
        const existing = await db
            .select()
            .from(bookingDeclineReason)
            .where(eq(bookingDeclineReason.code, row.code));

        if (existing.length === 0) {
            await db.insert(bookingDeclineReason).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: booking_decline_reason");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding booking_decline_reason:", err);
    process.exit(1);
});
