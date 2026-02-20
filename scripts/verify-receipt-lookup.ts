
import { db } from "../server/db";
import { HousemaidEarningsService } from "../server/services/HousemaidEarningsService";
import { bookingPayments, housemaidEarnings } from "../server/db/schema";
import { eq, isNotNull } from "drizzle-orm";

async function main() {
    console.log("Verifying receipt number lookup...");

    // 1. Find an earning with a receipt number
    const earningWithReceipt = await db.query.housemaidEarnings.findFirst({
        with: {
            payment: true
        },
        where: (earnings, { exists }) => exists(
            db.select()
            .from(bookingPayments)
            .where(eq(bookingPayments.paymentId, earnings.paymentId))
        )
    });

    if (!earningWithReceipt || !earningWithReceipt.payment?.receiptNumber) {
        console.log("No earning with receipt number found. Creating a test one or skipping generic test.");
        // Try to look for ANY booking payment with receipt number to see if we have test data
        const payment = await db.query.bookingPayments.findFirst({
            where: isNotNull(bookingPayments.receiptNumber)
        });

        if (payment) {
            console.log(`Found payment with receipt: ${payment.receiptNumber}. Checking if earning exists...`);
            // Check if earning exists for this payment
            const earning = await db.query.housemaidEarnings.findFirst({
                where: eq(housemaidEarnings.paymentId, payment.paymentId)
            });
            
            if (earning) {
                 console.log(`Found earning ${earning.earningId} for receipt ${payment.receiptNumber}`);
                 await testLookup(payment.receiptNumber, earning.earningId);
            } else {
                console.log("No earning found for this payment.");
            }
        } else {
            console.log("No payments with receipt numbers found in DB.");
        }
        return;
    }

    const receiptNum = earningWithReceipt.payment.receiptNumber;
    const earningId = earningWithReceipt.earningId;

    console.log(`Found Earning ID: ${earningId} with Receipt: ${receiptNum}`);

    await testLookup(receiptNum, earningId);
}

async function testLookup(receiptNum: string, earningId: number) {
    // Test 1: Lookup by Receipt Number
    console.log(`\nTesting lookup by Receipt Number: ${receiptNum}`);
    const byReceipt = await HousemaidEarningsService.getEarningDetails(receiptNum);
    
    if (byReceipt && byReceipt.earningId === earningId) {
        console.log("✅ Lookup by Receipt Number SUCCESS");
    } else {
        console.error("❌ Lookup by Receipt Number FAILED");
        console.log("Result:", byReceipt ? `ID: ${byReceipt.earningId}` : "null");
    }

    // Test 2: Lookup by Earning ID
    console.log(`\nTesting lookup by Earning ID: ${earningId}`);
    const byId = await HousemaidEarningsService.getEarningDetails(earningId);

    if (byId && byId.earningId === earningId) {
         console.log("✅ Lookup by Earning ID SUCCESS");
    } else {
        console.error("❌ Lookup by Earning ID FAILED");
    }
}

main().catch(console.error).finally(() => process.exit(0));
