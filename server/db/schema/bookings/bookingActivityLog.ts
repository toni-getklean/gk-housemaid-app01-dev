import { sql } from "drizzle-orm";
import { pgTable, text, jsonb, timestamp, bigint } from "drizzle-orm/pg-core";



export const bookingActivityLog = pgTable("booking_activity_log", {
    bookingActivityId: bigint("booking_activity_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    bookingId: bigint("booking_id", { mode: "number" }).notNull(),
    actorType: text("actor_type").notNull(),
    actorId: text("actor_id").notNull(),
    audience: text("audience").notNull(),
    action: text("action").notNull(),
    statusCode: text("status_code"),
    substatusCode: text("substatus_code"),
    title: text("title"),
    message: text("message"),
    changedFields: jsonb("changed_fields"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
