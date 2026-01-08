import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, bigint } from "drizzle-orm/pg-core";



export const customerRatings = pgTable("customer_ratings", {
    customerRatingId: bigint("customer_rating_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    bookingId: bigint("booking_id", { mode: "number" }).notNull(),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    rating: integer("rating").notNull(),
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
