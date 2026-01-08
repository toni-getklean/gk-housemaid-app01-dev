import "dotenv/config";

import { db } from "@/server/db/client";
import { status } from "@/server/db/schema/lookups/status";
import { eq } from "drizzle-orm";

const statusData = [
    { statusCode: "needs_confirmation", statusDisplayName: "Needs Confirmation" },
    { statusCode: "pending_review", statusDisplayName: "Pending Review" },
    { statusCode: "accepted", statusDisplayName: "Accepted" },
    { statusCode: "dispatched", statusDisplayName: "Dispatched" },
    { statusCode: "on_the_way", statusDisplayName: "On The Way" },
    { statusCode: "arrived", statusDisplayName: "Arrived" },
    { statusCode: "in_progress", statusDisplayName: "In Progress" },
    { statusCode: "completed", statusDisplayName: "Completed" },
    { statusCode: "rescheduled", statusDisplayName: "Rescheduled" },
    { statusCode: "cancelled", statusDisplayName: "Cancelled" },
    { statusCode: "no_show", statusDisplayName: "No Show" },
];

async function main() {
    console.log("🌱 Seeding status...");

    for (const row of statusData) {
        const existing = await db
            .select()
            .from(status)
            .where(eq(status.statusCode, row.statusCode));

        if (existing.length === 0) {
            await db.insert(status).values(row);
            console.log(`Inserted → ${row.statusCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.statusCode}`);
        }
    }

    console.log("✅ Seed complete: status");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding status:", err);
    process.exit(1);
});
