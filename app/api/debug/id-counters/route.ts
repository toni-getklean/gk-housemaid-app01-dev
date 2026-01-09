import { db } from "@/server/db/client";
import { idCounters } from "@/server/db/schema";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const rows = await db.select().from(idCounters);
    return NextResponse.json(rows);
}
