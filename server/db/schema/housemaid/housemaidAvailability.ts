import { sql } from "drizzle-orm";
import { pgTable, text, date, timestamp, bigint } from "drizzle-orm/pg-core";



export const housemaidAvailability = pgTable("housemaid_availability", {
    availabilityId: bigint("availability_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    availabilityDate: date("availability_date").notNull(),
    statusCode: text("status_code"),
    timeCommitment: text("time_commitment"),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
