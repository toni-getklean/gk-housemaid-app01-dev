import { pgTable, text } from "drizzle-orm/pg-core";

export const paymentSource = pgTable("payment_source", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
