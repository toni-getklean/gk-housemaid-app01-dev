
import { NextResponse } from "next/server";
import { databaseService } from "@/lib/database";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();
        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const housemaidId = Number(session.sub);

        if (!month || !year) {
            return NextResponse.json({ error: "Month and Year are required" }, { status: 400 });
        }

        const data = await databaseService.getAvailability(
            housemaidId,
            parseInt(month),
            parseInt(year)
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching availability:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { date, status, timeCommitment, reason } = body;

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month');
        const year = searchParams.get('year');

        // Secure Session Check
        const { getSession } = await import("@/lib/auth");
        const session = await getSession();
        if (!session || !session.sub) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const housemaidId = Number(session.sub);

        // Basic Validation
        if (!date || !status) {
            return NextResponse.json({ error: "Date and Status are required" }, { status: 400 });
        }

        if (status === 'AVAILABLE' && !timeCommitment) {
            return NextResponse.json({ error: "Time Commitment is required when Available" }, { status: 400 });
        }

        const result = await databaseService.updateAvailability({
            housemaidId: housemaidId,
            date,
            status,
            timeCommitment,
            reason
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Error updating availability:", error);
        if (error.message === "Cannot edit availability for a date with an active booking.") {
            return NextResponse.json({ error: error.message }, { status: 409 });
        }
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
