import "dotenv/config";
import { db } from "@/server/db/client";
import { sourceInstitution } from "@/server/db/schema/lookups/sourceInstitution";
import { eq } from "drizzle-orm";

const data = [
    { code: "BPI", displayName: "Bank of the Philippine Islands (BPI)" },
    { code: "BDO", displayName: "Banco de Oro (BDO)" },
    { code: "METROBANK", displayName: "Metrobank" },
    { code: "CIMB", displayName: "CIMB Bank" },
    { code: "LANDBANK", displayName: "Landbank" },
    { code: "UNIONBANK", displayName: "UnionBank" },
];

async function main() {
    console.log("🌱 Seeding source_institution...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(sourceInstitution)
            .where(eq(sourceInstitution.code, row.code));

        if (existing.length === 0) {
            await db.insert(sourceInstitution).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: source_institution");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding source_institution:", err);
    process.exit(1);
});
