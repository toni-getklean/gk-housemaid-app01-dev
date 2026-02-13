
import { NextResponse } from "next/server";
import { PerformanceService } from "@/server/services/PerformanceService";
// import { auth } from "@/server/auth"; // Assuming auth is set up

export async function GET() {
    try {
        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const housemaidId = Number(session.sub);

        const [summary, history] = await Promise.all([
            PerformanceService.getPerformanceSummary(housemaidId),
            PerformanceService.getViolationHistory(housemaidId),
        ]);

        console.log("Summary:", summary);
        console.log("History:", history);

        return NextResponse.json({
            stats: summary,
            violations: history,
        });
    } catch (error) {
        console.error("Error fetching performance reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch performance reports" },
            { status: 500 }
        );
    }
}
