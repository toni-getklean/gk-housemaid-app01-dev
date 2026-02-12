
import { NextRequest, NextResponse } from "next/server";
import { HousemaidEarningsService } from "@/server/services/HousemaidEarningsService";

export const dynamic = "force-dynamic";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params; // Await the params
    try {
        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const earningId = Number(params.id);

        if (isNaN(earningId)) {
            return NextResponse.json({ error: "Invalid earning ID" }, { status: 400 });
        }

        const data = await HousemaidEarningsService.getEarningDetails(earningId);

        if (!data) {
            return NextResponse.json({ error: "Earning not found" }, { status: 404 });
        }

        // Verify ownership (optional but recommended)
        // The service doesn't check ownership, so strict security would filter by housemaidId too.
        // For now, checks if earning exists. Ideally we should pass housemaidId to getEarningDetails or check it here.
        if (Number(data.housemaidId) !== Number(session.sub)) {
            return NextResponse.json({ error: "Unauthorized access to this earning" }, { status: 403 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET /api/earnings/[id]:", error);
        return NextResponse.json(
            { error: "Failed to fetch earning details" },
            { status: 500 }
        );
    }
}
