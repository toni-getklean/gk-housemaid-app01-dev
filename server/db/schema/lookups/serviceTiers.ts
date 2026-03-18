import { pgTable, text } from "drizzle-orm/pg-core";

export const serviceTiers = pgTable("service_tiers", {
    tierCode: text("tier_code").primaryKey(), // REGULAR, PLUS, ALL_IN
    displayName: text("display_name").notNull(),
    description: text("description"),
});
