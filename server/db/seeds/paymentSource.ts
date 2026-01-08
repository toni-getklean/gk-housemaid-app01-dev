import "dotenv/config";
import { db } from "@/server/db/client";
import { paymentSource } from "@/server/db/schema/lookups/paymentSource";
import { eq } from "drizzle-orm";

const data = [
    { code: "CUSTOMER_DIRECT", displayName: "Customer Direct" },
    { code: "CUSTOMER_TO_PARTNER", displayName: "Customer to Partner" },
    { code: "CUSTOMER_TO_FREELANCER", displayName: "Customer to Freelancer" },
    { code: "MARKETING_CAMPAIGN", displayName: "Marketing Campaign" },
];

async function main() {
    console.log("🌱 Seeding payment_source...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(paymentSource)
            .where(eq(paymentSource.code, row.code));

        if (existing.length === 0) {
            await db.insert(paymentSource).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: payment_source");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding payment_source:", err);
    process.exit(1);
});
