import "dotenv/config";
import { db } from "@/server/db/client";
import { asensoPointsConfig } from "@/server/db/schema/housemaid/asensoPointsConfig";
import { eq, and, isNull } from "drizzle-orm";

type AsensoConfigData = {
    eventType: string;
    bookingTypeCode: string | null;
    serviceType: string | null;
    pointsAwarded: number;
    description: string;
};

const data: AsensoConfigData[] = [
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "TRIAL",
    "serviceType": "regular",
    "pointsAwarded": 150,
    "description": "Trial booking - Regular"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "TRIAL",
    "serviceType": "plus",
    "pointsAwarded": 300,
    "description": "Trial booking - Plus"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "TRIAL",
    "serviceType": "all_in",
    "pointsAwarded": 600,
    "description": "Trial booking - All-in"
  },

  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "ONE_TIME",
    "serviceType": "regular",
    "pointsAwarded": 150,
    "description": "One-time booking - Regular"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "ONE_TIME",
    "serviceType": "plus",
    "pointsAwarded": 300,
    "description": "One-time booking - Plus"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "ONE_TIME",
    "serviceType": "all_in",
    "pointsAwarded": 600,
    "description": "One-time booking - All-in"
  },

  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "REPEAT",
    "serviceType": "regular",
    "pointsAwarded": 150,
    "description": "Repeat booking - Regular"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "REPEAT",
    "serviceType": "plus",
    "pointsAwarded": 300,
    "description": "Repeat booking - Plus"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "REPEAT",
    "serviceType": "all_in",
    "pointsAwarded": 600,
    "description": "Repeat booking - All-in"
  },

  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "FLEXI",
    "serviceType": "regular",
    "pointsAwarded": 300,
    "description": "Flexi booking - Regular"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "FLEXI",
    "serviceType": "plus",
    "pointsAwarded": 600,
    "description": "Flexi booking - Plus"
  },
  {
    "eventType": "BOOKING_COMPLETED",
    "bookingTypeCode": "FLEXI",
    "serviceType": "all_in",
    "pointsAwarded": 900,
    "description": "Flexi booking - All-in"
  },

  {
    "eventType": "AVAILABILITY_REWARD",
    "bookingTypeCode": null,
    "serviceType": null,
    "pointsAwarded": 100,
    "description": "Marked available but no booking"
  }
];

async function main() {
    console.log("🌱 Seeding asenso_points_config...");

    // Basic insert or update logic using eventType, bookingTypeCode, and serviceType as pseudo-key
    for (const row of data) {
        let whereCondition;
        if (row.bookingTypeCode === null && row.serviceType === null) {
            whereCondition = and(
                eq(asensoPointsConfig.eventType, row.eventType),
                isNull(asensoPointsConfig.bookingTypeCode),
                isNull(asensoPointsConfig.serviceType)
            );
        } else if (row.bookingTypeCode !== null && row.serviceType !== null) {
             whereCondition = and(
                 eq(asensoPointsConfig.eventType, row.eventType),
                 eq(asensoPointsConfig.bookingTypeCode, row.bookingTypeCode),
                 eq(asensoPointsConfig.serviceType, row.serviceType)
             );
        } else {
             // Handle other null cases if they arise (e.g. only serviceType is null)
             whereCondition = and(
                eq(asensoPointsConfig.eventType, row.eventType),
                row.bookingTypeCode ? eq(asensoPointsConfig.bookingTypeCode, row.bookingTypeCode) : isNull(asensoPointsConfig.bookingTypeCode),
                row.serviceType ? eq(asensoPointsConfig.serviceType, row.serviceType) : isNull(asensoPointsConfig.serviceType)
            );
        }

        const existing = await db
            .select()
            .from(asensoPointsConfig)
            .where(whereCondition);

        if (existing.length === 0) {
            await db.insert(asensoPointsConfig).values(row);
            console.log(`Inserted → ${row.eventType} / ${row.bookingTypeCode} / ${row.serviceType} = ${row.pointsAwarded} pts`);
        } else {
            await db
                .update(asensoPointsConfig)
                .set({
                    pointsAwarded: row.pointsAwarded,
                    description: row.description
                })
                .where(whereCondition);
            console.log(`Updated → ${row.eventType} / ${row.bookingTypeCode} / ${row.serviceType} = ${row.pointsAwarded} pts`);
        }
    }

    console.log("✅ Seed complete: asenso_points_config");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding asenso_points_config:", err);
    process.exit(1);
});
