import { pgTable, text, integer, serial } from "drizzle-orm/pg-core";

export const asensoPointsConfig = pgTable("asenso_points_config", {
    id: serial("id").primaryKey(),

    eventType: text("event_type").notNull(),
    // BOOKING_COMPLETED
    // AVAILABILITY_REWARD
    // (future: PENALTY, BONUS, etc.)

    bookingTypeCode: text("booking_type_code"),
    // TRIAL, ONE_TIME, REPEAT, FLEXI (nullable)

    serviceType: text("service_type"),
    // regular, plus, all_in (nullable)

    pointsAwarded: integer("points_awarded").notNull(),

    description: text("description"),
});
