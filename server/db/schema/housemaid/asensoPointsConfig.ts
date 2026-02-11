import { pgTable, text, integer } from "drizzle-orm/pg-core";

export const asensoPointsConfig = pgTable("asenso_points_config", {
    bookingTypeCode: text("booking_type_code").primaryKey(), // TRIAL, ONE_TIME, FLEXI
    pointsAwarded: integer("points_awarded").notNull(),
    description: text("description"),
});
