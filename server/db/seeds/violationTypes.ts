import "dotenv/config";
import { db } from "@/server/db/client";
import { violationTypes } from "@/server/db/schema/lookups/violationTypes";
import { eq } from "drizzle-orm";

const VIOLATIONS = [
    // MAJOR VIOLATIONS
    {
        violationCode: "THEFT",
        type: "MAJOR",
        title: "Theft",
        category: "CRIMINAL",
        description: "Theft of client or company property.",
        performanceDeduction: 0,
        asensoDeduction: 0,
        sanctionInfo: "Termination",
    },
    {
        violationCode: "SULOT_CLIENT",
        type: "MAJOR",
        title: "Sulot Client",
        category: "GROSS_MISCONDUCT",
        description: "Attempting to bypass the platform to deal with the client directly.",
        performanceDeduction: -10,
        asensoDeduction: -10000,
        sanctionInfo: "30-day suspension / termination",
    },
    {
        violationCode: "DAMAGE_TO_PROPERTY",
        type: "MAJOR",
        title: "Damage to Property",
        category: "NEGLIGENCE",
        description: "Causing damage to client's property due to negligence.",
        performanceDeduction: -8,
        asensoDeduction: -5000,
        sanctionInfo: "3-day suspension",
    },
    {
        violationCode: "INCORRECT_SHARE_AMOUNT",
        type: "MAJOR",
        title: "Incorrect Share Amount",
        category: "FRAUD",
        description: "Remitting incorrect share amount.",
        performanceDeduction: -8,
        asensoDeduction: -5000,
        sanctionInfo: "Suspension escalation",
    },
    {
        violationCode: "GROSS_MISCONDUCT",
        type: "MAJOR",
        title: "Gross Misconduct",
        category: "DISCIPLINARY",
        description: "Gross misconduct.",
        performanceDeduction: -8,
        asensoDeduction: -5000,
        sanctionInfo: "5-day suspension",
    },
    {
        violationCode: "ALCOHOL_DRUG_ABUSE",
        type: "MAJOR",
        title: "Alcohol / Drug Abuse",
        category: "DISCIPLINARY",
        description: "Under the influence of alcohol or drugs during work.",
        performanceDeduction: -8,
        asensoDeduction: -3500,
        sanctionInfo: "Subject to sanction",
    },
    {
        violationCode: "FAKE_TRANSPO",
        type: "MAJOR",
        title: "Fake Transpo",
        category: "FRAUD",
        description: "Submitting fake transportation receipts or details.",
        performanceDeduction: -7,
        asensoDeduction: -2000,
        sanctionInfo: "Subject to sanction",
    },
    {
        violationCode: "NO_SHOW",
        type: "MAJOR",
        title: "No Show to Booking",
        category: "ATTENDANCE",
        description: "Failure to arrive at the booking without notice.",
        performanceDeduction: -7,
        asensoDeduction: -1500,
        sanctionInfo: "3-day suspension",
    },
    {
        violationCode: "IMPROPER_BACKOUT",
        type: "MAJOR",
        title: "Improper Backout",
        category: "ATTENDANCE",
        description: "Backing out of a booking improperly.",
        performanceDeduction: -5,
        asensoDeduction: -1500,
        sanctionInfo: "Subject to sanction",
    },
    {
        violationCode: "UNAUTHORIZED_USE_PROPERTY",
        type: "MAJOR",
        title: "Unauthorized use of property",
        category: "MISCONDUCT",
        description: "Using client's property without permission.",
        performanceDeduction: -5,
        asensoDeduction: -1000,
        sanctionInfo: "Subject to sanction",
    },

    // MINOR VIOLATIONS
    {
        violationCode: "LATE_ARRIVAL",
        type: "MINOR",
        title: "Late Arrival",
        category: "ATTENDANCE",
        description: "Arriving late to a booking.",
        performanceDeduction: -3,
        asensoDeduction: -200,
        sanctionInfo: "Escalating suspension",
    },
    {
        violationCode: "UNPROFESSIONAL_BEHAVIOR",
        type: "MINOR",
        title: "Unprofessional Behavior",
        category: "BEHAVIOR",
        description: "Displaying unprofessional behavior.",
        performanceDeduction: -3,
        asensoDeduction: -300,
        sanctionInfo: "Warning / sanction",
    },
    {
        violationCode: "NOT_UPDATING",
        type: "MINOR",
        title: "Not Updating",
        category: "COMMUNICATION",
        description: "Failure to update the team or client.",
        performanceDeduction: -1,
        asensoDeduction: -150,
        sanctionInfo: "Warning",
    },
    {
        violationCode: "PICTURE_WITHOUT_PERMISSION",
        type: "MINOR",
        title: "Picture without permission",
        category: "PRIVACY",
        description: "Taking pictures of client's property or privacy without permission.",
        performanceDeduction: -1,
        asensoDeduction: -200,
        sanctionInfo: "Warning",
    },
];

async function main() {
    console.log("🌱 Seeding violation_types...");

    for (const row of VIOLATIONS) {
        const existing = await db
            .select()
            .from(violationTypes)
            .where(eq(violationTypes.violationCode, row.violationCode));

        if (existing.length === 0) {
            await db.insert(violationTypes).values(row);
            console.log(`Inserted → ${row.violationCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.violationCode}`);

            // Optional: Update existing records if needed, but per pattern we skip
            // If update is needed, we would add an update query here
        }
    }

    console.log("✅ Seed complete: violation_types");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding violation_types:", err);
    process.exit(1);
});
