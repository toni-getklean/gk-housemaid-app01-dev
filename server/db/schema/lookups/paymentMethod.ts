import { pgTable, text } from "drizzle-orm/pg-core";

export const paymentMethod = pgTable("payment_method", {
    paymentCode: text("payment_code").primaryKey(),
    displayName: text("display_name").notNull(),
    paymentMethodType: text("payment_method_type"),
});
