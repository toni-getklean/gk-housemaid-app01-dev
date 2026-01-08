import { pgTable, text } from "drizzle-orm/pg-core";

export const validationStatus = pgTable("validation_status", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
