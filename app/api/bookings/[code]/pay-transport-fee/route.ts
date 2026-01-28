import { NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export async function POST(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const db = getDatabaseService();
        const success = await db.updateTransportPaymentStatus(params.code, "PAID");

        if (success) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { error: "Failed to update transport payment status" },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("Error processing transport fee payment:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
