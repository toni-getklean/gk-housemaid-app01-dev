import { pgTable, text, numeric, timestamp, bigint } from "drizzle-orm/pg-core";

export const addresses = pgTable("addresses", {
    addressId: bigint("address_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    addressUnit: text("address_unit"),
    addressBuilding: text("address_building"),
    addressStreet: text("address_street"),
    cityName: text("city_name"),
    addressLine: text("address_line").notNull(),
    addressLink: text("address_link"),
    addressLinkName: text("address_link_name"),
    landmark: text("landmark"),
    latitude: numeric("latitude", { precision: 9, scale: 6 }),
    longitude: numeric("longitude", { precision: 9, scale: 6 }),
    googlePlaceId: text("google_place_id"),
    segmentCode: text("segment_code"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
