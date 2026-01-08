import "dotenv/config";

import { db } from "@/server/db/client";
import { serviceCategory } from "@/server/db/schema/lookups/serviceCategory";
import { eq } from "drizzle-orm";

const serviceCategoryData = [
    { categoryCode: "housekeeping", categoryDisplayName: "HOUSEKEEPING" },
    { categoryCode: "laundry", categoryDisplayName: "LAUNDRY" },
    { categoryCode: "ironing", categoryDisplayName: "IRONING" },
    { categoryCode: "cooking", categoryDisplayName: "COOKING" },
    { categoryCode: "kitchencare", categoryDisplayName: "KITCHENCARE" },
    { categoryCode: "childcare", categoryDisplayName: "CHILDCARE" },
    { categoryCode: "elderly_care", categoryDisplayName: "ELDERLY CARE" },
    { categoryCode: "gardening", categoryDisplayName: "GARDENING" },
    { categoryCode: "outdoor_care", categoryDisplayName: "OUTDOOR CARE" },
    { categoryCode: "pet_care", categoryDisplayName: "PET CARE" },
    { categoryCode: "all_around", categoryDisplayName: "ALL AROUND" },
];

async function main() {
    console.log("🌱 Seeding service_category...");

    for (const row of serviceCategoryData) {
        const existing = await db
            .select()
            .from(serviceCategory)
            .where(eq(serviceCategory.categoryCode, row.categoryCode));

        if (existing.length === 0) {
            await db.insert(serviceCategory).values(row);
            console.log(`Inserted → ${row.categoryCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.categoryCode}`);
        }
    }

    console.log("✅ Seed complete: service_category");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding service_category:", err);
    process.exit(1);
});
