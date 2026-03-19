import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";

export const housemaidCertifications = pgTable("housemaid_certifications", {
    certificationId: bigint("certification_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    housemaidId: bigint("housemaid_id", { mode: "number" }).notNull(),
    skillCategory: text("skill_category").notNull(), // Housekeeping, Laundry, etc.
    trainingLevel: text("training_level").notNull(), // ENTRY, BASIC, ADVANCED, EXPERT
    certificationName: text("certification_name").notNull(), // e.g., "Linis 101"
    grantedAt: timestamp("granted_at", { withTimezone: true }).defaultNow(),
    grantedBy: text("granted_by"), // admin ID
});
