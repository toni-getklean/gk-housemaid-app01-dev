import { db } from "@/server/db";
import { serviceSkus } from "@/server/db/schema/pricing/serviceSkus";
import { flexiRateCards } from "@/server/db/schema/pricing/flexiRateCards";
import { MembershipService } from "./MembershipService";
import { eq, and } from "drizzle-orm";
import { isWeekend } from "date-fns"; // Note: isHoliday might need a custom helper

interface PricingRequest {
    location: string;
    tier: string;
    duration: string; // WHOLE_DAY, HALF_DAY
    date: Date;
    bookingType: string; // TRIAL, ONE_TIME, FLEXI
    customerId?: number; // Required for Flexi validation
    adjustments?: {
        type: "DISCOUNT" | "WAIVER" | "SURCHARGE";
        amount?: number;
        percentage?: number;
        description: string;
    }[];
}

interface PricingResponse {
    finalPrice: number;
    breakdown: {
        basePrice: number;
        surgeAmount: number;
        adjustments: any[];
        currency: "PHP";
    };
    error?: string;
}

export class PricingService {
    private static isWeekendOrHoliday(date: Date): boolean {
        const isWeekendDay = isWeekend(date);
        // TODO: Implement real holiday checking logic (e.g. valid-ph or lookup table)
        const isHolidayDay = false;
        return isWeekendDay || isHolidayDay;
    }

    static async calculateBookingPrice(params: PricingRequest): Promise<PricingResponse> {
        const { location, tier, duration, date, bookingType, customerId, adjustments = [] } = params;

        let basePrice = 0;
        let surgeAmount = 0;

        // --- RULE SELECTION ---

        if (bookingType === "TRIAL" || bookingType === "ONE_TIME") {
            // Rule A & B: Flat Service Price
            const sku = await db.query.serviceSkus.findFirst({
                where: and(
                    eq(serviceSkus.location, location),
                    eq(serviceSkus.tierCode, tier),
                    eq(serviceSkus.duration, duration),
                    eq(serviceSkus.bookingType, bookingType)
                ),
            });

            if (!sku) {
                throw new Error(`Pricing SKU not found for ${location}/${tier}/${duration}/${bookingType}`);
            }

            basePrice = parseFloat(sku.servicePrice);
            // No surge for fixed price SKUs (per spec)
        }
        else if (bookingType === "FLEXI") {
            // Rule D: Flexi Membership Pricing

            // 1. Validate Membership
            if (!customerId) throw new Error("Customer ID required for Flexi booking pricing");

            const hasMembership = await MembershipService.validateMembership(customerId, location, tier);
            if (!hasMembership) {
                throw new Error("Active Membership required for Flexi rates");
            }

            // 2. Fetch Rate Card
            const rateCard = await db.query.flexiRateCards.findFirst({
                where: and(
                    eq(flexiRateCards.location, location),
                    eq(flexiRateCards.tierCode, tier),
                    eq(flexiRateCards.duration, duration)
                ),
            });

            if (!rateCard) {
                throw new Error(`Rate Card not found for ${location}/${tier}/${duration}`);
            }

            // 3. Calculate Rate
            basePrice = parseFloat(rateCard.baseRateWeekday);

            if (this.isWeekendOrHoliday(date)) {
                surgeAmount = parseFloat(rateCard.surgeAddWeekendHoliday);
            }
        } else {
            throw new Error("Invalid Booking Type");
        }

        // --- ADJUSTMENTS ---
        let finalPrice = basePrice + surgeAmount;
        const appliedAdjustments = [];

        for (const adj of adjustments) {
            let adjAmount = 0;
            if (adj.type === "DISCOUNT" || adj.type === "WAIVER") {
                if (adj.amount) adjAmount = -adj.amount;
                if (adj.percentage) adjAmount = -(finalPrice * (adj.percentage / 100));
            } else if (adj.type === "SURCHARGE") {
                if (adj.amount) adjAmount = adj.amount;
                if (adj.percentage) adjAmount = finalPrice * (adj.percentage / 100);
            }

            finalPrice += adjAmount;
            appliedAdjustments.push({ ...adj, calculatedAmount: adjAmount });
        }

        // Ensure no negative price
        finalPrice = Math.max(0, finalPrice);

        return {
            finalPrice,
            breakdown: {
                basePrice,
                surgeAmount,
                adjustments: appliedAdjustments,
                currency: "PHP"
            }
        };
    }
}
