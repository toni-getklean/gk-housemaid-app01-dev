import { pgTable, text } from "drizzle-orm/pg-core";

export const sourceInstitution = pgTable("source_institution", {
    code: text("code").primaryKey(),
    displayName: text("display_name").notNull(),
});
