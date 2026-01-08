import { sql } from "drizzle-orm";
import { pgTable, text, integer, numeric, timestamp, bigint } from "drizzle-orm/pg-core";


export const transportationLegs = pgTable("transportation_legs", {
    transportationLegId: bigint("transportation_leg_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(), // TRANSLxxxxxxxx
    transportationId: bigint("transportation_id", { mode: "number" }).notNull(), // FK → transportation_details

    direction: text("direction").notNull(),  // 'TO_CLIENT' or 'RETURN'
    legSequence: integer("leg_sequence").notNull(),  // 1,2,3,...

    mode: text("mode").notNull(),            // 'bus', 'jeep', 'train', 'tricycle', etc.
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),

    receiptUrl: text("receipt_url"),
    notes: text("notes"),

    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
