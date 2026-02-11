CREATE TABLE "booking_decline_reason" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pricing_tiers" (
	"tier_code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "reschedule_cause" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reschedule_reason" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asenso_transactions" (
	"transaction_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "asenso_transactions_transaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"housemaid_id" bigint NOT NULL,
	"booking_id" bigint,
	"points" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "housemaid_tiers" (
	"tier_code" text PRIMARY KEY NOT NULL,
	"tier_label" text NOT NULL,
	"min_points" integer NOT NULL,
	"estimated_bookings" integer,
	"tier_order" integer NOT NULL,
	"description" text,
	"color_class" text,
	"unlocked_skills" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "asenso_points_config" (
	"booking_type_code" text PRIMARY KEY NOT NULL,
	"points_awarded" integer NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "service_skus" (
	"sku_id" text PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"tier_code" text NOT NULL,
	"duration" text NOT NULL,
	"booking_type" text NOT NULL,
	"service_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "membership_skus" (
	"sku_id" text PRIMARY KEY NOT NULL,
	"location" text NOT NULL,
	"tier_code" text,
	"term_months" integer NOT NULL,
	"service_price" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "flexi_rate_cards" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "flexi_rate_cards_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"location" text NOT NULL,
	"tier_code" text NOT NULL,
	"duration" text NOT NULL,
	"base_rate_weekday" numeric(12, 2) NOT NULL,
	"surge_add_weekend_holiday" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"membership_id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "memberships_membership_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"customer_id" bigint NOT NULL,
	"sku_id_source" text,
	"location_scope" text NOT NULL,
	"tier_scope" text,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "location" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "tier_code" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "booking_type_code" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "day_type" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "pricing_breakdown" jsonb;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "asenso_points_awarded" integer;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "housemaid_declined_at" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "decline_reason_code" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_requested_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_requested_by" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_reason_id" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_proposed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_approved_by" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_approved_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reschedule_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "assignment_attempt_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "housemaids" ADD COLUMN "current_tier_code" text;--> statement-breakpoint
ALTER TABLE "housemaids" ADD COLUMN "asenso_points_balance" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "housemaid_earnings" ADD COLUMN "payment_method_code" text;--> statement-breakpoint
ALTER TABLE "transportation_details" ADD COLUMN "payment_status" text DEFAULT 'AWAITING_PAYMENT';--> statement-breakpoint
ALTER TABLE "transportation_details" ADD COLUMN "payment_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "asenso_transactions" ADD CONSTRAINT "asenso_transactions_housemaid_id_housemaids_housemaid_id_fk" FOREIGN KEY ("housemaid_id") REFERENCES "public"."housemaids"("housemaid_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asenso_transactions" ADD CONSTRAINT "asenso_transactions_booking_id_bookings_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("booking_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_skus" ADD CONSTRAINT "service_skus_tier_code_pricing_tiers_tier_code_fk" FOREIGN KEY ("tier_code") REFERENCES "public"."pricing_tiers"("tier_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_skus" ADD CONSTRAINT "membership_skus_tier_code_pricing_tiers_tier_code_fk" FOREIGN KEY ("tier_code") REFERENCES "public"."pricing_tiers"("tier_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "flexi_rate_cards" ADD CONSTRAINT "flexi_rate_cards_tier_code_pricing_tiers_tier_code_fk" FOREIGN KEY ("tier_code") REFERENCES "public"."pricing_tiers"("tier_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_customer_id_customer_profiles_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_sku_id_source_membership_skus_sku_id_fk" FOREIGN KEY ("sku_id_source") REFERENCES "public"."membership_skus"("sku_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tier_code_pricing_tiers_tier_code_fk" FOREIGN KEY ("tier_code") REFERENCES "public"."pricing_tiers"("tier_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" DROP COLUMN "category_code";--> statement-breakpoint
ALTER TABLE "housemaid_earnings" DROP COLUMN "payment_code";