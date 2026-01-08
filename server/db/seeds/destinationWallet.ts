import "dotenv/config";
import { db } from "@/server/db/client";
import { destinationWallet } from "@/server/db/schema/lookups/destinationWallet";
import { eq } from "drizzle-orm";

const data = [
    { code: "GCASH", displayName: "GCash" },
    { code: "AUB", displayName: "Asia United Bank (AUB)" },
    { code: "MAYA", displayName: "Maya" },
];

async function main() {
    console.log("🌱 Seeding destination_wallet...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(destinationWallet)
            .where(eq(destinationWallet.code, row.code));

        if (existing.length === 0) {
            await db.insert(destinationWallet).values(row);
            console.log(`Inserted → ${row.code}`);
        } else {
            console.log(`Skipped (already exists) → ${row.code}`);
        }
    }

    console.log("✅ Seed complete: destination_wallet");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding destination_wallet:", err);
    process.exit(1);
});
