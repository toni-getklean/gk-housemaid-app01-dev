import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const databaseService = getDatabaseService();
        const tiers = await databaseService.getTrainingLevels();

        return NextResponse.json({
            tiers,
            total: tiers.length,
        });
    } catch (error) {
        console.error("Error in GET /api/lookups/training-levels:", error);
        return NextResponse.json(
            { error: "Failed to fetch training levels" },
            { status: 500 }
        );
    }
}
