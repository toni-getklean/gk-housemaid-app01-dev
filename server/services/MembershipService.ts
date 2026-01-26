import { db } from "@/server/db";
import { memberships } from "@/server/db/schema/pricing/memberships";
import { membershipSkus } from "@/server/db/schema/pricing/membershipSkus";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";
import { addMonths } from "date-fns";

export class MembershipService {
    /**
     * Validates if a customer has an active membership for a specific location and tier.
     */
    static async validateMembership(
        customerId: number,
        location: string,
        tierCode: string
    ): Promise<boolean> {
        const now = new Date(); // Use Date object for comparison

        const activeMemberships = await db
            .select()
            .from(memberships)
            .where(
                and(
                    eq(memberships.customerId, customerId),
                    eq(memberships.status, "ACTIVE"),
                    // Date range check handled in application logic or specific SQL if needed, 
                    // generally safe to fetch active and filter by dates if dates are purely strings, 
                    // but assuming they are Cast to dates by driver or we use SQL operators.
                    // Drizzle 'date' type returns string, so we might need raw SQL comparison or ensuring format.
                    // For simplicity here, we assume strictly managed 'ACTIVE' status + date checks.
                )
            );

        // Filter in memory for precise date and scope matching
        const isValid = activeMemberships.some((m) => {
            const startDate = new Date(m.startDate);
            const endDate = new Date(m.endDate);

            if (now < startDate || now > endDate) return false;

            // Check Location Scope (Null/Global or Exact Match)
            // Note: Spec says Location is mandatory, so membership MUST encapsulate it.
            // If membership can be global (null), check that.
            const locationMatch = m.locationScope === location || m.locationScope === "GLOBAL" || !m.locationScope;

            // Check Tier Scope (Null/Global or Exact Match)
            const tierMatch = !m.tierScope || m.tierScope === tierCode;

            return locationMatch && tierMatch;
        });

        return isValid;
    }

    /**
     * Purchases a membership for a customer.
     */
    static async purchaseMembership(customerId: number, skuId: string) {
        // 1. Fetch SKU
        const sku = await db.query.membershipSkus.findFirst({
            where: eq(membershipSkus.skuId, skuId),
        });

        if (!sku) throw new Error("Membership SKU not found");

        // 2. Calculate Dates
        const startDate = new Date();
        const endDate = addMonths(startDate, sku.termMonths);

        // 3. Create Membership
        await db.insert(memberships).values({
            customerId,
            skuIdSource: skuId,
            locationScope: sku.location,
            tierScope: sku.tierCode, // Can be null if global
            startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD
            endDate: endDate.toISOString().split('T')[0],
            status: "ACTIVE",
        });

        return { success: true };
    }
}
