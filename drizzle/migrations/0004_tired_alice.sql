CREATE TABLE "validation_status" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "payment_source_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "payment_method_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "validation_status_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "settlement_type_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "source_institution_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD COLUMN "destination_wallet_code" text;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_payment_source_code_payment_source_code_fk" FOREIGN KEY ("payment_source_code") REFERENCES "public"."payment_source"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_payment_method_code_payment_method_payment_code_fk" FOREIGN KEY ("payment_method_code") REFERENCES "public"."payment_method"("payment_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_payment_status_code_payment_status_status_code_fk" FOREIGN KEY ("payment_status_code") REFERENCES "public"."payment_status"("status_code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_validation_status_code_validation_status_code_fk" FOREIGN KEY ("validation_status_code") REFERENCES "public"."validation_status"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_settlement_type_code_settlement_type_code_fk" FOREIGN KEY ("settlement_type_code") REFERENCES "public"."settlement_type"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_source_institution_code_source_institution_code_fk" FOREIGN KEY ("source_institution_code") REFERENCES "public"."source_institution"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_destination_wallet_code_destination_wallet_code_fk" FOREIGN KEY ("destination_wallet_code") REFERENCES "public"."destination_wallet"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_payments" DROP COLUMN "payment_code";--> statement-breakpoint
ALTER TABLE "booking_payments" DROP COLUMN "payment_state";