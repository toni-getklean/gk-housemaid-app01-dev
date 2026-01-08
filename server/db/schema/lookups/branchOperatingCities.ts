import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";

export const branchOperatingCities = pgTable("branch_operating_cities", {
    branchCode: text("branch_code").notNull(),
    cityName: text("city_name").notNull(),
}, (table) => ({
    pk: primaryKey({ columns: [table.branchCode, table.cityName] }),
}));
