import { sql } from "drizzle-orm";
import { pgTable, text, numeric, date, integer, timestamp, bigint } from "drizzle-orm/pg-core";
import { serviceTiers } from "../lookups/serviceTiers";


// Table definition for housemaids
export const housemaids = pgTable("housemaids", {
    housemaidId: bigint("housemaid_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    housemaidCode: text("housemaid_code"),

    // Loyalty & Tiers
    currentServiceTierCode: text("current_service_tier_code").references(() => serviceTiers.tierCode), // REGULAR, PLUS, ALL_IN
    asensoPointsBalance: integer("asenso_points_balance").default(0),

    // Performance
    performanceScore: numeric("performance_score", { precision: 5, scale: 2 }), // 0-100
    averageRating: numeric("average_rating", { precision: 4, scale: 2 }), // 0-5

    name: text("name").notNull(),
    mobile: text("mobile"),
    email: text("email"),
    dateOfBirth: date("date_of_birth"),
    age: integer("age"),
    civilStatus: text("civil_status"),
    dialectSpoken: text("dialect_spoken"),
    addressId: bigint("address_id", { mode: "number" }),
    emergencyContactName: text("emergency_contact_name"),
    emergencyContactMobile: text("emergency_contact_mobile"),
    emergencyContactRelationship: text("emergency_contact_relationship"),
    employmentStatus: text("employment_status"),
    dateStarted: date("date_started"),
    commitment: text("commitment"),
    branchCode: text("branch_code"),
    branchName: text("branch_name"),
    assignedAreas: text("assigned_areas"),
    profilePhoto: text("profile_photo"),
    facebookId: text("facebook_id"),
    facebookName: text("facebook_name"),
    facebookAccessToken: text("facebook_access_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    gcashNumber: text("gcash_number"),
    gcashQrCodeUrl: text("gcash_qr_code_url"),
    status: text("status"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    lastLogin: timestamp("last_login", { withTimezone: true }),
});
