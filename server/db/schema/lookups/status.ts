import { pgTable, text } from "drizzle-orm/pg-core";

export const status = pgTable("status", {
    statusCode: text("status_code").primaryKey(),
    statusDisplayName: text("status_display_name").notNull(),
});