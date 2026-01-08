import { pgTable, text } from "drizzle-orm/pg-core";

export const acquisition = pgTable("acquisition", {
    acquisitionCode: text("acquisition_code").primaryKey(),
    acquisitionDisplayName: text("acquisition_display_name").notNull(),
    sourceChannel: text("source_channel"),
    clientType: text("client_type"),
    campaignType: text("campaign_type"),
});
