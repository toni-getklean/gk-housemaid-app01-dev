import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { pricingTiers } from "@/server/db/schema/lookups/pricingTiers";

// Non-membership Service SKUs (Trial & One-time)
export const serviceSkus = pgTable("service_skus", {
    skuId: text("sku_id").primaryKey(), // e.g., NCR_REGULAR_WHOLE_TRIAL
    location: text("location").notNull(), // NCR, CEBU, CAVITE
    tierCode: text("tier_code").references(() => pricingTiers.tierCode).notNull(),
    duration: text("duration").notNull(), // WHOLE_DAY, HALF_DAY
    bookingType: text("booking_type").notNull(), // TRIAL, ONE_TIME
    servicePrice: numeric("service_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
