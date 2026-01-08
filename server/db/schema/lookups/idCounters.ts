import { pgTable, text, bigint } from "drizzle-orm/pg-core";

export const idCounters = pgTable("id_counters", {
    prefix: text("prefix").primaryKey(),
    lastNumber: bigint("last_number", { mode: "number" }).notNull(),
});
