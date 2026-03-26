# Implementation Plan: Housemaid App vs. PRD

*(Strictly cross-referenced against `PRD-housemaid.md`)*

Upon checking the `server/db/schema` directory strictly against the Housemaid PRD's Data Models (Section 10) and Profile features (Section 7.13), the core tables generated so far ALMOST perfectly match the PRD. 

However, there are exactly **four missing schema modifications** on existing heavily-used schemas that have not yet been applied to the codebase.

---

## Phase 1: Pre-Requisite Schema Modifications
The following columns and constraints must be added to the Drizzle schema files so that the app's backend can query, enforce, and update them as mandated by `PRD-housemaid.md`:

### 1. Missing Columns on `housemaids.ts`
Per PRD Section 7.13 (Profile) and Section 10 (Data Models Summary), the housemaid's master record must cache their aggregated score and rating for dispatching and profile display:
- **[NEW] `performanceScore`**: (numeric, precision 5 scale 2) — Caches the 0-100 score.
- **[NEW] `averageRating`**: (numeric, precision 4 scale 2) — Caches the 0-5 average rating.
- **[MODIFY] `currentServiceTierCode`**: Add `.references(() => serviceTiers.tierCode)` to enforce database-level referential integrity between the housemaid and the validated `serviceTiers` lookup table.

### 2. Missing Column on `bookings.ts`
Per PRD Section 10 (Data Models Summary - Core Domain Tables) and Service Specifications:
- **[NEW] `serviceChecklist`**: The PRD explicitly lists `service checklist` under the `bookings` table. This maps to the customer's *demanded tasks* for that specific booking (e.g., `["housekeeping", "laundry"]`). It must be added as a `jsonb("service_checklist")` column.

*(Once these 4 modifications are added to their respective `.ts` files, this phase is complete).*

---

## Phase 2: Core Backend Engine Updates

### 1. Composite Performance Score Logic
- **Current State:** The 0-100 score doesn't exist.
- **Implementation:** Create a `PerformanceScoreService` that calculates and syncs this metric by reading from `housemaidPerformance`, ratings, and violations, writing the summary back to the new `housemaids.performanceScore` column.

### 2. Availability Asenso Rewards (Daily Job)
- **Current State:** No automated rewards system for passive availability.
- **Implementation:** Build a Node.js cron routine (or secure backend/server-action) that checks `housemaidAvailability` against `bookings` and inserts an `asensoTransactions` record for eligible maids (+100 points).

### 3. Dynamic Pricing vs. Hardcoded Assumptions
- **Current State:** `BookingSummaryTab.tsx` has hardcoded NCR Pricing logic.
- **Implementation:** Update the backend `HousemaidEarningsService` to compute the exact pricing breakdown dynamically from the `serviceSkus` tables.

---

## Phase 3: Frontend & UI Redesign

### 1. Growth Path Overhaul
- **Current State:** The `GrowthPath` UI incorrectly treats `ENTRY/BASIC/ADVANCED/EXPERT` as the primary Service Tier.
- **Implementation:** Redesign the page to contain two distinct sections: "My Tier Progress" (`REGULAR/PLUS/ALL_IN`) and "My Certifications" (pulling from `housemaidCertifications`).

### 2. Earnings Wallet Redesign
- **Current State:** Basic earnings display.
- **Implementation:** Refactor the `app/earnings` page using the updated `HousemaidEarningsService` to show granular line items (Base Fare, Surge Bonus, Client Tips, Penalty Deductions).

---

## Phase 4: Secondary Features (Partially Implemented)
1. **Reschedule Flow:** Finishing the API handler for rescheduling requests based on the PRD rules.
