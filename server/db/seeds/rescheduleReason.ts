import "dotenv/config";
import { db } from "@/server/db/client";
import { rescheduleReason } from "@/server/db/schema/lookups/rescheduleReason";
import { eq } from "drizzle-orm";

const seeds = [
    { code: "OUT_OF_TOWN", displayName: "Out of Town" },
    { code: "CHANGE_OF_MIND", displayName: "Change of Mind" },
    { code: "EMERGENCY", displayName: "Emergency" },
    { code: "BAD_WEATHER", displayName: "Bad Weather" },
    { code: "ERRANDS", displayName: "Errands" },
    { code: "OTHER", displayName: "Other" },
];

async function main() {
    console.log("🌱 Seeding reschedule_reason...");

    for (const data of seeds) {
        const existing = await db
            .select()
            .from(rescheduleReason)
            .where(eq(rescheduleReason.code, data.code));

        if (existing.length === 0) {
            await db.insert(rescheduleReason).values(data);
            console.log(`Inserted → ${data.displayName}`);
        } else {
            console.log(`Skipped (already exists) → ${data.displayName}`);
        }
    }

    console.log("✅ Seed complete: reschedule_reason");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding reschedule_reason:", err);
    process.exit(1);
});
