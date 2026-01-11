import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { imageUrl, metadata } = body;

        if (!imageUrl) {
            return NextResponse.json(
                { error: "Image URL or data is required" },
                { status: 400 }
            );
        }

        const databaseService = getDatabaseService();
        const booking = await databaseService.getBookingByCode(code);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const success = await databaseService.uploadProofOfArrival(booking.bookingId, imageUrl, metadata);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to upload proof of arrival" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error uploading proof of arrival:", error);
        return NextResponse.json(
            { error: "Failed to upload proof of arrival" },
            { status: 500 }
        );
    }
}
