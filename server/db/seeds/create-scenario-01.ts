import "dotenv/config";
import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { addresses } from "@/server/db/schema/customer/addresses";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { bookingPayments } from "@/server/db/schema/bookings/bookingPayments";
import { customerProfiles } from "@/server/db/schema/customer/customerProfiles";
import { customerAddresses } from "@/server/db/schema/customer/customerAddresses";
import { eq } from "drizzle-orm";
import { getDatabaseService } from "@/lib/database";

// Configuration for the scenario
const SCENARIO_CONFIG = {
    housemaid: {
        facebookId: "SEED_SCENARIO_HM_01",
        name: "Marvin Perol",
        code: "HM-SCENARIO-01"
    },
    customer: {
        accountNumber: "ACC-SCENARIO-01",
        customerName: "Scenario Customer",
        email: "scenario.customer@test.com",
        mobile: "639991112222"
    }
};

async function main() {
    console.log("🌱 Creating Scenario 01: Housemaid + Customer + 5 Bookings...");

    const dbService = getDatabaseService();
    const now = new Date();

    // ==========================================
    // 1. Create Scenario Customer
    // ==========================================
    let customerId: number;
    let customerAddressId: number;

    const existingCust = await db.select().from(customerProfiles).where(eq(customerProfiles.accountNumber, SCENARIO_CONFIG.customer.accountNumber)).limit(1);

    if (existingCust.length > 0) {
        console.log(`ℹ️ Customer already exists: ${existingCust[0].accountNumber}`);
        customerId = existingCust[0].customerId;

        const custAddr = await db.select().from(customerAddresses).where(eq(customerAddresses.customerId, customerId)).limit(1);
        customerAddressId = custAddr[0].customerAddressId;
    } else {
        // Create Address
        const [addr] = await db.insert(addresses).values({
            addressUnit: "101",
            addressBuilding: "Scenario Plaza",
            addressStreet: "Test St",
            cityName: "TAGUIG",
            addressLine: "101 Scenario Plaza, Test St, Taguig",
            segmentCode: "condo",
            createdAt: now,
            updatedAt: now
        }).returning({ addressId: addresses.addressId });

        // Create Customer
        // Generate Code - FIX for "customerCode" missing
        const yy = now.getFullYear().toString().slice(-2);
        const customerCode = await dbService.generateCode(`CUST${yy}`);

        const [cust] = await db.insert(customerProfiles).values({
            customerCode, // <-- Copied from customers.ts logic
            accountNumber: SCENARIO_CONFIG.customer.accountNumber,
            customerName: SCENARIO_CONFIG.customer.customerName,
            // firstName: SCENARIO_CONFIG.customer.firstName,  <-- REMOVED
            // lastName: SCENARIO_CONFIG.customer.lastName,    <-- REMOVED
            // email: SCENARIO_CONFIG.customer.email,          <-- NOTE: Schema usually has contactNumber, not mobileNumber? Let me check customers.ts again.
            // customers.ts uses: customerName, contactNumber, repeatOrNew, primarySegmentCode
            // It does NOT show email or mobileNumber in the testCustomers object in customers.ts
            // Let me re-verify exact column names from customers.ts usage.
            // customers.ts:
            // customerName: "Maria Santos",
            // contactNumber: "639171234567",
            // repeatOrNew: "new",
            // primarySegmentCode: "residential"

            contactNumber: SCENARIO_CONFIG.customer.mobile,
            repeatOrNew: "new",
            primarySegmentCode: "residential",

            // NOTE: I will blindly strictly follow what customers.ts did.
            status: "active",
            createdAt: now,
            updatedAt: now
        } as any).returning({ customerId: customerProfiles.customerId });

        customerId = cust.customerId;

        // Link Address
        const [link] = await db.insert(customerAddresses).values({
            customerId: customerId,
            addressId: addr.addressId,
            isPrimary: true,
            label: "Home",
            createdAt: now,
            updatedAt: now
        }).returning({ customerAddressId: customerAddresses.customerAddressId });

        customerAddressId = link.customerAddressId;
        console.log(`✅ Created Customer: ${SCENARIO_CONFIG.customer.accountNumber}`);
    }

    // ==========================================
    // 2. Create Scenario Housemaid
    // ==========================================
    let housemaidId: number;
    let housemaidName: string;

    const existingHm = await db.select().from(housemaids).where(eq(housemaids.facebookId, SCENARIO_CONFIG.housemaid.facebookId)).limit(1);

    if (existingHm.length > 0) {
        console.log(`ℹ️ Housemaid already exists: ${existingHm[0].housemaidCode}`);
        housemaidId = existingHm[0].housemaidId;
        housemaidName = existingHm[0].name;
    } else {
        // Create Address
        const [addr] = await db.insert(addresses).values({
            addressUnit: "Staff House",
            addressBuilding: "GK HQ",
            addressStreet: "Main Ave",
            cityName: "MAKATI",
            addressLine: "Staff House, GK HQ, Main Ave, Makati",
            segmentCode: "residential",
            createdAt: now,
            updatedAt: now
        }).returning({ addressId: addresses.addressId });

        // Generate Code
        const yy = now.getFullYear().toString().slice(-2);
        const housemaidCode = await dbService.generateCode(`HMAID${yy}`);

        const [hm] = await db.insert(housemaids).values({
            housemaidCode,
            name: SCENARIO_CONFIG.housemaid.name,
            facebookId: SCENARIO_CONFIG.housemaid.facebookId,
            addressId: addr.addressId,

            mobile: "639998887777",
            email: "hm.scenario@test.com",

            dateOfBirth: new Date("1995-06-15"),
            age: 29,
            civilStatus: "Single",
            dialectSpoken: "English, Tagalog",

            employmentStatus: "Active",
            commitment: "Full-Time",
            status: "active",

            currentTierCode: "REGULAR",
            asensoPointsBalance: 0,

            createdAt: now,
            updatedAt: now
        } as any).returning();

        housemaidId = hm.housemaidId;
        housemaidName = hm.name;
        console.log(`✅ Created Housemaid: ${hm.housemaidCode}`);
    }

    // ==========================================
    // 3. Create 5 Bookings (One-Time Pricing)
    // ==========================================
    // NCR Pricing: ONE_TIME Half Day = 1090.00, Whole Day = 1390.00
    const bookingScenarios = [
        { dayOffset: 1, duration: "HALF_DAY", price: "1090.00" },
        { dayOffset: 2, duration: "HALF_DAY", price: "1090.00" },
        { dayOffset: 3, duration: "WHOLE_DAY", price: "1390.00" },
        { dayOffset: 4, duration: "HALF_DAY", price: "1090.00" },
        { dayOffset: 5, duration: "HALF_DAY", price: "1090.00" },
    ];

    for (const scenario of bookingScenarios) {
        const yy = now.getFullYear().toString().slice(-2);
        const bookingCode = await dbService.generateCode(`HM${yy}`);

        const sDate = new Date();
        sDate.setDate(now.getDate() + scenario.dayOffset);

        const [bk] = await db.insert(bookings).values({
            bookingCode,
            customerId,
            customerAddressId,
            housemaidId,
            housemaidName,

            bookingDate: now.toISOString().split('T')[0],
            serviceDate: sDate.toISOString().split('T')[0],

            statusCode: "pending_review",
            substatusCode: "awaiting_housemaid_response",

            serviceTypeCode: "general_cleaning",
            bookingTypeCode: "ONE_TIME",
            location: "NCR",
            tierCode: "REGULAR",

            duration: scenario.duration,
            time: scenario.duration === "HALF_DAY" ? "8:00AM - 12:00PM" : "8:00AM - 5:00PM",

            pricingBreakdown: {
                basePrice: parseFloat(scenario.price),
                currency: "PHP"
            },

            createdAt: now,
            updatedAt: now,
            dateModified: now
        } as any).returning({ bookingId: bookings.bookingId });

        await db.insert(bookingPayments).values({
            bookingId: bk.bookingId,
            paymentStatusCode: "PENDING",
            totalAmount: scenario.price,
            balanceAmount: scenario.price,
            amountPaid: "0.00",
            paymentSourceCode: "CUSTOMER_DIRECT",
            paymentMethodCode: "CASH",
            createdAt: now,
            updatedAt: now
        } as any);

        console.log(`  ✓ Created ${scenario.duration} Booking: ${bookingCode} (PHP ${scenario.price})`);
    }

    console.log("\n🎉 Scenario 01 Created Successfully!");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});
