import { sql } from "drizzle-orm";
import { pgTable, text, integer, numeric, timestamp, bigint } from "drizzle-orm/pg-core";



export const housemaidPerformance = pgTable("housemaid_performance", {
    performanceId: bigint("performance_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    month: text("month").notNull(),
    totalJobs: integer("total_jobs"),
    completedJobs: integer("completed_jobs"),
    avgRating: numeric("avg_rating", { precision: 4, scale: 2 }),
    completionRate: numeric("completion_rate", { precision: 5, scale: 2 }),
    totalEarnings: numeric("total_earnings", { precision: 12, scale: 2 }),
    minorViolations: integer("minor_violations"),
    majorViolations: integer("major_violations"),
    generatedAt: timestamp("generated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
