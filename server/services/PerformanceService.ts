
import { db } from "@/server/db";
import { housemaidPerformance } from "@/server/db/schema/housemaid/housemaidPerformance";
import { housemaidViolations } from "@/server/db/schema/housemaid/housemaidViolations";
import { violationTypes } from "@/server/db/schema/lookups/violationTypes";
import { eq, desc, and, sql } from "drizzle-orm";

import { bookings } from "@/server/db/schema/bookings/bookings";

export class PerformanceService {
    /**
     * Retrieves the latest performance summary for a housemaid.
     * Returns defaults if no record exists.
     */
    static async getPerformanceSummary(housemaidId: number) {
        const perf = await db.query.housemaidPerformance.findFirst({
            where: eq(housemaidPerformance.housemaidId, housemaidId),
            orderBy: [desc(housemaidPerformance.createdAt)],
        });

        // 1. Get Live Total Jobs Count (Completed Bookings)
        const completedJobsCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(bookings)
            .where(
                and(
                    eq(bookings.housemaidId, housemaidId),
                    eq(bookings.statusCode, "completed")
                )
            )
            .then(res => Number(res[0]?.count || 0));

        // 2. Count violations dynamically from the violations table
        const allViolations = await db.select({
            type: violationTypes.type
        })
            .from(housemaidViolations)
            .leftJoin(violationTypes, eq(housemaidViolations.violationCode, violationTypes.violationCode))
            .where(eq(housemaidViolations.housemaidId, housemaidId));

        const minorCount = allViolations.filter(v => v.type?.toUpperCase() === 'MINOR').length;
        const majorCount = allViolations.filter(v => v.type?.toUpperCase() === 'MAJOR').length;

        // 3. Return combined data
        return {
            averageRating: perf?.avgRating != null ? Number(perf.avgRating) : 4.8, // Ensure number type, handle 0
            completionRate: perf?.completionRate != null ? Number(perf.completionRate) : 95,
            totalJobs: completedJobsCount, // Use live count
            violations: {
                minor: minorCount,
                major: majorCount,
            }
        };
    }

    /**
     * Retrieves the violation history for a housemaid.
     * Joins with violation_types to get details.
     */
    /**
     * Retrieves the violation history for a housemaid.
     * Joins with violation_types to get details.
     */
    static async getViolationHistory(housemaidId: number) {
        // We perform a join to get violation details
        const history = await db.select({
            id: housemaidViolations.violationId,
            type: violationTypes.type,
            title: violationTypes.title,
            customTitle: housemaidViolations.violationTitle,
            description: violationTypes.description,
            customDescription: housemaidViolations.violationDescription,
            bookingId: housemaidViolations.bookingId,
            bookingCode: bookings.bookingCode, // Get actual booking code
            date: housemaidViolations.date,
            pointsDeducted: housemaidViolations.pointsDeducted,
            defaultPoints: violationTypes.defaultPointsDeduction,
            sanctionInfo: violationTypes.sanctionInfo,
            sanctionApplied: housemaidViolations.sanctionApplied,
        })
            .from(housemaidViolations)
            .leftJoin(violationTypes, eq(housemaidViolations.violationCode, violationTypes.violationCode))
            .leftJoin(bookings, eq(housemaidViolations.bookingId, bookings.bookingId)) // Join bookings
            .where(eq(housemaidViolations.housemaidId, housemaidId))
            .orderBy(desc(housemaidViolations.date));

        return history.map(record => ({
            id: record.id.toString(),
            type: record.type?.toLowerCase() || "minor",
            title: record.customTitle || record.title || "Unknown Violation",
            description: record.customDescription || record.description || "",
            // Use actual booking code if linked, otherwise General
            bookingCode: record.bookingCode || (record.bookingId ? `HM-${record.bookingId}` : "General"),
            // Format date
            date: record.date ? new Date(record.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
            // Use snapshot points or default
            pointsImpact: record.pointsDeducted ?? record.defaultPoints ?? 0,
            sanction: record.sanctionApplied || record.sanctionInfo,
        }));
    }

    /**
     * Retrieves specific details for a single violation.
     */
    static async getViolationDetails(violationId: number, housemaidId: number) {
        const [detail] = await db.select({
            id: housemaidViolations.violationId,
            type: violationTypes.type,
            title: violationTypes.title,
            customTitle: housemaidViolations.violationTitle,
            description: violationTypes.description,
            customDescription: housemaidViolations.violationDescription,
            bookingId: housemaidViolations.bookingId,
            bookingCode: bookings.bookingCode,
            serviceDate: bookings.serviceDate,
            date: housemaidViolations.date,
            pointsDeducted: housemaidViolations.pointsDeducted,
            defaultPoints: violationTypes.defaultPointsDeduction,
            sanctionInfo: violationTypes.sanctionInfo,
            sanctionApplied: housemaidViolations.sanctionApplied,
            status: housemaidViolations.status,
            violationCode: housemaidViolations.violationCode,
        })
            .from(housemaidViolations)
            .leftJoin(violationTypes, eq(housemaidViolations.violationCode, violationTypes.violationCode))
            .leftJoin(bookings, eq(housemaidViolations.bookingId, bookings.bookingId))
            .where(
                and(
                    eq(housemaidViolations.violationId, violationId),
                    eq(housemaidViolations.housemaidId, housemaidId)
                )
            );

        if (!detail) return null;

        return {
            id: detail.id.toString(),
            violationCode: detail.violationCode,
            type: detail.type?.toLowerCase() || "minor",
            title: detail.customTitle || detail.title || "Unknown Violation",
            description: detail.customDescription || detail.description || "",
            status: detail.status || "RESOLVED",
            booking: detail.bookingId ? {
                id: detail.bookingId.toString(),
                code: detail.bookingCode || `HM-${detail.bookingId}`,
                serviceDate: detail.serviceDate ? new Date(detail.serviceDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
            } : null,
            date: detail.date ? new Date(detail.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
            pointsImpact: detail.pointsDeducted ?? detail.defaultPoints ?? 0,
            sanction: detail.sanctionApplied || detail.sanctionInfo,
        };
    }
    /**
     * Retrieves all violation types for the penalty guidelines page.
     */
    static async getPenaltyGuidelines() {
        return await db.select({
            violationCode: violationTypes.violationCode,
            type: violationTypes.type,
            title: violationTypes.title,
            description: violationTypes.description,
            points: violationTypes.defaultPointsDeduction,
            sanction: violationTypes.sanctionInfo,
        })
            .from(violationTypes)
            .orderBy(violationTypes.type, violationTypes.title);
    }
}
