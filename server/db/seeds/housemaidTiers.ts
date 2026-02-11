import "dotenv/config";
import { db } from "@/server/db/client";
import { housemaidTiers } from "@/server/db/schema/housemaid/housemaidTiers";
import { eq } from "drizzle-orm";

const seedData = [
    {
        tierCode: "ENTRY",
        tierLabel: "Entry",
        minPoints: 10000,
        estimatedBookings: 34,
        tierOrder: 1,
        description: "Start your journey",
        colorClass: "#9E9E9E", // Gray
        unlockedSkills: [
            "Linis 101",
            "Basic Laundry",
            "Babysitting starter",
            "Pet care starter",
            "Ironing basic",
        ],
    },
    {
        tierCode: "BASIC",
        tierLabel: "Basic",
        minPoints: 15000,
        estimatedBookings: 50,
        tierOrder: 2,
        description: "Unlock standard benefits",
        colorClass: "#4CAF50", // Green
        unlockedSkills: [
            "Level-up cleaning",
            "Better laundry",
            "Childcare",
            "Pet basics",
            "Plantsa basics",
        ],
    },
    {
        tierCode: "ADVANCED",
        tierLabel: "Advanced",
        minPoints: 20000,
        estimatedBookings: 67,
        tierOrder: 3,
        description: "Higher earnings potential",
        colorClass: "#E67E22", // Orange
        unlockedSkills: [
            "Advanced cleaning",
            "Advanced laundry",
            "Advanced childcare",
            "Advanced petcare",
            "Advanced ironing",
        ],
    },
    {
        tierCode: "EXPERT",
        tierLabel: "Expert",
        minPoints: 30000,
        estimatedBookings: 100,
        tierOrder: 4,
        description: "Maximum benefits unlocked",
        colorClass: "#E74C3C", // Red
        unlockedSkills: [
            "Cleaning expert",
            "Laundry expert",
            "Childcare expert",
            "Petcare expert",
            "Ironing expert",
        ],
    },
];

async function main() {
    console.log("🌱 Seeding housemaid_tiers...");

    for (const row of seedData) {
        const existing = await db
            .select()
            .from(housemaidTiers)
            .where(eq(housemaidTiers.tierCode, row.tierCode));

        if (existing.length === 0) {
            await db.insert(housemaidTiers).values(row);
            console.log(`Inserted → ${row.tierCode} (${row.tierLabel}) - ${row.minPoints} pts`);
        } else {
            // Update existing row with latest data
            await db
                .update(housemaidTiers)
                .set(row)
                .where(eq(housemaidTiers.tierCode, row.tierCode));
            console.log(`Updated → ${row.tierCode} (${row.tierLabel}) - ${row.minPoints} pts`);
        }
    }

    console.log("✅ Seed complete: housemaid_tiers");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding housemaid_tiers:", err);
    process.exit(1);
});
