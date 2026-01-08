import { pgTable, text, boolean } from "drizzle-orm/pg-core";

export const city = pgTable("city", {
    cityName: text("city_name").primaryKey(),
    cityProvince: text("city_province"),
    cityRegion: text("city_region"),
    isProvince: boolean("is_province"),
});
