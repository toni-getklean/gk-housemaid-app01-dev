import { NextRequest, NextResponse } from "next/server";
import { PricingService } from "@/server/services/PricingService";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            location,
            tier,
            duration,
            date,
            bookingType,
            customerId,
            adjustments
        } = body;

        // Basic validation
        if (!location || !tier || !duration || !date || !bookingType) {
            return NextResponse.json(
                { error: "Missing required fields: location, tier, duration, date, bookingType" },
                { status: 400 }
            );
        }

        const priceData = await PricingService.calculateBookingPrice({
            location,
            tier,
            duration,
            date: new Date(date),
            bookingType,
            customerId, // Optional (required only for FLEXI)
            adjustments
        });

        return NextResponse.json(priceData);
    } catch (error: any) {
        console.error("Pricing calculation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to calculate price" },
            { status: 500 }
        );
    }
}
