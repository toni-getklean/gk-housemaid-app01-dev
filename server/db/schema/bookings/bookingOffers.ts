import { sql } from "drizzle-orm";
import { pgTable, text, numeric, timestamp, bigint } from "drizzle-orm/pg-core";



export const bookingOffers = pgTable("booking_offers", {
    bookingOfferId: bigint("booking_offer_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    bookingId: bigint("booking_id", { mode: "number" }).notNull(),
    offerCode: text("offer_code").notNull(),
    discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }),
    discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }),
    computedDiscount: numeric("computed_discount", { precision: 12, scale: 2 }),
    appliedToAmount: numeric("applied_to_amount", { precision: 12, scale: 2 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
