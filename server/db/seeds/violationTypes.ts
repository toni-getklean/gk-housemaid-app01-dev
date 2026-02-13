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
        defaultPointsDeduction: -10000,
        sanctionInfo: "Termination",
    },
    {
        violationCode: "SULOT_CLIENT",
        type: "MAJOR",
        title: "Sulot Client",
        category: "GROSS_MISCONDUCT",
        description: "Attempting to bypass the platform to deal with the client directly.",
        defaultPointsDeduction: -5000,
        sanctionInfo: "1st - 30 days suspension | 2nd - Termination",
    },
    {
        violationCode: "DAMAGE_TO_PROPERTY",
        type: "MAJOR",
        title: "Damage to Property",
        category: "NEGLIGENCE",
        description: "Causing damage to client's property due to negligence.",
        defaultPointsDeduction: -5000,
        sanctionInfo: "3 days suspension kung kapabayaan ng HM",
    },
    {
        violationCode: "INCORRECT_SHARE_AMOUNT",
        type: "MAJOR",
        title: "Incorrect Share Amount",
        category: "FRAUD",
        description: "Remitting incorrect share amount.",
        defaultPointsDeduction: -5000,
        sanctionInfo: "1st - 10 days suspension | 2nd - 20 days suspension | 3rd - Termination",
    },
    {
        violationCode: "GROSS_MISCONDUCT",
        type: "MAJOR",
        title: "Gross Misconduct",
        category: "DISCIPLINARY",
        description: "Gross misconduct.",
        defaultPointsDeduction: -5000,
        sanctionInfo: "5 days suspension if proven guilty",
    },
    {
        violationCode: "ALCOHOL_DRUG_ABUSE",
        type: "MAJOR",
        title: "Alcohol / Drug Abuse",
        category: "DISCIPLINARY",
        description: "Under the influence of alcohol or drugs during work.",
        defaultPointsDeduction: -3500,
        sanctionInfo: "5 days suspension if proven guilty",
    },
    {
        violationCode: "FAKE_TRANSPO",
        type: "MAJOR",
        title: "Fake Transpo",
        category: "FRAUD",
        description: "Submitting fake transportation receipts or details.",
        defaultPointsDeduction: -2000,
        sanctionInfo: "5 days suspension if proven guilty",
    },
    {
        violationCode: "UNAUTHORIZED_USE_PROPERTY",
        type: "MAJOR",
        title: "Unauthorized Use of Client's Property",
        category: "MISCONDUCT",
        description: "Using client's property without permission.",
        defaultPointsDeduction: -1000,
        sanctionInfo: "3 days suspension",
    },
    {
        violationCode: "NO_SHOW",
        type: "MAJOR",
        title: "No Show to Booking",
        category: "ATTENDANCE",
        description: "Failure to arrive at the booking without notice.",
        defaultPointsDeduction: -1500,
        sanctionInfo: "Points Deduction",
    },
    {
        violationCode: "IMPROPER_BACKOUT",
        type: "MAJOR",
        title: "Improper Backout",
        category: "ATTENDANCE",
        description: "Backing out of a booking improperly.",
        defaultPointsDeduction: -1500,
        sanctionInfo: "Points Deduction",
    },

    // MINOR VIOLATIONS
    {
        violationCode: "LATE_ARRIVAL",
        type: "MINOR",
        title: "Late Arrival",
        category: "ATTENDANCE",
        description: "Arriving late to a booking.",
        defaultPointsDeduction: -200,
        sanctionInfo: "1st - Verbal Warning | 2nd - Written Warning | 3rd - 2 Days Suspension | 4th - 5 Days Suspension | 5th - 10 Days Suspension",
    },
    {
        violationCode: "UNPROFESSIONAL_BEHAVIOR",
        type: "MINOR",
        title: "Unprofessional Behavior",
        category: "BEHAVIOR",
        description: "Displaying unprofessional behavior.",
        defaultPointsDeduction: -300,
        sanctionInfo: "Points Deduction",
    },
    {
        violationCode: "PICTURE_WITHOUT_PERMISSION",
        type: "MINOR",
        title: "Picture Without Permission",
        category: "PRIVACY",
        description: "Taking pictures of client's property or privacy without permission.",
        defaultPointsDeduction: -200,
        sanctionInfo: "Points Deduction",
    },
    {
        violationCode: "NOT_UPDATING",
        type: "MINOR",
        title: "Not Updating",
        category: "COMMUNICATION",
        description: "Failure to update the team or client.",
        defaultPointsDeduction: -150,
        sanctionInfo: "Points Deduction",
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
