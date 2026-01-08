import { pgTable, text } from "drizzle-orm/pg-core";

export const serviceType = pgTable("service_type", {
    serviceTypeCode: text("service_type_code").primaryKey(),
    serviceDisplayName: text("service_display_name").notNull(),
    durationCategory: text("duration_category"),
    bookingFrequency: text("booking_frequency"),
});
