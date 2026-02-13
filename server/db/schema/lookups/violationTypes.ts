import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const violationTypes = pgTable("violation_types", {
    violationCode: text("violation_code").primaryKey(), // MAJOR_THEFT, MINOR_LATE_ARRIVAL, etc.
    type: text("type").notNull(), // MAJOR, MINOR
    category: text("category"), // DISCIPLINARY, etc.
    title: text("title").notNull(),
    description: text("description"),
    defaultPointsDeduction: integer("default_points_deduction").notNull(), // Negative value
    sanctionInfo: text("sanction_info"), // "1st - Verbal Warning..."
});
