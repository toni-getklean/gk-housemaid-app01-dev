import "dotenv/config";
import { db } from "@/server/db/client";
import { serviceTiers } from "@/server/db/schema/lookups/serviceTiers";
import { serviceSkus } from "@/server/db/schema/pricing/serviceSkus";
import { membershipSkus } from "@/server/db/schema/pricing/membershipSkus";
import { flexiRateCards } from "@/server/db/schema/pricing/flexiRateCards";

async function seedPricing() {
    console.log("🌱 Seeding CEBU Pricing Data...");

    // 1. Ensure Pricing Tiers Exist
    await db.insert(serviceTiers).values([
        { tierCode: "REGULAR", displayName: "Regular", description: "Standard Housemaid Service" },
        { tierCode: "PLUS", displayName: "Plus", description: "Experienced Housemaid Service" },
        { tierCode: "ALL_IN", displayName: "All-In", description: "Premium All-Inclusive Service" },
    ]).onConflictDoNothing();

    const LOCATION = "CEBU";
    const TIER = "REGULAR";

    // 2. Service SKUs (Trial & One-Time)
    console.log("...Service SKUs");
    const services = [
        // Trial
        { skuId: "CEBU_REGULAR_WHOLE_TRIAL", tierCode: "REGULAR", duration: "WHOLE_DAY", bookingType: "TRIAL", price: "540.00", priceHm: "540.00", surgeAmount: null },
        { skuId: "CEBU_REGULAR_HALF_TRIAL", tierCode: "REGULAR", duration: "HALF_DAY", bookingType: "TRIAL", price: "420.00", priceHm: "420.00", surgeAmount: null },
        
        // One Time - Whole Day
        { skuId: "CEBU_REGULAR_WHOLE_ONE_TIME", tierCode: "REGULAR", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "1190.00", priceHm: "540.00", surgeAmount: "54.00" },
        { skuId: "CEBU_PLUS_WHOLE_ONE_TIME", tierCode: "PLUS", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "900.00", priceHm: "630.00", surgeAmount: "63.00" },
        { skuId: "CEBU_ALL_IN_WHOLE_ONE_TIME", tierCode: "ALL_IN", duration: "WHOLE_DAY", bookingType: "ONE_TIME", price: "900.00", priceHm: "890.00", surgeAmount: "89.00" },
        
        // One Time - Half Day
        { skuId: "CEBU_REGULAR_HALF_ONE_TIME", tierCode: "REGULAR", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "900.00", priceHm: "420.00", surgeAmount: "42.00" },
        { skuId: "CEBU_PLUS_HALF_ONE_TIME", tierCode: "PLUS", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "900.00", priceHm: "510.00", surgeAmount: "51.00" },
        { skuId: "CEBU_ALL_IN_HALF_ONE_TIME", tierCode: "ALL_IN", duration: "HALF_DAY", bookingType: "ONE_TIME", price: "900.00", priceHm: "660.00", surgeAmount: "66.00" },
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
    console.log("...Membership SKUs");
    const memberships = [
        { term: 1, price: "1490.00" },
        { term: 3, price: "3990.00" },
        { term: 6, price: "4990.00" },
        { term: 12, price: "7990.00" },
    ];

    for (const m of memberships) {
        await db.insert(membershipSkus).values({
            skuId: `CEBU_FLEXI_REGULAR_${m.term}M`,
            location: LOCATION,
            tierCode: TIER,
            termMonths: m.term,
            servicePrice: m.price
        }).onConflictDoNothing();
    }

    // 4. Flexi Rate Cards (Member Booking Rates)
    console.log("...Flexi Rate Cards");
    await db.insert(flexiRateCards).values([
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "WHOLE_DAY",
            baseRateWeekday: "540.00",
            surgeAddWeekendHoliday: "54.00"
        },
        {
            location: LOCATION,
            tierCode: TIER,
            duration: "HALF_DAY",
            baseRateWeekday: "420.00",
            surgeAddWeekendHoliday: "42.00"
        }
    ]);

    console.log("✅ CEBU Pricing Seeding Complete!");
    process.exit(0);
}

seedPricing().catch((err) => {
    console.error("Error seeding Cebu pricing:", err);
    process.exit(1);
});
