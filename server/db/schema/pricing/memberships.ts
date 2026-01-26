import { pgTable, text, timestamp, bigint, date } from "drizzle-orm/pg-core";
import { customerProfiles } from "@/server/db/schema/customer/customerProfiles";
import { membershipSkus } from "./membershipSkus";

// Active Customer Memberships
export const memberships = pgTable("memberships", {
    membershipId: bigint("membership_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    customerId: bigint("customer_id", { mode: "number" }).references(() => customerProfiles.customerId).notNull(),

    skuIdSource: text("sku_id_source").references(() => membershipSkus.skuId),

    // Denormalized scope for easy validation
    locationScope: text("location_scope").notNull(),
    tierScope: text("tier_scope"), // Null = Global

    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),

    status: text("status").default("ACTIVE").notNull(), // ACTIVE, EXPIRED, CANCELLED

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
