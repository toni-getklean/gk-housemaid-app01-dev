import { pgTable, text } from "drizzle-orm/pg-core";

export const offered = pgTable("offered", {
    offerCode: text("offer_code").primaryKey(),
    offerDisplayName: text("offer_display_name").notNull(),
    offerType: text("offer_type"),
});
