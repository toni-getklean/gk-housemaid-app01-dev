# Product Requirements Document (PRD)
## GetKlean Housemaid App

**Version**: 2.0
**Last Updated**: 2026-03-16
**Repository**: `gk-housemaid-app01-dev`
**Status**: Active Development
**Companion App**: `gk-admin-app02-dev` (Admin Dashboard)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Persona](#2-user-persona)
3. [Business Goals](#3-business-goals)
4. [Technical Architecture](#4-technical-architecture)
5. [Authentication & Onboarding](#5-authentication--onboarding)
6. [Navigation & Layout](#6-navigation--layout)
7. [Feature Specifications](#7-feature-specifications)
   - 7.1 [Dashboard](#71-dashboard)
   - 7.2 [Bookings](#72-bookings)
   - 7.3 [Booking Detail](#73-booking-detail)
   - 7.X [Booking Extension (Immediate / On-site)](#7x-booking-extension-immediate--on-site)
   - 7.4 [Payment Collection](#74-payment-collection)
   - 7.5 [Proof of Arrival](#75-proof-of-arrival)
   - 7.6 [Transportation](#76-transportation)
   - 7.7 [Client Rating](#77-client-rating)
   - 7.8 [Earnings](#78-earnings)
   - 7.9 [Availability Management](#79-availability-management)
   - 7.10 [Performance Reports](#710-performance-reports)
   - 7.11 [Growth Path (Certifications & Service Tier System)](#711-growth-path-certifications--service-tier-system)
   - 7.12 [Penalty Guidelines & Violations](#712-penalty-guidelines--violations)
   - 7.13 [Profile](#713-profile)
8. [Pricing Engine & Flat Rate Model](#8-pricing-engine--flat-rate-model)
9. [Asenso Points & Certification System](#9-asenso-points--certification-system)
10. [Data Models Summary](#10-data-models-summary)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [UI & Badge Color Specifications](#12-ui--badge-color-specifications)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Integration with Admin Dashboard](#14-integration-with-admin-dashboard)
15. [Planned / Partially Implemented Features](#15-planned--partially-implemented-features)

---

## 1. Product Overview

**GetKlean Housemaid App** is a mobile-first Progressive Web App (PWA) built for domestic service workers (housemaids) employed by GetKlean, a home cleaning service company operating in the Philippines (NCR, Cavite, Cebu).

The app serves as the primary operational tool for housemaids to:
- View and manage their assigned cleaning bookings
- Track and collect payments from clients
- Monitor their earnings and performance metrics
- Manage their weekly/monthly availability
- Track their Asenso points balance and training/certification progress
- Understand their Performance Score and how it impacts booking assignments

The app is **not** a customer-facing app. It is an **internal operations tool** for GetKlean's field workforce.

### Relationship to Admin Dashboard

| Aspect | Housemaid App | Admin Dashboard |
|--------|--------------|-----------------|
| **Users** | Housemaids (field workers) | Operations staff (office) |
| **Device** | Mobile (PWA) | Desktop (web app) |
| **Database** | Shared Neon PostgreSQL | Shared Neon PostgreSQL |
| **Actions** | View bookings, collect payments, upload proofs | Create bookings, assign housemaids, manage everything |
| **Repo** | `gk-housemaid-app01-dev` | `gk-admin-app02-dev` |

Both apps read and write to the **same database**. Admin actions (e.g., assigning a housemaid, creating a booking) are immediately visible in the housemaid app. Housemaid actions (e.g., uploading proof of arrival, marking payment collected) are immediately visible in the admin dashboard.

---

## 2. User Persona

### Primary User: GetKlean Housemaid (Field Service Worker)

| Attribute | Description |
|-----------|-------------|
| **Role** | Domestic cleaner / housemaid employed by GetKlean |
| **Device** | Personal smartphone (Android or iOS) |
| **Tech literacy** | Low to medium — minimal prior app experience expected |
| **Goals** | Know their schedule, collect payment correctly, track their earnings, certifications, and service tier progress |
| **Pain points** | Unclear payment status, not knowing how far the next booking is, missing certification/tier progress info |
| **Language** | Filipino (Tagalog) / English |
| **Location** | Metro Manila (NCR), Cavite, Cebu |

---

## 3. Business Goals

1. **Operational efficiency** — Reduce coordinator workload by giving housemaids direct visibility into their bookings and payments.
2. **Payment accountability** — Ensure service fees are properly collected and recorded, with clear settlement tracking.
3. **Worker retention** — The Asenso points and certification system incentivizes quality performance and long-term engagement.
4. **Performance quality** — Track ratings, Performance Score, and violations to maintain service quality standards.
5. **Schedule transparency** — Availability management reduces missed bookings and improves dispatch success.
6. **Audit trail** — All booking state changes are logged, supporting dispute resolution and accountability.
7. **Skill development** — Certification/training system encourages housemaids to upskill and progress to higher service tiers.

---

## 4. Technical Architecture

### Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 18 |
| **UI Library** | Shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS 3.4 |
| **State Management** | TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Backend** | Next.js API Routes (REST) |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL via Neon (serverless) — **shared with Admin Dashboard** |
| **Auth** | Facebook OAuth + Phone OTP + JWT session |
| **File Uploads** | Uploadthing |
| **Search** | Meilisearch (planned) |
| **SMS** | CYN SMS API |
| **Deployment** | Fly.io via Docker |
| **Language** | TypeScript 5.6 (strict mode) |

### Application Structure

```
app/                  # Next.js App Router (pages + API routes)
server/               # Business logic, DB schema, seeds, services
components/           # Shared React UI components
lib/                  # Auth, OTP, SMS, utilities
hooks/                # Custom React hooks
drizzle/              # Database migrations
```

### Key Architectural Patterns

- **Shared database** — Same Neon PostgreSQL instance as the Admin Dashboard; same Drizzle schema definitions
- **Service layer**: `PricingService`, `HousemaidEarningsService`, `PerformanceService`, `AsensoService`, `MembershipService`
- **Database Service class**: Reusable query methods in `lib/database.ts`
- **API route per resource**: Each endpoint in its own `route.ts` file
- **Schema-first**: Drizzle ORM schema drives all data modeling
- **JWT session cookies**: 7-day expiry, stored as HTTP-only cookie
- **Audit logging**: All booking state transitions logged to `bookingActivityLog`
- **Schema migrations managed by Admin Dashboard repo** — Admin Dashboard and Housemaid app can run migrations, and this app references the shared schema

---

## 5. Authentication & Onboarding

### Flow

```
/login
  └─→ Facebook OAuth (implicit grant)
        └─→ /auth/callback
              ├─→ Phone not verified → /phone-verification
              │     └─→ OTP sent via SMS → /otp-verification
              │           └─→ OTP confirmed → /dashboard
              └─→ Existing verified user → /dashboard
```

### Screens

#### `/login` — Login Screen
- Displays GetKlean logo and branding
- Single CTA: "Login with Facebook"
- Initiates Facebook OAuth flow
- No email/password option — passwordless login only

#### `/phone-verification` — Phone Verification
- Input field for mobile phone number (Philippines)
- OTP is sent via CYN SMS API
- Validates phone number format

#### `/otp-verification` — OTP Confirmation
- 6-digit OTP input
- OTP expiry handling
- Resend OTP option

### Session Management
- JWT stored in HTTP-only cookie
- 7-day session expiry
- `POST /api/auth/logout` clears session cookie
- All API routes validate session before responding

---

## 6. Navigation & Layout

### Bottom Navigation (4 tabs)

| Tab | Icon | Route |
|-----|------|-------|
| Home | House icon | `/dashboard` |
| Bookings | Calendar icon | `/bookings` |
| Earnings | Peso icon | `/earnings` |
| Profile | Avatar icon | `/profile` |

### Header
- Back button (on sub-pages)
- Page title
- Housemaid name/avatar (on main pages)

### Design System
- Mobile-first layout (375px base width)
- Tailwind CSS utility classes
- Shadcn/ui component library
- Framer Motion for transitions/animations
- Toast notifications for user feedback

---

## 7. Feature Specifications

---

### 7.1 Dashboard

**Route**: `/dashboard`
**API**: `GET /api/dashboard`

#### Purpose
Home screen providing a quick snapshot of the housemaid's current workload and upcoming schedule.

#### Displayed Data
- **Today's bookings**: Count of bookings for today with status
- **Upcoming bookings**: Next N bookings requiring attention
- **For-review bookings**: Bookings waiting for housemaid action (e.g., confirm arrival, collect payment)
- **Quick stats**: Total jobs this week/month
- **Performance Score**: Current 0-100 score (brief summary)
- **Asenso Points Balance**: Current points total

#### Behavior
- Data refreshes on every page visit (React Query)
- Tapping a booking card navigates to `/bookings/[code]`

---

### 7.2 Bookings

**Route**: `/bookings`
**API**: `GET /api/bookings?status=...&date=...&search=...`

#### Purpose
Full list of all bookings assigned to the housemaid, with filtering and search.

#### Filter Options

| Filter | Values |
|--------|--------|
| **Status** | All, Pending Review, Accepted, Dispatched, Arrived, Ongoing, Completed, Cancelled, Rescheduled |
| **Date** | Calendar week picker (7-day view) |
| **Search** | Booking code, customer name, address keyword *(planned — Meilisearch)* |

#### Booking List Item (`BookingCard`)
Each card displays:
- Booking code (e.g., `HM26-00123`)
- Customer name
- Service date and time
- Address (barangay/city)
- Service tier (Regular, Plus, All-in) with badge
- Booking type (Trial, One-time, Repeat, Flexi)
- Current status badge
- Payment status indicator

#### Empty State
- Shows appropriate message when no bookings match filter

---

### 7.3 Booking Detail

**Route**: `/bookings/[code]`
**API**: `GET /api/bookings/[code]`

#### Purpose
Full detail view for a single booking, organized into 4 tabs.

#### Tabs

##### Tab 1: Summary
- Booking code, status, sub-status
- Service date, time, duration
- Service tier (Regular / Plus / All-in) and type (Trial / One-time / Repeat / Flexi)
- Total price
- **Extension Details:**
  - Total Extended Hours
  - Extension Amount (₱)
- **Service checklist** (tasks expected for this booking):
  - Housekeeping, Laundry, Childcare, Pet care, Ironing, Other
  - Displayed as a checked/unchecked list so the housemaid knows exactly what tasks are required
- Rescheduled count (if any)
- Assignment attempt count

##### Tab 2: Client Info
- Customer name
- Contact number (click to call)
- Full address with landmark
- **Address label** (e.g., "Home", "Office") — from `customerAddresses.label`
- **Google Maps link** (clickable, opens in new tab) — from `addresses.addressLink`
- **Customer status warning**: If the customer is flagged or banned, display a warning badge so the housemaid is aware of potential issues
- Customer rating to housemaid (visible post-completion)

##### Tab 3: Payment
- Payment status badge
- Service fee amount (housemaid's flat rate)
- Transport fee amount (if applicable)
- Total amount
- Payment method (GCash, Card, Maya, Cash)
- Payment source (Customer or Company)
- Settlement type (Paid to GK, Direct to Housemaid, Pending)
- Receipt number (if collected)
- Validation status

##### Tab 4: Transport
- Transport status
- Total transport cost
- Transport legs (route details)
- Payment status for transport

#### Action Footer (`BookingActionFooter`)
Context-sensitive action buttons based on booking status:

| Booking Status | Available Actions |
|---------------|-------------------|
| Accepted | Upload Proof of Arrival |
| Dispatched | Upload Proof of Arrival |
| Arrived | Start service, Upload transport |
| Ongoing | Submit payment collection |
| Completed (unpaid) | Collect service fee |
| Completed (transport unpaid) | Collect transport fee |
| Completed | Rate client |

#### Activity Log
- Accessed via link on booking detail
- Route: `GET /api/bookings/[code]/activity-log`
- Chronological list of all status changes and actions (timestamp, actor, action)

---

### 7.X Booking Extension (Immediate / On-site)

#### 1. Feature Definition
Allows housemaids to extend an ongoing booking when the client requests additional time during service.

#### 2. Feature Scope & Availability Rule
- **Scope:** Only support Immediate Extension (On-site). Triggered by housemaid during active service. No scheduled extension. No admin approval (MVP). No client app interaction.
- **Availability Rule:** Extension is only available when `status_code = in_progress`.

#### 3. UX: Housemaid App Flow
- **Booking Action Footer:** When `status = in_progress`, add `[ Request Extension ]`.
- **Component (`ExtendBookingDialog`):**
  - Fields: Additional hours: `+1`, `+2` (future: custom), Notes (optional), Confirm client approval (required checkbox).
- **Flow:** `in_progress` → housemaid opens `ExtendBookingDialog` → inputs `additionalHours` → system calculates `extensionAmount` → confirms → booking updated (no status change) → remains `in_progress`.

#### 4. CRITICAL: Lifecycle Alignment
- Use existing `status_code: in_progress`. DO NOT create new status codes, modify lifecycle transitions, or break `updateBookingStatus`.
- **Substatus Strategy (Controlled / Optional):** DO NOT use substatus for logic. You MAY optionally introduce `substatus_code = has_extension`. Rules: UI indicator only. NOT used in backend validation. NOT required for functionality. Set when `extendedHours > 0`.

#### 5. Audit Trace Design (CRITICAL)
Extension must support multiple actions per booking (e.g., Extension #1 → +1h, Extension #2 → +2h. Final: `extendedHours = 3`, `extensionAmount = 300`).
- **Activity Log (Required):** Use existing `bookingActivityLog`. Log each extension: "Extension added: +[X] hours (₱[Y])".
- **Audit Requirements:** Each log entry must capture: `additionalHours`, calculated amount, timestamp, actor (housemaid).

#### 6. Constraints & Non-Goals (STRICT)
- **Constraints:** Only allowed when `status_code = in_progress`. Cannot extend after completed. Multiple extensions allowed (accumulative). Requires client confirmation checkbox.
- **Non-Goals:** No new status codes. No lifecycle modification. No required substatus logic. No admin approval. No scheduled extension. No pricing recalculation. No surge logic.
- **Consistency Requirements:** Must align with Booking lifecycle (`updateBookingStatus`), PaymentCollectionDialog (§7.4), Earnings system (§7.8), Pricing model (§8), Activity log system.

---

### 7.4 Payment Collection

**Component**: `PaymentCollectionDialog`
**APIs**:
- `POST /api/bookings/[code]/pay-service-fee`
- `POST /api/bookings/[code]/pay-transport-fee`

#### Purpose
Modal dialog for the housemaid to confirm they have collected payment from the client.

#### Fields
- Amount to collect (pre-filled from booking) — Calculation: `totalAmount = baseServiceFee + transportFee + extensionAmount`
- Payment method confirmation
- Optional: receipt photo upload

#### Validation
- Amount validation: `amountCollected >= totalAmount`
- Cannot mark as paid if booking is not in correct status
- Transport fee collection is blocked if transport details haven't been submitted

#### Business Rule (Transport Validation)
`TransportRequiredDialog` — A blocking modal is shown if the housemaid tries to collect payment without first submitting transport details.

---

### 7.5 Proof of Arrival

**Component**: `ProofOfArrivalCard`
**API**: `POST /api/bookings/[code]/proof-of-arrival`

#### Purpose
Housemaid uploads a photo upon arriving at the client's location as proof of on-time arrival.

#### Behavior
- Photo is uploaded via Uploadthing
- Image URL stored against the booking record (`proofOfArrivalImg`)
- Triggers a booking status update
- Required before service can begin

---

### 7.6 Transportation

**API**: `POST /api/bookings/[code]/transport`

#### Purpose
Record transportation details for bookings where GetKlean covers transport costs.

#### Data Captured
- Transport mode
- Route legs (origin → destination)
- Cost per leg
- Timestamps (departure, arrival)

#### Business Rules
- Transport must be recorded before payment collection is allowed
- `TransportRequiredDialog` blocks payment submission if transport data is missing

---

### 7.7 Client Rating

**Component**: `ClientRating`
**API**: `POST /api/bookings/[code]/rate-client`

#### Purpose
After a booking is completed, the housemaid can rate the client (1–5 stars) and leave optional feedback.

#### Rules
- Only available for completed bookings
- Rating can only be submitted once per booking
- Rating is stored in `bookingRatings`

---

### 7.8 Earnings

**Route**: `/earnings`
**API**: `GET /api/earnings`

**Route**: `/earnings/[id]`
**API**: `GET /api/earnings/[id]`

#### Purpose
Shows the housemaid's earnings history and breakdown per booking.

#### Revenue Model: Flat Rate
The platform uses a **Flat Rate Model**, not a revenue split.
- Housemaids earn a **fixed flat rate** per booking based on their **Service Tier** (Regular, Plus, All-In).
- Platform revenue is the difference between the final customer price and the housemaid's flat rate.
- **Surge Rate**: Applies on weekends, regular holidays, and special holidays. Formula: `+10% of base HM rate (per tier)`.

#### Earnings Summary Screen
- **Period toggle**: Daily / Weekly / Monthly
- Total earnings for selected period
- Breakdown by:
  - Service earnings (flat rate)
  - Surge bonus (if weekend/holiday booking)
  - Transport reimbursements
  - Extension Earnings (₱)
  - Asenso points earned
- Earnings list (chronological, most recent first)

#### Earnings Detail Screen (`/earnings/[id]`)
Per-booking earning breakdown:
- Booking code and date
- Booking type (Trial, One-time, Repeat, Flexi)
- **Flat rate earned** (based on service tier, location, and duration)
- **Surge bonus** (if applicable — weekend/holiday)
- **Extension Earnings (₱)** (100% credited to housemaid, no platform deduction)
- Transportation amount (if any)
- Asenso points awarded
- Payment status
- Transaction date

#### HM Flat Rate Reference (per booking)

##### NCR
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 650 | +65 | 715 |
| Whole Day| Plus | 740 | +74 | 814 |
| Whole Day| All-In | 1000 | +100 | 1100 |
| Half Day | Regular | 510 | +51 | 561 |
| Half Day | Plus | 600 | +60 | 660 |
| Half Day | All-In | 750 | +75 | 825 |

##### CEBU
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 540 | +54 | 594 |
| Whole Day| Plus | 630 | +63 | 693 |
| Whole Day| All-In | 890 | +89 | 979 |
| Half Day | Regular | 420 | +42 | 462 |
| Half Day | Plus | 510 | +51 | 561 |
| Half Day | All-In | 660 | +66 | 726 |

##### CAVITE
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 600 | +60 | 660 |
| Whole Day| Plus | 690 | +69 | 759 |
| Whole Day| All-In | 950 | +95 | 1045 |
| Half Day | Regular | 460 | +46 | 506 |
| Half Day | Plus | 550 | +55 | 605 |
| Half Day | All-In | 700 | +70 | 770 |

#### Earnings Rules (from `HousemaidEarningsService`)
- **Flat rate** is determined by the housemaid's current Service Tier, booking location, and duration
- Weekend/holiday bookings include a **surge bonus** (+10% of base HM rate)
- Transport costs are separate from service earnings (reimbursement)
- Asenso points are only awarded on **completed** bookings

---

### 7.9 Availability Management

**Route**: `/manage-availability`
**API**: `GET /api/availability?month=...&year=...`

#### Purpose
Calendar-based tool for the housemaid to declare their available, blocked, or absent days.

#### Calendar View
- Monthly calendar navigation (previous/next month)
- Each day color-coded:
  - **Available** (default)
  - **Blocked/Absent** (housemaid marked unavailable)
  - **Booked** (has assigned booking on that day)

#### Availability Options per Day
- **Full Day** available
- **Half Day - AM** only
- **Half Day - PM** only
- **Unavailable / Absent**

#### Business Rules
- Days with existing bookings cannot be marked as unavailable (read-only)
- Exceptions are stored in `housemaidAvailability` table
- Default state is "available" unless explicitly marked otherwise
- Being marked available on a day with no assigned booking earns Asenso points (Regular tier: 100 pts)

---

### 7.10 Performance Reports

**Route**: `/performance-reports`
**API**: `GET /api/performance-reports`

#### Purpose
Shows the housemaid their performance metrics for the current period.

#### Performance Score (0-100)
A composite score that determines dispatch priority — higher-scoring housemaids receive more booking assignments.

| Component | Weight | Formula |
|-----------|--------|---------|
| **Rating** | 50% | `(Average Rating / 5) * 50` — Minimum of 5 bookings required; default 4.5 rating applied otherwise |
| **Completion** | 30% | `(Completed Bookings / Accepted Bookings) * 30` |
| **Violations** | 20% | Starts at 20 points; subtracts points based on cumulative violation history |

The Performance Score is displayed prominently at the top of the performance reports screen with a visual breakdown of the three components.

#### Displayed Metrics
| Metric | Description |
|--------|-------------|
| **Performance Score** | Composite 0-100 score with component breakdown |
| **Average Rating** | Mean star rating from all completed bookings |
| **Completion Rate** | Percentage of accepted bookings completed vs cancelled/no-show |
| **Total Jobs** | Total completed job count |
| **Minor Violations** | Count of minor violations incurred |
| **Major Violations** | Count of major violations incurred |

#### How Bookings Are Assigned (Informational)
An informational section explaining to housemaids how the dispatching system works, so they understand what impacts their booking flow:

1. **City Filter** — Bookings are matched to housemaids in the same city
2. **Availability** — Must be marked available on the booking date
3. **Service Tier Eligibility** — Must hold the required Service Tier (Regular, Plus, All-In)
4. **Certificate Relevance** — Relevant certifications (e.g., Pet Care) give priority
5. **Performance Score Ranking** — Higher score = higher priority for assignment
6. **Fairness Rotation** — If scores tie, priority goes to the housemaid with fewer recent bookings

#### Violations List
- List of all violations on record for the housemaid
- Each item shows: type (minor/major), description, booking reference, date, points deducted
- Tapping navigates to `/performance-reports/violations/[id]`

#### Links
- "View Growth Path" → `/performance-reports/growth-path`
- "View Penalty Guidelines" → `/performance-reports/penalty-guidelines`

---

### 7.11 Growth Path (Certifications & Service Tier System)

**Route**: `/performance-reports/growth-path`
**API**: `GET /api/lookups/service-tiers`, `GET /api/certifications`

#### Purpose
Visual display of the certification/training progression and service tier system, showing the housemaid where they are and what's required to advance.

#### Service Tiers

Service Tiers determine customer pricing and housemaid flat-rate earnings. Tier upgrades are **manual admin actions** based on the highest certification achieved.

| Service Tier | Code | Description |
|-------------|------|-------------|
| Regular | `REGULAR` | Default starting tier for all new housemaids |
| Plus | `PLUS` | Unlocked after achieving Advanced certification in any skill |
| All-In | `ALL_IN` | Unlocked after achieving Expert certification in any skill |

#### Certification / Training Levels (per Skill)

Housemaids progress through training levels for each specific skill category. This is separate from Service Tiers.

| Certification Level | Code | Description |
|--------------------|------|-------------|
| Entry | `ENTRY` | Introductory — SOP, task sequence, communication |
| Basic | `BASIC` | SOP mastery, time efficiency, appliance handling |
| Advanced | `ADVANCED` | Specialized skills, complex services |
| Expert | `EXPERT` | Premium handling, high-end service |

#### Skill Categories
- Housekeeping
- Laundry
- Childcare
- Pet care
- Ironing

#### Progression Rules
- **Vertical progression**: Must complete the previous level first within a skill (Entry → Basic → Advanced → Expert)
- **Lateral progression**: Can start a new skill category at the Entry level anytime
- Asenso points are used as **currency to enroll** in training/certification programs
- Certifications are validated/recorded by admin

#### Certification to Service Tier Mapping

| Highest Certification Achieved | Eligible Service Tier |
|--------------------------------|-----------------------|
| Entry & Basic | Regular (default) |
| Advanced | Plus |
| Expert | All-In |

#### Per-Tier Display
- Tier name and badge icon
- Current housemaid's service tier highlighted
- Certification matrix: skills × levels achieved
- Visual progress indicators per skill
- Points required to enroll in next training level

#### Component
`HousemaidTierCard` — Reusable widget also shown on the Earnings screen.

---

### 7.12 Penalty Guidelines & Violations

#### Penalty Guidelines Screen
**Route**: `/performance-reports/penalty-guidelines`
**API**: `GET /api/performance-reports/penalty-guidelines`

Displays all violation types and their corresponding sanctions:
- Violation code
- Violation name and description
- Severity (Minor / Major)
- Points deducted per occurrence
- Sanction (warning, suspension, termination)

#### Violation Types (Seeded Reference Data)

| Code | Name | Severity | Points Deducted | Sanction |
|------|------|----------|-----------------|----------|
| `MAJOR_THEFT` | Theft | Major | -100 | Termination |
| `MAJOR_MISCONDUCT` | Gross Misconduct | Major | -80 | Suspension/Termination |
| `MAJOR_NO_SHOW` | No-show | Major | -50 | Suspension |
| `MINOR_LATE_ARRIVAL` | Late Arrival | Minor | -10 | Warning |
| `MINOR_INCOMPLETE_SERVICE` | Incomplete Service | Minor | -15 | Warning |
| `MINOR_UNPROFESSIONAL` | Unprofessional Conduct | Minor | -10 | Warning |
| `MINOR_DRESS_CODE` | Dress Code Violation | Minor | -5 | Warning |

#### Violation Detail Screen
**Route**: `/performance-reports/violations/[id]`
**API**: `GET /api/performance-reports/violations/[id]`

Per-violation detail:
- Violation type, description
- Date of violation
- Booking reference
- Points deducted
- Sanction applied
- Notes/remarks

---

### 7.13 Profile

**Route**: `/profile`
**API**: `GET /api/profile`

#### Purpose
Displays the housemaid's personal profile and serves as a secondary navigation hub for settings and support.

#### Displayed Information
- Profile photo (from Facebook or uploaded)
- Full name
- Mobile number
- Email address
- Date of birth / Age
- Civil status
- Employment status
- Date started with GetKlean
- Assigned areas/branch
- GCash number
- Current **Service Tier** badge (Regular, Plus, or All-In)
- **Performance Score** (0-100)
- Average star rating
- Total completed bookings
- Asenso points balance

#### Menu Items on Profile
- View Growth Path (Certifications & Tiers)
- Manage Availability
- Penalty Guidelines
- Performance Reports
- Logout

---

## 8. Pricing Engine & Flat Rate Model

**Service**: `PricingService` (shared with Admin Dashboard)
**API**: `GET /api/pricing/calculate`

### Revenue Model: Flat Rate

The platform uses a **Flat Rate Model**. Housemaids earn a fixed flat rate per booking. The rate depends on:
1. **Location** — NCR, Cavite, Cebu
2. **Service Tier** — Regular, Plus, All-In (based on housemaid's current tier)
3. **Duration** — Whole Day (8h), Half Day AM (4h), Half Day PM (4h)
4. **Day Type** — Weekday vs Weekend/Holiday (surge applies)

### Pricing Dimensions

| Dimension | Options |
|-----------|---------|
| **Location** | NCR, CAVITE, CEBU |
| **Service Tier** | REGULAR, PLUS, ALL_IN |
| **Booking Type** | TRIAL, ONE_TIME, REPEAT, FLEXI |
| **Duration** | WHOLE_DAY, HALF_DAY_AM, HALF_DAY_PM |
| **Day Type** | WEEKDAY, WEEKEND_HOLIDAY |

### Pricing Logic

1. **Base price** — Looked up from `serviceSkus` (Trial/One-time) or `flexiRateCards` (Flexi) based on location, tier, and duration.
2. **Surge pricing** — Weekend/holiday bookings apply a surcharge (+10% of base HM rate per tier).
3. **Adjustments** — Optional line items:
   - Discounts (flat or percentage)
   - Surcharges
   - Waivers
4. **Final price** — `basePrice + surgeAmount + adjustments`

### Extension Pricing Logic (LOCKED)

**Explicit Rule Block:**
Extension Pricing Rules:
- Rate: ₱100 per hour
- Fixed and non-dynamic
- No surge pricing
- No dependency on base booking price

**Application:** MUST MATCH SALES INPUT. Overtime fee = ₱100 per hour. Applies regardless of weekday/weekend, holiday, booking type, duration. 100% goes to housemaid.

### Flexi Membership Rules
- Flexi booking type requires an **active membership** on record for the customer
- Validated via `MembershipService` before pricing is returned
- Membership scoped by location and tier

#### Flexi Plan Customer Pricing
| Plan | Price |
|------|------:|
| 1 Month | 1790 |
| 3 Months | 4990 |
| 6 Months | 5990 |
| 12 Months | 8990 |

- Same across all territories
- Not affected by surge
- Membership pricing (not HM rate)

### What the Housemaid Sees
- The housemaid sees their **flat rate earned** per booking (not the customer-facing price)
- Surge bonus is shown as a separate line item
- Transport reimbursement is shown separately
- All visible in the Earnings section (§7.8)

### Output (`pricingBreakdown` JSONB on booking)
```json
{
  "basePrice": 850,
  "surgeAmount": 85,
  "adjustments": [],
  "currency": "PHP",
  "finalPrice": 935
}
```

---

## 9. Asenso Points & Certification System

**Service**: `AsensoService`
**Tables**: `asensoTransactions`, `asensoPointsConfig`

### Overview
"Asenso" is GetKlean's internal loyalty points system for housemaids. Points are earned per completed booking and serve as **currency to enroll in Training/Certification programs**. Points do NOT automatically determine a housemaid's service tier. Points accumulate continuously and **never reset**.

### 9.1 Points Earning

| Action | Regular | Plus | All-in |
|--------|---------|------|--------|
| Trial booking | 150 pts | 300 pts | 600 pts |
| One-time booking | 150 pts | 300 pts | 600 pts |
| Repeat booking | 150 pts | 300 pts | 600 pts |
| Subscription / Flexi booking | 300 pts | 600 pts | 900 pts |
| Marked available but no booking | 100 pts | — | — |

**Rules**
- Points earned per completed booking
- No monthly or daily cap
- Earnings accumulate continuously
- Points may go negative due to violations

#### 9.1.1 Availability Reward

Housemaids may earn +100 Asenso points when they mark themselves available but do not receive any booking offers for the day.

**Conditions for awarding the availability reward:**
1. The housemaid must have marked herself available for that specific day in the system.
2. The system must have not sent any booking offer to the housemaid during that day.
3. The housemaid must not be suspended or restricted from receiving bookings.

If all conditions are met, the housemaid is awarded:
**+100 Asenso points**

This reward is intended to compensate housemaids for maintaining availability when the platform was unable to provide booking opportunities.

**Important Rules**
- The reward is granted per day of availability.
- If the housemaid receives at least one booking offer, the availability reward is not granted.
- This applies regardless of whether the booking was accepted, declined, missed, or later cancelled.
- The key condition is whether the system issued an offer, not whether a booking was completed.

**Processing Method**
Availability rewards are processed through a daily automated system job.

Process flow:
1. The system reviews all housemaids who marked themselves available on the previous day.
2. The system checks whether any booking offers were sent to each housemaid on that day.
3. If no booking offers exist, the system automatically credits +100 Asenso points to the housemaid’s account.

All awarded points must be recorded in the Asenso Points transaction ledger for auditing and reporting purposes.

### 9.2 Points Usage

Asenso points are used only for: Enrollment into certification/training programs

They do NOT:
- Automatically upgrade tier
- Act as a level threshold
- Expire or reset

### 9.3 Points Deductions
- **Minor violation**: Deducts points per violation type (e.g., -5 to -15 pts)
- **Major violation**: Deducts larger amounts (e.g., -50 to -100 pts)
- Admin can manually adjust points (add/deduct with reason)

### 9.4 Points Ledger (`asensoTransactions`)
Every point movement is recorded:
- Transaction type (earn / deduct / adjustment)
- Amount
- Reference (booking code or violation ID)
- Timestamp

### 9.5 Points Balance
- Stored on `housemaids.asensoPointsBalance`
- Updated atomically with each transaction

### 9.6 Certification → Service Tier Path

| Highest Certification Level | Eligible Service Tier |
|---|---|
| Entry & Basic | Regular (default starting tier) |
| Advanced | Plus |
| Expert | All-In |

See Section 7.11 for full details on the certification system.

---

## 10. Data Models Summary

### Core Domain Tables (Shared with Admin Dashboard)

| Table | Purpose |
|-------|---------|
| `housemaids` | Housemaid profile (name, mobile, service tier, points, status, performanceScore) |
| `bookings` | Main booking record (including Pricing V2 fields: `tierCode`, `bookingTypeCode`, `serviceChecklist`, `dayType`). **Extension fields:** `extendedHours` (integer, default 0), `extensionAmount` (numeric, default 0), `extensionRequestedAt` (timestamp) |
| `bookingPayments` | Payment details per booking |
| `bookingActivityLog` | Audit trail for all booking events |
| `bookingRatings` | Housemaid ratings submitted to clients |
| `customerProfiles` | Customer master data — includes `status` (ACTIVE/FLAGGED/BANNED), `flagReason`, `banReason` |
| `customerAddresses` | Customer ↔ address junction — `label` (Home/Office), `isPrimary` flag |
| `addresses` | Address master — `addressLine`, `landmark`, `addressLink` (Google Maps URL), `latitude`, `longitude`, `segmentCode` |
| `housemaidAvailability` | Daily availability calendar exceptions |
| `housemaidEarnings` | Per-booking earnings record (flat rate). *Note: "Extension Earnings" displayed in UI are derived directly from the joined `bookings.extensionAmount` field. Extension fees are rolled seamlessly into the earnings `totalAmount` ledger field to maintain financial alignment without schema inflation.* |
| `housemaidPerformance` | Aggregated monthly performance stats, including `performanceScore` (0-100) |
| `housemaidViolations` | Violation records |
| `housemaidRatings` | Ratings received from customers |
| `housemaidCertifications` | Training and certification records per skill |
| `asensoTransactions` | Points ledger |
| `asensoPointsConfig` | Points configuration per booking type and tier |
| `serviceSkus` | Trial/One-time pricing by location/tier/duration |
| `flexiRateCards` | Flexi rate pricing |
| `memberships` | Active customer memberships |
| `membershipSkus` | Membership product definitions |
| `transportationDetails` | Transport cost/status per booking |
| `transportationLegs` | Multi-leg route details |
| `otpVerifications` | OTP records |
| `userAuthAttempts` | Login attempt tracking |

### Key Lookup Tables (Reference Data)

| Table | Values |
|-------|--------|
| `status` | pending_review, accepted, dispatched, arrived, ongoing, completed, cancelled, rescheduled, ... |
| `substatus` | Detailed sub-states per main status |
| `paymentStatus` | PENDING, FOR_BILLING, AWAITING_PAYMENT, PAYMENT_RECEIVED, FAILED, OVERDUE |
| `paymentMethod` | GCASH, CARD, MAYA, CASH |
| `settlementType` | PAID_TO_GK, DIRECT_HOUSEMAID, PENDING |
| `serviceTiers` | REGULAR, PLUS, ALL_IN |
| `trainingLevels` | ENTRY, BASIC, ADVANCED, EXPERT |
| `violationTypes` | MAJOR_THEFT, MINOR_LATE_ARRIVAL, etc. |
| `serviceType` | House Cleaning categories |

### ID Code Format & Prefix Convention

All entity codes follow the format: `{PREFIX}{YY}-{NNNNN}` where `{YY}` is the 2-digit year and `{NNNNN}` is a zero-padded 5-digit sequential number.

IDs are generated via the `idCounters` table using `DatabaseService.generateCode(prefix)`. Each prefix+year combination has its own independent counter row.

| Prefix | Entity | Example | Schema Field |
|--------|--------|---------|-------------|
| `HM{YY}` | Booking Code | `HM26-00001` | `bookings.bookingCode` |
| `ER{YY}` | Receipt Number (Booking Payments) | `ER26-00001` | `bookingPayments.receiptNumber` |
| `CUST{YY}` | Customer Code | `CUST26-00001` | `customerProfiles.customerCode` |
| `HMAID{YY}` | Housemaid Code | `HMAID26-00001` | `housemaids.housemaidCode` |
| `HVIO{YY}` | Housemaid Violation Code | `HVIO26-00001` | `housemaidViolations.violationCode` |
| `ADMIN{YY}` | Admin Code | `ADMIN26-00001` | `admins.adminCode` |

**Year Transition**: At the start of each calendar year, new prefix rows are created in `idCounters` (e.g., `HM26`, `HM27`). Counters reset to 0 for each new year prefix. The `idCounters` seed (`server/db/seeds/idCounters.ts`) pre-creates all prefix rows for the current year.

**Important**: These prefixes are the **canonical standard** shared with the Admin Dashboard. All code that generates entity codes must use these exact prefixes. Do not introduce alternative prefixes (e.g., do not use `BK` for bookings — use `HM`).

---

## 11. API Endpoints Reference

All endpoints require a valid JWT session cookie. Return 401 if session is invalid.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/facebook/callback` | Facebook OAuth token exchange |
| `POST` | `/api/auth/verify-phone` | Send OTP to phone number |
| `POST` | `/api/auth/verify-otp` | Confirm OTP code |
| `POST` | `/api/auth/logout` | Terminate session |

### Bookings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/bookings` | List bookings (query: `status`, `date`, `search`) |
| `GET` | `/api/bookings/[code]` | Single booking detail |
| `GET` | `/api/bookings/[code]/activity-log` | Booking event history |
| `POST` | `/api/bookings/[code]/proof-of-arrival` | Upload arrival photo |
| `POST` | `/api/bookings/[code]/transport` | Submit transport details |
| `POST` | `/api/bookings/[code]/rate-client` | Submit client rating |
| `POST` | `/api/bookings/[code]/pay-service-fee` | Mark service fee collected |
| `POST` | `/api/bookings/[code]/pay-transport-fee` | Mark transport fee collected |

### Dashboard & Profile

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard` | Dashboard stats (today, week, month) |
| `GET` | `/api/profile` | Housemaid profile data |

### Earnings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/earnings` | Earnings summary and history |
| `GET` | `/api/earnings/[id]` | Detailed earning record |

### Performance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/performance-reports` | Performance stats + Performance Score + violations list |
| `GET` | `/api/performance-reports/violations/[id]` | Violation detail |
| `GET` | `/api/performance-reports/penalty-guidelines` | All violation types and sanctions |

### Certifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/certifications` | Housemaid's certification records per skill |

### Availability

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/availability` | Availability data (query: `month`, `year`) |

### Pricing & Lookups

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/pricing/calculate` | Dynamic pricing calculation |
| `GET` | `/api/lookups/statuses` | All booking status codes |
| `GET` | `/api/lookups/service-tiers` | Service Tier definitions (Regular, Plus, All-In) |
| `GET` | `/api/lookups/training-levels` | Training Level definitions (Entry, Basic, Advanced, Expert) |

### File Uploads

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploadthing` | Upload file (proof of arrival, receipt) |

---

## 12. UI & Badge Color Specifications

All badge colors across the app follow this centralized palette to seamlessly match the Admin Dashboard.

### Service Tiers (Housemaid Tiers)

| Tier | Color | HEX | Tailwind |
|------|-------|-----|----------|
| Regular | Slate | `#334155` | `bg-slate-100 text-slate-800` |
| Plus | Blue | `#1D4ED8` | `bg-blue-50 text-blue-700` |
| All-in | Amber / Gold | `#B45309` | `bg-amber-50 text-amber-700` |

### Booking Types

| Type | Color | HEX | Tailwind |
|------|-------|-----|----------|
| Trial | Purple | `#7E22CE` | `bg-purple-50 text-purple-700` |
| One-time | Green | `#15803D` | `bg-green-50 text-green-700` |
| Flexi | Orange | `#C2410C` | `bg-orange-50 text-orange-700` |

### Booking Statuses (Operational Color Logic)

Statuses follow a semantic system so operations can identify urgency at a glance.

| Color | HEX | Statuses |
|-------|-----|----------|
| Yellow | `#CA8A04` | `needs_confirmation`, `pending_review`, `rescheduled` |
| Blue | `#1D4ED8` | `dispatched`, `on_the_way`, `arrived`, `in_progress` |
| Green | `#15803D` | `accepted`, `completed` |
| Red | `#DC2626` | `cancelled`, `no_show` |

---

## 13. Non-Functional Requirements

### Performance
- Mobile-first design; target < 3s initial load on 3G
- React Query caching reduces redundant API calls
- Neon serverless PostgreSQL for low-latency queries
- Next.js standalone build optimized for Docker/Fly.io

### Security
- JWT tokens stored as HTTP-only cookies (no JavaScript access)
- All API routes validate session before processing
- Phone OTP as second factor for new users
- Activity log provides audit trail for all booking mutations
- No passwords stored — OAuth-only login

### Scalability
- Neon serverless PostgreSQL scales automatically
- Meilisearch for full-text search offloads DB query pressure *(planned)*
- Docker-based deployment on Fly.io supports horizontal scaling

### Availability
- Deployed on Fly.io with Docker
- Standalone Next.js build for predictable containerization
- Database migrations via Drizzle (version-controlled) — **managed by Admin Dashboard repo** (primary), but both Admin Dashboard and Housemaid app can run migrations
- Separate deployment from Admin Dashboard (independent scaling and releases)

### Accessibility
- Shadcn/ui built on Radix UI provides ARIA compliance
- Mobile-first touch targets (44px min)

### Localization
- Currency: Philippine Peso (PHP), custom `PesoIcon` component
- Date/time: Philippines timezone assumed
- SMS: Philippine mobile number format (+63)
- Content: English (UI), Tagalog-friendly tone expected in copy

---

## 14. Integration with Admin Dashboard

### Shared Database (Single Source of Truth)
Both apps connect to the **same Neon PostgreSQL database**. There is no API-to-API integration — both apps read/write directly.

### Data Flow: Admin → Housemaid App

| Admin Action | Effect in Housemaid App |
|-------------|------------------------|
| Create booking | Appears in housemaid's booking list |
| Assign housemaid | Booking appears in assigned housemaid's dashboard |
| Cancel booking | Status updates in housemaid's booking detail |
| Record violation | Points deducted, visible in housemaid's performance & Asenso balance |
| Override pricing | Updated total shown in housemaid's payment tab |
| Adjust Asenso points | Balance updates in housemaid's Asenso points |
| Record certification | New certification visible in housemaid's Growth Path |
| Update Service Tier | Tier badge updates across housemaid's profile and earnings |

### Data Flow: Housemaid App → Admin Dashboard

| Housemaid Action | Effect in Admin Dashboard |
|-----------------|--------------------------|
| Upload proof of arrival | Image visible in booking detail, arrival validated |
| Mark payment collected | Payment status updates in finance module |
| Submit transport details | Transport data visible in booking transport tab |
| Rate client | Rating visible in customer detail |
| Update availability | Calendar updates in admin availability view |

### Schema Migrations
- Drizzle migrations managed in the **Admin Dashboard repo** (primary)
- Admin Dashboard and Housemaid app can run migrations
- Housemaid app repo references the same schema
- Coordinated releases required when schema changes affect both apps

### Notification Triggers
- Admin actions that affect housemaids should trigger push/in-app notifications in the housemaid app (future: WebSocket or polling)
- Currently: housemaid app polls for updates via React Query

---

## 15. Planned / Partially Implemented Features

The following features have infrastructure or route stubs in the codebase but are **not yet fully implemented**:

### Live Booking Tracking
- **Route**: `/bookings/[code]/track`
- **Status**: Page file exists; tracking logic not fully implemented
- **Intent**: Real-time GPS tracking for housemaid location during transit to client

### Full-Text Search
- **Integration**: Meilisearch client configured in `lib/meilisearch.ts`
- **Cron Route**: `GET /api/cron/sync-search` (syncs DB data to search index)
- **Status**: Search infrastructure in place; search UI on `/bookings` uses basic filter (not Meilisearch)
- **Intent**: Allow housemaids to search bookings by keyword (customer name, address, booking code)

### Reschedule Flow
- **Component**: `RescheduleModal.tsx` exists
- **API**: Reschedule tracking fields present on booking (`rescheduleCount`, `rescheduleRequestedAt`, `rescheduleCause`)
- **Status**: Component shell exists; full rescheduling API flow not confirmed implemented
- **Intent**: Housemaid or admin can request reschedule with reason tracking

### Ratings Received from Customers
- **Table**: `housemaidRatings` and `customerRatings` both exist in schema
- **Status**: Rating submission from customers is admin/customer-app driven; housemaid app shows aggregated rating in profile
- **Intent**: Eventually display individual customer-to-housemaid ratings per booking

---

*This PRD was originally reverse-engineered from the `gk-housemaid-app01-dev` codebase on 2026-02-18. Updated on 2026-03-16 to align with `PRD-admin.md` (Admin Dashboard v1.0), incorporating changes to the Asenso Points system, Service Tier/Certification model, Performance Score, Flat Rate revenue model, enhanced address and customer models, and service checklist features.*