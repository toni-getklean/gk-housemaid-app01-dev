import { pgTable, text } from "drizzle-orm/pg-core";

export const destinationWallet = pgTable("destination_wallet", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
