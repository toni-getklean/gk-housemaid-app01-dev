import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const databaseService = getDatabaseService();
        const tiers = await databaseService.getHousemaidTiers();

        return NextResponse.json({
            tiers,
            total: tiers.length,
        });
    } catch (error) {
        console.error("Error in GET /api/lookups/housemaid-tiers:", error);
        return NextResponse.json(
            { error: "Failed to fetch housemaid tiers" },
            { status: 500 }
        );
    }
}
