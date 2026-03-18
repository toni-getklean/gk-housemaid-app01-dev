# Product Requirements Document (PRD)
## GetKlean Admin Dashboard

**Version**: 1.0
**Last Updated**: 2026-02-19
**Repository**: `gk-admin-app01-dev`
**Status**: Active Development
**Companion App**: `gk-housemaid-app01-dev` (Housemaid App)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Admin Personas & Roles](#2-admin-personas--roles)
3. [Business Goals](#3-business-goals)
4. [Technical Architecture](#4-technical-architecture)
5. [Authentication & Onboarding](#5-authentication--onboarding)
6. [Navigation & Layout](#6-navigation--layout)
7. [Feature Specifications](#7-feature-specifications)
   - 7.1 [Dashboard (Operations Command Center)](#71-dashboard-operations-command-center)
   - 7.2 [Booking Management](#72-booking-management)
   - 7.3 [Booking Detail](#73-booking-detail)
   - 7.4 [Book a Housemaid (Multi-Step Booking Creation)](#74-book-a-housemaid-multi-step-booking-creation)
   - 7.5 [Dispatching System](#75-dispatching-system)
   - 7.6 [Housemaid Management](#76-housemaid-management)
   - 7.7 [Customer Management](#77-customer-management)
   - 7.8 [Payment & Finance Module](#78-payment--finance-module)
   - 7.9 [Violations & Performance Management](#79-violations--performance-management)
   - 7.10 [Asenso Points & Tier System](#710-asenso-points--tier-system)
   - 7.11 [Availability & Scheduling](#711-availability--scheduling)
   - 7.12 [Booking History](#712-booking-history)
   - 7.13 [Reports & Analytics](#713-reports--analytics)
   - 7.14 [Notifications & Alerts](#714-notifications--alerts)
   - 7.15 [System Settings](#715-system-settings)
8. [Audit Logging](#8-audit-logging)
9. [Role-Based Access Control (RBAC)](#9-role-based-access-control-rbac)
10. [Pricing Engine (Admin)](#10-pricing-engine-admin)
11. [Data Models Summary](#11-data-models-summary)
12. [API Endpoints Reference](#12-api-endpoints-reference)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Integration with Housemaid App](#14-integration-with-housemaid-app)
15. [Identified Gaps & Planned Features](#15-identified-gaps--planned-features)

---

## 1. Product Overview

**GetKlean Admin Dashboard** is a desktop-first web application built for GetKlean's internal operations team. It serves as the **operations control center** for managing all aspects of the GetKlean home cleaning service business.

The admin dashboard is the **counterpart** to the GetKlean Housemaid App. While the housemaid app is a field-facing mobile PWA, the admin dashboard is the back-office system that powers all operational workflows.

### What the Admin Dashboard Controls

- **Booking lifecycle** — Create, assign, reschedule, cancel, and track all bookings from start to completion
- **Housemaid workforce** — Manage profiles, performance, violations, tiers, earnings, and availability
- **Dispatching** — Smart-suggest and assign housemaids to bookings based on location, availability, tier, and rating
- **Payments & finance** — Track service fees, transport fees, cash remittance, company/housemaid share splits, and discrepancy detection
- **Customer management** — View customers, manage memberships, flag/ban abusive clients
- **Asenso loyalty system** — Configure and manage the points/tier progression program
- **System configuration** — Pricing engine, surge rules, transport rules, violation penalties, tier requirements

### Relationship to Housemaid App

| Aspect | Housemaid App | Admin Dashboard |
|--------|--------------|-----------------|
| **Users** | Housemaids (field workers) | Operations staff (office) |
| **Device** | Mobile (PWA) | Desktop (web app) |
| **Database** | Shared Neon PostgreSQL | Shared Neon PostgreSQL |
| **Actions** | View bookings, collect payments, upload proofs | Create bookings, assign housemaids, manage everything |
| **Repo** | `gk-housemaid-app01-dev` | `gk-admin-app01-dev` |

Both apps read and write to the **same database**. Admin actions (e.g., assigning a housemaid, creating a booking) are immediately visible in the housemaid app. Housemaid actions (e.g., uploading proof of arrival, marking payment collected) are immediately visible in the admin dashboard.

---

## 2. Admin Personas & Roles

### Initial Release: 3 Core Roles

#### Role 1: Super Admin
| Attribute | Description |
|-----------|-------------|
| **Title** | Owner / CTO / System Administrator |
| **Access** | Full access to all modules, settings, and data |
| **Key actions** | System configuration, user management, pricing engine, role assignment, all operational actions |
| **Restrictions** | None |

#### Role 2: Operations Manager / Dispatcher
| Attribute | Description |
|-----------|-------------|
| **Title** | Operations Manager / Coordinator / Dispatcher |
| **Access** | Booking management, dispatching, housemaid management, availability, customer management, reports |
| **Key actions** | Create/edit bookings, assign/reassign housemaids, manage schedules, resolve issues, view performance |
| **Restrictions** | Cannot access system settings, pricing engine configuration, or user/role management |

#### Role 3: Finance
| Attribute | Description |
|-----------|-------------|
| **Title** | Finance / Accounting Staff |
| **Access** | Payment & finance module, reports & analytics, booking payment details (read-only), housemaid earnings |
| **Key actions** | Confirm remittances, track cash collection, mark payments, export financial reports, view payroll summaries |
| **Restrictions** | Cannot create/edit bookings, assign housemaids, manage violations, or access system settings |

---

## 3. Business Goals

1. **Centralized operations** — Single control center for all booking, dispatch, payment, and workforce operations
2. **Financial accountability** — Full reconciliation of service fees, transport fees, cash remittance, and company/housemaid share splits with discrepancy detection
3. **Efficient dispatching** — Smart-suggest matching reduces dispatcher workload and improves assignment quality
4. **Workforce management** — Complete visibility into housemaid performance, violations, tier progression, and availability
5. **Customer oversight** — Manage customer profiles, memberships, and flag problematic clients
6. **Audit compliance** — Every admin action logged with who/what/when for dispute resolution and accountability
7. **Data-driven decisions** — Operational, financial, and performance reports and analytics dashboards
8. **Role-based security** — Appropriate access controls prevent unauthorized actions and data exposure

---

## 4. Technical Architecture

### Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 18 |
| **UI Library** | Shadcn/ui (Radix UI primitives) |
| **Styling** | Tailwind CSS v4 |
| **State Management** | TanStack React Query |
| **Forms** | React Hook Form + Zod |
| **Tables** | @tanstack/react-table |
| **Charts** | Recharts |
| **Backend** | Next.js API Routes (REST) |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL via Neon (serverless) — **shared with Housemaid App** |
| **Auth** | Google OAuth + JWT session |
| **File Uploads** | Uploadthing |
| **Search** | Meilisearch (planned) |
| **Email** | Resend (for admin email notifications) |
| **Deployment** | Fly.io via Docker |
| **Language** | TypeScript 5.6 (strict mode) |

### Application Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Auth pages (login, callback)
│   ├── (dashboard)/          # Dashboard layout group
│   │   ├── layout.tsx        # DashboardLayout (topbar + sidebar + footer)
│   │   ├── dashboard/        # Operations command center
│   │   ├── book-housemaid/   # Multi-step booking creation
│   │   ├── bookings/         # Booking list + detail + waive
│   │   ├── housemaids/       # Housemaid management
│   │   ├── customers/        # Customer management
│   │   ├── dispatching/      # Dispatch board
│   │   ├── finance/          # Payment & finance
│   │   ├── violations/       # Violations management
│   │   ├── reports/          # Reports & analytics
│   │   ├── booking-history/  # Booking history
│   │   └── settings/         # System settings
│   └── api/                  # API routes
├── components/
│   ├── ui/                   # Shadcn/ui + custom components
│   ├── layout/               # AppTopbar, AppSidebar, AppFooter
│   ├── dashboard/            # Dashboard-specific components
│   ├── bookings/             # Booking-specific components
│   └── ...                   # Module-specific components
├── lib/                      # Auth, utilities, database
├── hooks/                    # Custom React hooks
├── server/                   # Business logic, DB schema, services
│   ├── db/
│   │   └── schema/           # Drizzle ORM schema (shared models)
│   ├── services/             # PricingService, DispatchService, etc.
│   └── seeds/                # Reference data seeds
└── drizzle/                  # Database migrations
```

### Key Architectural Patterns

- **Shared database** — Same Neon PostgreSQL instance as the Housemaid App; same Drizzle schema definitions
- **Service layer** — `PricingService`, `DispatchService`, `FinanceService`, `ViolationService`, `AsensoService`, `AuditService`
- **RBAC middleware** — All API routes check user role permissions before processing
- **Audit logging** — `AuditService` wraps all mutation endpoints, logging before/after state
- **API route per resource** — Each endpoint in its own `route.ts` file
- **Schema-first** — Drizzle ORM schema drives all data modeling
- **JWT session cookies** — 7-day expiry, stored as HTTP-only cookie
- **Optimistic updates** — React Query mutations with optimistic UI for responsive admin experience

---

## 5. Authentication & Onboarding

### Flow

```
/login
  └── Google OAuth
        └── /auth/callback
              ├── User not in adminUsers table → "Access denied" screen
              ├── User exists, not verified → /phone-verification
              │     └── OTP sent via SMS → /otp-verification
              │           └── OTP confirmed → /dashboard
              └── Existing verified admin → /dashboard
```

### Screens

#### `/login` — Admin Login Screen
- Two-column layout: left panel with GetKlean branding, right panel with login form
- Single CTA: "Login with Google"
- Initiates Google OAuth flow
- Only users pre-registered in the `adminUsers` table can access the dashboard
- Unauthorized Google accounts see an "Access Denied" message

#### `/phone-verification` — Phone Verification (First-time only)
- Input field for mobile phone number (Philippines +63)
- OTP sent via CYN SMS API
- Validates phone number format
- Required only on first login

#### `/otp-verification` — OTP Confirmation
- 6-digit OTP input
- OTP expiry handling (5 minutes)
- Resend OTP option

### Session Management
- JWT stored in HTTP-only cookie
- 7-day session expiry
- `POST /api/auth/logout` clears session cookie
- All API routes validate session + role before responding
- Session includes: `userId`, `name`, `email`, `role`, `branch`

### Admin User Provisioning
- Admin users are **pre-created** by Super Admin via System Settings > User Management
- No self-registration — only invited users can access the dashboard
- Each admin user has: name, email, phone, role, assigned branch, active/inactive status

---

## 6. Navigation & Layout

### Design System
- Desktop-first layout (1280px+ optimized, responsive down to 1024px)
- Tailwind CSS v4 with shadcn/ui component library
- **Font**: Montserrat, Helvetica, Arial, sans-serif
- **Primary color**: `#3886C8` (blue)
- **Secondary/accent color**: `#FFEB3B` (yellow)
- Refer to `DESIGN.md` for complete token system

### Badge Color Specification

All badge colors across the app follow this centralized palette. Components: `StatusBadge`, `TypeBadge` (in `DESIGN.md` §4.6.1).

#### Service Tiers (Housemaid Tiers)

| Tier | Color | HEX | Tailwind |
|------|-------|-----|----------|
| Regular | Slate | `#334155` | `bg-slate-100 text-slate-800` |
| Plus | Blue | `#1D4ED8` | `bg-blue-50 text-blue-700` |
| All-in | Amber / Gold | `#B45309` | `bg-amber-50 text-amber-700` |

#### Booking Types

| Type | Color | HEX | Tailwind |
|------|-------|-----|----------|
| Trial | Purple | `#7E22CE` | `bg-purple-50 text-purple-700` |
| One-time | Green | `#15803D` | `bg-green-50 text-green-700` |
| Flexi | Orange | `#C2410C` | `bg-orange-50 text-orange-700` |

#### Booking Statuses (Operational Color Logic)

Statuses follow a semantic system so operations can identify urgency at a glance.

| Color | HEX | Statuses |
|-------|-----|----------|
| Yellow | `#CA8A04` | `needs_confirmation`, `pending_review`, `rescheduled` |
| Blue | `#1D4ED8` | `dispatched`, `on_the_way`, `arrived`, `in_progress` |
| Green | `#15803D` | `accepted`, `completed` |
| Red | `#DC2626` | `cancelled`, `no_show` |

### Layout Structure

```
┌────────────┬─────────────────────────────────────┐
│ AppSidebar │ AppTopbar (64px) — date, search,    │
│ (260px)    │ notifications, user                 │
│            ├─────────────────────────────────────┤
│ Logo       │ Main Content Area                   │
│            │ (scrollable, 24px padding)          │
│ Dashboard  │                                     │
│ Book HM    │                                     │
│ Bookings   │                                     │
│ Housemaids │                                     │
│ Customers  │                                     │
│ Finance    │                                     │
│ Reports    │                                     │
│ History    │                                     │
│ Settings   │                                     │
│            ├─────────────────────────────────────┤
│            │ AppFooter — copyright, links        │
└────────────┴─────────────────────────────────────┘
```

### Sidebar Navigation

- GetKlean logo (top)

| Nav Item | Icon | Route | Roles |
|----------|------|-------|-------|
| Dashboard | `LayoutDashboard` | `/dashboard` | All |
| Book a Housemaid | `CalendarPlus` | `/book-housemaid` | Super Admin, Ops |
| Bookings | `ClipboardList` | `/bookings` | All |
| Housemaids | `Users` | `/housemaids` | Super Admin, Ops |
| Customers | `UserCircle` | `/customers` | Super Admin, Ops |
| Finance | `Wallet` | `/finance` | Super Admin, Finance |
| Reports | `BarChart3` | `/reports` | All |
| Booking History | `History` | `/booking-history` | All |
| Settings | `Settings` | `/settings` | Super Admin only |

### Topbar
- Today's date (left)
- Search bar (center)
- Notification bell with unread count badge (right)
- User dropdown: avatar initials, name, branch, role — with "My profile" and "Log out" actions

---

## 7. Feature Specifications

---

### 7.1 Dashboard (Operations Command Center)

**Route**: `/dashboard`
**API**: `GET /api/dashboard`
**Access**: All roles

#### Purpose
Live operations board providing a real-time snapshot of today's operational status. This is the first screen every admin sees upon login.

#### KPI Stat Cards (Top Row)

| KPI | Description | Card color accent |
|-----|-------------|-------------------|
| **Today's Bookings** | Total bookings scheduled for today | Yellow bar (secondary) |
| **Unassigned Bookings** | Bookings without a housemaid assigned | Yellow bar |
| **Ongoing Services** | Bookings currently in "Ongoing" status | Yellow bar |
| **Payments Pending** | Bookings where payment has not been collected | Yellow bar |
| **Revenue Today** | Total revenue from completed bookings today (PHP) | Yellow bar |
| **Active Housemaids** | Housemaids currently on duty today | Yellow bar |

#### Alert Panels (Below KPIs)

| Alert | Trigger | Severity |
|-------|---------|----------|
| **Late Arrivals** | Housemaid has not uploaded proof of arrival within 30 min of booking time | Warning |
| **Payment Discrepancies** | Amount collected does not match expected amount | Destructive |
| **Cancelled Bookings** | Bookings cancelled today | Info |
| **Violations Today** | New violations recorded today | Warning |

#### Recent Activity Feed
- Last 20 booking status changes across all bookings
- Each item: timestamp, booking code, action, actor (housemaid name or admin name)

#### Quick Actions
- "Book a Housemaid" button → `/book-housemaid`
- "View Unassigned" link → `/bookings?status=pending_review`

#### Behavior
- Data refreshes every 30 seconds (React Query polling)
- KPI cards use `KPIStatCard` component from design system
- Alert items are clickable, navigating to the relevant booking or housemaid

---

### 7.2 Booking Management

**Route**: `/bookings`
**API**: `GET /api/bookings?status=...&date=...&search=...&assignee=...&area=...`
**Access**: All roles (Finance: read-only on payment tabs)

#### Purpose
Full list of all bookings with advanced filtering, search, and bulk actions.

#### Filter Bar

| Filter | Type | Options |
|--------|------|---------|
| **Status** | Multi-select (Popover + Checkbox) | All, Pending Review, Accepted, Dispatched, Arrived, Ongoing, Completed, Cancelled, Rescheduled |
| **Date Range** | Date picker (range) | Start date, End date |
| **Assigned Housemaid** | Searchable select | All housemaids |
| **Service Area** | Select | NCR, Cavite, Cebu |
| **Booking Type** | Select | Trial, One-time, Flexi |
| **Payment Status** | Multi-select | Pending, For Billing, Awaiting Payment, Payment Received, Failed, Overdue |
| **Search** | Text input | Booking code, customer name, address keyword |

#### Bookings DataTable

Columns:

| Column | Description |
|--------|-------------|
| **Booking Code** | `HM26-00123` format, clickable → detail page |
| **Client Name** | Customer full name |
| **Address** | Barangay / City |
| **Service Type** | Regular, Plus, All-in (badge) |
| **Booking Type** | Trial, One-time, Flexi |
| **Booking Date** | Service date and time |
| **Housemaid** | Assigned housemaid name or "Unassigned" |
| **Status** | `StatusBadge` component |
| **Payment** | Payment status indicator |
| **Actions** | Edit icon button → detail page |

#### Table Features
- Sortable columns (date, status, code)
- Pagination (20 rows per page, `Pagination` component)
- Empty state when no bookings match filters
- Row click navigates to `/bookings/[code]`

---

### 7.3 Booking Detail

**Route**: `/bookings/[code]`
**API**: `GET /api/bookings/[code]`
**Access**: All roles

#### Purpose
Full detail view for a single booking. The admin's primary workspace for managing a booking through its lifecycle.

#### Header
- Back button → `/bookings`
- Booking code + `StatusBadge`
- Action buttons (context-sensitive based on status and role):
  - "Cancel Booking" (destructive-outlined)
  - "Reschedule" (outlined)
  - "Edit" (outlined)

#### Tabs (Underline Style)

##### Tab 1: Booking Summary
- Booking code, status, sub-status
- Service date, time, duration
- Service tier (Regular / Plus / All-in) with badge
- Booking type (Trial / One-time / Flexi)
- Pricing breakdown (`DetailSection`):
  - Base price
  - Surge amount
  - Adjustments (discounts, surcharges)
  - **Total price**
- Rescheduled count (if any)
- Assignment attempt count
- Internal admin notes (editable textarea)

##### Tab 2: Client Information
- Customer name
- Contact number (click-to-call)
- Email address
- Full address with landmark
- Google Maps link (if coordinates available)
- Customer rating (average from all bookings)
- Membership status (Flexi customers)
- Customer flag status (if flagged/banned)

##### Tab 3: Assigned Housemaid
- Housemaid code and name
- Contact number
- Current tier badge
- Average rating (`StarRating` component)
- Total completed bookings
- **Assign / Reassign button** → opens Dispatch modal
- Proof of arrival image (if uploaded) with timestamp
- Arrival validation status

##### Tab 4: Payment
- Payment status badge
- Service fee amount
- Transport fee amount (if applicable)
- **Total amount due**
- Payment method (GCash, Card, Maya, Cash)
- Payment source (Customer or Company)
- Settlement type (Paid to GK, Direct to Housemaid, Pending)
- Company share amount
- Housemaid share amount
- Receipt number (if collected)
- Validation status
- **Admin actions**:
  - "Mark as Paid" button
  - "Override Amount" button
  - "Apply Discount" button
  - "Apply Surcharge" button

##### Tab 5: Transport
- Transport status
- Total transport cost
- Transport legs table:
  - Mode (Jeep, Tricycle, Bus, etc.)
  - Origin → Destination
  - Fare amount
- Transport payment status
- Admin can manually add/edit transport details

#### Activity Log Panel
- Expandable panel at bottom of booking detail
- Chronological list of all status changes and actions
- Each entry: timestamp, actor (admin name or housemaid name), action description, old value → new value
- **API**: `GET /api/bookings/[code]/activity-log`

#### Booking Status Transitions (Admin Actions)

| Current Status | Admin Can → | Notes |
|---------------|-------------|-------|
| Pending Review | Accept, Cancel, Assign Housemaid | New booking awaiting review |
| Accepted | Dispatch, Cancel, Reassign, Reschedule | Housemaid confirmed |
| Dispatched | Mark Arrived (override), Cancel, Reassign | Housemaid en route |
| Arrived | Start Service (override), Cancel | Housemaid at location |
| Ongoing | Complete (override), Cancel | Service in progress |
| Completed | N/A (terminal) | Can still manage payment |
| Cancelled | Reactivate (Super Admin only) | Terminal state |
| Rescheduled | Accept, Cancel | Treated as new pending |

---

### 7.4 Book a Housemaid (Multi-Step Booking Creation)

**Route**: `/book-housemaid`
**API**: `POST /api/bookings`
**Access**: Super Admin, Ops

#### Purpose
Multi-step wizard form for creating a new booking from the admin side.

#### Steps (StepProgressBar)

##### Step 1: Start
- Terms of Use acceptance
- Confirmation that policies, fees, and cancellation terms have been explained to and accepted by the customer

##### Step 2: Client Information
- Search existing customer (by name or phone) OR create new
- Customer name, phone, email
- Select address from customer's saved addresses OR add new
- Address: street, barangay, city, province, landmark
- **Location & Details Map Overlay**:
  - Interactive Google Maps preview box for visual location pinning
  - "Use current location" GPS button to autofill current coordinates

##### Step 3: Service Details
- Select booking type: Trial, One-time, Flexi
- Select service area: NCR, Cavite, Cebu
- If Flexi: validate customer has active membership
- Service duration: Whole Day (8h), Half Day AM (4h), Half Day PM (4h) (RadioGroup)
- Service date (date picker)
- Service time (time picker)
- Service checklist (Checkbox grid, 2-column):
  - Housekeeping
  - Laundry
  - Childcare
  - Pet care 
  - Ironing
  - Other (text input)
- Pricing auto-calculated via `PricingService`

##### Step 4: Assign Housemaid
- **Smart-suggest panel**: System recommends top matched housemaids based on the **6-Step Booking Matching Framework** (see Section 7.5 Dispatching).
- Each suggestion card shows: name, code, tier badge, rating, distance estimate, and Performance Score.
- Admin selects one OR searches full housemaid list
- Conflict detection: warns if housemaid already has a booking at overlapping time
##### Step 5: Summary & Confirm
- Full booking summary review
- Pricing breakdown
- Client info recap
- Assigned housemaid (mandatory)
- Payment details:
  - Payment recipient (RadioGroup): Cash to Housemaid / Direct to GetKlean
  - Discount code input + "Apply discount" button
- Pricing breakdown (Service fee, Total amount due)
- "Confirm Booking" button → creates booking
- Success dialog with booking code → option to "View Booking" or "Create Another"

---

### 7.5 Dispatching System

**Route**: `/dispatching`
**API**: `GET /api/dispatching/unassigned`, `POST /api/dispatching/assign`
**Access**: Super Admin, Ops

#### Purpose
Dedicated dispatch board for assigning and reassigning housemaids to bookings efficiently.

#### Layout: Split Panel

**Left Panel — Unassigned Bookings**
- List of bookings with status `pending_review` or `accepted` without a housemaid
- Each card shows: booking code, date/time, area, service tier, client name
- Sorted by urgency (earliest date first)
- Click to select a booking

**Right Panel — Available Housemaids**
- Filtered list of housemaids based on selected booking's criteria
- Smart-suggest ranking (top matches first)
- Each row: name, code, tier, rating, today's booking count, availability status
- "Assign" button per housemaid

#### Smart-Suggest Booking Matching Framework
Booking assignment is determined through a 6-step pipeline to ensure the most suitable housemaid receives the booking:

1. **City Filter**: Filters housemaids where HM City = Booking City. Expands to nearby City Hierarchy if empty.
2. **Availability Filter**: Excludes those marked unavailable, suspended, on another booking, or declined the request.
3. **Tier Eligibility**: Client booking tier strictly filters eligible housemaids (Regular, Plus, All-In). System may allow downgrading the booking if none available.
4. **Certificate Relevance**: Task types (e.g., Pet Care) are mapped to Certification groups. Housemaids holding relevant certificates get priority ranking. Mandatory for Plus/All-In, acts as a priority boost for Regular.
5. **Performance Score Ranking**: Ranks housemaids using a 0-100 Performance Score.
   - **Rating Component (50%)**: `(Rating / 5) * 50`. Minimum of 5 bookings required to overcome a default 4.5 rating.
   - **Completion Component (30%)**: `(Completed / Accepted) * 30`.
   - **Violation Component (20%)**: Starts at 20 points, substracts points based on cumulative violation history.
6. **Fairness Rotation (Booking Load Balancing)**: If ranking scores tie, priority goes to the housemaid with fewer completed bookings in the last 7 days.

#### Conflict Detection
Before assignment, system checks:
- Housemaid already has a booking at overlapping time → **Block with warning**
- Housemaid marked unavailable on that date → **Block**
- Housemaid is suspended → **Block**
- Housemaid has reached daily booking limit → **Warn** (soft block)

#### Emergency Reassignment
- Admin can reassign a housemaid from an `accepted` or `dispatched` booking
- Original housemaid is notified (in-app notification in housemaid app)
- Reason for reassignment is required and logged

---

### 7.6 Housemaid Management

**Route**: `/housemaids`
**API**: `GET /api/housemaids`, `GET /api/housemaids/[code]`
**Access**: Super Admin, Ops

#### Housemaid List

| Column | Description |
|--------|-------------|
| **Code** | `HMAID26-00001` format |
| **Name** | Full name |
| **Branch / Area** | Assigned service area(s) |
| **Tier** | Current Service Tier (HM Regular, HM Plus, HM All-In) |
| **Rating** | Average star rating |
| **Status** | Active, Inactive, Suspended |
| **Completed Jobs** | Total lifetime completed bookings |
| **Actions** | View detail, Suspend, Deactivate |

#### Filters
- Status (Active, Inactive, Suspended)
- Service Tier (Regular, Plus, All-In)
- Area (NCR, Cavite, Cebu)
- Search (name, code)

#### Housemaid Detail (`/housemaids/[code]`)

##### Profile Tab
- Personal info: name, phone, email, date of birth, civil status
- Employment: date started, employment status, assigned areas
- Profile photo
- **GCash Information Section**:
  - GCash number
  - GCash QR Code image (view/preview)
- **Admin actions**: Edit profile, Update Service Tier, Reset login access, Activate/Deactivate, Suspend

##### Performance Tab
- **Performance Score (0-100)**: Overall ranking score determining dispatch priority
  - Breakdown: Rating Component (50%), Completion Component (30%), Violation Component (20%)
- Average rating with `StarRating`
- Completion rate (%)
- Total completed jobs
- Total cancelled/no-show
- Minor & Major violations count (affecting Violation Component)
- Performance trend chart (monthly)

##### Violations Tab
- List of all violations
- Each: date, type (minor/major), description, booking reference, points deducted, sanction
- **Admin action**: "Record Violation" button → opens violation creation form

##### Earnings Tab
- Earnings summary (weekly/monthly toggle)
- Service earnings total
- Transport reimbursements total
- Asenso points earned
- Earnings history list (per-booking breakdown)

##### Asenso Tab
- Current points balance
- Points transaction history (earn, deduct, adjust)
- **Admin actions**: "Adjust Points" (add/deduct with reason)

##### Certifications Tab
- List of completed training certifications by skill category (Housekeeping, Laundry, Childcare, Pet care, Ironing)
- Current Training Level per skill (Entry, Basic, Advanced, Expert)
- **Admin action**: "Add / Validate Certification" button → opens form to record training completion and updates Training Level for that skill

##### Availability Tab
- Monthly calendar view
- Color-coded days: Available, Blocked, Booked, Absent
- Admin can override availability (block/unblock days)
- Shows bookings on each day

---

### 7.7 Customer Management

**Route**: `/customers`
**API**: `GET /api/customers`, `GET /api/customers/[id]`
**Access**: Super Admin, Ops

#### Purpose
View and manage customer profiles, addresses, memberships, and flags.

#### Customer List

| Column | Description |
|--------|-------------|
| **Name** | Customer full name |
| **Phone** | Contact number |
| **Email** | Email address |
| **Area** | Primary service area (from `primarySegmentCode`) |
| **Bookings** | Total booking count |
| **Membership** | Flexi membership status (Active/Expired/None) |
| **Status** | `StatusBadge`: Active, Flagged, Banned |
| **Actions** | View detail |

#### Customer Detail (`/customers/[code]`)

##### Tab 1: Profile
- Personal info: name, phone, email
- Customer since date (`createdAt`)
- Account status badge (Active / Flagged / Banned)
- If Flagged: flag reason displayed
- If Banned: ban reason displayed
- **Admin actions**:
  - "Edit Profile" — edit name, phone, email
  - "Flag Customer" — requires reason input (sets status → FLAGGED, saves `flagReason`)
  - "Ban Customer" — requires reason input (sets status → BANNED, saves `banReason`)
  - "Unflag / Unban" — resets status to ACTIVE, clears reason (shown when currently Flagged/Banned)

##### Tab 2: Addresses
- List of all saved addresses for this customer (from `customerAddresses` joined with `addresses`)
- Each address card shows:
  - Label (e.g. "Home", "Office") — from `customerAddresses.label`
  - Primary badge — for the address where `customerAddresses.isPrimary = true`
  - Full address line (`addressLine`)
  - Landmark (`landmark`)
  - Google Maps link (`addressLink`) — clickable, opens in new tab
  - Coordinates if available (`latitude` / `longitude`)
- **Admin actions**:
  - "Add Address" button → form: unit, building, street, city, landmark, GPS pin / map preview
  - Edit (pencil icon per address) → opens pre-filled address form
  - Delete (trash icon per address) → confirmation dialog; blocked if address is in use by an active booking
  - "Set as Primary" button (shown on non-primary addresses) → marks as `isPrimary = true`, removes flag from previous primary

##### Tab 3: Bookings
- All bookings for this customer
- DataTable with same columns as Bookings list
- Filter by status, date

##### Tab 4: Membership
- Current membership details (if Flexi)
- Membership type, start date, end date, status
- Location and tier scope
- **Admin actions**: Activate/deactivate membership

##### Tab 5: Ratings
- Ratings given TO this customer by housemaids
- Average rating, individual booking ratings

---

### 7.8 Payment & Finance Module

**Route**: `/finance`
**API**: `GET /api/finance/summary`, `GET /api/finance/transactions`
**Access**: Super Admin, Finance

#### Purpose
Full financial reconciliation: track all money flows between customers, housemaids, and GetKlean.

#### Finance Dashboard (Summary Cards)

| Card | Description |
|------|-------------|
| **Total Revenue (Today)** | Sum of all payment received today |
| **Pending Collections** | Total outstanding amount from unpaid bookings |
| **Housemaid Payouts (This Week)** | Total amount owed to housemaids |
| **Company Share (This Week)** | GetKlean's revenue share |
| **Discrepancies** | Count of bookings with payment amount mismatches |

#### Transaction List

| Column | Description |
|--------|-------------|
| **Booking Code** | Reference booking |
| **Client** | Customer name |
| **Housemaid** | Assigned housemaid |
| **Service Fee** | Service amount |
| **Transport Fee** | Transport amount |
| **Total** | Combined total |
| **Paid to GK** | Amount received by GetKlean |
| **HM Share** | Housemaid's share |
| **Status** | Payment status badge |
| **Settlement** | Settlement type |

#### Filters
- Date range
- Payment status
- Settlement type
- Housemaid
- Area

#### Admin Actions
- **Mark as Paid** — Manually mark a booking payment as received (with receipt number)
- **Confirm Remittance** — Confirm housemaid has remitted cash to company
- **Flag Discrepancy** — Mark a payment as having a discrepancy (amount mismatch, missing receipt)
- **Export Report** — Download CSV/Excel of filtered transactions

#### Daily Cash Remittance Tracking
- Per-housemaid view: expected remittance vs actual
- Outstanding balances per housemaid
- Remittance confirmation with timestamp and admin who confirmed

#### Revenue Dashboard
- Revenue by day/week/month (bar chart)
- Revenue by area (pie/donut chart)
- Revenue by service tier (stacked bar)
- Company share vs housemaid share trend

---

### 7.9 Violations & Performance Management

**Route**: `/violations` (accessed from Housemaid Detail, but also standalone)
**API**: `POST /api/violations`, `GET /api/violations`
**Access**: Super Admin, Ops

#### Purpose
Record, categorize, and manage housemaid violations with automatic points deduction and sanctions.

#### Create Violation Form

| Field | Type | Description |
|-------|------|-------------|
| **Housemaid** | Searchable select | Select housemaid |
| **Booking** | Searchable select | Related booking (optional) |
| **Violation Type** | Select | From `violationTypes` lookup |
| **Severity** | Auto-filled | Minor or Major (from violation type) |
| **Description** | Textarea | Detailed description of violation |
| **Evidence** | File upload | Photo/document upload (optional) |
| **Points Deduction** | Auto-filled | From violation type config, admin can override |
| **Sanction** | Auto-filled | Warning / Suspension / Termination (from config) |
| **Notes** | Textarea | Internal admin notes |

#### On Submission
1. Creates violation record in `housemaidViolations`
2. Deducts Asenso points via `AsensoService`
3. Creates `asensoTransactions` deduction entry
4. Updates housemaid performance metrics
5. If sanction = Suspension: automatically suspends housemaid
6. Logs action in audit trail

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

---

### 7.10 Asenso Points & Certification System

**Route**: `/settings/asenso` (configuration), displayed on Housemaid Detail
**API**: `GET /api/asenso/config`, `PUT /api/asenso/config`
**Access**: Super Admin (config), Ops (view)

#### Points Configuration
Asenso points serve strictly as currency to enroll in Training/Certification programs. They DO NOT determine a housemaid's service tier automatically. Points accumulate continuously and never reset.

| Action | Regular | Plus | All-in |
|--------|:---:|:---:|:---:|
| Trial booking | 150 pts | 300 pts | 600 pts |
| One-time booking | 150 pts | 300 pts | 600 pts |
| Repeat booking | 150 pts | 300 pts | 300 pts |
| Subscription / Flexi | 300 pts | 600 pts | 900 pts |
| Marked available (no booking)| 100 pts | - | - |

#### Training Progression (Certifications)

Housemaids progress through training levels per specific skill (e.g., Housekeeping, Laundry).

| Certification Level | Description |
|-------------------|-------------|
| Entry | Introductory to SOP, Task sequence, Communication |
| Basic | SOP Mastery, Time efficiency, Appliance handling |
| Advanced | Specialized skills, Complex Services |
| Expert | Premium Handling, high-end service |

**Vertical progression** within a skill requires completing the previous level first (Entry → Basic → Advanced → Expert).
**Lateral progression** means starting a new skill at the Entry level.

#### Certification to Service Tier Mapping

Housemaid Service Tiers define customer pricing and housemaid flat-rate earnings. Tier upgrades are **manual admin actions** based on the highest certification achieved.

| Highest Certification Achieved | Eligible Housemaid Service Tier |
|--------------------------------|---------------------------------|
| Entry & Basic | Regular (Default starting tier) |
| Advanced | Plus |
| Expert | All-In |

#### Admin Actions
- **Adjust points manually** — Add or deduct with reason (logged)
- **Record Certification** — Log a housemaid's completion of a training module
- **Update Service Tier** — Manually update the housemaid's service tier upon verifying certification (logged)
- **Configure rules** — Edit certification requirements and point awards

---

### 7.11 Availability & Scheduling

**Route**: `/housemaids/[code]` (Availability tab), also accessible from dispatching
**API**: `GET /api/availability?housemaidId=...&month=...&year=...`, `PUT /api/availability`
**Access**: Super Admin, Ops

#### Purpose
View and manage housemaid availability at an individual and fleet-wide level.

#### Individual Availability (Housemaid Detail > Availability Tab)
- Monthly calendar view
- Days color-coded: Available (green), Blocked (red), Booked (blue), Absent (gray)
- Admin can override: block/unblock days, force availability
- View bookings scheduled on each day

#### Fleet-Wide Scheduling View
- **Route**: `/dispatching` (secondary view)
- Calendar view showing all housemaids' availability for a selected date
- Detect understaffed days (more bookings than available housemaids in an area)
- Highlight conflicts and overbookings

---

### 7.12 Booking History

**Route**: `/booking-history`
**API**: `GET /api/booking-history`
**Access**: All roles

#### Purpose
Searchable archive of completed, cancelled, and rescheduled bookings. Separate from active bookings for performance.

#### Filters
- Date range (required, default: last 30 days)
- Status: Completed, Cancelled, Rescheduled
- Housemaid
- Customer
- Area

#### DataTable
- Same columns as Bookings list
- Export to CSV button

---

### 7.13 Reports & Analytics

**Route**: `/reports`
**API**: `GET /api/reports/operational`, `GET /api/reports/financial`, `GET /api/reports/performance`
**Access**: All roles (Finance: financial reports only)

#### Operational Reports
- Bookings per day/week/month (bar chart — primary `#3886C8`)
- Completion rate trend (line chart)
- Cancellation rate trend (line chart — destructive `#D32F2F`)
- Reschedule count (bar)
- Average bookings per housemaid (utilization rate)
- Bookings by area (donut chart)
- Bookings by type (stacked bar)

#### Financial Reports
- Revenue trend (bar chart — primary `#3886C8` + secondary `#FFEB3B`)
- Revenue by area (pie chart)
- Company share vs housemaid share (stacked bar)
- Outstanding payments aging (bar)
- Average booking value trend (line)

#### Performance Reports
- Rating leaderboard (top 10 housemaids by avg rating)
- Violation frequency (bar chart by type)
- Tier distribution (donut chart)
- Completion rate leaderboard
- Points leaderboard

#### Report Features
- Date range selector (default: current month)
- Area filter
- Export to PDF / CSV
- Charts use Recharts library

---

### 7.14 Notifications & Alerts

**API**: `GET /api/notifications`, `PUT /api/notifications/[id]/read`
**Access**: All roles (role-filtered)

#### In-App Notifications (Bell Icon in Topbar)
- Notification bell with unread count badge
- Dropdown panel showing recent notifications
- Each notification: icon, message, timestamp, read/unread status
- "Mark as read" and "Dismiss" actions (via `DropdownMenu`)

#### Notification Types

| Type | Trigger | Roles Notified | Severity |
|------|---------|---------------|----------|
| **Late Arrival** | Housemaid hasn't arrived 30 min past booking time | Ops | Warning |
| **Unpaid Booking** | Booking completed but payment not collected after 24h | Ops, Finance | Warning |
| **Cancelled Booking** | Booking cancelled (by housemaid or system) | Ops | Info |
| **Reassignment Needed** | Housemaid became unavailable for assigned booking | Ops | Destructive |
| **Payment Discrepancy** | Amount mismatch detected | Finance | Destructive |
| **New Violation** | Violation recorded | Ops | Warning |
| **Low Housemaid Availability** | Fewer than N housemaids available for upcoming date in area | Ops | Warning |

#### Email Notifications
- Same notification types sent via email (Resend API)
- Admin can configure email preferences in profile settings
- Critical alerts (payment discrepancies, late arrivals) always sent
- Informational alerts (new bookings, completions) configurable per admin

---

### 7.15 System Settings

**Route**: `/settings`
**API**: Various `GET/PUT /api/settings/*`
**Access**: Super Admin only

#### User Management
- Create/edit/deactivate admin users
- Assign roles
- Assign branches
- Reset login access

#### Pricing Configuration
- View and edit `serviceSkus` (Trial/One-time pricing by location/tier/duration)
- View and edit `flexiRateCards` (Flexi pricing)
- Configure surge rules (weekend/holiday surcharge percentage)
- Configure discount presets

#### Transport Rules
- Transport modes configuration
- Default fare ranges per mode
- Transport reimbursement rules

#### Asenso Configuration
- Points per booking type
- Tier requirements (points, rating, completion rate, violation limits)
- Violation penalties (points deducted per type)

#### Service Configuration
- Service types and categories
- Service areas (locations)
- Booking types

#### System Health
- Database connection status
- Last seed data sync
- API health checks

---

## 8. Audit Logging

### Mandatory Audit Trail

Every admin mutation (create, update, delete) is logged to the `adminAuditLog` table.

#### Audit Log Record

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique log entry ID |
| `adminUserId` | FK → adminUsers | Who performed the action |
| `adminName` | String | Admin name (denormalized for display) |
| `action` | Enum | CREATE, UPDATE, DELETE, ASSIGN, OVERRIDE, SUSPEND, etc. |
| `resource` | String | booking, housemaid, payment, violation, asenso, settings |
| `resourceId` | String | ID of the affected record |
| `oldValue` | JSONB | Previous state (for updates) |
| `newValue` | JSONB | New state |
| `reason` | String | Optional reason/note provided by admin |
| `ipAddress` | String | Admin's IP address |
| `createdAt` | Timestamp | When the action occurred |

#### Audit-Logged Actions

| Module | Actions Logged |
|--------|---------------|
| **Bookings** | Create, update status, assign, reassign, cancel, reschedule, override price, mark paid |
| **Housemaids** | Activate, deactivate, suspend, edit profile, adjust points, override tier, reset access |
| **Payments** | Mark paid, confirm remittance, flag discrepancy, override amount |
| **Violations** | Create, edit, delete violation |
| **Asenso** | Adjust points, override tier, change config |
| **Settings** | Any configuration change |
| **Customers** | Flag, ban, edit profile, manage membership |

#### Viewing Audit Logs
- Accessible from booking detail (activity log tab)
- Accessible from housemaid detail (actions tab)
- Super Admin: full audit log viewer at `/settings/audit-log`

---

## 9. Role-Based Access Control (RBAC)

### Permission Matrix

| Module / Action | Super Admin | Ops Manager | Finance |
|----------------|:-----------:|:-----------:|:-------:|
| **Dashboard** — View | Yes | Yes | Yes |
| **Book Housemaid** — Create | Yes | Yes | No |
| **Bookings** — View all | Yes | Yes | Yes (read-only) |
| **Bookings** — Edit/Cancel/Reschedule | Yes | Yes | No |
| **Bookings** — Assign/Reassign | Yes | Yes | No |
| **Bookings** — Override pricing | Yes | Yes | No |
| **Bookings** — Mark payment | Yes | Yes | Yes |
| **Dispatching** — Access | Yes | Yes | No |
| **Housemaids** — View all | Yes | Yes | No |
| **Housemaids** — Edit profile | Yes | Yes | No |
| **Housemaids** — Suspend/Deactivate | Yes | Yes | No |
| **Housemaids** — Adjust points/tier | Yes | Yes | No |
| **Housemaids** — Record violation | Yes | Yes | No |
| **Customers** — View all | Yes | Yes | No |
| **Customers** — Flag/Ban | Yes | Yes | No |
| **Customers** — Manage membership | Yes | Yes | No |
| **Finance** — View dashboard | Yes | No | Yes |
| **Finance** — Confirm remittance | Yes | No | Yes |
| **Finance** — Export reports | Yes | No | Yes |
| **Finance** — Flag discrepancy | Yes | No | Yes |
| **Reports** — Operational | Yes | Yes | No |
| **Reports** — Financial | Yes | No | Yes |
| **Reports** — Performance | Yes | Yes | No |
| **Booking History** — View | Yes | Yes | Yes |
| **Settings** — All | Yes | No | No |
| **User Management** | Yes | No | No |

### RBAC Implementation
- Role stored in `adminUsers.role` column
- JWT session includes role
- API middleware validates role permission before processing
- Sidebar navigation items are role-filtered (hidden if no access)
- Action buttons are role-filtered (hidden or disabled if no permission)

---

## 10. Pricing Engine (Admin)

**Service**: `PricingService` (shared with Housemaid App)
**API**: `GET /api/pricing/calculate`, `PUT /api/pricing/skus`, `PUT /api/pricing/flexi-rates`

### Admin Pricing Capabilities

| Action | Description | Access |
|--------|-------------|--------|
| **Calculate price** | Real-time price calculation during booking creation | Ops, Super Admin |
| **Override price** | Manually set a different price for a booking (with reason) | Ops, Super Admin |
| **Apply discount** | Flat (PHP) or percentage discount | Ops, Super Admin |
| **Apply surcharge** | Additional charge (with reason) | Ops, Super Admin |
| **Edit SKU pricing** | Update base prices for location/tier/duration combos | Super Admin |
| **Edit Flexi rates** | Update Flexi rate cards | Super Admin |
| **Configure surge** | Set weekend/holiday surge percentage (Default: +10% of base HM rate) | Super Admin |

### Pricing Dimensions (Same as Housemaid App)

| Dimension | Options |
|-----------|---------|
| **Location** | NCR, CAVITE, CEBU |
| **Service Tier** | REGULAR, PLUS, ALL_IN |
| **Booking Type** | TRIAL, ONE_TIME, FLEXI |
| **Duration** | WHOLE_DAY, HALF_DAY_AM, HALF_DAY_PM |
| **Day Type** | WEEKDAY, WEEKEND_HOLIDAY |

### Revenue Model (Flat Rate)
The platform uses a **Flat Rate Model**, not a revenue split.
- Housemaids earn a fixed flat rate per booking based on their Service Tier.
- Platform revenue is the difference between the final customer price and the housemaid's flat rate.
- **Surge Rate**: Applies on weekends, regular holidays, and special holidays. Formula: `+10% of base HM rate (per tier)`.

### HM Flat Rate Pricing Matrices

#### NCR
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 650 | +65 | 715 |
| Whole Day| Plus | 740 | +74 | 814 |
| Whole Day| All-In | 1000 | +100 | 1100 |
| Half Day | Regular | 510 | +51 | 561 |
| Half Day | Plus | 600 | +60 | 660 |
| Half Day | All-In | 750 | +75 | 825 |
*(Customer One-Time Pricing: Whole Day = 1390, Half Day = 1090. Trial Booking: Whole Day = 650, Half Day = 510; no surge applies to Trial).*

#### CEBU
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 540 | +54 | 594 |
| Whole Day| Plus | 630 | +63 | 693 |
| Whole Day| All-In | 890 | +89 | 979 |
| Half Day | Regular | 420 | +42 | 462 |
| Half Day | Plus | 510 | +51 | 561 |
| Half Day | All-In | 660 | +66 | 726 |

#### CAVITE
| Duration | Tier | HM Rate | Surge Add | Surge Total |
|----------|------|---------|-----------|-------------|
| Whole Day| Regular | 600 | +60 | 660 |
| Whole Day| Plus | 690 | +69 | 759 |
| Whole Day| All-In | 950 | +95 | 1045 |
| Half Day | Regular | 460 | +46 | 506 |
| Half Day | Plus | 550 | +55 | 605 |
| Half Day | All-In | 700 | +70 | 770 |

### Pricing Output (Stored as JSONB on booking)
```json
{
  "basePrice": 850,
  "surgeAmount": 85,
  "adjustments": [
    { "type": "discount", "label": "First-time customer", "amount": -100 },
    { "type": "surcharge", "label": "Extra room", "amount": 200 }
  ],
  "currency": "PHP",
  "finalPrice": 1035,
  "overrideBy": "admin:ADMIN26-00001",
  "overrideReason": "Loyal customer discount"
}
```

---

## 11. Data Models Summary

### Shared Tables (Same Database as Housemaid App)

All tables from the Housemaid App PRD are shared. The admin dashboard reads and writes to the same tables.

#### Core Domain Tables (Shared)

| Table | Purpose | Admin Access |
|-------|---------|-------------|
| `housemaids` | Housemaid profile | Read/Write |
| `bookings` | Main booking record | Read/Write |
| `bookingPayments` | Payment details per booking | Read/Write |
| `bookingActivityLog` | Audit trail for booking events | Read/Write |
| `bookingRatings` | Ratings submitted | Read |
| `customerProfiles` | Customer master data — includes `email`, `status` (ACTIVE/FLAGGED/BANNED), `flagReason`, `banReason` | Read/Write |
| `customerAddresses` | Customer ↔ address junction — `label` (Home/Office/etc.), `isPrimary` flag; one customer can have many labeled addresses | Read/Write |
| `addresses` | Address master — `addressLine`, `landmark`, `addressLink` (Google Maps URL), `latitude`, `longitude`, `segmentCode` | Read/Write |
| `housemaidAvailability` | Daily availability calendar | Read/Write |
| `housemaidEarnings` | Per-booking earnings | Read |
| `housemaidPerformance` | Aggregated stats, including `performanceScore` | Read/Write |
| `housemaidViolations` | Violation records | Read/Write |
| `housemaidRatings` | Ratings from customers | Read |
| `asensoTransactions` | Points ledger | Read/Write |
| `asensoPointsConfig` | Points config per booking type | Read/Write |
| `housemaidCertifications` | Training and certification records | Read/Write |
| `serviceSkus` | Trial/One-time pricing | Read/Write |
| `flexiRateCards` | Flexi rate pricing | Read/Write |
| `memberships` | Customer memberships | Read/Write |
| `membershipSkus` | Membership product definitions | Read/Write |
| `transportationDetails` | Transport per booking | Read/Write |
| `transportationLegs` | Multi-leg route details | Read/Write |

#### Admin-Only Tables (New)

| Table | Purpose |
|-------|---------|
| `adminUsers` | Admin user profiles (name, email, phone, role, branch, status) |
| `adminAuditLog` | Complete audit trail of all admin actions |
| `adminNotifications` | In-app notifications for admin users |
| `adminEmailPreferences` | Email notification preferences per admin |
| `dispatchSuggestions` | Cached dispatch suggestions for logging/analytics |

### Key Lookup Tables (Shared)

| Table | Values |
|-------|--------|
| `status` | pending_review, accepted, dispatched, arrived, ongoing, completed, cancelled, rescheduled |
| `substatus` | Detailed sub-states per main status |
| `paymentStatus` | PENDING, FOR_BILLING, AWAITING_PAYMENT, PAYMENT_RECEIVED, FAILED, OVERDUE |
| `paymentMethod` | GCASH, CARD, MAYA, CASH |
| `settlementType` | PAID_TO_GK, DIRECT_HOUSEMAID, PENDING |
| `serviceTiers` | REGULAR, PLUS, ALL_IN |
| `trainingLevels` | ENTRY, BASIC, ADVANCED, EXPERT |
| `violationTypes` | MAJOR_THEFT, MINOR_LATE_ARRIVAL, etc. |
| `serviceType` | House Cleaning categories |
| `adminRoles` | SUPER_ADMIN, OPS_MANAGER, FINANCE |

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

**Important**: These prefixes are the **canonical standard** shared with the Housemaid App. All code that generates entity codes must use these exact prefixes. Do not introduce alternative prefixes (e.g., do not use `BK` for bookings — use `HM`).

---

## 12. API Endpoints Reference

All endpoints require a valid JWT session cookie with admin role. Return 401 if session is invalid, 403 if role insufficient.

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/google/callback` | Google OAuth token exchange |
| `POST` | `/api/auth/verify-phone` | Send OTP to phone number |
| `POST` | `/api/auth/verify-otp` | Confirm OTP code |
| `POST` | `/api/auth/logout` | Terminate session |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard` | Dashboard KPIs, alerts, recent activity |

### Bookings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/bookings` | List bookings (query: status, date, search, area, assignee) |
| `POST` | `/api/bookings` | Create new booking |
| `GET` | `/api/bookings/[code]` | Single booking detail |
| `PUT` | `/api/bookings/[code]` | Update booking (edit, status change) |
| `POST` | `/api/bookings/[code]/cancel` | Cancel booking (with reason) |
| `POST` | `/api/bookings/[code]/reschedule` | Reschedule booking |
| `POST` | `/api/bookings/[code]/assign` | Assign housemaid |
| `POST` | `/api/bookings/[code]/reassign` | Reassign housemaid |
| `PUT` | `/api/bookings/[code]/pricing` | Override pricing |
| `POST` | `/api/bookings/[code]/pay-service-fee` | Mark service fee paid |
| `POST` | `/api/bookings/[code]/pay-transport-fee` | Mark transport fee paid |
| `POST` | `/api/bookings/[code]/notes` | Add internal admin notes |
| `GET` | `/api/bookings/[code]/activity-log` | Booking audit trail |

### Dispatching

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dispatching/unassigned` | List unassigned bookings |
| `GET` | `/api/dispatching/suggest?bookingCode=...` | Get smart-suggest housemaid matches |
| `POST` | `/api/dispatching/assign` | Assign housemaid to booking |
| `POST` | `/api/dispatching/reassign` | Reassign with reason |

### Housemaids

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/housemaids` | List housemaids (query: status, tier, area, search) |
| `GET` | `/api/housemaids/[code]` | Housemaid detail |
| `PUT` | `/api/housemaids/[code]` | Update housemaid profile |
| `POST` | `/api/housemaids/[code]/suspend` | Suspend housemaid |
| `POST` | `/api/housemaids/[code]/activate` | Activate/reactivate |
| `POST` | `/api/housemaids/[code]/deactivate` | Deactivate |
| `POST` | `/api/housemaids/[code]/reset-access` | Reset login access |
| `GET` | `/api/housemaids/[code]/earnings` | Earnings history |
| `GET` | `/api/housemaids/[code]/violations` | Violations list |
| `GET` | `/api/housemaids/[code]/performance` | Performance metrics |

### Customers

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/customers` | List customers (query: search, area, status) |
| `GET` | `/api/customers/[id]` | Customer detail |
| `PUT` | `/api/customers/[id]` | Update customer profile |
| `POST` | `/api/customers/[id]/flag` | Flag customer (with reason) |
| `POST` | `/api/customers/[id]/ban` | Ban customer (with reason) |
| `GET` | `/api/customers/[id]/bookings` | Customer booking history |
| `GET` | `/api/customers/[id]/memberships` | Customer memberships |
| `PUT` | `/api/customers/[id]/memberships/[mid]` | Update membership status |

### Finance

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/finance/summary` | Finance dashboard summary |
| `GET` | `/api/finance/transactions` | Transaction list (query: date, status, housemaid, area) |
| `POST` | `/api/finance/confirm-remittance` | Confirm housemaid cash remittance |
| `POST` | `/api/finance/flag-discrepancy` | Flag payment discrepancy |
| `GET` | `/api/finance/export` | Export transactions (CSV) |
| `GET` | `/api/finance/revenue` | Revenue dashboard data |
| `GET` | `/api/finance/housemaid-payouts` | Housemaid payout summary |

### Violations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/violations` | List violations |
| `POST` | `/api/violations` | Create violation |
| `GET` | `/api/violations/[id]` | Violation detail |
| `PUT` | `/api/violations/[id]` | Update violation |

### Asenso

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/asenso/config` | Get points/tier configuration |
| `PUT` | `/api/asenso/config` | Update configuration |
| `POST` | `/api/asenso/adjust-points` | Manual points adjustment |
| `POST` | `/api/asenso/override-tier` | Manual tier override |
| `GET` | `/api/asenso/leaderboard` | Points leaderboard |

### Availability

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/availability` | Get availability (query: housemaidId, month, year) |
| `PUT` | `/api/availability` | Override availability |

### Reports

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/reports/operational` | Operational report data |
| `GET` | `/api/reports/financial` | Financial report data |
| `GET` | `/api/reports/performance` | Performance report data |

### Notifications

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | Get admin notifications |
| `PUT` | `/api/notifications/[id]/read` | Mark notification as read |
| `PUT` | `/api/notifications/read-all` | Mark all as read |
| `GET` | `/api/notifications/preferences` | Get email preferences |
| `PUT` | `/api/notifications/preferences` | Update email preferences |

### Settings

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/settings/users` | List admin users |
| `POST` | `/api/settings/users` | Create admin user |
| `PUT` | `/api/settings/users/[id]` | Update admin user |
| `GET` | `/api/settings/pricing/skus` | Get pricing SKUs |
| `PUT` | `/api/settings/pricing/skus` | Update pricing SKUs |
| `GET` | `/api/settings/pricing/flexi-rates` | Get Flexi rate cards |
| `PUT` | `/api/settings/pricing/flexi-rates` | Update Flexi rate cards |
| `GET` | `/api/settings/pricing/surge` | Get surge rules |
| `PUT` | `/api/settings/pricing/surge` | Update surge rules |
| `GET` | `/api/settings/audit-log` | View full audit log |

### Lookups (Shared)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/lookups/statuses` | All booking status codes |
| `GET` | `/api/lookups/housemaid-tiers` | Tier definitions |
| `GET` | `/api/lookups/violation-types` | Violation type definitions |
| `GET` | `/api/lookups/service-areas` | Service areas |
| `GET` | `/api/lookups/payment-methods` | Payment methods |

### File Uploads

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/uploadthing` | Upload file (evidence, documents) |

---

## 13. Non-Functional Requirements

### Performance
- Desktop-first design optimized for 1280px+
- Target < 2s initial page load on broadband
- React Query caching with 30-second stale time for dashboard data
- Neon serverless PostgreSQL for low-latency queries
- DataTable pagination (20 rows default) to limit query size
- Next.js standalone build optimized for Docker/Fly.io

### Security
- JWT tokens stored as HTTP-only cookies (no JavaScript access)
- All API routes validate session + role before processing
- Google OAuth — no passwords stored
- Phone OTP as second factor for first-time admin users
- Admin users pre-provisioned by Super Admin (no self-registration)
- RBAC enforced at API level (not just UI)
- Audit log for all mutations (who, what, when, old/new values)
- CORS restricted to admin dashboard domain only

### Scalability
- Neon serverless PostgreSQL scales automatically
- Meilisearch for full-text search (planned)
- Docker-based deployment on Fly.io supports horizontal scaling
- React Query deduplication prevents redundant API calls

### Availability
- Deployed on Fly.io with Docker
- Standalone Next.js build for predictable containerization
- Database migrations via Drizzle (version-controlled)
- Separate deployment from Housemaid App (independent scaling and releases)

### Accessibility
- Shadcn/ui built on Radix UI provides ARIA compliance
- Keyboard navigation for all interactive elements
- Focus-visible rings on all focusable elements
- Color contrast compliant with WCAG AA

### Localization
- Currency: Philippine Peso (PHP), formatted as "Php X,XXX.XX"
- Date/time: Philippines timezone (Asia/Manila)
- Phone: Philippine mobile number format (+63)
- Content: English (UI)

---

## 14. Integration with Housemaid App

### Shared Database (Single Source of Truth)
Both apps connect to the **same Neon PostgreSQL database**. There is no API-to-API integration — both apps read/write directly.

### Data Flow Examples

| Admin Action | Effect in Housemaid App |
|-------------|------------------------|
| Create booking | Appears in housemaid's booking list |
| Assign housemaid | Booking appears in assigned housemaid's dashboard |
| Cancel booking | Status updates in housemaid's booking detail |
| Record violation | Points deducted, visible in housemaid's performance |
| Override pricing | Updated total shown in housemaid's payment tab |
| Adjust Asenso points | Balance updates in housemaid's Asenso tab |

| Housemaid Action | Effect in Admin Dashboard |
|-----------------|--------------------------|
| Upload proof of arrival | Image visible in booking detail, arrival validated |
| Mark payment collected | Payment status updates in finance module |
| Submit transport details | Transport data visible in booking transport tab |
| Rate client | Rating visible in customer detail |
| Update availability | Calendar updates in admin availability view |

### Schema Migrations
- Drizzle migrations managed in the **admin app repo** (primary)
- Housemaid app repo references the same schema but does not run migrations
- Coordinated releases required when schema changes affect both apps

### Notification Triggers
- Admin actions that affect housemaids should trigger push/in-app notifications in the housemaid app (future: WebSocket or polling)
- Currently: housemaid app polls for updates via React Query

---

## 15. Identified Gaps & Planned Features

### Critical Gaps Addressed in This PRD

| Gap | Status | Section |
|-----|--------|---------|
| No central dispatch system | **Addressed** | 7.5 — Smart-suggest + manual dispatch |
| No financial reconciliation | **Addressed** | 7.8 — Full reconciliation with remittance tracking |
| No customer management | **Addressed** | 7.7 — Full customer module |
| No role permissions | **Addressed** | 9 — 3-role RBAC |
| No admin-side notifications | **Addressed** | 7.14 — In-app + email notifications |
| No audit logging | **Addressed** | 8 — Comprehensive audit trail |

### Planned for Future Releases

| Feature | Priority | Description |
|---------|----------|-------------|
| **Fraud Detection** | High | Automated detection of fake photos, location spoofing, duplicate receipts, payment anomalies |
| **Payroll / Payout System** | High | GCash payout batching, weekly payroll generation, payout tracking |
| **Auto-Dispatch** | Medium | Fully automated housemaid assignment with admin override |
| **Real-time Tracking** | Medium | Live GPS tracking of housemaids during transit (WebSocket) |
| **Full-Text Search** | Medium | Meilisearch integration for booking/customer/housemaid search |
| **Additional Roles** | Medium | HR/Performance Manager, Customer Support as separate roles |
| **Mobile Admin** | Low | Responsive admin dashboard for tablet/mobile use |
| **API for External Systems** | Low | REST API for integration with accounting software, CRM |
| **Bulk Operations** | Low | Bulk assign, bulk cancel, bulk payment marking |
| **Advanced Analytics** | Low | Predictive demand forecasting, housemaid churn prediction |

---

*This PRD was created on 2026-02-19 for the `gk-admin-app01-dev` repository. It is the counterpart to the GetKlean Housemaid App PRD (`gk-housemaid-app01-dev`). Both apps share the same Neon PostgreSQL database and Drizzle ORM schema. Design system follows `DESIGN.md`.*
