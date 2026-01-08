import "dotenv/config";

import { db } from "@/server/db/client";
import { city } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const cityData = [
    // Given in your sheet
    { cityName: "TAGUIG", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MANILA", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MANDALUYONG", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "PASIG", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MALABON", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "SAN JUAN", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MAKATI", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "QUEZON CITY", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "PASAY", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "PARANAQUE", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MARIKINA", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "RIZAL", cityProvince: "Rizal", cityRegion: "CALABARZON (Region IV-A)", isProvince: true },
    { cityName: "LAGUNA", cityProvince: "Laguna", cityRegion: "CALABARZON (Region IV-A)", isProvince: true },
    { cityName: "LAS PINAS", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "MUNTINLUPA", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "NORTH CALOOCAN", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "CALOOCAN", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "VALENZUELA", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "NAVOTAS", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },

    // Extra but needed from operating_cities_description
    { cityName: "PATEROS", cityProvince: "Metro Manila", cityRegion: "National Capital Region (NCR)", isProvince: false },
    { cityName: "CAVITE", cityProvince: "Cavite", cityRegion: "CALABARZON (Region IV-A)", isProvince: true },
    { cityName: "BATANGAS", cityProvince: "Batangas", cityRegion: "CALABARZON (Region IV-A)", isProvince: true },
    { cityName: "BULACAN", cityProvince: "Bulacan", cityRegion: "Central Luzon (Region III)", isProvince: true },
    { cityName: "PAMPANGA", cityProvince: "Pampanga", cityRegion: "Central Luzon (Region III)", isProvince: true },
    { cityName: "CEBU", cityProvince: "Cebu", cityRegion: "Central Visayas (Region VII)", isProvince: true },
];

async function main() {
    console.log("🌱 Seeding city...");

    for (const row of cityData) {
        const existing = await db
            .select()
            .from(city)
            .where(eq(city.cityName, row.cityName));

        if (existing.length === 0) {
            await db.insert(city).values(row);
            console.log(`Inserted → ${row.cityName}`);
        } else {
            console.log(`Skipped (already exists) → ${row.cityName}`);
        }
    }

    console.log("✅ Seed complete: city");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding city:", err);
    process.exit(1);
});
