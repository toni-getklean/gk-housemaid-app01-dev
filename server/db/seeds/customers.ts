import "dotenv/config";
import { db } from "@/server/db/client";
import { customerProfiles } from "@/server/db/schema/customer/customerProfiles";
import { addresses } from "@/server/db/schema/customer/addresses";
import { customerAddresses } from "@/server/db/schema/customer/customerAddresses";
import { databaseService } from "@/lib/database";
import { eq } from "drizzle-orm";

// Test customers data
const testCustomers = [
    {
        profile: {
            accountNumber: "ACC-2024-001",
            customerName: "Maria Santos",
            contactNumber: "639171234567",
            repeatOrNew: "new",
            primarySegmentCode: "residential",
        },
        address: {
            addressUnit: "Unit 1205",
            addressBuilding: "The Rise Makati",
            addressStreet: "Malugay Street",
            cityName: "Makati City",
            addressLine: "Unit 1205, The Rise Makati, Malugay Street, Makati City",
            addressLink: "https://maps.google.com/?q=14.5547,121.0244",
            addressLinkName: "The Rise Makati",
            landmark: "Near Ayala Triangle",
            latitude: "14.554700",
            longitude: "121.024400",
            googlePlaceId: null,
            segmentCode: "residential",
        },
        addressLabel: "Home",
    },
    {
        profile: {
            accountNumber: "ACC-2024-002",
            customerName: "Juan Dela Cruz",
            contactNumber: "639189876543",
            repeatOrNew: "repeat",
            primarySegmentCode: "residential",
        },
        address: {
            addressUnit: "House 42",
            addressBuilding: null,
            addressStreet: "Scout Rallos Street",
            cityName: "Quezon City",
            addressLine: "House 42, Scout Rallos Street, Quezon City",
            addressLink: "https://maps.google.com/?q=14.6340,121.0330",
            addressLinkName: "Scout Rallos Street Home",
            landmark: "Near Tomas Morato",
            latitude: "14.634000",
            longitude: "121.033000",
            googlePlaceId: null,
            segmentCode: "residential",
        },
        addressLabel: "Home",
    },
    {
        profile: {
            accountNumber: "ACC-2024-003",
            customerName: "Tech Solutions Corp",
            contactNumber: "639201234567",
            repeatOrNew: "new",
            primarySegmentCode: "commercial",
        },
        address: {
            addressUnit: "Floor 25",
            addressBuilding: "BGC Corporate Center",
            addressStreet: "30th Street",
            cityName: "Taguig City",
            addressLine: "Floor 25, BGC Corporate Center, 30th Street, Taguig City",
            addressLink: "https://maps.google.com/?q=14.5500,121.0500",
            addressLinkName: "BGC Corporate Center",
            landmark: "Near High Street",
            latitude: "14.550000",
            longitude: "121.050000",
            googlePlaceId: null,
            segmentCode: "commercial",
        },
        addressLabel: "Office",
    },
];

async function main() {
    console.log("🌱 Seeding customers (profiles + addresses)...\n");

    for (const customer of testCustomers) {
        try {
            // Check if customer already exists
            const existingCustomer = await db
                .select()
                .from(customerProfiles)
                .where(eq(customerProfiles.accountNumber, customer.profile.accountNumber))
                .limit(1);

            if (existingCustomer.length > 0) {
                console.log(`✓ Skipped (exists): ${customer.profile.customerName}`);
                continue;
            }

            const now = new Date();

            // 1. Create customer profile
            const currentYear = new Date().getFullYear();
            const yy = currentYear.toString().slice(-2);
            const customerCode = await databaseService.generateCode(`CUST${yy}`);

            const insertedCustomer = await db.insert(customerProfiles).values({
                customerCode,
                ...customer.profile,
                createdAt: now,
                updatedAt: now,
            }).returning({ customerId: customerProfiles.customerId });

            const customerId = insertedCustomer[0].customerId;
            console.log(`  Created customer: ${customerCode} - ${customer.profile.customerName}`);

            // 2. Create address
            // NOTE: addresses table uses auto-increment address_id, we just insert and get it back
            const insertedAddress = await db.insert(addresses).values({
                ...customer.address,
                createdAt: now,
                updatedAt: now,
            }).returning({ addressId: addresses.addressId });

            const addressId = insertedAddress[0].addressId;
            console.log(`  Created address (ID: ${addressId}) - ${customer.address.addressLine.substring(0, 40)}...`);

            // 3. Link customer to address
            // customer_addresses usually has auto-increment PK too, so we don't generate CADDR unless schema requires it.
            // based on schema viewing earlier, customerAddressId is auto-increment.
            await db.insert(customerAddresses).values({
                customerId,
                addressId,
                label: customer.addressLabel,
                isPrimary: true,
                createdAt: now,
                updatedAt: now,
            });
            console.log(`  Linked customer to address\n`);

        } catch (error) {
            console.error(`❌ Error seeding ${customer.profile.customerName}:`, error);
        }
    }

    console.log("✅ Customer seed complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding customers:", err);
    process.exit(1);
});
