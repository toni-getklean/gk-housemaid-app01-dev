import { sql } from "drizzle-orm";
import { pgTable, text, date, timestamp, bigint, integer } from "drizzle-orm/pg-core";



export const housemaidViolations = pgTable("housemaid_violations", {
    violationId: bigint("violation_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    violationCode: text("violation_code"),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    bookingId: bigint("booking_id", { mode: "number" }),
    violationType: text("violation_type"),
    violationTitle: text("violation_title"),
    violationDescription: text("violation_description"),
    date: date("date"),
    pointsDeducted: integer("points_deducted"), // Snapshot of actual deduction
    sanctionApplied: text("sanction_applied"), // Snapshot of sanction
    status: text("status"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
