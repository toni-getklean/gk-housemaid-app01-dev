import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const housemaidTiers = pgTable("housemaid_tiers", {
    tierCode: text("tier_code").primaryKey(), // ENTRY, BASIC, ADVANCED, EXPERT
    tierLabel: text("tier_label").notNull(),
    minPoints: integer("min_points").notNull(),
    estimatedBookings: integer("estimated_bookings"),
    tierOrder: integer("tier_order").notNull(), // 1, 2, 3, 4 for sorting
    description: text("description"),
    colorClass: text("color_class"), // e.g. "text-blue-500"
    unlockedSkills: jsonb("unlocked_skills"), // Array of skill names
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
