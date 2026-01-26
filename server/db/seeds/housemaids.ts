import "dotenv/config";

import { db } from "@/server/db/client";
import { housemaids } from "@/server/db/schema/housemaid/housemaids";
import { addresses } from "@/server/db/schema/customer/addresses";
import { eq } from "drizzle-orm";
import { getDatabaseService } from "@/lib/database";

type HousemaidSeedRow = {
    legacyId: string;
    name: string;
    mobile: string;
    email: string;
    dateOfBirth: string;
    age: number;
    civilStatus: "Single" | "Married" | "Widowed" | "Separated" | null; // Adjusted type inference
    dialectSpoken: string;

    address: {
        unit: string | null;
        building: string | null;
        street: string | null;
        cityRaw: string;
        cityName: string;
        segmentCode: string | null;
    };

    emergencyContactName: string | null;
    emergencyContactMobile: string | null;
    emergencyContactRelationship: string | null;

    employmentStatus: "Active" | "Inactive" | "Terminated" | "Resigned" | null; // Adjusted
    dateStarted: string | null;
    commitment: "Full-Time" | "Part-Time" | null; // Adjusted

    branchCode: string | null;
    branchName: string | null;
    assignedAreas: string | null;

    profilePhoto: string | null;
    facebookId: string | null;
    facebookName: string | null;
    facebookAccessToken: string | null;
    tokenExpiresAt: string | null;

    gcashNumber: string | null;
    status: string | null;
    createdAt: string | null;
    lastLogin: string | null;

    // Pricing V2
    currentTierCode?: string;
    asensoPointsBalance?: number;
};

// Simplified type for seed to match what we actually have
const seedData: any[] = [
    {
        legacyId: "HM-12345",
        name: "Angel Dela Cruz",
        mobile: "639171234567",
        email: "angel@email.com",
        dateOfBirth: "1994-08-11",
        age: 30,
        civilStatus: "Single",
        dialectSpoken: "Tagalog, English",

        address: {
            unit: "Unit 1502, 15th Floor",
            building: "The Infinity Tower",
            street: "26th Street",
            cityRaw: "Taguig City",
            cityName: "TAGUIG",
            segmentCode: "condo",
        },

        emergencyContactName: "Marial Lourdes Dela Cruz",
        emergencyContactMobile: "639123456789",
        emergencyContactRelationship: "Parent",

        employmentStatus: "Active",
        dateStarted: "2024-08-10",
        commitment: "Full-Time",

        branchCode: "SF-MAKATI",
        branchName: "CK Makati Cleaning Services Inc.",
        assignedAreas: "Makati, Taguig",

        profilePhoto: "https://...",
        facebookId: "123456789",
        facebookName: "Angel Dela Cruz",
        facebookAccessToken: "EAAH73kjd9189912...",
        tokenExpiresAt: "2025-05-30T12:00:00Z",

        gcashNumber: "639171234567",
        status: "active",
        createdAt: "2024-08-10T10:30:00Z",
        lastLogin: "2025-04-30T08:15:00Z",

        currentTierCode: "REGULAR",
        asensoPointsBalance: 0,
    },
    {
        legacyId: "HM-12346",
        name: "ROSE PANGANIBAN",
        mobile: "639158214488",
        email: "angel@email.com",
        dateOfBirth: "1994-08-11",
        age: 30,
        civilStatus: "Single",
        dialectSpoken: "Tagalog, English",

        address: {
            unit: "Unit 1502, 15th Floor",
            building: "The Infinity Tower",
            street: "26th Street",
            cityRaw: "Taguig City",
            cityName: "TAGUIG",
            segmentCode: "condo",
        },

        emergencyContactName: "Marial Lourdes Dela Cruz",
        emergencyContactMobile: "639123456789",
        emergencyContactRelationship: "Parent",

        employmentStatus: "Active",
        dateStarted: "2024-08-10",
        commitment: "Full-Time",

        branchCode: "SF-MAKATI",
        branchName: "CK Makati Cleaning Services Inc.",
        assignedAreas: "Makati, Taguig",

        profilePhoto: "https://...",
        facebookId: "24887253297631318",
        facebookName: "Rose Panganiban",
        facebookAccessToken: "LONG_FACEBOOK_ACCESS_TOKEN_HERE",
        tokenExpiresAt: "2026-01-25T03:32:38.559Z",

        gcashNumber: "639158214488",
        status: "active",
        createdAt: "2024-08-10T10:30:00Z",
        lastLogin: "2025-11-26T06:18:03.569Z",

        currentTierCode: "PLUS",
        asensoPointsBalance: 150,
    },
];

function buildAddressLine(addr: any): string {
    return [addr.unit, addr.building, addr.street, addr.cityRaw]
        .filter(Boolean)
        .join(", ");
}

async function main() {
    console.log("🌱 Seeding housemaids & addresses...");

    for (const seed of seedData) {
        // Skip if already exists
        if (seed.facebookId) {
            const exists = await db
                .select()
                .from(housemaids)
                .where(eq(housemaids.facebookId, seed.facebookId));

            if (exists.length > 0) {
                console.log(`⏭️ Already exists → ${seed.name}`);
                continue;
            }
        }

        // 1. Create address
        // Auto-increment addressId
        const addressLine = buildAddressLine(seed.address);

        const insertedAddress = await db.insert(addresses).values({
            addressUnit: seed.address.unit,
            addressBuilding: seed.address.building,
            addressStreet: seed.address.street,
            cityName: seed.address.cityName,
            addressLine,

            addressLink: null,
            addressLinkName: null,
            landmark: null,
            latitude: null,
            longitude: null,
            googlePlaceId: null,

            segmentCode: seed.address.segmentCode,

            createdAt: seed.createdAt ? new Date(seed.createdAt) : null,
            updatedAt: seed.createdAt ? new Date(seed.createdAt) : null,
        }).returning({ addressId: addresses.addressId });

        const addressId = insertedAddress[0].addressId;

        // 2. Create housemaid
        const currentYear = new Date().getFullYear();
        const yy = currentYear.toString().slice(-2);
        const databaseService = getDatabaseService();
        const housemaidCode = await databaseService.generateCode(`HMAID${yy}`);

        await db.insert(housemaids).values({
            housemaidCode,
            name: seed.name,
            mobile: seed.mobile,
            email: seed.email,
            dateOfBirth: new Date(seed.dateOfBirth),
            age: seed.age,
            civilStatus: seed.civilStatus,
            dialectSpoken: seed.dialectSpoken,

            addressId, // BigInt

            emergencyContactName: seed.emergencyContactName,
            emergencyContactMobile: seed.emergencyContactMobile,
            emergencyContactRelationship: seed.emergencyContactRelationship,

            employmentStatus: seed.employmentStatus,
            dateStarted: seed.dateStarted ? new Date(seed.dateStarted) : null,
            commitment: seed.commitment,

            branchCode: seed.branchCode,
            branchName: seed.branchName,
            assignedAreas: seed.assignedAreas,
            profilePhoto: seed.profilePhoto,

            facebookId: seed.facebookId,
            facebookName: seed.facebookName,
            facebookAccessToken: seed.facebookAccessToken,
            tokenExpiresAt: seed.tokenExpiresAt
                ? new Date(seed.tokenExpiresAt)
                : null,

            gcashNumber: seed.gcashNumber,
            status: seed.status,

            currentTierCode: seed.currentTierCode || "REGULAR",
            asensoPointsBalance: seed.asensoPointsBalance || 0,

            createdAt: seed.createdAt ? new Date(seed.createdAt) : null,
            updatedAt: seed.createdAt ? new Date(seed.createdAt) : null,
            lastLogin: seed.lastLogin ? new Date(seed.lastLogin) : null,
        } as any);

        console.log(`✅ Inserted housemaid → ${seed.name} (${housemaidCode})`);
    }

    console.log("🎉 Seeding complete");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
});
