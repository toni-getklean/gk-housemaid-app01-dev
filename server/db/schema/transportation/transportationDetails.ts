import { sql } from "drizzle-orm";
import { pgTable, text, numeric, timestamp, bigint } from "drizzle-orm/pg-core";

export const transportationDetails = pgTable("transportation_details", {
    transportationId: bigint("transportation_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    bookingId: bigint("booking_id", { mode: "number" }).notNull(),          // FK → bookings
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),      // FK → housemaids

    totalTransportationCost: numeric("total_transportation_cost", { precision: 12, scale: 2 }),

    paymentStatus: text("payment_status").default("AWAITING_PAYMENT"),
    paymentDate: timestamp("payment_date", { withTimezone: true }),

    transportationSubmittedAt: timestamp("transportation_submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
