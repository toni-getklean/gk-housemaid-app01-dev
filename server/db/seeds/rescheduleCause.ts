import "dotenv/config";
import { db } from "@/server/db/client";
import { rescheduleCause } from "@/server/db/schema/lookups/rescheduleCause";
import { eq } from "drizzle-orm";

const seeds = [
    { code: "CLIENT", displayName: "Client" },
    { code: "HOUSEMAID", displayName: "Housemaid" },
    { code: "SYSTEM", displayName: "System" },
];

async function main() {
    console.log("🌱 Seeding reschedule_cause...");

    for (const data of seeds) {
        const existing = await db
            .select()
            .from(rescheduleCause)
            .where(eq(rescheduleCause.code, data.code));

        if (existing.length === 0) {
            await db.insert(rescheduleCause).values(data);
            console.log(`Inserted → ${data.displayName}`);
        } else {
            console.log(`Skipped (already exists) → ${data.displayName}`);
        }
    }

    console.log("✅ Seed complete: reschedule_cause");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding reschedule_cause:", err);
    process.exit(1);
});
