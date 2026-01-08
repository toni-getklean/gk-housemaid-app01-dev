import "dotenv/config";
import { db } from "@/server/db/client";
import { validationStatus } from "@/server/db/schema/lookups/validationStatus";
import { eq } from "drizzle-orm";

const data = [
    { code: "PENDING", displayName: "Pending" },
    { code: "VALIDATED", displayName: "Validated" },
];

async function main() {
    console.log("🌱 Seeding validation_status...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(validationStatus)
            .where(eq(validationStatus.code, row.code));

        if (existing.length === 0) {
            await db.insert(validationStatus).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: validation_status");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding validation_status:", err);
    process.exit(1);
});
