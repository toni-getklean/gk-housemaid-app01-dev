import "dotenv/config";
import { db } from "../server/db/client";
import { housemaidEarnings } from "../server/db/schema";
import { desc } from "drizzle-orm";
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const logPath = path.join(process.cwd(), 'scripts', 'latest-earning.log');
    const log = (msg: string) => fs.appendFileSync(logPath, msg + '\n');

    fs.writeFileSync(logPath, "🔍 Checking Latest Earning Record...\n"); // Reset log

    try {
        const earnings = await db.select().from(housemaidEarnings).orderBy(desc(housemaidEarnings.transactionDate)).limit(1);

        if (earnings.length === 0) {
            log("❌ No earnings found.");
        } else {
            log(`✅ Latest Earning ID: ${earnings[0].earningId}`);
            log(`   Amount: ${earnings[0].totalAmount}`);
            log(`   Points: ${earnings[0].pointsEarned}`);
        }
    } catch (e) {
        log(`❌ Error: ${JSON.stringify(e, null, 2)}`);
        if (e instanceof Error) {
            log(`Stack: ${e.stack}`);
        }
    }
    process.exit(0);
}

main();
