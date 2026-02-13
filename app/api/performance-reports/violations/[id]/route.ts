
import { NextResponse } from "next/server";
import { PerformanceService } from "@/server/services/PerformanceService";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const housemaidId = Number(session.sub);
        const violationId = Number(params.id);

        if (isNaN(violationId)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const violation = await PerformanceService.getViolationDetails(violationId, housemaidId);

        if (!violation) {
            return NextResponse.json({ error: "Violation not found" }, { status: 404 });
        }

        return NextResponse.json(violation);
    } catch (error) {
        console.error("Error fetching violation details:", error);
        return NextResponse.json(
            { error: "Failed to fetch violation details" },
            { status: 500 }
        );
    }
}
