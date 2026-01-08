import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";



export const customerProfiles = pgTable("customer_profiles", {
    customerId: bigint("customer_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    customerCode: text("customer_code"),
    accountNumber: text("account_number"),
    customerName: text("customer_name").notNull(),
    contactNumber: text("contact_number"),
    repeatOrNew: text("repeat_or_new"),
    primarySegmentCode: text("primary_segment_code"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
