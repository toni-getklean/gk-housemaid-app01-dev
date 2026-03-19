import { pgTable, text, integer, timestamp, bigint } from "drizzle-orm/pg-core";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { bookings } from "@/server/db/schema/bookings/bookings";

export const asensoTransactions = pgTable("asenso_transactions", {
    transactionId: bigint("transaction_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    housemaidId: bigint("housemaid_id", { mode: "number" })
        .references(() => housemaids.housemaidId)
        .notNull(),

    bookingId: bigint("booking_id", { mode: "number" })
        .references(() => bookings.bookingId),

    // ✅ CORE DATA
    points: integer("points").notNull(),

    // ✅ EVENT CONTEXT (match config)
    eventType: text("event_type").notNull(), 
    // BOOKING_COMPLETED, AVAILABILITY_REWARD

    bookingTypeCode: text("booking_type_code"),
    // TRIAL, ONE_TIME, REPEAT, FLEXI

    serviceType: text("service_type"),
    // regular, plus, all_in

    // ✅ TRACEABILITY
    configId: integer("config_id"),
    // optional FK to asenso_points_config.id

    // ✅ FINANCIAL TYPE (optional but useful)
    transactionType: text("transaction_type").notNull(),
    // EARN, SPEND, ADJUSTMENT

    // ✅ RUNNING BALANCE (HIGHLY recommended)
    balanceAfter: integer("balance_after"),

    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
