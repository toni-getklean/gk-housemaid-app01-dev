import "dotenv/config";

import { db } from "@/server/db/client";
import { branchOperatingCities } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

const branchOperatingCitiesData = [
    // MF-NCR-NORTH
    { branchCode: "MF-NCR-NORTH", cityName: "QUEZON CITY" },
    { branchCode: "MF-NCR-NORTH", cityName: "MANILA" },
    { branchCode: "MF-NCR-NORTH", cityName: "NORTH CALOOCAN" }, // Caloocan North
    { branchCode: "MF-NCR-NORTH", cityName: "CALOOCAN" },       // Caloocan South
    { branchCode: "MF-NCR-NORTH", cityName: "VALENZUELA" },
    { branchCode: "MF-NCR-NORTH", cityName: "MALABON" },
    { branchCode: "MF-NCR-NORTH", cityName: "NAVOTAS" },
    { branchCode: "MF-NCR-NORTH", cityName: "SAN JUAN" },
    { branchCode: "MF-NCR-NORTH", cityName: "MANDALUYONG" },

    // MF-NCR-SOUTH
    { branchCode: "MF-NCR-SOUTH", cityName: "MARIKINA" },
    { branchCode: "MF-NCR-SOUTH", cityName: "TAGUIG" },
    { branchCode: "MF-NCR-SOUTH", cityName: "PASIG" },
    { branchCode: "MF-NCR-SOUTH", cityName: "PATEROS" },
    { branchCode: "MF-NCR-SOUTH", cityName: "PARANAQUE" },
    { branchCode: "MF-NCR-SOUTH", cityName: "PASAY" },
    { branchCode: "MF-NCR-SOUTH", cityName: "MUNTINLUPA" },
    { branchCode: "MF-NCR-SOUTH", cityName: "LAS PINAS" },

    // MF-CLB (provinces)
    { branchCode: "MF-CLB", cityName: "CAVITE" },
    { branchCode: "MF-CLB", cityName: "LAGUNA" },
    { branchCode: "MF-CLB", cityName: "BATANGAS" },

    // MF-BULACAN
    { branchCode: "MF-BULACAN", cityName: "BULACAN" },

    // MF-CEBU
    { branchCode: "MF-CEBU", cityName: "CEBU" },

    // MF-PAMPANGA
    { branchCode: "MF-PAMPANGA", cityName: "PAMPANGA" },

    // SF TAGUIG
    { branchCode: "SF TAGUIG", cityName: "TAGUIG" },

    // SF-QC
    { branchCode: "SF-QC", cityName: "QUEZON CITY" },

    // SF-MAKATI
    { branchCode: "SF-MAKATI", cityName: "MAKATI" },

    // SF-MANILA
    { branchCode: "SF-MANILA", cityName: "MANILA" },

    // SF-MUNTILAS
    { branchCode: "SF-MUNTILAS", cityName: "MUNTINLUPA" },
    { branchCode: "SF-MUNTILAS", cityName: "LAS PINAS" },

    // SF-PARPAS
    { branchCode: "SF-PARPAS", cityName: "PARANAQUE" },
    { branchCode: "SF-PARPAS", cityName: "PASAY" },

    // NC-ANTIPOLO (Rizal province)
    { branchCode: "NC-ANTIPOLO", cityName: "RIZAL" },

    // NC-DASMA (Cavite province)
    { branchCode: "NC-DASMA", cityName: "CAVITE" },

    // NC-LIPA (Batangas province)
    { branchCode: "NC-LIPA", cityName: "BATANGAS" },
];

async function main() {
    console.log("🌱 Seeding branch_operating_cities...");

    for (const row of branchOperatingCitiesData) {
        const existing = await db
            .select()
            .from(branchOperatingCities)
            .where(
                and(
                    eq(branchOperatingCities.branchCode, row.branchCode),
                    eq(branchOperatingCities.cityName, row.cityName),
                ),
            );

        if (existing.length === 0) {
            await db.insert(branchOperatingCities).values(row);
            console.log(`Linked → ${row.branchCode} ↔ ${row.cityName}`);
        } else {
            console.log(`Skipped (already exists) → ${row.branchCode} ↔ ${row.cityName}`);
        }
    }

    console.log("✅ Seed complete: branch_operating_cities");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding branch_operating_cities:", err);
    process.exit(1);
});
