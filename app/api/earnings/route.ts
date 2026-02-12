
import { NextRequest, NextResponse } from "next/server";
import { HousemaidEarningsService } from "@/server/services/HousemaidEarningsService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const housemaidId = Number(session.sub);

        const data = await HousemaidEarningsService.getEarningsByHousemaid(housemaidId);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET /api/earnings:", error);
        return NextResponse.json(
            { error: "Failed to fetch earnings" },
            { status: 500 }
        );
    }
}
