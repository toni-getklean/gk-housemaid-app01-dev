
import { NextResponse } from "next/server";
import { PerformanceService } from "@/server/services/PerformanceService";

export async function GET() {
    try {
        const guidelines = await PerformanceService.getPenaltyGuidelines();
        return NextResponse.json(guidelines);
    } catch (error) {
        console.error("Error fetching penalty guidelines:", error);
        return NextResponse.json(
            { error: "Failed to fetch penalty guidelines" },
            { status: 500 }
        );
    }
}
