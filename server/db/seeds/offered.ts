import "dotenv/config";

import { db } from "@/server/db/client";
import { offered } from "@/server/db/schema/lookups/offered";
import { eq } from "drizzle-orm";

const offeredData = [
    { offerCode: "discount", offerDisplayName: "DISCOUNT", offerType: "Pricing Adjustment" },
    { offerCode: "complimentary", offerDisplayName: "COMPLIMENTARY", offerType: "Service/Pricing Adjustment" },
    { offerCode: "hm_incentive", offerDisplayName: "HM INCENTIVE", offerType: "Housemaid Incentive" },
    { offerCode: "trial_rate", offerDisplayName: "TRIAL RATE", offerType: "Pricing Adjustment" },
    { offerCode: "advanced_payment", offerDisplayName: "ADVANCED PAYMENT", offerType: "Payment Arrangement" },
];

async function main() {
    console.log("🌱 Seeding offered...");

    for (const row of offeredData) {
        const existing = await db
            .select()
            .from(offered)
            .where(eq(offered.offerCode, row.offerCode));

        if (existing.length === 0) {
            await db.insert(offered).values(row);
            console.log(`Inserted → ${row.offerCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.offerCode}`);
        }
    }

    console.log("✅ Seed complete: offered");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding offered:", err);
    process.exit(1);
});
