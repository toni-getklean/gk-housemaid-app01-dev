import { NextRequest, NextResponse } from "next/server";
import { getDatabaseService } from "@/lib/database";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const databaseService = getDatabaseService();
    const statuses = await databaseService.getStatuses();

    return NextResponse.json({
      statuses,
      total: statuses.length,
    });
  } catch (error) {
    console.error("Error in GET /api/lookups/statuses:", error);
    return NextResponse.json(
      { error: "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}
