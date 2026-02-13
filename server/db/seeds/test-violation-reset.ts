import "dotenv/config";
import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { housemaidViolations } from "@/server/db/schema/housemaid/housemaidViolations";
import { housemaidPerformance } from "@/server/db/schema/housemaid/housemaidPerformance";
import { violationTypes } from "@/server/db/schema/lookups/violationTypes";
import { eq, and, desc } from "drizzle-orm";

const TARGET_HOUSEMAID_CODE = "HMAID25-00002";
const VIOLATION_CODE = "LATE_ARRIVAL";

async function main() {
    console.log(`↺ Resetting test violation for ${TARGET_HOUSEMAID_CODE}...`);

    // 1. Get Housemaid
    const housemaid = await db.query.housemaids.findFirst({
        where: eq(housemaids.housemaidCode, TARGET_HOUSEMAID_CODE),
    });

    if (!housemaid) {
        console.error(`❌ Housemaid ${TARGET_HOUSEMAID_CODE} not found.`);
        process.exit(1);
    }

    console.log(`Found Housemaid: ${housemaid.name} (ID: ${housemaid.housemaidId})`);

    // 2. Find the latest violation of this type to revert
    const violation = await db.query.housemaidViolations.findFirst({
        where: and(
            eq(housemaidViolations.housemaidId, housemaid.housemaidId),
            eq(housemaidViolations.violationCode, VIOLATION_CODE)
        ),
        orderBy: [desc(housemaidViolations.createdAt)],
    });

    if (!violation) {
        console.log("ℹ️ No matching violation found to reset.");
    } else {
        const pointsToRestore = (violation.pointsDeducted || 0) * -1; // Invert negative points to positive
        console.log(`Found violation ID: ${violation.violationId}`);
        console.log(`Points to restore: ${pointsToRestore}`);

        // 3. Delete Violation
        await db.delete(housemaidViolations)
            .where(eq(housemaidViolations.violationId, violation.violationId));

        console.log("✅ Deleted violation record.");

        // 4. Restore Housemaid Points
        const newBalance = (housemaid.asensoPointsBalance || 0) + pointsToRestore;

        await db.update(housemaids)
            .set({
                asensoPointsBalance: newBalance,
                updatedAt: new Date(),
            })
            .where(eq(housemaids.housemaidId, housemaid.housemaidId));

        console.log(`✅ Restored points balance: ${housemaid.asensoPointsBalance} -> ${newBalance}`);

        // 5. Revert Performance Record
        // We need to decrease the violation count
        const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        const existingPerf = await db.query.housemaidPerformance.findFirst({
            where: (perf, { eq, and }) => and(
                eq(perf.housemaidId, housemaid.housemaidId),
                eq(perf.month, currentMonth)
            ),
        });

        if (existingPerf) {
            await db.delete(housemaidPerformance)
                .where(eq(housemaidPerformance.performanceId, existingPerf.performanceId));
            console.log(`✅ Deleted housemaid_performance record for ${currentMonth}`);
        }
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error resetting test violation:", err);
    process.exit(1);
});
