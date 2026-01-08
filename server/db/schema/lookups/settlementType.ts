import { pgTable, text } from "drizzle-orm/pg-core";

export const settlementType = pgTable("settlement_type", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
