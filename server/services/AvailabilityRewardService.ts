import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { housemaidAvailability } from "@/server/db/schema/housemaid/housemaidAvailability";
import { asensoTransactions } from "@/server/db/schema/housemaid/asensoTransactions";
import { asensoPointsConfig } from "@/server/db/schema/housemaid/asensoPointsConfig";
import { eq, and, ne, isNull, inArray } from "drizzle-orm";
import { format } from "date-fns";

export class AvailabilityRewardService {
    /**
     * Nightly job to grant Asenso points to housemaids who were marked "available"
     * but did not receive any bookings for the target date.
     * 
     * @param targetDate The date to evaluate (default: today)
     */
    static async processDailyRewards(targetDate: Date = new Date()) {
        const dateStr = format(targetDate, "yyyy-MM-dd");

        // 1. Get the Reward Config 
        const [config] = await db
            .select()
            .from(asensoPointsConfig)
            .where(
                and(
                    eq(asensoPointsConfig.eventType, "AVAILABILITY_REWARD"),
                    isNull(asensoPointsConfig.bookingTypeCode),
                    isNull(asensoPointsConfig.serviceType)
                )
            );

        if (!config || config.pointsAwarded <= 0) {
            console.log("[AvailabilityRewardService] No active config found for AVAILABILITY_REWARD. Skipping.");
            return { processed: 0, pointsAwarded: 0 };
        }

        const rewardPoints = config.pointsAwarded;

        // 2. Fetch all currently active housemaids
        const allMaids = await db
            .select()
            .from(housemaids)
            .where(eq(housemaids.status, "ACTIVE"));

        if (allMaids.length === 0) return { processed: 0, pointsAwarded: 0 };
        const maidIds = allMaids.map(m => m.housemaidId);

        // 3. Find housemaids who actually had bookings on this date (that were not cancelled)
        const bookedMaidsData = await db
            .select({ housemaidId: bookings.housemaidId })
            .from(bookings)
            .where(
                and(
                    eq(bookings.serviceDate, dateStr),
                    ne(bookings.statusCode, "cancelled")
                )
            );
        const bookedMaidIds = new Set(bookedMaidsData.map(b => b.housemaidId).filter(Boolean));

        // 4. Find housemaids explicitly marked unavailable/absent on this date
        const absentMaidsData = await db
            .select({ housemaidId: housemaidAvailability.housemaidId })
            .from(housemaidAvailability)
            .where(
                and(
                    eq(housemaidAvailability.availabilityDate, dateStr),
                    inArray(housemaidAvailability.statusCode, ["unavailable", "absent", "blocked"])
                )
            );
        const absentMaidIds = new Set(absentMaidsData.map(a => a.housemaidId));

        let rewardCount = 0;

        // 5. Evaluate and Reward Eligible Housemaids
        for (const maid of allMaids) {
            // If they are booked or explicitly absent, they do NOT qualify for the availability reward
            if (bookedMaidIds.has(maid.housemaidId) || absentMaidIds.has(maid.housemaidId)) {
                continue;
            }

            // Check Idempotency: Did we already award them for this exact date?
            // "dateStr" can be appended to notes to check, or just check records today. 
            // For safety, let's verify if an AVAILABILITY_REWARD transaction was made for them today.
            // In a robust system we'd join on timestamp or add a `referenceDate` column.
            const alreadyAwarded = await db.query.asensoTransactions.findFirst({
                where: and(
                    eq(asensoTransactions.housemaidId, maid.housemaidId),
                    eq(asensoTransactions.eventType, "AVAILABILITY_REWARD"),
                    // Using notes string match as a simple idempotency key for this date
                    eq(asensoTransactions.notes, `Availability bonus for ${dateStr}`)
                )
            });

            if (alreadyAwarded) {
                continue; // Skip if already claimed
            }

            // Award Points!
            const newBalance = (maid.asensoPointsBalance || 0) + rewardPoints;

            await db.insert(asensoTransactions).values({
                housemaidId: maid.housemaidId,
                points: rewardPoints,
                eventType: "AVAILABILITY_REWARD",
                configId: config.id,
                transactionType: "EARN",
                balanceAfter: newBalance,
                notes: `Availability bonus for ${dateStr}`
            });

            await db.update(housemaids)
                .set({ asensoPointsBalance: newBalance })
                .where(eq(housemaids.housemaidId, maid.housemaidId));
            
            rewardCount++;
        }

        console.log(`[AvailabilityRewardService] Processed ${dateStr}. Awarded ${rewardPoints} pts to ${rewardCount} housemaids.`);
        return { processed: rewardCount, pointsAwarded: rewardCount * rewardPoints };
    }
}
