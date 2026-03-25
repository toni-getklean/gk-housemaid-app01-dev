import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const violationTypes = pgTable("violation_types", {
    violationCode: text("violation_code").primaryKey(), // MAJOR_THEFT, MINOR_LATE_ARRIVAL, etc.
    type: text("type").notNull(), // MAJOR, MINOR
    category: text("category"), // DISCIPLINARY, etc.
    title: text("title").notNull(),
    description: text("description"),
    performanceDeduction: integer("performance_deduction").notNull(), // Negative or zero
    asensoDeduction: integer("asenso_deduction").notNull(), // Actual point value to deduct
    sanctionInfo: text("sanction_info"), // "1st - Verbal Warning..."
});
