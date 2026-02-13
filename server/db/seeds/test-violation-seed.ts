import "dotenv/config";
import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { housemaidViolations } from "@/server/db/schema/housemaid/housemaidViolations";
import { housemaidPerformance } from "@/server/db/schema/housemaid/housemaidPerformance";
import { violationTypes } from "@/server/db/schema/lookups/violationTypes";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { eq, sql, desc } from "drizzle-orm";

const TARGET_HOUSEMAID_CODE = "HMAID25-00002";
const VIOLATION_CODE = "LATE_ARRIVAL"; // Minor violation

async function main() {
    console.log(`🌱 Seeding test violation for ${TARGET_HOUSEMAID_CODE}...`);

    // 1. Get Housemaid
    const housemaid = await db.query.housemaids.findFirst({
        where: eq(housemaids.housemaidCode, TARGET_HOUSEMAID_CODE),
    });

    if (!housemaid) {
        console.error(`❌ Housemaid ${TARGET_HOUSEMAID_CODE} not found.`);
        process.exit(1);
    }

    console.log(`Found Housemaid: ${housemaid.name} (ID: ${housemaid.housemaidId})`);
    console.log(`Current Points: ${housemaid.asensoPointsBalance}`);

    // 2. Get Violation Details
    const violationType = await db.query.violationTypes.findFirst({
        where: eq(violationTypes.violationCode, VIOLATION_CODE),
    });

    if (!violationType) {
        console.error(`❌ Violation Type ${VIOLATION_CODE} not found.`);
        process.exit(1);
    }

    const pointsDeduction = violationType.defaultPointsDeduction;
    console.log(`Violation: ${violationType.title} (${violationType.type})`);
    console.log(`Points Deduction: ${pointsDeduction}`);

    // 3. Find a Booking to link
    const booking = await db.query.bookings.findFirst({
        where: eq(bookings.housemaidId, housemaid.housemaidId),
        orderBy: [desc(bookings.serviceDate)],
    });

    if (!booking) {
        console.warn(`⚠️ No booking found for ${housemaid.name}. Linking to General.`);
    } else {
        console.log(`Linking to Booking ID: ${booking.bookingId} (${booking.bookingCode})`);
    }

    // 4. Insert Violation
    await db.insert(housemaidViolations).values({
        housemaidId: housemaid.housemaidId,
        bookingId: booking?.bookingId || null, // Link to booking if found
        violationCode: VIOLATION_CODE,
        violationType: violationType.type,
        violationTitle: violationType.title,
        violationDescription: violationType.description,
        date: new Date().toISOString().split('T')[0], // Today
        pointsDeducted: pointsDeduction,
        sanctionApplied: violationType.sanctionInfo,
        status: "RESOLVED",
    });

    console.log("✅ Inserted violation record.");

    // 5. Update Housemaid Points
    const newBalance = (housemaid.asensoPointsBalance || 0) + pointsDeduction;

    await db.update(housemaids)
        .set({
            asensoPointsBalance: newBalance,
            updatedAt: new Date(),
        })
        .where(eq(housemaids.housemaidId, housemaid.housemaidId));

    console.log(`✅ Updated points balance: ${housemaid.asensoPointsBalance} -> ${newBalance}`);

    // 6. Create Housemaid Performance Snapshot
    // We'll create a new record or update the latest one for the current month
    const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // Check for existing performance record for this month
    const existingPerf = await db.query.housemaidPerformance.findFirst({
        where: (perf, { eq, and }) => and(
            eq(perf.housemaidId, housemaid.housemaidId),
            eq(perf.month, currentMonth)
        ),
    });

    if (existingPerf) {
        // Update existing
        await db.update(housemaidPerformance)
            .set({
                minorViolations: (existingPerf.minorViolations || 0) + (violationType.type === 'MINOR' ? 1 : 0),
                majorViolations: (existingPerf.majorViolations || 0) + (violationType.type === 'MAJOR' ? 1 : 0),
                updatedAt: new Date(),
            })
            .where(eq(housemaidPerformance.performanceId, existingPerf.performanceId));
        console.log(`✅ Updated existing performance record for ${currentMonth}`);
    } else {
        // Create new
        await db.insert(housemaidPerformance).values({
            housemaidId: housemaid.housemaidId,
            month: currentMonth,
            totalJobs: 0, // Default for now
            completedJobs: 0,
            avgRating: "5.00",
            completionRate: "100.00",
            totalEarnings: "0.00",
            minorViolations: violationType.type === 'MINOR' ? 1 : 0,
            majorViolations: violationType.type === 'MAJOR' ? 1 : 0,
            generatedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        console.log(`✅ Created new performance record for ${currentMonth}`);
    }

    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding test violation:", err);
    process.exit(1);
});
