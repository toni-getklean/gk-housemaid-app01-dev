import { pgTable, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { serviceTiers } from "@/server/db/schema/lookups/serviceTiers";

// Non-membership Service SKUs (Trial & One-time)
export const serviceSkus = pgTable("service_skus", {
    skuId: text("sku_id").primaryKey(), // e.g., NCR_REGULAR_WHOLE_TRIAL
    location: text("location").notNull(), // NCR, CEBU, CAVITE
    tierCode: text("tier_code").references(() => serviceTiers.tierCode).notNull(),
    duration: text("duration").notNull(), // WHOLE_DAY, HALF_DAY
    bookingType: text("booking_type").notNull(), // TRIAL, ONE_TIME
    servicePrice: numeric("service_price", { precision: 12, scale: 2 }).notNull(),
    priceHm: numeric("price_hm", { precision: 12, scale: 2 }),
    surgeAmount: numeric("surge_amount", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
