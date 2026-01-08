import { sql } from "drizzle-orm";
import { pgTable, text, boolean, timestamp, bigint } from "drizzle-orm/pg-core";



export const otpVerifications = pgTable("otp_verifications", {
    id: bigint("id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    userType: text("user_type").notNull(), // 'HOUSEMAID', 'ADMIN'
    userId: text("user_id"),
    authProvider: text("auth_provider").notNull(), // 'FACEBOOK', 'GOOGLE'
    providerUserId: text("provider_user_id"),
    mobileNumber: text("mobile_number"),
    otpCode: text("otp_code"),
    isVerified: boolean("is_verified"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
});
