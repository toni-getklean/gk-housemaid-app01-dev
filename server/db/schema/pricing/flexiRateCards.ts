import { pgTable, text, numeric, integer, timestamp, bigint } from "drizzle-orm/pg-core";
import { pricingTiers } from "@/server/db/schema/lookups/pricingTiers";

// Flexi Rate Cards (Variable pricing for Members)
export const flexiRateCards = pgTable("flexi_rate_cards", {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    location: text("location").notNull(), // NCR, CEBU, CAVITE
    tierCode: text("tier_code").references(() => pricingTiers.tierCode).notNull(),
    duration: text("duration").notNull(), // WHOLE_DAY, HALF_DAY

    baseRateWeekday: numeric("base_rate_weekday", { precision: 12, scale: 2 }).notNull(),
    surgeAddWeekendHoliday: numeric("surge_add_weekend_holiday", { precision: 12, scale: 2 }).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
