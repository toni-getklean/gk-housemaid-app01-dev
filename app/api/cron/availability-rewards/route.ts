import { NextResponse } from "next/server";
import { AvailabilityRewardService } from "@/server/services/AvailabilityRewardService";

// This tells Next.js to not cache the response, ensuring the cron runs correctly
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Simple security measure for Vercel cron jobs
        const authHeader = request.headers.get("authorization");
        
        // Uncomment in production: Ensure only Vercel (or authorized agent) can trigger this
        /*
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        */

        // Execute the daily reward Service (Evaluates the current day)
        console.log("[Cron] Executing nightly availability rewards routine...");
        const result = await AvailabilityRewardService.processDailyRewards();

        return NextResponse.json({
            success: true,
            message: "Availability rewards processed successfully.",
            data: result
        });
    } catch (error: any) {
        console.error("[Cron Error] Failed to process availability rewards:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
