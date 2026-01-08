
import { NextResponse } from "next/server";
import { databaseService } from "@/lib/database";
import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();

        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const housemaidId = Number(session.sub);

        // 2. Get Stats
        const data = await databaseService.getDashboardStats(housemaidId);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in dashboard API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
