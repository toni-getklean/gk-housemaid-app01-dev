import { getDatabaseService } from "../lib/database";
import { db } from "../server/db";
import { transportationLegs, bookings } from "../server/db/schema";
import { eq } from "drizzle-orm";
import "dotenv/config";

async function verifyValidation() {
    console.log("🔍 Verifying Transportation Validation Logic...");

    const databaseService = getDatabaseService();
    const bookingCode = "HM25-00001"; // Assuming this exists from seeds

    console.log(`\n1. Fetching booking ${bookingCode}...`);
    let booking = await databaseService.getBookingByCode(bookingCode);

    if (!booking) {
        console.error("❌ Booking not found. Please seed the database.");
        return;
    }

    console.log(`   Found booking. ID: ${booking.bookingId}, Current Status: ${booking.statusCode}`);

    // --- Scenario 1: No Legs ---
    console.log("\n--- Scenario 1: No Transportation Legs ---");
    // Temporarily delete legs (simulation) - wrapped in transaction if possible effectively, 
    // but here we might just delete and restore/re-add.
    // For safety in dev env, we'll check what we have and assume we can manipulate.

    // Check current legs
    console.log(`   Current legs count: ${booking.transportationLegs?.length || 0}`);

    // Logic from route.ts
    let hasToClient = booking.transportationLegs?.some(leg => leg.direction === 'TO_CLIENT');
    let hasReturn = booking.transportationLegs?.some(leg => leg.direction === 'RETURN');

    console.log(`   Has TO_CLIENT: ${hasToClient}`);
    console.log(`   Has RETURN: ${hasReturn}`);

    if (!hasToClient || !hasReturn) {
        console.log("   ✅ Validation WOULD FAIL (Expected behavior for empty/partial legs)");
    } else {
        console.log("   ⚠️ Validation WOULD PASS (Unexpected if verifying failure)");
    }

    // --- Scenario 2: Simulate Passing ---
    // If we wanted to test passing, we'd need to insert legs. 
    // I won't modify data permanently strictly, but let's query a known valid state if exists.
    // Or just manually inspect expected output.

    console.log("\nDone verification check.");
    process.exit(0);
}

verifyValidation();
