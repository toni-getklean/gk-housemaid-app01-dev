import { sql } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, bigint } from "drizzle-orm/pg-core";



export const customerAddresses = pgTable("customer_addresses", {
    customerAddressId: bigint("customer_address_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    addressId: bigint("address_id", { mode: "number" }).notNull(),
    label: text("label"),
    isPrimary: boolean("is_primary").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
