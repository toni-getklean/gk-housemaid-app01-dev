import { pgTable, text, integer, timestamp, primaryKey, bigint } from "drizzle-orm/pg-core";

export const housemaidSkills = pgTable("housemaid_skills", {
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    skillCode: text("skill_code").notNull(),
    rating: integer("rating"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
}, (table) => ({
    pk: primaryKey({ columns: [table.housemaidId, table.skillCode] }),
}));
