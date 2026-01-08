import { pgTable, text } from "drizzle-orm/pg-core";

export const serviceCategory = pgTable("service_category", {
    categoryCode: text("category_code").primaryKey(),
    categoryDisplayName: text("category_display_name").notNull(),
});
