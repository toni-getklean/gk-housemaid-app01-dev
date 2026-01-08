CREATE TABLE "housemaid_earnings" (
	"earning_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "housemaid_earnings_earning_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"housemaid_id" bigint NOT NULL,
	"type" text,
	"booking_id" bigint,
	"payment_id" bigint,
	"service_amount" numeric(12, 2),
	"transportation_amount" numeric(12, 2),
	"total_amount" numeric(12, 2),
	"payment_code" text,
	"payment_status_code" text,
	"transaction_date" date,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "booking_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "bookings_booking_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "customer_address_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "transportation_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_activity_log" ALTER COLUMN "booking_activity_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_activity_log" ALTER COLUMN "booking_activity_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "booking_activity_log_booking_activity_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "booking_activity_log" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_payments" ALTER COLUMN "payment_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_payments" ALTER COLUMN "payment_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "booking_payments_payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "booking_payments" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_offers" ALTER COLUMN "booking_offer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_offers" ALTER COLUMN "booking_offer_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "booking_offers_booking_offer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "booking_offers" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_ratings" ALTER COLUMN "booking_rating_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_ratings" ALTER COLUMN "booking_rating_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "booking_ratings_booking_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "booking_ratings" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "booking_ratings" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaids" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaids" ALTER COLUMN "housemaid_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "housemaids_housemaid_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "housemaids" ALTER COLUMN "address_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_skills" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_availability" ALTER COLUMN "availability_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_availability" ALTER COLUMN "availability_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "housemaid_availability_availability_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "housemaid_availability" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_ratings" ALTER COLUMN "housemaid_rating_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_ratings" ALTER COLUMN "housemaid_rating_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "housemaid_ratings_housemaid_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "housemaid_ratings" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_ratings" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_ratings" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_performance" ALTER COLUMN "performance_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_performance" ALTER COLUMN "performance_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "housemaid_performance_performance_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "housemaid_performance" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_violations" ALTER COLUMN "violation_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_violations" ALTER COLUMN "violation_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "housemaid_violations_violation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "housemaid_violations" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "housemaid_violations" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "address_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "addresses" ALTER COLUMN "address_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "addresses_address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_profiles" ALTER COLUMN "customer_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "customer_profiles_customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "customer_addresses" ALTER COLUMN "customer_address_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_addresses" ALTER COLUMN "customer_address_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "customer_addresses_customer_address_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "customer_addresses" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_addresses" ALTER COLUMN "address_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_ratings" ALTER COLUMN "customer_rating_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_ratings" ALTER COLUMN "customer_rating_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "customer_ratings_customer_rating_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "customer_ratings" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_ratings" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "customer_ratings" ALTER COLUMN "customer_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transportation_details" ALTER COLUMN "transportation_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transportation_details" ALTER COLUMN "transportation_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "transportation_details_transportation_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "transportation_details" ALTER COLUMN "booking_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transportation_details" ALTER COLUMN "housemaid_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transportation_legs" ALTER COLUMN "transportation_leg_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "transportation_legs" ALTER COLUMN "transportation_leg_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "transportation_legs_transportation_leg_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "transportation_legs" ALTER COLUMN "transportation_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "admin_id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "admins" ALTER COLUMN "admin_id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "admins_admin_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "user_auth_attempts" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "user_auth_attempts" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "user_auth_attempts_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "otp_verifications" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "otp_verifications" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (sequence name "otp_verifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1);--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_code" text;--> statement-breakpoint
ALTER TABLE "housemaids" ADD COLUMN "housemaid_code" text;--> statement-breakpoint
ALTER TABLE "housemaid_violations" ADD COLUMN "violation_code" text;--> statement-breakpoint
ALTER TABLE "customer_profiles" ADD COLUMN "customer_code" text;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "admin_code" text;