
import { db } from "../db";
import { eq, and, desc, sql, between } from "drizzle-orm";
import {
    bookings,
    housemaidEarnings,
    bookingPayments,
    transportationDetails,
    housemaids
} from "../db/schema";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWeekend } from "date-fns";

export class HousemaidEarningsService {

    /**
     * Creates an earning record from a completed booking.
     * Calculates the Housemaid vs Company split based on financial rules.
     */
    static async createEarningFromBooking(bookingId: number): Promise<boolean> {
        try {
            console.log(`[Earnings] Creating earning for booking ${bookingId}`);

            // 1. Fetch Booking, Payment, and Transportation Details
            const bookingData = await db
                .select({
                    booking: bookings,
                    payment: bookingPayments,
                    transport: transportationDetails,
                })
                .from(bookings)
                .leftJoin(bookingPayments, eq(bookings.bookingId, bookingPayments.bookingId))
                .leftJoin(transportationDetails, eq(bookings.bookingId, transportationDetails.bookingId))
                .where(eq(bookings.bookingId, bookingId))
                .limit(1);

            if (bookingData.length === 0) {
                console.error(`[Earnings] Booking ${bookingId} not found`);
                return false;
            }

            const { booking, payment, transport } = bookingData[0];

            if (!booking.housemaidId) {
                console.error(`[Earnings] Booking ${bookingId} has no housemaid assigned`);
                return false;
            }

            // Check if earning already exists
            const existing = await db.query.housemaidEarnings.findFirst({
                where: eq(housemaidEarnings.bookingId, bookingId)
            });

            if (existing) {
                console.log(`[Earnings] Earning already exists for booking ${bookingId}`);
                return true; // Already processed
            }

            // 2. Financial Rules & Calculation

            // Defined HM Rates base on Location & Service Type
            const LOCATION_RATES: Record<string, { WHOLE_DAY: number; HALF_DAY: number }> = {
                NCR: { WHOLE_DAY: 650, HALF_DAY: 510 },
                CAVITE: { WHOLE_DAY: 600, HALF_DAY: 460 },
                CEBU: { WHOLE_DAY: 500, HALF_DAY: 400 }, // Placeholder for Cebu
            };

            const bookingType = booking.bookingTypeCode || "ONE_TIME";
            const serviceType = (booking.duration || "WHOLE_DAY") as "WHOLE_DAY" | "HALF_DAY";
            const serviceDate = new Date(booking.serviceDate);
            const isWeekendService = isWeekend(serviceDate);
            const location = booking.location || "NCR"; // Default to NCR if not set

            // Amounts
            const totalTransactionAmount = payment ? parseFloat(payment.totalAmount || "0") : 0;
            const transportationFee = transport ? parseFloat(transport.totalTransportationCost || "0") : 0;

            let hmBaseShare = 0;
            let surgeBonus = 0;

            // Get Rate Card for Location
            const rateCard = LOCATION_RATES[location] || LOCATION_RATES["NCR"];

            if (bookingType === "TRIAL") {
                // Trial: 100% of Service Fee goes to HM (excluding transpo) - Logic maintained from original
                // NOTE: User requirement didn't explicitly specify TRIAL logic change, but implied standardizing rates.
                // However, usually Trial bookings might have specific rules. 
                // Any specific override for trial? The user input showed Trial Booking Service Price matching HM Regular Rate.
                // NCR Trial: 650 (Whole) / 510 (Half) -> Matches Rate Card
                // Cavite Trial: 600 (Whole) / 460 (Half) -> Matches Rate Card
                // So effectively, for TRIAL, HM gets the full Rate Card amount (which equals the service price).

                hmBaseShare = serviceType === "HALF_DAY" ? rateCard.HALF_DAY : rateCard.WHOLE_DAY;

                // Does Trial get surge? The user table shows "Surge Rate" as "-" for Trial.
                // So no surge for Trial.
            } else {
                // OneTime / Flexi
                hmBaseShare = serviceType === "HALF_DAY" ? rateCard.HALF_DAY : rateCard.WHOLE_DAY;

                if (isWeekendService) {
                    // 10% Surge based on HM Share
                    surgeBonus = Math.round(hmBaseShare * 0.10);
                }
            }

            const hmServiceTotal = hmBaseShare + surgeBonus;

            // Total Amount = Service Share (Base + Surge) only. 
            // Transportation is paid directly and recorded separately but not added to the 'Earnings' total for platform accounting.
            const hmTotalEarnings = hmServiceTotal;

            // 3. Insert into housemaid_earnings
            await db.insert(housemaidEarnings).values({
                housemaidId: booking.housemaidId,
                bookingId: booking.bookingId,
                paymentId: payment ? payment.paymentId : null,
                type: "earning",

                // Storing HM's Earnings
                serviceAmount: hmServiceTotal.toFixed(2), // Base + Surge
                transportationAmount: transportationFee.toFixed(2),
                totalAmount: hmTotalEarnings.toFixed(2), // HM's Service Earnings Only

                pointsEarned: booking.asensoPointsAwarded || 0,

                paymentMethodCode: payment ? payment.paymentMethodCode : null,
                paymentStatusCode: payment ? payment.paymentStatusCode : null,
                transactionDate: booking.serviceDate, // Using Service Date as the transaction date for earnings
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            console.log(`[Earnings] Successfully created earning for booking ${bookingId}. Amount: ${hmTotalEarnings}`);
            return true;

        } catch (error) {
            console.error(`[Earnings] Error creating earning:`, error);
            return false;
        }
    }

    /**
     * Get earnings summary and recent list for a housemaid
     */
    static async getEarningsByHousemaid(housemaidId: number) {
        const now = new Date();

        // Date Ranges
        const dayStart = startOfDay(now);
        const dayEnd = endOfDay(now);
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Queries for Summary stats
        // We sum 'totalAmount' from housemaid_earnings

        async function getSum(start: Date, end: Date) {
            const result = await db
                .select({
                    total: sql<string>`sum(${housemaidEarnings.totalAmount})`
                })
                .from(housemaidEarnings)
                .where(and(
                    eq(housemaidEarnings.housemaidId, housemaidId),
                    between(housemaidEarnings.transactionDate, start.toISOString().split('T')[0], end.toISOString().split('T')[0])
                ));
            return result[0]?.total || "0";
        }

        const [todaySum, weekSum, monthSum, list, housemaid] = await Promise.all([
            getSum(dayStart, dayEnd),
            getSum(weekStart, weekEnd),
            getSum(monthStart, monthEnd),
            db.select({
                earning: housemaidEarnings,
                booking: bookings,
                payment: bookingPayments,
                customer: {
                    name: sql<string>`(SELECT customer_name FROM customer_profiles WHERE customer_id = ${bookings.customerId})`
                }
            })
                .from(housemaidEarnings)
                .leftJoin(bookings, eq(housemaidEarnings.bookingId, bookings.bookingId))
                .leftJoin(bookingPayments, eq(housemaidEarnings.paymentId, bookingPayments.paymentId))
                .where(eq(housemaidEarnings.housemaidId, housemaidId))
                .orderBy(desc(housemaidEarnings.createdAt))
                .limit(50), // Pagination can be added later
            db.select({
                asensoPointsBalance: housemaids.asensoPointsBalance
            })
                .from(housemaids)
                .where(eq(housemaids.housemaidId, housemaidId))
                .limit(1)
        ]);

        return {
            summary: {
                today: todaySum,
                week: weekSum,
                month: monthSum
            },
            currentPoints: housemaid[0]?.asensoPointsBalance || 0,
            earnings: list.map(item => ({
                id: item.earning.earningId,
                receiptNumber: item.payment?.receiptNumber,
                bookingCode: item.booking?.bookingCode || "N/A",
                date: item.earning.createdAt, // Or transactionDate
                client: item.customer.name || "Unknown",
                amount: item.earning.totalAmount, // HM's Total Share
                status: item.payment?.paymentStatusCode || item.earning.paymentStatusCode || "PENDING", // Live from booking_payments
                bookingType: item.booking?.bookingTypeCode === "ONE_TIME" ? "OneTime" :
                    item.booking?.bookingTypeCode === "FLEXI" ? "Flexi" : "Trial",
                points: item.earning.pointsEarned || 0
            }))
        };
    }

    /**
     * Get detailed earning record
     */
    static async getEarningDetails(identifier: string | number) {
        // Build the where clause dynamically
        // If it's a number, it could be an ID. If it's a string, it might be a receipt number.
        // We'll prioritize looking up by receipt number if it's a string, or fallback to ID.

        let whereClause;
        const idAsNumber = Number(identifier);

        if (!isNaN(idAsNumber)) {
            // It's a number (or numeric string). 
            // Ideally we should check both, but for performance let's try to be smart.
            // If we want to support both ID 10 and Receipt "10", there's a conflict.
            // Assuming Receipt numbers are strings (which they are in schema), 
            // we can check if there's a match on receiptNumber OR earningId.
            whereClause = sql`${housemaidEarnings.earningId} = ${idAsNumber} OR ${bookingPayments.receiptNumber} = ${identifier.toString()}`;
        } else {
            // It's definitely not an ID (alphanumeric string)
            whereClause = eq(bookingPayments.receiptNumber, identifier.toString());
        }

        const result = await db
            .select({
                earning: housemaidEarnings,
                booking: bookings,
                payment: bookingPayments,
                transport: transportationDetails,
                // We'll join customer details via booking.customerId manually or via subquery if needed, 
                // but simpler to use Drizzle's relational queries if setup. 
                // Since this is a raw select, we need to be careful.
                customerName: sql<string>`(SELECT customer_name FROM customer_profiles WHERE customer_id = ${bookings.customerId})`
            })
            .from(housemaidEarnings)
            .leftJoin(bookings, eq(housemaidEarnings.bookingId, bookings.bookingId))
            .leftJoin(bookingPayments, eq(housemaidEarnings.paymentId, bookingPayments.paymentId))
            .leftJoin(transportationDetails, eq(housemaidEarnings.bookingId, transportationDetails.bookingId))
            .where(whereClause)
            .limit(1);

        if (result.length === 0) return null;

        const row = result[0];

        // Re-calculate some display values if needed or use stored values
        // We stored the splits in createEarningFromBooking, but we might want to recalculate 
        // the "Company Share" since it's not stored directly in housemaid_earnings (only HM share is).

        const clientPaidTotal = row.payment ? parseFloat(row.payment.originalAmount || "0") : 0;
        const hmTotalShare = parseFloat(row.earning.totalAmount || "0");
        const companyShare = clientPaidTotal - hmTotalShare; // Simple derivation

        // Service Type Logic for display
        const duration = row.booking?.duration === "WHOLE_DAY" ? "WholeDay" : "HalfDay";
        const isWeekendService = isWeekend(new Date(row.booking?.serviceDate || new Date()));

        return {
            ...row.earning,
            // Use LIVE payment status from booking_payments (source of truth)
            paymentStatusCode: row.payment?.paymentStatusCode || row.earning.paymentStatusCode || "PENDING",
            bookingCode: row.booking?.bookingCode,
            clientName: row.customerName,
            clientPaidAmount: clientPaidTotal,
            // Re-constructing the full financial picture for the UI
            calculation: {
                hmServiceShare: parseFloat(row.earning.serviceAmount || "0") - (isWeekendService && row.booking?.bookingTypeCode !== "TRIAL" ? Math.round((row.booking?.duration === "WHOLE_DAY" ? 650 : 510) * 0.1) : 0), // Approx reverse eng. or just use serviceAmount
                hmSurgeBonus: isWeekendService && row.booking?.bookingTypeCode !== "TRIAL" ? Math.round((row.booking?.duration === "WHOLE_DAY" ? 650 : 510) * 0.1) : 0,
                hmTransportation: parseFloat(row.earning.transportationAmount || "0"),
                hmTotalShare: hmTotalShare,
                companyShare: companyShare > 0 ? companyShare : 0
            },
            bookingDetails: {
                serviceDate: row.booking?.serviceDate,
                serviceTime: row.booking?.time,
                location: row.booking?.location, // or customer address
                type: row.booking?.bookingTypeCode === "ONE_TIME" ? "OneTime" :
                    row.booking?.bookingTypeCode === "FLEXI" ? "Flexi" : "Trial",
                duration: duration
            }
        };
    }

    /**
     * Syncs payment status from Booking/Payment to Earning record.
     * Call this when payment status is updated (e.g. Mark as Paid).
     */
    static async syncPaymentStatus(bookingId: number, status: string) {
        try {
            const result = await db
                .update(housemaidEarnings)
                .set({
                    paymentStatusCode: status,
                    updatedAt: new Date()
                })
                .where(eq(housemaidEarnings.bookingId, bookingId))
                .returning();

            if (result.length > 0) {
                console.log(`[Earnings] Synced payment status to '${status}' for booking ${bookingId}`);
                return true;
            } else {
                console.warn(`[Earnings] No earning record found to sync for booking ${bookingId}`);
                return false;
            }
        } catch (error) {
            console.error(`[Earnings] Error syncing payment status:`, error);
            return false;
        }
    }
}
