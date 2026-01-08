import { pgTable, text } from "drizzle-orm/pg-core";

export const paymentStatus = pgTable("payment_status", {
    statusCode: text("status_code").primaryKey(),
    displayName: text("display_name").notNull(),
    statusType: text("status_type"),
    statusDescription: text("status_description"),
});
