# Product Requirements Document (PRD)
## GetKlean Housemaid App

**Version**: 1.0 (Reverse-engineered from codebase)
**Last Updated**: 2026-02-18
**Repository**: `gk-housemaid-app01-dev`
**Status**: Active Development

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
   - 7.4 [Payment Collection](#74-payment-collection)
   - 7.5 [Proof of Arrival](#75-proof-of-arrival)
   - 7.6 [Transportation](#76-transportation)
   - 7.7 [Client Rating](#77-client-rating)
   - 7.8 [Earnings](#78-earnings)
   - 7.9 [Availability Management](#79-availability-management)
   - 7.10 [Performance Reports](#710-performance-reports)
   - 7.11 [Growth Path (Tier System)](#711-growth-path-tier-system)
   - 7.12 [Penalty Guidelines & Violations](#712-penalty-guidelines--violations)
   - 7.13 [Profile](#713-profile)
8. [Pricing Engine](#8-pricing-engine)
9. [Asenso Loyalty Points System](#9-asenso-loyalty-points-system)
10. [Data Models Summary](#10-data-models-summary)
11. [API Endpoints Reference](#11-api-endpoints-reference)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Planned / Partially Implemented Features](#13-planned--partially-implemented-features)

---

## 1. Product Overview

**GetKlean Housemaid App** is a mobile-first Progressive Web App (PWA) built for domestic service workers (housemaids) employed by GetKlean, a home cleaning service company operating in the Philippines (NCR, Cavite, Cebu).

The app serves as the primary operational tool for housemaids to:
- View and manage their assigned cleaning bookings
- Track and collect payments from clients
- Monitor their earnings and performance metrics
- Manage their weekly/monthly availability
- Participate in the Asenso loyalty points and tier progression program

The app is **not** a customer-facing app. It is an **internal operations tool** for GetKlean's field workforce.

---

## 2. User Persona

### Primary User: GetKlean Housemaid (Field Service Worker)

| Attribute | Description |
|-----------|-------------|
| **Role** | Domestic cleaner / housemaid employed by GetKlean |
| **Device** | Personal smartphone (Android or iOS) |
| **Tech literacy** | Low to medium — minimal prior app experience expected |
| **Goals** | Know their schedule, collect payment correctly, track their earnings and tier progress |
| **Pain points** | Unclear payment status, not knowing how far the next booking is, missing tier progress info |
| **Language** | Filipino (Tagalog) / English |
| **Location** | Metro Manila (NCR), Cavite, Cebu |

---

## 3. Business Goals

1. **Operational efficiency** — Reduce coordinator workload by giving housemaids direct visibility into their bookings and payments.
2. **Payment accountability** — Ensure service fees are properly collected and recorded, with clear settlement tracking.
3. **Worker retention** — The Asenso tier/rewards system incentivizes quality performance and long-term engagement.
4. **Performance quality** — Track ratings and violations to maintain service quality standards.
5. **Schedule transparency** — Availability management reduces missed bookings and improves dispatch success.
6. **Audit trail** — All booking state changes are logged, supporting dispute resolution and accountability.

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
| **Database** | PostgreSQL via Neon (serverless) |
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

- **Service layer**: `PricingService`, `HousemaidEarningsService`, `PerformanceService`, `AsensoService`, `MembershipService`
- **Database Service class**: Reusable query methods in `lib/database.ts`
- **API route per resource**: Each endpoint in its own `route.ts` file
- **Schema-first**: Drizzle ORM schema drives all data modeling
- **JWT session cookies**: 7-day expiry, stored as HTTP-only cookie
- **Audit logging**: All booking state transitions logged to `bookingActivityLog`

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
- Booking type (Trial, One-time, Flexi)
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
- Service tier and type
- Total price
- Rescheduled count (if any)
- Assignment attempt count

##### Tab 2: Client Info
- Customer name
- Contact number (click to call)
- Full address with landmark
- Google Maps link (if available)
- Customer rating to housemaid (visible post-completion)

##### Tab 3: Payment
- Payment status badge
- Service fee amount
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

### 7.4 Payment Collection

**Component**: `PaymentCollectionDialog`
**APIs**:
- `POST /api/bookings/[code]/pay-service-fee`
- `POST /api/bookings/[code]/pay-transport-fee`

#### Purpose
Modal dialog for the housemaid to confirm they have collected payment from the client.

#### Fields
- Amount to collect (pre-filled from booking)
- Payment method confirmation
- Optional: receipt photo upload

#### Validation
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

#### Earnings Summary Screen
- **Period toggle**: Daily / Weekly / Monthly
- Total earnings for selected period
- Breakdown by:
  - Service earnings
  - Transport reimbursements
  - Asenso points earned
- Earnings list (chronological, most recent first)

#### Earnings Detail Screen (`/earnings/[id]`)
Per-booking earning breakdown:
- Booking code and date
- Booking type (Trial, One-time, Flexi)
- Service amount earned
- Transportation amount (if any)
- Asenso points awarded
- Payment status
- Transaction date

#### Earnings Rules (from `HousemaidEarningsService`)
- Service amount is calculated based on location, tier, and duration
- Weekend bookings include a **surge bonus** (10% additional)
- Transport costs are separate from service earnings
- Points are only awarded on **completed** bookings

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

---

### 7.10 Performance Reports

**Route**: `/performance-reports`
**API**: `GET /api/performance-reports`

#### Purpose
Shows the housemaid their performance metrics for the current period.

#### Displayed Metrics
| Metric | Description |
|--------|-------------|
| **Average Rating** | Mean star rating from all completed bookings |
| **Completion Rate** | Percentage of accepted bookings completed vs cancelled/no-show |
| **Total Jobs** | Total completed job count |
| **Minor Violations** | Count of minor violations incurred |
| **Major Violations** | Count of major violations incurred |

#### Violations List
- List of all violations on record for the housemaid
- Each item shows: type (minor/major), description, booking reference, date, points deducted
- Tapping navigates to `/performance-reports/violations/[id]`

#### Links
- "View Growth Path" → `/performance-reports/growth-path`
- "View Penalty Guidelines" → `/performance-reports/penalty-guidelines`

---

### 7.11 Growth Path (Tier System)

**Route**: `/performance-reports/growth-path`
**API**: `GET /api/lookups/housemaid-tiers`

#### Purpose
Visual display of the Asenso tier progression system, showing the housemaid where they are and what's required to advance.

#### Tiers

| Tier | Code | Description |
|------|------|-------------|
| Entry | `ENTRY` | Starting tier for all new housemaids |
| Basic | `BASIC` | Unlocked after meeting basic performance criteria |
| Advanced | `ADVANCED` | Unlocked after sustained high performance |
| Expert | `EXPERT` | Highest tier with maximum benefits |

#### Per-Tier Display
- Tier name and badge icon
- Requirements to reach this tier (points, rating, completion rate, violation limits)
- Benefits/perks unlocked at this tier
- Current housemaid's tier highlighted
- Visual progress bar or step indicator

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

#### Violation Types (from seeds)
| Category | Examples |
|----------|----------|
| **Major** | MAJOR_THEFT, MAJOR_MISCONDUCT |
| **Minor** | MINOR_LATE_ARRIVAL, MINOR_INCOMPLETE_SERVICE |

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
- Current tier badge
- Average star rating
- Total completed bookings

#### Menu Items on Profile
- View Growth Path
- Manage Availability
- Penalty Guidelines
- Performance Reports
- Logout

---

## 8. Pricing Engine

**Service**: `PricingService`
**API**: `GET /api/pricing/calculate`

### Pricing Dimensions

| Dimension | Options |
|-----------|---------|
| **Location** | NCR, CAVITE, CEBU |
| **Service Tier** | REGULAR, PLUS, ALL_IN |
| **Booking Type** | TRIAL, ONE_TIME, FLEXI |
| **Duration** | WHOLE_DAY, HALF_DAY_AM, HALF_DAY_PM |
| **Day Type** | WEEKDAY, WEEKEND_HOLIDAY |

### Pricing Logic

1. **Base price** — Looked up from `serviceSkus` (Trial/One-time) or `flexiRateCards` (Flexi) based on location, tier, and duration.
2. **Surge pricing** — Weekend/holiday bookings apply a surcharge.
3. **Adjustments** — Optional line items:
   - Discounts (flat or percentage)
   - Surcharges
   - Waivers
4. **Final price** — `basePrice + surgeAmount + adjustments`

### Flexi Membership Rules
- Flexi booking type requires an **active membership** on record for the customer
- Validated via `MembershipService` before pricing is returned
- Membership scoped by location and tier

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

## 9. Asenso Loyalty Points System

**Service**: `AsensoService`
**Tables**: `asensoTransactions`, `asensoPointsConfig`

### Overview
"Asenso" is GetKlean's internal loyalty points system for housemaids. Points are earned per completed booking and can accumulate to unlock higher tiers.

### How Points Are Earned
| Booking Type | Points Awarded |
|-------------|---------------|
| TRIAL | Configurable (via `asensoPointsConfig`) |
| ONE_TIME | Configurable |
| FLEXI | Configurable |

Points are awarded when a booking is marked **Completed**.

### Points Deductions
- **Minor violation**: Deducts a configured amount of points
- **Major violation**: Deducts a larger configured amount (or may reset progress)

### Points Ledger (`asensoTransactions`)
Every point movement is recorded:
- Transaction type (earn / deduct / adjustment)
- Amount
- Reference (booking code or violation ID)
- Timestamp

### Points Balance
- Stored on `housemaids.asensoPointsBalance`
- Updated atomically with each transaction

### Tier Unlock Rules
- Each tier has a minimum points threshold
- Also requires minimum average rating and completion rate
- Violations count may block tier advancement
- Tier evaluated periodically or after each booking completion

---

## 10. Data Models Summary

### Core Domain Tables

| Table | Purpose |
|-------|---------|
| `housemaids` | Housemaid profile (name, mobile, tier, points, status) |
| `bookings` | Main booking record (customer, date, status, pricing) |
| `bookingPayments` | Payment details per booking |
| `bookingActivityLog` | Audit trail for all booking events |
| `bookingRatings` | Housemaid ratings submitted to clients |
| `customerProfiles` | Customer master data |
| `customerAddresses` | Customer address associations |
| `addresses` | Address master (street, barangay, city, landmark) |
| `housemaidAvailability` | Daily availability calendar exceptions |
| `housemaidEarnings` | Per-booking earnings record |
| `housemaidPerformance` | Aggregated monthly performance stats |
| `housemaidViolations` | Violation records |
| `housemaidRatings` | Ratings received from customers |
| `asensoTransactions` | Points ledger |
| `asensoPointsConfig` | Points configuration per booking type |
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
| `pricingTiers` | REGULAR, PLUS, ALL_IN |
| `housemaidTiers` | ENTRY, BASIC, ADVANCED, EXPERT |
| `violationTypes` | MAJOR_THEFT, MINOR_LATE_ARRIVAL, etc. |
| `serviceType` | House Cleaning categories |

### ID Code Format & Prefix Convention

All entity codes follow the format: `{PREFIX}{YY}-{NNNNN}` where `{YY}` is the 2-digit year and `{NNNNN}` is a zero-padded 5-digit sequential number.

IDs are generated via the `idCounters` table using `DatabaseService.generateCode(prefix)`. Each prefix+year combination has its own independent counter row.

| Prefix | Entity | Example | Schema Field |
|--------|--------|---------|-------------|
| `HM{YY}` | Booking Code | `HM26-00001` | `bookings.bookingCode` |
| `OR{YY}` | Receipt Number (Booking Payments) | `OR26-00001` | `bookingPayments.receiptNumber` |
| `CUST{YY}` | Customer Code | `CUST26-00001` | `customerProfiles.customerCode` |
| `HMAID{YY}` | Housemaid Code | `HMAID26-00001` | `housemaids.housemaidCode` |
| `HVIO{YY}` | Housemaid Violation Code | `HVIO26-00001` | `housemaidViolations.violationCode` |
| `ADMIN{YY}` | Admin Code | `ADMIN26-00001` | `admins.adminCode` |

**Year Transition**: At the start of each calendar year, new prefix rows are created in `idCounters` (e.g., `HM26`, `HM27`). Counters reset to 0 for each new year prefix. The `idCounters` seed (`server/db/seeds/idCounters.ts`) pre-creates all prefix rows for the current year.

**Important**: These prefixes are the **canonical standard**. All code that generates entity codes must use these exact prefixes. Do not introduce alternative prefixes (e.g., do not use `BK` for bookings — use `HM`).

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
| `GET` | `/api/performance-reports` | Performance stats + violations list |
| `GET` | `/api/performance-reports/violations/[id]` | Violation detail |
| `GET` | `/api/performance-reports/penalty-guidelines` | All violation types and sanctions |

### Availability

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/availability` | Availability data (query: `month`, `year`) |

### Pricing & Lookups

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/pricing/calculate` | Dynamic pricing calculation |
| `GET` | `/api/lookups/statuses` | All booking status codes |
| `GET` | `/api/lookups/housemaid-tiers` | Tier definitions |

### File Uploads

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploadthing` | Upload file (proof of arrival, receipt) |

---

## 12. Non-Functional Requirements

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
- Database migrations via Drizzle (version-controlled)

### Accessibility
- Shadcn/ui built on Radix UI provides ARIA compliance
- Mobile-first touch targets (44px min)

### Localization
- Currency: Philippine Peso (PHP), custom `PesoIcon` component
- Date/time: Philippines timezone assumed
- SMS: Philippine mobile number format (+63)
- Content: English (UI), Tagalog-friendly tone expected in copy

---

## 13. Planned / Partially Implemented Features

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

### Admin-Initiated Actions
- **Referenced**: Booking creation, manual payment marking, violation recording, and housemaid assignment are referenced in the database schema and business logic
- **Status**: These flows exist server-side but are driven by a **separate admin application** (not in this repo)
- **Intent**: Admin can manage bookings, assign housemaids, and record violations; changes surface in this app

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

*This PRD was reverse-engineered from the `gk-housemaid-app01-dev` codebase on 2026-02-18. It reflects the current state of the application as inferred from source code, schema definitions, API routes, and service logic. It should be validated against stakeholder intent and updated as features are clarified or built.*