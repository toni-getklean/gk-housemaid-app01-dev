import { pgTable, text, primaryKey } from "drizzle-orm/pg-core";

export const substatus = pgTable(
    "substatus",
    {
        parentStatusCode: text("parent_status_code").notNull(),
        substatusCode: text("substatus_code").notNull(),
        substatusDisplayName: text("substatus_display_name").notNull(),
    },
    (table) => ({
        pk: primaryKey({ columns: [table.parentStatusCode, table.substatusCode] }),
    }),
);
