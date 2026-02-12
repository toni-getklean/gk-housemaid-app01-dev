
import "dotenv/config";
import { db } from "../server/db/client";
import { sql } from "drizzle-orm";

async function main() {
    console.log("TEST: Starting DB Connection Test...");
    try {
        console.log("TEST: Database URL:", process.env.DATABASE_URL ? "Defined" : "UNDEFINED");

        const result = await db.execute(sql`SELECT 1 as val`);
        console.log("TEST: Query Result:", result);
        console.log("TEST: SUCCESS");
    } catch (e) {
        console.error("TEST: FAILED", e);
    }
    process.exit(0);
}
main();
