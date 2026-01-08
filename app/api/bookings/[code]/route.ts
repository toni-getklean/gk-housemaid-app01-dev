import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/lib/database";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        console.log("code", code);
        const booking = await databaseService.getBookingByCode(code);

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { status, reason, metadata } = body;

        if (!status) {
            return NextResponse.json(
                { error: "Status is required" },
                { status: 400 }
            );
        }

        const updates: Record<string, any> = {};

        // Use provided metadata or generate a server-side fallback
        const metaToSave = metadata || JSON.stringify({
            timestamp: new Date().toISOString(),
            error: "No client metadata provided"
        });

        // Determine timestamp updates based on status
        // Using camelCase keys to match Drizzle schema definition
        switch (status) {
            case "pending_review":
                // Handle decline logic
                if (reason) {
                    // 1. Record decline details
                    updates.housemaidDeclinedAt = metaToSave;
                    updates.declineReasonCode = reason;

                    // 2. Update substatus (User requirement: HOUSEMAID_DECLINED -> REASSIGNMENT_REQUIRED)
                    // We go straight to the final state for the record
                    updates.substatusCode = "reassignment_required";
                    updates.substatusNotes = "Housemaid declined assignment";

                    // 3. Unassign housemaid
                    // We need to pass this explicitly to updateBookingStatus or handle it here
                    // specific for this case
                    updates.housemaidId = null;
                    updates.housemaidName = null;
                }
                break;
            case "accepted":
                updates.housemaidAcceptedAt = metaToSave;
                break;
            case "dispatched":
                updates.housemaidDispatchedAt = metaToSave;
                break;
            case "on_the_way":
                updates.housemaidDepartedAt = metaToSave;
                break;
            case "arrived":
                updates.housemaidArrivedAt = metaToSave;
                break;
            case "in_progress":
                updates.housemaidCheckInTime = metaToSave;
                break;
            case "completed":
                updates.housemaidCheckOutTime = metaToSave;
                updates.housemaidCompletedAt = metaToSave;
                break;
            case "rescheduled":
                // 1. Validation: Check if reschedule is allowed for current status
                const currentBooking = await databaseService.getBookingByCode(code);
                if (!currentBooking) {
                    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
                }

                const allowedStatuses = ["pending_review", "accepted", "dispatched"];
                if (!allowedStatuses.includes(currentBooking.statusCode)) {
                    return NextResponse.json(
                        { error: `Reschedule not allowed for status: ${currentBooking.statusCode}` },
                        { status: 400 }
                    );
                }

                // 2. Extract and Validate Payload
                const { proposedDate, proposedTime, reasonId } = body;

                if (!proposedDate || !proposedTime || !reasonId) {
                    return NextResponse.json(
                        { error: "Proposed date, time, and reason are required" },
                        { status: 400 }
                    );
                }

                // 3. Compose Proposed Timestamp (ISO)
                // Assuming proposedDate is YYYY-MM-DD and proposedTime is HH:mm
                const proposedDateTimeStr = `${proposedDate}T${proposedTime}:00`;
                const proposedAt = new Date(proposedDateTimeStr);

                if (isNaN(proposedAt.getTime())) {
                    return NextResponse.json(
                        { error: "Invalid date/time format" },
                        { status: 400 }
                    );
                }

                // 4. Update Fields
                updates.rescheduleRequestedAt = new Date();
                updates.rescheduleRequestedBy = "HOUSEMAID";
                updates.rescheduleReasonId = reasonId; // e.g. "OUT_OF_TOWN"
                updates.rescheduleProposedAt = proposedAt;

                updates.substatusCode = "due_to_housemaid";
                updates.substatusNotes = "Reschedule requested by housemaid";
                break;
        }

        const booking = await databaseService.getBookingByCode(code);
        if (!booking) {
            return NextResponse.json({ error: "Booking not found" }, { status: 404 });
        }

        const success = await databaseService.updateBookingStatus(booking.bookingId, status, updates);

        if (!success) {
            return NextResponse.json(
                { error: "Failed to update booking status" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating booking:", error);
        return NextResponse.json(
            { error: "Failed to update booking" },
            { status: 500 }
        );
    }
}
