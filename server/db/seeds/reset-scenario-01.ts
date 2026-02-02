import "dotenv/config";
import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { bookings } from "@/server/db/schema/bookings/bookings";
import { bookingPayments } from "@/server/db/schema/bookings/bookingPayments";
import { bookingActivityLog } from "@/server/db/schema/bookings/bookingActivityLog";
import { customerProfiles } from "@/server/db/schema/customer/customerProfiles";
import { customerAddresses } from "@/server/db/schema/customer/customerAddresses";
import { addresses } from "@/server/db/schema/customer/addresses";
import { eq, inArray, and } from "drizzle-orm";

const SCENARIO_CONFIG = {
    housemaidName: "Scenario Housemaid 01",
    housemaidEmail: "hm.scenario@test.com",
    customerAccountNumber: "ACC-SCENARIO-01"
};

async function main() {
    console.log("🗑️ Resetting Scenario 01 Data...");

    // 1. Find Housemaid
    const hmList = await db.select().from(housemaids).where(
        and(
            eq(housemaids.name, SCENARIO_CONFIG.housemaidName),
            eq(housemaids.email, SCENARIO_CONFIG.housemaidEmail)
        )
    );

    // 2. Find Customer
    const custList = await db.select().from(customerProfiles).where(eq(customerProfiles.accountNumber, SCENARIO_CONFIG.customerAccountNumber));

    // DELETE BOOKINGS & PAYMENTS
    // Collect all booking IDs linked to these entities

    let bookingIds: number[] = [];

    if (hmList.length > 0) {
        const bks = await db.select().from(bookings).where(eq(bookings.housemaidId, hmList[0].housemaidId));
        bookingIds = [...bookingIds, ...bks.map(b => b.bookingId)];
    }

    if (custList.length > 0) {
        const bks = await db.select().from(bookings).where(eq(bookings.customerId, custList[0].customerId));
        bookingIds = [...bookingIds, ...bks.map(b => b.bookingId)];
    }

    // Unique IDs
    bookingIds = [...new Set(bookingIds)]; // Set handles numbers fine

    if (bookingIds.length > 0) {
        console.log(`Deleting ${bookingIds.length} bookings...`);

        await db.delete(bookingPayments).where(inArray(bookingPayments.bookingId, bookingIds));
        await db.delete(bookingActivityLog).where(inArray(bookingActivityLog.bookingId, bookingIds));
        await db.delete(bookings).where(inArray(bookings.bookingId, bookingIds));
    }

    // DELETE HOUSEMAID & ADDRESS
    if (hmList.length > 0) {
        const hmAddressId = hmList[0].addressId;

        await db.delete(housemaids).where(eq(housemaids.housemaidId, hmList[0].housemaidId));
        console.log(`Deleted Housemaid: ${hmList[0].name}`);

        if (hmAddressId) {
            await db.delete(addresses).where(eq(addresses.addressId, hmAddressId));
            console.log(`Deleted Housemaid Address ID: ${hmAddressId}`);
        }
    }

    // DELETE CUSTOMER & ADDRESSES
    if (custList.length > 0) {
        // Collect all address IDs linked to this customer before deleting links
        const custAddrs = await db.select().from(customerAddresses).where(eq(customerAddresses.customerId, custList[0].customerId));
        const addressIdsToDelete = custAddrs.map(ca => ca.addressId);

        // Delete links
        await db.delete(customerAddresses).where(eq(customerAddresses.customerId, custList[0].customerId));

        // Delete customer
        await db.delete(customerProfiles).where(eq(customerProfiles.customerId, custList[0].customerId));
        console.log(`Deleted Customer: ${custList[0].accountNumber}`);

        // Delete actual addresses
        // Using loop to avoid empty array issues with inArray, though checks exist
        if (addressIdsToDelete.length > 0) {
            await db.delete(addresses).where(inArray(addresses.addressId, addressIdsToDelete));
            console.log(`Deleted Customer Addresses: ${addressIdsToDelete.length} records`);
        }
    }

    console.log("✅ Reset Complete!");
    process.exit(0);
}

main().catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
});
