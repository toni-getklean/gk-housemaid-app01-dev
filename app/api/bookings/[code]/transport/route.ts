import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/lib/database";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { commute_to_client_infos, return_from_client_infos, total_transportation_cost } = body;

        // Get booking to retrieve housemaidId
        const booking = await databaseService.getBookingByCode(code);
        if (!booking || !booking.housemaidId) {
            return NextResponse.json(
                { error: "Booking or Housemaid not found" },
                { status: 404 }
            );
        }

        const success = await databaseService.updateTransportationDetails(booking.bookingId, booking.housemaidId, {
            commute_to_client_infos: commute_to_client_infos,
            return_from_client_infos: return_from_client_infos,
            total_transportation_cost: total_transportation_cost?.toString(),
        });



        if (!success) {
            return NextResponse.json(
                { error: "Failed to update transportation details" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating transportation:", error);
        return NextResponse.json(
            { error: "Failed to update transportation" },
            { status: 500 }
        );
    }
}
