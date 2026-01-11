import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const databaseService = getDatabaseService();
        const booking = await databaseService.getBookingByCode(code);

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        const activityLog = await databaseService.getBookingActivityLog(booking.bookingId);

        return NextResponse.json(activityLog);
    } catch (error) {
        console.error("Error fetching activity log:", error);
        return NextResponse.json(
            { error: "Failed to fetch activity log" },
            { status: 500 }
        );
    }
}
