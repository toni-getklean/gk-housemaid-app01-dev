import { pgTable, text } from "drizzle-orm/pg-core";

export const bookingDeclineReason = pgTable("booking_decline_reason", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
