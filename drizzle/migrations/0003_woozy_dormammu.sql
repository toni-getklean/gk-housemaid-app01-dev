CREATE TABLE "payment_source" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_institution" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "destination_wallet" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settlement_type" (
	"code" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_status" ADD COLUMN "display_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_method" DROP COLUMN "payment_display_name";--> statement-breakpoint
ALTER TABLE "payment_status" DROP COLUMN "status_name";