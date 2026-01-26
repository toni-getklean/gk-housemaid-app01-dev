import "dotenv/config";
import { db } from "@/server/db/client";
import { pricingTiers } from "@/server/db/schema/lookups/pricingTiers";
import { serviceSkus } from "@/server/db/schema/pricing/serviceSkus";
import { membershipSkus } from "@/server/db/schema/pricing/membershipSkus";
import { flexiRateCards } from "@/server/db/schema/pricing/flexiRateCards";

async function seedPricing() {
    console.log("🌱 Seeding NCR Pricing Data...");

    // 1. Ensure Pricing Tiers Exist
    await db.insert(pricingTiers).values([
        { tierCode: "REGULAR", displayName: "Regular", description: "Standard Housemaid Service" },
        { tierCode: "PLUS", displayName: "Plus", description: "Experienced Housemaid Service" },
        { tierCode: "ALL_IN", displayName: "All-In", description: "Premium All-Inclusive Service" },
    ]).onConflictDoNothing();

    const LOCATION = "NCR";
    const TIER = "REGULAR";

    // 2. Service SKUs (Trial & One-Time)
    // Data from Image: 
    // Whole Day: Trial=650, OneTime=1390
    // Half Day: Trial=510, OneTime=1090
    console.log("...Service SKUs");
    const services = [
        // Whole Day
        { skuId: "NCR_REGULAR_WHOLE_TRIAL", duration: "WHOLE_DAY", bookingType: "TRIAL", price: "650.00" },
        { skuId: "NCR_REGULAR_WHOLE_ONE_TIME", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1390.00" },
        // Half Day
        { skuId: "NCR_REGULAR_HALF_TRIAL", duration: "HALF_DAY", bookingType: "TRIAL", price: "510.00" },
        { skuId: "NCR_REGULAR_HALF_ONE_TIME", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "1090.00" },
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
    // Data from Image: 1mo=1790, 3mo=4990, 6mo=5990, 12mo=8990
    console.log("...Membership SKUs");
    const memberships = [
        { term: 1, price: "1790.00" },
        { term: 3, price: "4990.00" },
        { term: 6, price: "5990.00" },
        { term: 12, price: "8990.00" },
    ];

    for (const m of memberships) {
        await db.insert(membershipSkus).values({
            skuId: `NCR_FLEXI_REGULAR_${m.term}M`,
            location: LOCATION,
            tierCode: TIER,
            termMonths: m.term,
            servicePrice: m.price
        }).onConflictDoNothing();
    }

    // 4. Flexi Rate Cards (Member Booking Rates)
    // Data from Image (HM Regular Rate + Surge):
    // Whole Day: Base=650, Surge=+65
    // Half Day: Base=510, Surge=+51
    console.log("...Flexi Rate Cards");
    await db.insert(flexiRateCards).values([
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "WHOLE_DAY",
            baseRateWeekday: "650.00",
            surgeAddWeekendHoliday: "65.00"
        },
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "HALF_DAY",
            baseRateWeekday: "510.00",
            surgeAddWeekendHoliday: "51.00"
        }
    ]); // Note: No conflict handling since ID is auto-gen, be careful running multiple times without cleanup usually.
    // For seed script safely, typically we delete first or check existence, but strictly 'insert' is simpler for first run.

    console.log("✅ Pricing Seeding Complete!");
    process.exit(0);
}

seedPricing().catch((err) => {
    console.error("Error seeding pricing:", err);
    process.exit(1);
});
