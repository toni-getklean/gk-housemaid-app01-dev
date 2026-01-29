import { NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const db = getDatabaseService();
        const success = await db.updateBookingPaymentStatus(code, "PAYMENT_RECEIVED");

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Failed to update payment status" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error processing service fee payment:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
