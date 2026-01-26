import { pgTable, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { pricingTiers } from "@/server/db/schema/lookups/pricingTiers";

// Membership SKUs (Flexi Membership Purchase Options)
export const membershipSkus = pgTable("membership_skus", {
    skuId: text("sku_id").primaryKey(), // e.g., NCR_FLEXI_REGULAR_1M
    location: text("location").notNull(), // NCR, CEBU, CAVITE
    tierCode: text("tier_code").references(() => pricingTiers.tierCode), // Nullable if global
    termMonths: integer("term_months").notNull(), // 1, 3, 6, 12
    servicePrice: numeric("service_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
