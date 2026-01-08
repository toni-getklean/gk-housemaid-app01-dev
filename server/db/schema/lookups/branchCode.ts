import { pgTable, text } from "drizzle-orm/pg-core";

export const branchCode = pgTable("branch_code", {
    branchCode: text("branch_code").primaryKey(),
    branchName: text("branch_name").notNull(),
    branchCity: text("branch_city"),
    branchProvince: text("branch_province"),
    branchRegion: text("branch_region"),

});
