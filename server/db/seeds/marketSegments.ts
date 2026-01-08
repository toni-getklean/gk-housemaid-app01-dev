import "dotenv/config";
import { db } from "@/server/db/client";
import { marketSegment } from "@/server/db/schema/lookups/marketSegment";
import { eq } from "drizzle-orm";

const seedData = [
    { segmentCode: "house", segmentDisplayName: "HOUSE", segmentType: "Residential" },
    { segmentCode: "condo", segmentDisplayName: "CONDO", segmentType: "Residential" },
    { segmentCode: "apartment", segmentDisplayName: "APARTMENT", segmentType: "Residential" },
    { segmentCode: "office", segmentDisplayName: "OFFICE", segmentType: "Commercial" },
    { segmentCode: "hotel", segmentDisplayName: "HOTEL", segmentType: "Hospitality" },
    { segmentCode: "school", segmentDisplayName: "SCHOOL", segmentType: "Commercial/Institutional" },
];

async function main() {
    console.log("🌱 Seeding market_segment...");

    for (const row of seedData) {
        // Check if segment already exists (avoid duplicates)
        const existing = await db
            .select()
            .from(marketSegment)
            .where(eq(marketSegment.segmentCode, row.segmentCode));

        if (existing.length === 0) {
            await db.insert(marketSegment).values(row);
            console.log(`Inserted → ${row.segmentCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.segmentCode}`);
        }
    }

    console.log("✅ Seed complete: market_segment");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding market_segment:", err);
    process.exit(1);
});
