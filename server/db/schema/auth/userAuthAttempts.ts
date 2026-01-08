import { sql } from "drizzle-orm";
import { pgTable, text, integer, timestamp, bigint } from "drizzle-orm/pg-core";



export const userAuthAttempts = pgTable("user_auth_attempts", {
    id: bigint("id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    userType: text("user_type").notNull(), // 'HOUSEMAID', 'ADMIN'
    userId: text("user_id"),
    mobileNumber: text("mobile_number"),
    authProvider: text("auth_provider").notNull(), // 'FACEBOOK', 'GOOGLE'
    providerUserId: text("provider_user_id"),
    otpRequestCount: integer("otp_request_count").default(0),
    lastOtpRequestedAt: timestamp("last_otp_requested_at", { withTimezone: true }),
    otpVerificationFailCount: integer("otp_verification_fail_count").default(0),
    lastOtpVerificationFailAt: timestamp("last_otp_verification_fail_at", { withTimezone: true }),
    registrationFailCount: integer("registration_fail_count").default(0),
    lastRegistrationAttemptAt: timestamp("last_registration_attempt_at", { withTimezone: true }),
    loginFailCount: integer("login_fail_count").default(0),
    lastLoginAttemptAt: timestamp("last_login_attempt_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
});
