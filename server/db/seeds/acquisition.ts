import "dotenv/config";

import { db } from "@/server/db/client";
import { acquisition } from "@/server/db/schema/lookups/acquisition";
import { eq } from "drizzle-orm";

const acquisitionData = [
    { acquisitionCode: "sms_blast_returning", acquisitionDisplayName: "SMS BLAST - RETURNING", sourceChannel: "SMS Blast", clientType: "Returning", campaignType: "Standard" },
    { acquisitionCode: "fb_organic_new", acquisitionDisplayName: "FB - ORGANIC NEW", sourceChannel: "Facebook", clientType: "New", campaignType: "Organic" },
    { acquisitionCode: "facebook_new", acquisitionDisplayName: "FACEBOOK - NEW", sourceChannel: "Facebook", clientType: "New", campaignType: "Standard" },
    { acquisitionCode: "returning_ib", acquisitionDisplayName: "RETURNING - IB", sourceChannel: "Hotline (IB/Inbound)", clientType: "Returning", campaignType: "Standard" },
    { acquisitionCode: "returning_ib_organic", acquisitionDisplayName: "RETURNING IB - ORGANIC", sourceChannel: "Hotline (IB)", clientType: "Returning", campaignType: "Organic" },
    { acquisitionCode: "hotline_new", acquisitionDisplayName: "HOTLINE - NEW", sourceChannel: "Hotline", clientType: "New", campaignType: "Standard" },
    { acquisitionCode: "hotline_organic_new", acquisitionDisplayName: "HOTLINE - ORGANIC NEW", sourceChannel: "Hotline", clientType: "New", campaignType: "Organic" },
    { acquisitionCode: "hotline_returning", acquisitionDisplayName: "HOTLINE - RETURNING", sourceChannel: "Hotline", clientType: "Returning", campaignType: "Standard" },
    { acquisitionCode: "hotline_organic_returning", acquisitionDisplayName: "HOTLINE ORGANIC - RETURNING", sourceChannel: "Hotline", clientType: "Returning", campaignType: "Organic" },
    { acquisitionCode: "tiktok_new", acquisitionDisplayName: "TIKTOK - NEW", sourceChannel: "TikTok", clientType: "New", campaignType: "Standard" },
    { acquisitionCode: "tiktok_returning", acquisitionDisplayName: "TIKTOK - RETURNING", sourceChannel: "TikTok", clientType: "Returning", campaignType: "Standard" },
    { acquisitionCode: "website_organic", acquisitionDisplayName: "WEBSITE - ORGANIC", sourceChannel: "Website", clientType: "New", campaignType: "Organic" },
    { acquisitionCode: "website_returning_organic", acquisitionDisplayName: "WEBSITE RETURNING - ORGANIC", sourceChannel: "Website", clientType: "Returning", campaignType: "Organic" },
    { acquisitionCode: "retargeting_fs", acquisitionDisplayName: "RETARGETING - FS", sourceChannel: "Retargeting", clientType: "Returning", campaignType: "Full Service" },
    { acquisitionCode: "retargeting_free_transpo", acquisitionDisplayName: "RETARGETING - FREE TRANSPO", sourceChannel: "Retargeting", clientType: "Returning", campaignType: "Free Transport Promo" },
    { acquisitionCode: "retargeting_drip", acquisitionDisplayName: "RETARGETING - DRIP", sourceChannel: "Retargeting", clientType: "Returning", campaignType: "Drip Campaign" },
    { acquisitionCode: "retargeting_trial_promo", acquisitionDisplayName: "RETARGETING - TRIAL PROMO", sourceChannel: "Retargeting", clientType: "Returning", campaignType: "Trial Promo" },
    { acquisitionCode: "sms_blast_ac_cross_sell", acquisitionDisplayName: "SMS BLAST - AC CROSS SELL", sourceChannel: "SMS Blast", clientType: "Returning", campaignType: "Cross Sell (AC)" },
    { acquisitionCode: "returning_reactivate", acquisitionDisplayName: "RETURNING - REACTIVATE", sourceChannel: "General", clientType: "Reactivate", campaignType: "Standard" },
    { acquisitionCode: "fb_trial_fee_new", acquisitionDisplayName: "FB TRIAL FEE - NEW", sourceChannel: "Facebook", clientType: "New", campaignType: "Trial (Fee)" },
    { acquisitionCode: "fb_new_weekend", acquisitionDisplayName: "FB NEW - WEEKEND", sourceChannel: "Facebook", clientType: "New", campaignType: "Weekend Promo" },
    { acquisitionCode: "returning_ib_weekend", acquisitionDisplayName: "RETURNING IB - WEEKEND", sourceChannel: "Hotline (IB)", clientType: "Returning", campaignType: "Weekend Promo" },
    { acquisitionCode: "hotline_new_weekend", acquisitionDisplayName: "HOTLINE NEW - WEEKEND", sourceChannel: "Hotline", clientType: "New", campaignType: "Weekend Promo" },
    { acquisitionCode: "hotline_returning_weekend", acquisitionDisplayName: "HOTLINE RETURNING - WEEKEND", sourceChannel: "Hotline", clientType: "Returning", campaignType: "Weekend Promo" },
    { acquisitionCode: "fb_trial_returning", acquisitionDisplayName: "FB TRIAL - RETURNING", sourceChannel: "Facebook", clientType: "Returning", campaignType: "Trial Promo" },
    { acquisitionCode: "hotline_new_trial", acquisitionDisplayName: "HOTLINE NEW - TRIAL", sourceChannel: "Hotline", clientType: "New", campaignType: "Trial Promo" },
    { acquisitionCode: "hotline_returning_trial", acquisitionDisplayName: "HOTLINE RETURNING - TRIAL", sourceChannel: "Hotline", clientType: "Returning", campaignType: "Trial Promo" },
    { acquisitionCode: "marketing", acquisitionDisplayName: "MARKETING", sourceChannel: "Marketing (General)", clientType: "General", campaignType: "General" },
    { acquisitionCode: "sms_blasting_returning_trial", acquisitionDisplayName: "SMS BLASTING - RETURNING TRIAL", sourceChannel: "SMS Blast", clientType: "Returning", campaignType: "Trial Promo" },
];

async function main() {
    console.log("🌱 Seeding acquisition...");

    for (const row of acquisitionData) {
        const existing = await db
            .select()
            .from(acquisition)
            .where(eq(acquisition.acquisitionCode, row.acquisitionCode));

        if (existing.length === 0) {
            await db.insert(acquisition).values(row);
            console.log(`Inserted → ${row.acquisitionCode}`);
        } else {
            console.log(`Skipped (already exists) → ${row.acquisitionCode}`);
        }
    }

    console.log("✅ Seed complete: acquisition");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Error seeding acquisition:", err);
    process.exit(1);
});
