import "dotenv/config";

import { db } from "@/server/db/client";
import { serviceType } from "@/server/db/schema/lookups/serviceType";
import { eq } from "drizzle-orm";

const serviceTypeData = [
    { serviceTypeCode: "whole_day", serviceDisplayName: "WHOLE DAY", durationCategory: "Whole Day", bookingFrequency: "Standard" },
    { serviceTypeCode: "half_day", serviceDisplayName: "HALF DAY", durationCategory: "Half Day", bookingFrequency: "Standard" },
    { serviceTypeCode: "fixed_whole_day", serviceDisplayName: "FIXED WHOLE DAY", durationCategory: "Whole Day", bookingFrequency: "Fixed/Recurring" },
    { serviceTypeCode: "fixed_half_day", serviceDisplayName: "FIXED HALF DAY", durationCategory: "Half Day", bookingFrequency: "Fixed/Recurring" },
    { serviceTypeCode: "one_time_whole_day", serviceDisplayName: "ONE-TIME WHOLEDAY", durationCategory: "Whole Day", bookingFrequency: "One-Time" },
    { serviceTypeCode: "one_time_half_day", serviceDisplayName: "ONE-TIME HALF DAY", durationCategory: "Half Day", bookingFrequency: "One-Time" },
    { serviceTypeCode: "trial_whole_day", serviceDisplayName: "TRIAL - WHOLE DAY", durationCategory: "Whole Day", bookingFrequency: "Trial" },
    { serviceTypeCode: "trial_half_day", serviceDisplayName: "TRIAL - HALF DAY", durationCategory: "Half Day", bookingFrequency: "Trial" },
    { serviceTypeCode: "trial_whole_day_1", serviceDisplayName: "TRIAL - WHOLEDAY 1", durationCategory: "Whole Day", bookingFrequency: "Trial (Specific 1)" },
    { serviceTypeCode: "trial_whole_day_2", serviceDisplayName: "TRIAL - WHOLEDAY 2", durationCategory: "Whole Day", bookingFrequency: "Trial (Specific 2)" },
    { serviceTypeCode: "trial_whole_day_3", serviceDisplayName: "TRIAL - WHOLEDAY 3", durationCategory: "Whole Day", bookingFrequency: "Trial (Specific 3)" },
];

async function main() {
    console.log("🌱 Seeding service_type...");

    for (const row of serviceTypeData) {
        const existing = await db
            .select()
            .from(serviceType)
            .where(eq(serviceType.serviceTypeCode, row.serviceTypeCode));

        if (existing.length === 0) {
            await db.insert(serviceType).values(row);
            console.log(`Inserted → ${row.serviceTypeCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.serviceTypeCode}`);
        }
    }

    console.log("✅ Seed complete: service_type");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding service_type:", err);
    process.exit(1);
});
