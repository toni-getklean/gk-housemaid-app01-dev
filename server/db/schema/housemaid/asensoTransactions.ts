import { pgTable, text, integer, timestamp, bigint } from "drizzle-orm/pg-core";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { bookings } from "@/server/db/schema/bookings/bookings";

export const asensoTransactions = pgTable("asenso_transactions", {
    transactionId: bigint("transaction_id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),

    housemaidId: bigint("housemaid_id", { mode: "number" }).references(() => housemaids.housemaidId).notNull(),
    bookingId: bigint("booking_id", { mode: "number" }).references(() => bookings.bookingId), // Nullable if manual adjustment

    points: integer("points").notNull(), // Positive for Earn, Negative for Spend
    transactionType: text("transaction_type").notNull(), // EARN_BOOKING, SPEND_REWARD, ADJUSTMENT

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
