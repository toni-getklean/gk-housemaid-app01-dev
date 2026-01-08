import { NextRequest, NextResponse } from "next/server";
import { databaseService } from "@/lib/database";

export async function GET(request: NextRequest) {
  try {
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
