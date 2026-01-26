import { sql } from "drizzle-orm";
import { pgTable, text, date, integer, timestamp, bigint, jsonb } from "drizzle-orm/pg-core";



export const bookings = pgTable("bookings", {
    bookingId: bigint("booking_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    bookingCode: text("booking_code"),

    customerId: bigint("customer_id", { mode: "number" }).notNull(),
    customerAddressId: bigint("customer_address_id", { mode: "number" }),

    createdByAdminId: text("created_by_admin_id"),
    handledByAdminId: text("handled_by_admin_id"),

    lastUpdatedByType: text("last_updated_by_type"),
    lastUpdatedById: text("last_updated_by_id"),

    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),

    acquisitionCode: text("acquisition_code"),
    segmentCode: text("segment_code"),
    branchCode: text("branch_code"),

    bookingDate: date("booking_date"),
    serviceDate: date("service_date").notNull(),
    originalServiceDate: date("original_service_date"),
    rescheduledCount: integer("rescheduled_count"),

    serviceTypeCode: text("service_type_code"),
    categoryCode: text("category_code"),

    notes: text("notes"),
    extraNotes: text("extra_notes"),
    time: text("time").notNull(),

    statusCode: text("status_code").notNull(),
    substatusCode: text("substatus_code"),
    substatusNotes: text("substatus_notes"),

    // Pricing & Specs V2 Fields
    location: text("location"), // NCR, CEBU, CAVITE
    tierCode: text("tier_code"), // REGULAR, PLUS, ALL_IN
    bookingTypeCode: text("booking_type_code"), // TRIAL, ONE_TIME, FLEXI
    dayType: text("day_type"), // WEEKDAY, WEEKEND_HOLIDAY

    // Stored calculation for audit
    // Stored calculation for audit
    pricingBreakdown: jsonb("pricing_breakdown"),

    // Loyalty
    asensoPointsAwarded: integer("asenso_points_awarded"),

    housemaidId: bigint("housemaid_id", { mode: "number" }),
    housemaidName: text("housemaid_name"),

    housemaidAcceptedAt: text("housemaid_accepted_at"),
    housemaidDispatchedAt: text("housemaid_dispatched_at"),
    housemaidDepartedAt: text("housemaid_departed_at"),
    housemaidArrivedAt: text("housemaid_arrived_at"),
    housemaidCheckInTime: text("housemaid_check_in_time"),
    housemaidCheckOutTime: text("housemaid_check_out_time"),
    housemaidCompletedAt: text("housemaid_completed_at"),
    housemaidDeclinedAt: text("housemaid_declined_at"),
    declineReasonCode: text("decline_reason_code"),

    proofOfArrivalImg: text("proof_of_arrival_img"),
    proofOfArrivalData: text("proof_of_arrival_data"),

    transportationId: bigint("transportation_id", { mode: "number" }),

    // Reschedule Fields
    rescheduleRequestedAt: timestamp("reschedule_requested_at", { withTimezone: true }),
    rescheduleRequestedBy: text("reschedule_requested_by"),
    rescheduleReasonId: text("reschedule_reason_id"),
    rescheduleProposedAt: timestamp("reschedule_proposed_at", { withTimezone: true }),
    rescheduleApprovedBy: text("reschedule_approved_by"),
    rescheduleApprovedAt: timestamp("reschedule_approved_at", { withTimezone: true }),

    rescheduleCount: integer("reschedule_count").default(0).notNull(),
    assignmentAttemptCount: integer("assignment_attempt_count").default(0).notNull(),

    dateModified: timestamp("date_modified", { withTimezone: true }),
});
