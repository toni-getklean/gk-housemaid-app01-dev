import "dotenv/config";

import { db } from "@/server/db/client";
import { paymentMethod } from "@/server/db/schema/lookups/paymentMethod";
import { eq } from "drizzle-orm";

const paymentMethodData = [
    { paymentCode: "CASH", displayName: "Cash", paymentMethodType: "Cash" },
    { paymentCode: "BANK_TRANSFER", displayName: "Bank Transfer", paymentMethodType: "Bank Transfer" },
    { paymentCode: "E_WALLET", displayName: "E-Wallet", paymentMethodType: "Digital Wallet" },
    { paymentCode: "CHEQUE", displayName: "Cheque", paymentMethodType: "Cheque" },
    { paymentCode: "BILLING", displayName: "Billing", paymentMethodType: "Invoice" },
    { paymentCode: "A_R", displayName: "Accounts Receivable", paymentMethodType: "Credit" },
    { paymentCode: "VOUCHER", displayName: "Voucher", paymentMethodType: "Voucher" },
    { paymentCode: "SALARY_DEDUCTION", displayName: "Salary Deduction", paymentMethodType: "Deduction" },
];

async function main() {
    console.log("🌱 Seeding payment_method...");

    for (const row of paymentMethodData) {
        const existing = await db
            .select()
            .from(paymentMethod)
            .where(eq(paymentMethod.paymentCode, row.paymentCode));

        if (existing.length === 0) {
            await db.insert(paymentMethod).values(row);
            console.log(`Inserted → ${row.paymentCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.paymentCode}`);
        }
    }

    console.log("✅ Seed complete: payment_method");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding payment_method:", err);
    process.exit(1);
});
