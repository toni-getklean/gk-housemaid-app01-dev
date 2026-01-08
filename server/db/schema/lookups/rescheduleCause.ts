import { pgTable, text } from "drizzle-orm/pg-core";

export const rescheduleCause = pgTable("reschedule_cause", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
