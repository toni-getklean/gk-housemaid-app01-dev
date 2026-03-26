import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { housemaidRatings } from "@/server/db/schema/housemaid/housemaidRatings";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { housemaidViolations } from "@/server/db/schema/housemaid/housemaidViolations";
import { eq, or, desc, sum } from "drizzle-orm";

export class PerformanceScoreService {
    /**
     * Recalculates the Global Performance Score (0-100) and Average Rating for a Housemaid
     * and persists it to the `housemaids` table.
     * 
     * Formula (PRD 7.10):
     * - Rating (50%): (Average / 5) * 50. Min 5 jobs required, else default 4.5.
     * - Completion (30%): (Completed / Accepted) * 30.
     * - Violations (20%): 20 - SUM(violation points). Min 0.
     */
    static async recalculateAndSyncScore(housemaidId: number): Promise<{ performanceScore: number; averageRating: number }> {
        // 1. Calculate Average Rating
        const ratingsData = await db
            .select({ rating: housemaidRatings.rating })
            .from(housemaidRatings)
            .where(eq(housemaidRatings.housemaidId, housemaidId));

        let currentAverageRating = 4.5; // Default
        const totalRatings = ratingsData.length;

        if (totalRatings >= 5) {
            const sumRatings = ratingsData.reduce((acc, curr) => acc + Number(curr.rating || 0), 0);
            currentAverageRating = sumRatings / totalRatings;
        }

        const ratingScore = (currentAverageRating / 5) * 50;

        // 2. Calculate Completion Rate
        const jobsData = await db
            .select({ statusCode: bookings.statusCode, substatusCode: bookings.substatusCode })
            .from(bookings)
            .where(eq(bookings.housemaidId, housemaidId));

        let completedJobs = 0;
        let acceptedJobs = 0; // Jobs that were assigned and not immediately rejected

        jobsData.forEach((job) => {
            // Include all jobs assigned to the housemaid as "accepted" (unless they declined before starting)
            // Assuming any assigned job means they accepted it or were explicitly dispatched
            if (job.statusCode !== "cancelled" && job.substatusCode !== "reassignment_required") {
                acceptedJobs++;
            }
            if (job.statusCode === "completed") {
                completedJobs++;
            }
        });

        let completionScore = 30; // Default if no jobs
        if (acceptedJobs > 0) {
            completionScore = (completedJobs / acceptedJobs) * 30;
        }

        // 3. Calculate Violation Deductions
        const violationsData = await db
            .select({
                deducted: housemaidViolations.performancePointsDeducted
            })
            .from(housemaidViolations)
            .where(eq(housemaidViolations.housemaidId, housemaidId));

        const totalDeductions = violationsData.reduce((acc, curr) => acc + Number(curr.deducted || 0), 0);
        
        let violationScore = 20 - totalDeductions;
        if (violationScore < 0) violationScore = 0;

        // 4. Calculate Final Total
        let finalScore = ratingScore + completionScore + violationScore;
        // Cap at 100 just in case
        if (finalScore > 100) finalScore = 100;
        
        // Round to 2 decimal places
        finalScore = Math.round(finalScore * 100) / 100;
        currentAverageRating = Math.round(currentAverageRating * 100) / 100;

        // 5. Persist to DB
        await db
            .update(housemaids)
            .set({ 
                performanceScore: finalScore.toString(),
                averageRating: currentAverageRating.toString()
            })
            .where(eq(housemaids.housemaidId, housemaidId));

        return {
            performanceScore: finalScore,
            averageRating: currentAverageRating
        };
    }
}
