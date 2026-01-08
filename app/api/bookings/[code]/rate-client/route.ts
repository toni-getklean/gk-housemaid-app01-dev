import { NextResponse } from "next/server";
import { databaseService } from "@/lib/database";
import { headers } from "next/headers";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const bookingCode = code;

        // 1. Get Booking to resolve ID
        const booking = await databaseService.getBookingByCode(bookingCode);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 2. Get Rating
        const rating = await databaseService.getClientRating(booking.bookingId);

        return NextResponse.json(rating);
    } catch (error) {
        console.error("Error fetching client rating:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const bookingCode = code;
        const body = await request.json();
        const { rating, feedback } = body;

        // Validation
        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Valid star rating (1-5) is required" }, { status: 400 });
        }

        // 1. Get Booking
        const booking = await databaseService.getBookingByCode(bookingCode);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        // 2. Validate Status
        if (booking.statusCode !== 'completed') {
            return NextResponse.json({ error: "Bookings can only be rated when completed" }, { status: 400 });
        }

        // 3. Submit Rating
        const newRating = await databaseService.submitClientRating({
            bookingId: booking.bookingId,
            housemaidId: booking.housemaidId,
            customerId: booking.customerId || 0, // Fallback if customerId invalid
            rating: Number(rating),
            feedback
        });

        return NextResponse.json(newRating);

    } catch (error: any) {
        if (error.message === "Rating already submitted for this booking") {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        console.error("Error submitting client rating:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
