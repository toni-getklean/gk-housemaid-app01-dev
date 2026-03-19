import "dotenv/config";
import { db } from "@/server/db/client";
import { serviceTiers } from "@/server/db/schema/lookups/serviceTiers";
import { serviceSkus } from "@/server/db/schema/pricing/serviceSkus";
import { membershipSkus } from "@/server/db/schema/pricing/membershipSkus";
import { flexiRateCards } from "@/server/db/schema/pricing/flexiRateCards";

async function seedPricing() {
    console.log("🌱 Seeding NCR Pricing Data...");

    // 1. Ensure Pricing Tiers Exist
    await db.insert(serviceTiers).values([
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
        // Trial
        { skuId: "NCR_REGULAR_WHOLE_TRIAL", tierCode: "REGULAR", duration: "WHOLE_DAY", bookingType: "TRIAL", price: "650.00", priceHm: "650.00", surgeAmount: null },
        { skuId: "NCR_REGULAR_HALF_TRIAL", tierCode: "REGULAR", duration: "HALF_DAY", bookingType: "TRIAL", price: "510.00", priceHm: "510.00", surgeAmount: null },
        
        // One Time - Whole Day
        { skuId: "NCR_REGULAR_WHOLE_ONE_TIME", tierCode: "REGULAR", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1390.00", priceHm: "650.00", surgeAmount: "65.00" },
        { skuId: "NCR_PLUS_WHOLE_ONE_TIME", tierCode: "PLUS", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1390.00", priceHm: "740.00", surgeAmount: "74.00" },
        { skuId: "NCR_ALL_IN_WHOLE_ONE_TIME", tierCode: "ALL_IN", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1390.00", priceHm: "1000.00", surgeAmount: "100.00" },

        // One Time - Half Day
        { skuId: "NCR_REGULAR_HALF_ONE_TIME", tierCode: "REGULAR", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "1090.00", priceHm: "510.00", surgeAmount: "51.00" },
        { skuId: "NCR_PLUS_HALF_ONE_TIME", tierCode: "PLUS", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "1090.00", priceHm: "600.00", surgeAmount: "60.00" },
        { skuId: "NCR_ALL_IN_HALF_ONE_TIME", tierCode: "ALL_IN", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "1090.00", priceHm: "750.00", surgeAmount: "75.00" },
    ];

    for (const s of services) {
        await db.insert(serviceSkus).values({
            skuId: s.skuId,
            location: LOCATION,
            tierCode: s.tierCode,
            duration: s.duration,
            bookingType: s.bookingType,
            servicePrice: s.price,
            priceHm: s.priceHm,
            surgeAmount: s.surgeAmount
        }).onConflictDoUpdate({
            target: serviceSkus.skuId,
            set: {
                servicePrice: s.price,
                priceHm: s.priceHm,
                surgeAmount: s.surgeAmount,
                updatedAt: new Date()
            }
        });
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
