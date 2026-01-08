import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, bigint } from "drizzle-orm/pg-core";



export const admins = pgTable("admins", {
    adminId: bigint("admin_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    adminCode: text("admin_code"),
    fullName: text("full_name").notNull(),
    email: text("email").notNull(),
    mobileNumber: text("mobile_number"),
    googleId: text("google_id"),
    googleName: text("google_name"),
    googlePicture: text("google_picture"),
    googleAccessToken: text("google_access_token"),
    googleRefreshToken: text("google_refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    role: text("role"),
    branchCode: text("branch_code"),
    status: text("status"),
    createdAt: timestamp("created_at", { withTimezone: true }),
    lastLogin: timestamp("last_login", { withTimezone: true }),
});
