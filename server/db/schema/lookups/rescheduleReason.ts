import { pgTable, text } from "drizzle-orm/pg-core";

export const rescheduleReason = pgTable("reschedule_reason", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
