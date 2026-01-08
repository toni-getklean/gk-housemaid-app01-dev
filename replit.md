# GetKlean Housemaid Booking Dashboard

## Overview

GetKlean is a mobile-first housekeeping services dashboard designed for housemaids to manage their work schedules, bookings, earnings, and availability. The application provides a clean, professional interface that enables housemaids to track their jobs, view performance metrics, manage their calendar availability, and communicate their work status with clients and administrators.

The system follows a mobile-optimized design with a bottom navigation pattern, card-based layouts, and a color-coded status system that makes information easily scannable. The application emphasizes operational efficiency and trust through visual clarity and straightforward workflows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Runtime**
- Next.js 15+ with App Router for server and client-side rendering
- React 18+ with Server Components and Client Components pattern
- TypeScript for type safety across the application

**UI Component System**
- Radix UI primitives for accessible, unstyled components (dialogs, dropdowns, tabs, toasts, etc.)
- shadcn/ui component library built on top of Radix UI
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme extending Tailwind with brand colors (Yellow #F4D03F, Teal #1D72C6)
- Mobile-first responsive design optimized for viewport widths under 768px

**State Management**
- TanStack React Query (v5) for server state management and data fetching
- React hooks (useState, useEffect) for local component state
- No global state management library - relies on React Query cache and URL state

**Routing & Navigation**
- Next.js App Router with file-based routing
- Bottom navigation component for main app sections (Dashboard, Bookings, Earnings, Profile)
- Programmatic navigation using next/navigation hooks (useRouter, usePathname)

**Design System Implementation**
- Comprehensive design guidelines in `design_guidelines.md` defining color palette, typography scale, and spacing units
- Status-based color coding for booking states (green for completed, blue for accepted, yellow for pending, etc.)
- Consistent component patterns with Header, BottomNav, and Card as primary layout primitives

### Backend Architecture

**API Layer**
- Next.js API routes would handle backend logic (currently minimal server implementation)
- RESTful endpoint structure using Next.js route handlers
- Session-based authentication would use connect-pg-simple for PostgreSQL session storage

**Database**
- PostgreSQL database accessed through Neon serverless driver (@neondatabase/serverless)
- Drizzle ORM for type-safe database queries and schema management
- Schema defined in `shared/schema.ts` with Zod validation through drizzle-zod
- Database migrations managed via drizzle-kit in `migrations/` directory

**Authentication Flow**
- Two separate Facebook OAuth entry points:
  1. **Login Flow**: "Continue with Facebook" button → Facebook OAuth (state=login) → Check if housemaid exists in database → If found: update access token and redirect to dashboard with full session; If not found: store Facebook ID and redirect to phone verification
  2. **Verification Flow**: "Verify your account →" link → Facebook OAuth (state=verify) → Capture Facebook ID, name, and access token → Redirect to phone verification with verification session data
- Phone verification: Validates housemaid exists with matching Facebook name + mobile number, generates 6-digit OTP, sends via CYN SMS API
- OTP validation: Verifies code, expiration (10 minutes), one-time use enforcement, and updates housemaid profile with Facebook access token
- **Session Management**:
  - Verification session (temporary): facebook_id, facebook_name, mobile_number, facebook_access_token, token_expires_at
  - Authenticated session (permanent): user object, housemaid_id, facebook_id, facebook_name
  - All session data stored in localStorage
  - Temporary verification data cleared after successful OTP verification
- Rate limiting: 3 OTP requests/day, 5 OTP verification failures, 3 login attempts

**Data Models**
- User model with username/password fields (extensible for additional housemaid profile data)
- Booking entities with booking code system (HM0425-1314 format), status tracking, client information, location, and scheduling data
- Booking statuses: pending_review, accepted, dispatched, on_the_way, arrived, in_progress, completed
- Performance metrics including ratings, completion rates, violations (minor/major)
- Availability calendar with date-based status (available, booked, blocked, off)

**Booking Workflow & UI Patterns**
- Booking codes (HM0425-1314 format) used in URLs instead of numeric IDs for better traceability
- Status-based action button system following UI best practices:
  - **For Review** (pending_review): Accept (yellow primary) + Decline (outline) - Decision point
  - **Accepted**: "Mark as Dispatched" (teal primary) - Progression action
  - **Dispatched**: "Mark as On The Way" (teal primary) - Progression action
  - **On The Way**: "Mark as Arrived" (teal primary) - Progression action
  - **Arrived**: "Start Job" (green primary) - Milestone action
  - **In Progress**: "Complete Job" (green primary) - Final milestone
  - **Completed**: No action buttons - Terminal state
- Color coding: Yellow for decisions, Teal for progression, Green for milestones
- Default booking list view shows: accepted, dispatched, on_the_way, arrived, in_progress statuses

**Proof of Arrival Photo Capture (On The Way Status Only):**
- Appears in Summary, Client, and Payment tabs as a separate card ABOVE the "Mark as Arrived" button
- Only visible for "on_the_way" status bookings
- Camera capture button: "Open Camera / Choose Photo" with `capture="environment"` attribute
- Info message: Photo will include timestamp and location data
- Green submit button: "Upload Proof of Arrival"
- After upload: success message displayed
- **Status Change Restriction:** Cannot mark booking as "Arrived" until proof of arrival photo is uploaded
- "Mark as Arrived" button is disabled and shows "Upload Proof of Arrival First" until photo is uploaded
- Note: Backend timestamp/location metadata implementation pending

**Transportation Form & Validation (Accordion-Based Design)**
- Transportation details form appears in Transport tab for statuses: accepted, dispatched, on_the_way, arrived, in_progress
- **Two-Accordion Structure:**
  - **Accordion A: Commute to Client** (open by default)
    - Destination label: "Heading to the client"
    - Trip summary with multiple transportation entries
    - Each entry: Transit Type dropdown (Jeep, Pedicab, Train, Bus, Grab, Tricycle, Taxi, Motorcycle) + Fare input
    - Add/delete entry buttons (minimum one entry required)
    - Auto-calculated total fare display
    - File upload: "Upload proof of arrival receipt *" (JPG/JPEG/PNG/PDF, max 5MB per file, multiple files supported)
    - Optional additional notes textarea
    - Submit button: "Upload arrival fare"
  - **Accordion B: Return Fare**
    - Destination label: "Returning home"
    - Trip summary with multiple transportation entries
    - Same entry structure as Commute accordion
    - Auto-calculated total fare display
    - File upload: "Upload return fare receipt *" (JPG/JPEG/PNG/PDF, max 5MB per file, multiple files supported)
    - Optional additional notes textarea
    - Submit button: "Upload return fare"
- **Validation Rules:**
  - All entries must have transit type and valid fare (> 0)
  - Receipt file required for each accordion
  - Notes are optional
  - Job completion blocked until BOTH accordions are submitted
- **UI Behavior:**
  - Commute to Client accordion expanded by default on page load
  - After submission: fields disabled, green "Saved" badge on accordion trigger, success message shown
  - Delete buttons hidden after submission
  - Submit button hidden after submission
  - Toast notifications for validation errors and successful saves
- Object storage integration configured for receipt uploads
- Separate state management for each accordion (entries, receipt, notes, submission status)
- Multiple file upload support (UI displays first selected file name, full handling pending backend implementation)

### External Dependencies

**UI Component Libraries**
- @radix-ui/* - Complete suite of accessible UI primitives (20+ packages for dialogs, dropdowns, menus, form controls)
- @tanstack/react-query - Server state management and caching
- class-variance-authority - Type-safe component variant styling
- cmdk - Command palette component for search interfaces
- date-fns - Date manipulation and formatting utilities
- lucide-react - Icon library for UI elements
- react-icons - Additional icon set (specifically SiFacebook for social login)
- input-otp - OTP input component for phone verification

**Database & ORM**
- @neondatabase/serverless - Serverless PostgreSQL driver for Neon database
- drizzle-orm - Lightweight TypeScript ORM with strong type inference
- drizzle-zod - Zod schema generation from Drizzle schemas for validation
- connect-pg-simple - PostgreSQL session store for Express/Connect sessions

**Form Handling**
- @hookform/resolvers - Validation resolvers for React Hook Form
- zod - Schema validation library (implicit through drizzle-zod)

**Development Tools**
- tsx - TypeScript execution engine for Node.js scripts
- drizzle-kit - CLI tool for database migrations and schema management

**Third-Party Services (Planned Integration)**
- Facebook OAuth API - Social authentication for user login
- SMS/OTP service provider - Phone verification and one-time password delivery
- Google Sheets API - Potential data source for validating registered housemaids (mentioned in design docs)

**Styling & CSS**
- tailwindcss - Utility-first CSS framework
- tailwind-merge - Utility for merging Tailwind classes without conflicts
- clsx - Conditional className composition