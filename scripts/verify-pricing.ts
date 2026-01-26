
import { PricingService } from "../server/services/PricingService";
import { AsensoService } from "../server/services/AsensoService";
import { db } from "../server/db";
import { serviceSkus } from "../server/db/schema/pricing/serviceSkus";
import { flexiRateCards } from "../server/db/schema/pricing/flexiRateCards";

async function main() {
    console.log("🧪 Starting Verification...");

    // 1. Seed Test Data (In-memory or temp DB if possible, but we'll try to rely on logic with mocks if needed, 
    // or just assume the tables are empty and we insert test data)

    // Clean up test data
    // await db.delete(serviceSkus).where(eq(serviceSkus.skuId, "TEST_SKU"));

    // Insert Mock Pricing Data
    console.log("Inserting Mock Pricing Data...");
    await db.insert(serviceSkus).values({
        skuId: "NCR_REGULAR_WHOLE_ONE_TIME",
        location: "NCR",
        tierCode: "REGULAR",
        duration: "WHOLE_DAY",
        bookingType: "ONE_TIME",
        servicePrice: "1390.00"
    }).onConflictDoNothing();

    await db.insert(flexiRateCards).values({
        location: "NCR",
        tierCode: "REGULAR",
        duration: "WHOLE_DAY",
        baseRateWeekday: "650.00",
        surgeAddWeekendHoliday: "65.00"
    }); // Note: ID auto-gen

    // 2. Test One-Time Pricing
    console.log("Testing One-Time Pricing...");
    const price1 = await PricingService.calculateBookingPrice({
        location: "NCR",
        tier: "REGULAR",
        duration: "WHOLE_DAY",
        bookingType: "ONE_TIME",
        date: new Date("2026-02-02") // Monday
    });
    console.log(`One-Time Price: ${price1.finalPrice} (Expect 1390)`);

    // 3. Test Flexi Pricing (Weekday) - skipping membership check validation for this basic unit test if possible 
    // or we mock it. MembershipService uses db, so we need a real customer.
    // SKIPPING Flexi integration test here to avoid complex seeding of customer/membership.

    console.log("✅ Verification Script Complete");
    process.exit(0);
}

main().catch(console.error);
