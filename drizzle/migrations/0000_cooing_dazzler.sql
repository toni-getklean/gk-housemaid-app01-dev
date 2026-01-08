CREATE TABLE "bookings" (
	"booking_id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"customer_address_id" text,
	"created_by_admin_id" text,
	"handled_by_admin_id" text,
	"last_updated_by_type" text,
	"last_updated_by_id" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"acquisition_code" text,
	"segment_code" text,
	"branch_code" text,
	"booking_date" date,
	"service_date" date NOT NULL,
	"original_service_date" date,
	"rescheduled_count" integer,
	"service_type_code" text,
	"category_code" text,
	"notes" text,
	"extra_notes" text,
	"time" text NOT NULL,
	"status_code" text NOT NULL,
	"substatus_code" text,
	"substatus_notes" text,
	"housemaid_id" text,
	"housemaid_name" text,
	"housemaid_accepted_at" timestamp with time zone,
	"housemaid_dispatched_at" timestamp with time zone,
	"housemaid_departed_at" timestamp with time zone,
	"housemaid_arrived_at" timestamp with time zone,
	"housemaid_check_in_time" timestamp with time zone,
	"housemaid_check_out_time" timestamp with time zone,
	"housemaid_completed_at" timestamp with time zone,
	"proof_of_arrival_img" text,
	"proof_of_arrival_data" text,
	"transportation_id" text,
	"date_modified" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "booking_activity_log" (
	"booking_activity_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"actor_type" text NOT NULL,
	"actor_id" text NOT NULL,
	"audience" text NOT NULL,
	"action" text NOT NULL,
	"status_code" text,
	"substatus_code" text,
	"title" text,
	"message" text,
	"changed_fields" jsonb,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_payments" (
	"payment_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"service_invoice" text,
	"receipt_number" text,
	"receipt_url" text,
	"payment_code" text,
	"payment_status_code" text,
	"original_amount" numeric(12, 2),
	"discount" numeric(12, 2),
	"total_amount" numeric(12, 2),
	"amount_paid" numeric(12, 2),
	"balance_amount" numeric(12, 2),
	"payment_state" text,
	"payment_date" timestamp with time zone,
	"confirmed_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "booking_offers" (
	"booking_offer_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"offer_code" text NOT NULL,
	"discount_amount" numeric(12, 2),
	"discount_percent" numeric(5, 2),
	"computed_discount" numeric(12, 2),
	"applied_to_amount" numeric(12, 2),
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "booking_ratings" (
	"booking_rating_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "housemaids" (
	"housemaid_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"mobile" text,
	"email" text,
	"date_of_birth" date,
	"age" integer,
	"civil_status" text,
	"dialect_spoken" text,
	"address_id" text,
	"emergency_contact_name" text,
	"emergency_contact_mobile" text,
	"emergency_contact_relationship" text,
	"employment_status" text,
	"date_started" date,
	"commitment" text,
	"branch_code" text,
	"branch_name" text,
	"assigned_areas" text,
	"profile_photo" text,
	"facebook_id" text,
	"facebook_name" text,
	"facebook_access_token" text,
	"token_expires_at" timestamp with time zone,
	"gcash_number" text,
	"status" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"last_login" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "housemaid_skills" (
	"housemaid_id" text NOT NULL,
	"skill_code" text NOT NULL,
	"rating" integer,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	CONSTRAINT "housemaid_skills_housemaid_id_skill_code_pk" PRIMARY KEY("housemaid_id","skill_code")
);
--> statement-breakpoint
CREATE TABLE "housemaid_availability" (
	"availability_id" text PRIMARY KEY NOT NULL,
	"housemaid_id" text NOT NULL,
	"availability_date" date NOT NULL,
	"status_code" text,
	"time_commitment" text,
	"reason" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "housemaid_ratings" (
	"housemaid_rating_id" text PRIMARY KEY NOT NULL,
	"housemaid_id" text NOT NULL,
	"booking_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "housemaid_performance" (
	"performance_id" text PRIMARY KEY NOT NULL,
	"housemaid_id" text NOT NULL,
	"month" text NOT NULL,
	"total_jobs" integer,
	"completed_jobs" integer,
	"avg_rating" numeric(4, 2),
	"completion_rate" numeric(5, 2),
	"total_earnings" numeric(12, 2),
	"minor_violations" integer,
	"major_violations" integer,
	"generated_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "housemaid_violations" (
	"violation_id" text PRIMARY KEY NOT NULL,
	"housemaid_id" text NOT NULL,
	"booking_id" text,
	"violation_type" text,
	"violation_title" text,
	"violation_description" text,
	"date" date,
	"status" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "addresses" (
	"address_id" text PRIMARY KEY NOT NULL,
	"address_unit" text,
	"address_building" text,
	"address_street" text,
	"city_name" text,
	"address_line" text NOT NULL,
	"address_link" text,
	"address_link_name" text,
	"landmark" text,
	"latitude" numeric(9, 6),
	"longitude" numeric(9, 6),
	"google_place_id" text,
	"segment_code" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_profiles" (
	"customer_id" text PRIMARY KEY NOT NULL,
	"account_number" text,
	"customer_name" text NOT NULL,
	"contact_number" text,
	"repeat_or_new" text,
	"primary_segment_code" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_addresses" (
	"customer_address_id" text PRIMARY KEY NOT NULL,
	"customer_id" text NOT NULL,
	"address_id" text NOT NULL,
	"label" text,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer_ratings" (
	"customer_rating_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"housemaid_id" text NOT NULL,
	"customer_id" text NOT NULL,
	"rating" integer NOT NULL,
	"feedback" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transportation_details" (
	"transportation_id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"housemaid_id" text NOT NULL,
	"total_transportation_cost" numeric(12, 2),
	"transportation_submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "transportation_legs" (
	"transportation_leg_id" text PRIMARY KEY NOT NULL,
	"transportation_id" text NOT NULL,
	"direction" text NOT NULL,
	"leg_sequence" integer NOT NULL,
	"mode" text NOT NULL,
	"cost" numeric(12, 2) NOT NULL,
	"receipt_url" text,
	"notes" text,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "admins" (
	"admin_id" text PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"mobile_number" text,
	"google_id" text,
	"google_name" text,
	"google_picture" text,
	"google_access_token" text,
	"google_refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"role" text,
	"branch_code" text,
	"status" text,
	"created_at" timestamp with time zone,
	"last_login" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_auth_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_type" text NOT NULL,
	"user_id" text,
	"mobile_number" text,
	"auth_provider" text NOT NULL,
	"provider_user_id" text,
	"otp_request_count" integer DEFAULT 0,
	"last_otp_requested_at" timestamp with time zone,
	"otp_verification_fail_count" integer DEFAULT 0,
	"last_otp_verification_fail_at" timestamp with time zone,
	"registration_fail_count" integer DEFAULT 0,
	"last_registration_attempt_at" timestamp with time zone,
	"login_fail_count" integer DEFAULT 0,
	"last_login_attempt_at" timestamp with time zone,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "otp_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_type" text NOT NULL,
	"user_id" text,
	"auth_provider" text NOT NULL,
	"provider_user_id" text,
	"mobile_number" text,
	"otp_code" text,
	"is_verified" boolean,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "status" (
	"status_code" text PRIMARY KEY NOT NULL,
	"status_display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "substatus" (
	"parent_status_code" text NOT NULL,
	"substatus_code" text NOT NULL,
	"substatus_display_name" text NOT NULL,
	CONSTRAINT "substatus_parent_status_code_substatus_code_pk" PRIMARY KEY("parent_status_code","substatus_code")
);
--> statement-breakpoint
CREATE TABLE "service_type" (
	"service_type_code" text PRIMARY KEY NOT NULL,
	"service_display_name" text NOT NULL,
	"duration_category" text,
	"booking_frequency" text
);
--> statement-breakpoint
CREATE TABLE "service_category" (
	"category_code" text PRIMARY KEY NOT NULL,
	"category_display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "market_segment" (
	"segment_code" text PRIMARY KEY NOT NULL,
	"segment_display_name" text NOT NULL,
	"segment_type" text
);
--> statement-breakpoint
CREATE TABLE "payment_method" (
	"payment_code" text PRIMARY KEY NOT NULL,
	"payment_display_name" text NOT NULL,
	"payment_method_type" text
);
--> statement-breakpoint
CREATE TABLE "payment_status" (
	"status_code" text PRIMARY KEY NOT NULL,
	"status_name" text NOT NULL,
	"status_type" text,
	"status_description" text
);
--> statement-breakpoint
CREATE TABLE "acquisition" (
	"acquisition_code" text PRIMARY KEY NOT NULL,
	"acquisition_display_name" text NOT NULL,
	"source_channel" text,
	"client_type" text,
	"campaign_type" text
);
--> statement-breakpoint
CREATE TABLE "offered" (
	"offer_code" text PRIMARY KEY NOT NULL,
	"offer_display_name" text NOT NULL,
	"offer_type" text
);
--> statement-breakpoint
CREATE TABLE "branch_code" (
	"branch_code" text PRIMARY KEY NOT NULL,
	"branch_name" text NOT NULL,
	"branch_city" text,
	"branch_province" text,
	"branch_region" text
);
--> statement-breakpoint
CREATE TABLE "city" (
	"city_name" text PRIMARY KEY NOT NULL,
	"city_province" text,
	"city_region" text,
	"is_province" boolean
);
--> statement-breakpoint
CREATE TABLE "branch_operating_cities" (
	"branch_code" text NOT NULL,
	"city_name" text NOT NULL,
	CONSTRAINT "branch_operating_cities_branch_code_city_name_pk" PRIMARY KEY("branch_code","city_name")
);
--> statement-breakpoint
CREATE TABLE "id_counters" (
	"prefix" text PRIMARY KEY NOT NULL,
	"last_number" bigint NOT NULL
);
