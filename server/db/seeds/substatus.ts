import "dotenv/config";

import { db } from "@/server/db/client";
import { substatus } from "@/server/db/schema/lookups/substatus";
import { and, eq } from "drizzle-orm";

const substatusData = [
    // rescheduled
    { parentStatusCode: "rescheduled", substatusCode: "due_to_client", substatusDisplayName: "Due to Client" },
    // rescheduled
    { parentStatusCode: "rescheduled", substatusCode: "due_to_client", substatusDisplayName: "Due to Client" },
    { parentStatusCode: "rescheduled", substatusCode: "due_to_housemaid", substatusDisplayName: "Due to Housemaid" },
    { parentStatusCode: "rescheduled", substatusCode: "out_of_town", substatusDisplayName: "Out of Town" },
    { parentStatusCode: "rescheduled", substatusCode: "change_of_mind", substatusDisplayName: "Change of Mind" },
    { parentStatusCode: "rescheduled", substatusCode: "emergency", substatusDisplayName: "Emergency" },
    { parentStatusCode: "rescheduled", substatusCode: "preferred_hm_not_available", substatusDisplayName: "Preferred HM Not Available" },
    { parentStatusCode: "rescheduled", substatusCode: "bad_weather", substatusDisplayName: "Bad Weather" },
    { parentStatusCode: "rescheduled", substatusCode: "errands", substatusDisplayName: "Errands" },
    { parentStatusCode: "rescheduled", substatusCode: "none", substatusDisplayName: "- (No reason specified)" },

    // cancelled
    { parentStatusCode: "cancelled", substatusCode: "due_to_client", substatusDisplayName: "Due to Client" },
    { parentStatusCode: "cancelled", substatusCode: "due_to_housemaid", substatusDisplayName: "Due to Housemaid" },
    { parentStatusCode: "cancelled", substatusCode: "not_satisfied", substatusDisplayName: "Not Satisfied" },
    { parentStatusCode: "cancelled", substatusCode: "bad_weather", substatusDisplayName: "Bad Weather" },
    { parentStatusCode: "cancelled", substatusCode: "change_of_mind", substatusDisplayName: "Change of Mind" },
    { parentStatusCode: "cancelled", substatusCode: "service_not_needed", substatusDisplayName: "Service Not Needed" },
    { parentStatusCode: "cancelled", substatusCode: "no_response", substatusDisplayName: "No Response" },
    { parentStatusCode: "cancelled", substatusCode: "none", substatusDisplayName: "- (No reason specified)" },

    // no_show
    { parentStatusCode: "no_show", substatusCode: "housemaid_no_show", substatusDisplayName: "Housemaid No-Show" },
    { parentStatusCode: "no_show", substatusCode: "client_no_show", substatusDisplayName: "Client No-Show" },
    { parentStatusCode: "no_show", substatusCode: "none", substatusDisplayName: "- (No reason specified)" },

    // main statuses with blank substatus
    { parentStatusCode: "needs_confirmation", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "needs_confirmation", substatusCode: "none", substatusDisplayName: "-" },

    // pending_review
    { parentStatusCode: "pending_review", substatusCode: "awaiting_housemaid_response", substatusDisplayName: "Awaiting Housemaid Response" },
    { parentStatusCode: "pending_review", substatusCode: "housemaid_declined", substatusDisplayName: "Housemaid Declined" },
    { parentStatusCode: "pending_review", substatusCode: "housemaid_no_response", substatusDisplayName: "Housemaid No Response" },
    { parentStatusCode: "pending_review", substatusCode: "reassignment_required", substatusDisplayName: "Reassignment Required" },
    { parentStatusCode: "pending_review", substatusCode: "none", substatusDisplayName: "-" },

    { parentStatusCode: "accepted", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "accepted", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "dispatched", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "on_the_way", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "arrived", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "in_progress", substatusCode: "none", substatusDisplayName: "-" },
    { parentStatusCode: "completed", substatusCode: "none", substatusDisplayName: "-" },
];

async function main() {
    console.log("🌱 Seeding substatus...");

    for (const row of substatusData) {
        const existing = await db
            .select()
            .from(substatus)
            .where(
                and(
                    eq(substatus.parentStatusCode, row.parentStatusCode),
                    eq(substatus.substatusCode, row.substatusCode),
                ),
            );

        if (existing.length === 0) {
            await db.insert(substatus).values(row);
            console.log(
                `Inserted → ${row.parentStatusCode} / ${row.substatusCode || "(empty)"}`,
            );
        } else {
            console.log(
                `Skipped (already exists) → ${row.parentStatusCode} / ${row.substatusCode || "(empty)"}`,
            );
        }
    }

    console.log("✅ Seed complete: substatus");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding substatus:", err);
    process.exit(1);
});
