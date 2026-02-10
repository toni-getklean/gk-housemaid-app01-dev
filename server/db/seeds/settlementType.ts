import "dotenv/config";
import { db } from "@/server/db/client";
import { settlementType } from "@/server/db/schema/lookups/settlementType";
import { eq } from "drizzle-orm";

const data = [
    { code: "DIRECT_TO_HM", displayName: "Direct to Housemaid" },
    { code: "PAID_TO_GK", displayName: "Paid to GetKlean" },
    { code: "INTERNAL_CHARGE", displayName: "Internal Charge" },
    { code: "WAIVED", displayName: "Waived" },
];

async function main() {
    console.log("🌱 Seeding settlement_type...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(settlementType)
            .where(eq(settlementType.code, row.code));

        if (existing.length === 0) {
            await db.insert(settlementType).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: settlement_type");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding settlement_type:", err);
    process.exit(1);
});
