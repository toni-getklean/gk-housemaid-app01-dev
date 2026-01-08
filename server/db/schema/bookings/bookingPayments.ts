import { sql } from "drizzle-orm";
import { pgTable, text, numeric, timestamp, bigint } from "drizzle-orm/pg-core";
import { paymentSource } from "@/server/db/schema/lookups/paymentSource";
import { paymentMethod } from "@/server/db/schema/lookups/paymentMethod";
import { paymentStatus } from "@/server/db/schema/lookups/paymentStatus";
import { validationStatus } from "@/server/db/schema/lookups/validationStatus";
import { settlementType } from "@/server/db/schema/lookups/settlementType";
import { sourceInstitution } from "@/server/db/schema/lookups/sourceInstitution";
import { destinationWallet } from "@/server/db/schema/lookups/destinationWallet";



export const bookingPayments = pgTable("booking_payments", {
    paymentId: bigint("payment_id", { mode: "number" })
        .primaryKey()
        .generatedAlwaysAsIdentity(),
    bookingId: bigint("booking_id", { mode: "number" }).notNull(),

    // Lookup Relationships
    paymentSourceCode: text("payment_source_code").references(() => paymentSource.code),
    paymentMethodCode: text("payment_method_code").references(() => paymentMethod.paymentCode),
    paymentStatusCode: text("payment_status_code").references(() => paymentStatus.statusCode),
    validationStatusCode: text("validation_status_code").references(() => validationStatus.code),

    settlementTypeCode: text("settlement_type_code").references(() => settlementType.code),
    sourceInstitutionCode: text("source_institution_code").references(() => sourceInstitution.code),
    destinationWalletCode: text("destination_wallet_code").references(() => destinationWallet.code),

    serviceInvoice: text("service_invoice"),
    receiptNumber: text("receipt_number"),
    receiptUrl: text("receipt_url"),

    // Financials
    originalAmount: numeric("original_amount", { precision: 12, scale: 2 }),
    discount: numeric("discount", { precision: 12, scale: 2 }),
    totalAmount: numeric("total_amount", { precision: 12, scale: 2 }),
    amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }),
    balanceAmount: numeric("balance_amount", { precision: 12, scale: 2 }),

    // Timestamps
    paymentDate: timestamp("payment_date", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
});
