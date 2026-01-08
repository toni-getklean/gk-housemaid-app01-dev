import "dotenv/config";

import { db } from "@/server/db/client";
import { branchCode } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const branchCodeData = [
    {
        branchCode: "MF-NCR-NORTH",
        branchName: "Gklean NCR North Hub",
        branchCity: "Quezon City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "MF-NCR-SOUTH",
        branchName: "Gk Cleaning Services Inc. NCR South Hub",
        branchCity: "Taguig City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "MF-CLB",
        branchName: "CLB Cleaning Services Inc. Regional Hub",
        branchCity: "Dasmariñas",
        branchProvince: "Cavite",
        branchRegion: "CALABARZON (Region IV-A)",
    },
    {
        branchCode: "MF-BULACAN",
        branchName: "GKB Bulacan Hub",
        branchCity: "Malolos",
        branchProvince: "Bulacan",
        branchRegion: "Central Luzon (Region III)",
    },
    {
        branchCode: "MF-CEBU",
        branchName: "GK Cebu Cleaning Services Inc. Hub",
        branchCity: "Cebu City",
        branchProvince: "Cebu",
        branchRegion: "Central Visayas (Region VII)",
    },
    {
        branchCode: "MF-PAMPANGA",
        branchName: "GK Pampanga Cleaning Services Inc. Hub",
        branchCity: "San Fernando",
        branchProvince: "Pampanga",
        branchRegion: "Central Luzon (Region III)",
    },
    {
        branchCode: "SF TAGUIG",
        branchName: "Taguig City Branch",
        branchCity: "Taguig City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "SF-QC",
        branchName: "GK QC Cleaning Services Inc.",
        branchCity: "Quezon City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "SF-MAKATI",
        branchName: "GK Makati Cleaning Services Inc.",
        branchCity: "Makati City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "SF-MANILA",
        branchName: "GK Manila Cleaning Services Inc.",
        branchCity: "Manila City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "SF-MUNTILAS",
        branchName: "GK Muntinlupas Cleaning Services Inc.",
        branchCity: "Muntinlupa City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "SF-PARPAS",
        branchName: "GK PARPAS Cleaning Services Inc.",
        branchCity: "Paranaque City",
        branchProvince: "Metro Manila",
        branchRegion: "National Capital Region (NCR)",
    },
    {
        branchCode: "NC-ANTIPOLO",
        branchName: "Gklean Antipolo Branch",
        branchCity: "Antipolo",
        branchProvince: "Rizal",
        branchRegion: "CALABARZON (Region IV-A)",
    },
    {
        branchCode: "NC-DASMA",
        branchName: "Gklean Dasmariñas Branch",
        branchCity: "Dasmariñas",
        branchProvince: "Cavite",
        branchRegion: "CALABARZON (Region IV-A)",
    },
    {
        branchCode: "NC-LIPA",
        branchName: "Gklean Lipa Branch",
        branchCity: "Lipa City",
        branchProvince: "Batangas",
        branchRegion: "CALABARZON (Region IV-A)",
    },
];

async function main() {
    console.log("🌱 Seeding branch_code...");

    for (const row of branchCodeData) {
        const existing = await db
            .select()
            .from(branchCode)
            .where(eq(branchCode.branchCode, row.branchCode));

        if (existing.length === 0) {
            await db.insert(branchCode).values(row);
            console.log(`Inserted → ${row.branchCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.branchCode}`);
        }
    }

    console.log("✅ Seed complete: branch_code");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding branch_code:", err);
    process.exit(1);
});
