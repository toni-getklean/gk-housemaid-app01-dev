import "dotenv/config";
import { db } from "@/server/db/client";
import { asensoPointsConfig } from "@/server/db/schema/housemaid/asensoPointsConfig";
import { eq } from "drizzle-orm";

const data = [
    {
        bookingTypeCode: "TRIAL",
        pointsAwarded: 150,
        description: "Trial booking - introductory service",
    },
    {
        bookingTypeCode: "ONE_TIME",
        pointsAwarded: 150,
        description: "One-time booking - standard service",
    },
    {
        bookingTypeCode: "FLEXI",
        pointsAwarded: 300,
        description: "Flexi plan booking - premium membership service",
    },
];

async function main() {
    console.log("🌱 Seeding asenso_points_config...");

    for (const row of data) {
        const existing = await db
            .select()
            .from(asensoPointsConfig)
            .where(eq(asensoPointsConfig.bookingTypeCode, row.bookingTypeCode));

        if (existing.length === 0) {
            await db.insert(asensoPointsConfig).values(row);
            console.log(`Inserted → ${row.bookingTypeCode} = ${row.pointsAwarded} pts`);
        } else {
            await db
                .update(asensoPointsConfig)
                .set(row)
                .where(eq(asensoPointsConfig.bookingTypeCode, row.bookingTypeCode));
            console.log(`Updated → ${row.bookingTypeCode} = ${row.pointsAwarded} pts`);
        }
    }

    console.log("✅ Seed complete: asenso_points_config");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding asenso_points_config:", err);
    process.exit(1);
});
