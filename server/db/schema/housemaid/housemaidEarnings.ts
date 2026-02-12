import { sql } from "drizzle-orm";
import { pgTable, text, numeric, date, timestamp, bigint, integer } from "drizzle-orm/pg-core";



export const housemaidEarnings = pgTable("housemaid_earnings", {
    earningId: bigint("earning_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    type: text("type"),
    bookingId: bigint("booking_id", { mode: "number" }),
    paymentId: bigint("payment_id", { mode: "number" }),
    serviceAmount: numeric("service_amount", { precision: 12, scale: 2 }),
    transportationAmount: numeric("transportation_amount", { precision: 12, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    pointsEarned: integer("points_earned"),
    paymentMethodCode: text("payment_method_code"),
    paymentStatusCode: text("payment_status_code"),
    transactionDate: date("transaction_date"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
