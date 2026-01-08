import { pgTable, text } from "drizzle-orm/pg-core";

export const marketSegment = pgTable("market_segment", {
    segmentCode: text("segment_code").primaryKey(),
    segmentDisplayName: text("segment_display_name").notNull(),
    segmentType: text("segment_type"),
});
