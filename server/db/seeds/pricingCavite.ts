import "dotenv/config";
import { db } from "@/server/db/client";
import { pricingTiers } from "@/server/db/schema/lookups/pricingTiers";
import { serviceSkus } from "@/server/db/schema/pricing/serviceSkus";
import { membershipSkus } from "@/server/db/schema/pricing/membershipSkus";
import { flexiRateCards } from "@/server/db/schema/pricing/flexiRateCards";

async function seedPricing() {
    console.log("🌱 Seeding CAVITE Pricing Data...");

    // 1. Ensure Pricing Tiers Exist
    await db.insert(pricingTiers).values([
        { tierCode: "REGULAR", displayName: "Regular", description: "Standard Housemaid Service" },
        { tierCode: "PLUS", displayName: "Plus", description: "Experienced Housemaid Service" },
        { tierCode: "ALL_IN", displayName: "All-In", description: "Premium All-Inclusive Service" },
    ]).onConflictDoNothing();

    const LOCATION = "CAVITE";
    const TIER = "REGULAR";

    // 2. Service SKUs (Trial & One-Time)
    // Data from Image: 
    // Whole Day: Trial=600, OneTime=1190
    // Half Day: Trial=460, OneTime=900
    console.log("...Service SKUs");
    const services = [
        // Whole Day
        { skuId: "CAVITE_REGULAR_WHOLE_TRIAL", duration: "WHOLE_DAY", bookingType: "TRIAL", price: "600.00" },
        { skuId: "CAVITE_REGULAR_WHOLE_ONE_TIME", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1190.00" },
        // Half Day
        { skuId: "CAVITE_REGULAR_HALF_TRIAL", duration: "HALF_DAY", bookingType: "TRIAL", price: "460.00" },
        { skuId: "CAVITE_REGULAR_HALF_ONE_TIME", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "900.00" },
    ];

    for (const s of services) {
        await db.insert(serviceSkus).values({
            skuId: s.skuId,
            location: LOCATION,
            tierCode: TIER,
            duration: s.duration,
            bookingType: s.bookingType,
            servicePrice: s.price
        }).onConflictDoNothing();
    }

    // 3. Membership SKUs (Flexi Plans)
    // Data from Image: 1mo=1490, 3mo=3990, 6mo=4990, 12mo=7990
    console.log("...Membership SKUs");
    const memberships = [
        { term: 1, price: "1490.00" },
        { term: 3, price: "3990.00" },
        { term: 6, price: "4990.00" },
        { term: 12, price: "7990.00" },
    ];

    for (const m of memberships) {
        await db.insert(membershipSkus).values({
            skuId: `CAVITE_FLEXI_REGULAR_${m.term}M`,
            location: LOCATION,
            tierCode: TIER,
            termMonths: m.term,
            servicePrice: m.price
        }).onConflictDoNothing();
    }

    // 4. Flexi Rate Cards (Member Booking Rates)
    // Data from Image:
    // Whole Day: Base=600, Surge=+60
    // Half Day: Base=460, Surge=+46
    console.log("...Flexi Rate Cards");
    await db.insert(flexiRateCards).values([
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "WHOLE_DAY",
            baseRateWeekday: "600.00",
            surgeAddWeekendHoliday: "60.00"
        },
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "HALF_DAY",
            baseRateWeekday: "460.00",
            surgeAddWeekendHoliday: "46.00"
        }
    ]);

    console.log("✅ Pricing Seeding Complete!");
    process.exit(0);
}

seedPricing().catch((err) => {
    console.error("Error seeding pricing:", err);
    process.exit(1);
});
