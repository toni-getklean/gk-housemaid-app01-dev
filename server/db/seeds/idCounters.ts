import "dotenv/config";
import { db } from "@/server/db/client";
import { idCounters } from "@/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("🌱 Seeding id_counters...");

    // Get current year as YY (e.g., '25' for 2025)
    // Note: The user explicitly mentioned "25" in their examples (HM25, etc.)
    // We should use the current operational year.
    const currentYear = new Date().getFullYear(); // e.g., 2025
    const yy = currentYear.toString().slice(-2); // "25"

    // New prefixes based on business rules
    // HM{YY}    -> Booking Code
    // OR{YY}    -> Receipt Number in Booking Payments
    // CUST{YY}  -> Customer Code
    // HMAID{YY} -> Housemaid Code
    // HVIO{YY}  -> Housemaid Violation Code
    // ADMIN{YY} -> Admin Code

    const prefixes = [
        `HM${yy}`,
        `OR${yy}`,
        `CUST${yy}`,
        `HMAID${yy}`,
        `HVIO${yy}`,
        `ADMIN${yy}`
    ];

    const counterSeeds = prefixes.map(prefix => ({ prefix, lastNumber: 0 }));

    for (const row of counterSeeds) {
        const exists = await db
            .select()
            .from(idCounters)
            .where(eq(idCounters.prefix, row.prefix));

        if (exists.length === 0) {
            await db.insert(idCounters).values(row);
            console.log(`Inserted → ${row.prefix}`);
        } else {
            console.log(`Skipped → ${row.prefix} (Exists)`);
        }
    }

    console.log("✅ id_counters seed complete");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding id_counters:", err);
    process.exit(1);
});
