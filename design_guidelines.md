# GetKlean Housemaid Booking Dashboard - Design Guidelines

## Design Philosophy

Create a professional, trustworthy housekeeping services dashboard with visual clarity and operational efficiency. The interface should feel clean and organized like the service it represents, with warm, approachable touches through the yellow branding accent.

## Color System

### Primary Colors

- **Teal (#4A9B8E)**: Section headings, active navigation states, accent borders, icon highlights
- **Yellow (#F4D03F)**: Primary action buttons, GETKLEAN branding, important CTAs, dispatch/active status indicators
- **White (#FFFFFF)**: Primary background, card backgrounds

### Status Colors

- **Green (#10B981)**: Completed, validated, accepted states
- **Blue (#3B82F6)**: Accepted bookings, information states
- **Teal (#4A9B8E)**: Dispatched status
- **Purple (#8B5CF6)**: On the way, in progress
- **Indigo (#6366F1)**: Arrived status
- **Yellow (#F59E0B)**: Rescheduled, pending payment, half-day availability
- **Orange (#F97316)**: For Review, followup required
- **Red (#EF4444)**: Cancelled, no-show, blocked dates, violations
- **Gray (#9CA3AF)**: Needs confirmation, off days, disabled states

### Text Hierarchy

- **Headings**: #1F2937 (dark gray), semi-bold 600
- **Body Text**: #374151 (medium dark), regular 400
- **Secondary Text**: #6B7280 (medium gray), regular 400
- **Tertiary/Labels**: #9CA3AF (light gray), regular 400

## Typography

### Font Stack

- Primary: System fonts (SF Pro Display on iOS, Roboto on Android, Segoe UI on Windows)
- Use Next.js native font optimization

### Size Scale

- **Page Titles**: 24-28px, semi-bold
- **Section Headings**: 18-20px, semi-bold, teal color
- **Card Titles**: 16px, semi-bold
- **Body Text**: 14-15px, regular
- **Labels**: 12-13px, medium
- **Metadata**: 12px, regular

## Layout System

### Spacing Units

Use Tailwind spacing primitives: **2, 4, 8, 12, 16, 20, 24** (represents px/4)

- Component padding: p-4 (16px)
- Card padding: p-4 to p-6 (16-24px)
- Section margins: mb-6 to mb-8 (24-32px)
- Input spacing: gap-4 (16px)

### Container Widths

- Mobile: Full width with 16px horizontal padding
- Content max-width: 100% (mobile-first, no desktop constraints needed for MVP)

### Grid System

- **2-column layouts**: For stats cards, feature comparisons
- **Single column**: For forms, booking details, lists
- **Gap spacing**: 12-16px between grid items

## Component Design

### Cards

- Background: White
- Border: 1px solid #E5E7EB or none with shadow
- Border radius: 8-12px
- Shadow: `0 1px 3px rgba(0,0,0,0.1)` for subtle elevation
- Padding: 16px
- Active/Hover: Increase shadow to `0 4px 6px rgba(0,0,0,0.1)`

### Buttons

- **Primary (Yellow #F4D03F)**: Main actions, CTAs

  - Text: Dark gray #1F2937
  - Padding: 14px vertical, full width
  - Border radius: 6-8px
  - Font: 16px, semi-bold
  - Hover: Darker yellow #E8C135

- **Secondary (Teal #4A9B8E)**: Alternative actions

  - Text: White
  - Same sizing as primary
  - Hover: Darker teal #3D8A7A

- **Ghost/Outline**: Low-priority actions
  - Border: 1px solid current color
  - Background: Transparent
  - Hover: Light background tint

### Status Badges

- Padding: 4px 12px
- Border radius: 16px (pill shape)
- Font: 12px, medium weight
- Display status + icon combinations
- Colors match status color system above

### Input Fields

- Border: 1px solid #D1D5DB
- Border radius: 6-8px
- Padding: 14px 16px
- Font: 16px (prevents zoom on iOS)
- Focus: Teal border #4A9B8E, outline ring
- Icons: 20-24px, positioned left with 12px margin

### Icons

- Use Heroicons (outline style for navigation, solid for active states)
- Standard size: 20-24px
- Navigation icons: 24px
- In-card icons: 20px
- Metadata icons: 16px
- Color: Inherit from parent or teal for emphasis

## Navigation Components

### Bottom Navigation (Fixed)

- Height: 64-72px
- Background: White
- Top border: 1px solid #E5E7EB
- 4 icons evenly distributed
- Active state: Yellow circular background (48px), icon + label
- Inactive: Gray icon only
- Labels: 11px, shown only for active state

### Hamburger Menu

- Slide-in from left
- Full height overlay
- Background: White
- Sections separated by 1px gray dividers
- Menu items: 48px height touch targets
- Icons: 24px, teal color
- Active item: Light teal background

### Header

- Height: 56-64px
- Background: White or Yellow gradient for branded sections
- Contains: Hamburger menu (left), GETKLEAN logo (center), Notification bell (right)
- Shadow: Subtle bottom shadow on scroll

## Page-Specific Patterns

### Dashboard

- Stats cards: 2x2 grid
- Each card: Light colored background (teal/blue/green tint), icon (24px), label, large number (28px bold)
- Tab navigation: Underline style, teal color for active
- Recent bookings: Compact card list

### Bookings Page

- Horizontal scrollable date strip: 5 visible dates, arrows for navigation
- Date cells: 56px width, display day abbreviation + date number
- Active date: Teal background, white text
- Booking count dots: Show 1-3 dots below date (•••)
- Booking cards: Full width, white background, chevron right indicator

### Calendar (Availability)

- Month grid: 7 columns (S-M-T-W-T-F-S)
- Date cells: Square, 44-48px
- Color-coded: Green (available), Yellow (half-day), Blue (booked), Red (blocked)
- Legend: Horizontal row below calendar
- Bottom sheet: Slides up on date tap, contains availability options

### Booking Detail

- Full-screen view
- Status badge at top
- Client info section: Icon + text rows
- Action buttons: Positioned at logical workflow points
- Transportation section: Collapsible with photo upload
- Timeline view: Vertical line with timestamps (completed bookings)

### Profile

- Header: Yellow background, circular photo (120-150px), white border
- Tab navigation: Icon-based (4 icons), horizontal scroll
- Form sections: Grouped with teal headings, divider lines
- Skills: Row layout with icon (24px), name, star rating (right-aligned)

## Images

### Login/Registration Screens

- **Hero Image**: Housemaids in blue GetKlean uniforms cleaning professionally
- Placement: Top 35-40% of screen
- Treatment: Full-width, no padding
- Below image: Logo, authentication elements on white background

### Profile Photo

- Circular, 120-150px diameter on profile header
- 4-6px white border
- Subtle shadow
- Yellow gradient background behind photo

### Receipt Photos (Transportation)

- Thumbnail: 80x80px in display mode
- Full-screen lightbox on tap
- Upload: Camera icon placeholder, dashed border
- Stored via Replit Object Storage

## Interaction Patterns

### Touch Targets

- Minimum: 44x44px for all tappable elements
- Buttons: 48px minimum height
- List items: 56-64px height

### Feedback

- Button press: Slight scale down (0.98)
- Card tap: Background color shift
- Success toast: Green background, white text, 3 seconds
- Error toast: Red background, white text with retry option
- Loading: Yellow spinner or skeleton screens

### Transitions

- Page transitions: Slide animations (300ms)
- Modal/Bottom sheet: Slide up from bottom (250ms)
- Status changes: Fade in new content (200ms)
- Keep animations subtle and purposeful

## Accessibility

### Form Inputs

- Consistent 16px font size (prevents iOS zoom)
- High contrast labels
- Clear error messages below fields
- Focus indicators: 2px teal outline ring

### Color Contrast

- All text maintains WCAG AA standards
- Status badges: Sufficient contrast between background and text
- Icons: Use with text labels for clarity

## Mobile Optimizations

### Responsive Breakpoints

- Mobile: < 768px (primary focus)
- Tablet: 768px - 1024px (enhanced spacing)
- Desktop: > 1024px (max-width constraints, not primary focus)

### Performance

- Lazy load images
- Optimize Google Sheets queries (fetch only needed fields)
- Cache frequently accessed data
- PWA offline capability for core features

### Gestures

- Horizontal swipe: Calendar navigation
- Pull to refresh: Bookings/earnings lists
- Tap: Primary interaction
- Long press: Not used (keep interactions simple)

## Brand Elements

### GETKLEAN Logo

- "GET" in Yellow (#F4D03F)
- "KLEAN" in Teal (#4A9B8E)
- Tagline: "THE CLEANING EXPERTS" (small caps, gray)
- Usage: Header centers, login screen, profile background

### Voice and Tone

- Professional yet approachable
- Clear, action-oriented button labels ("Ready to Dispatch", "Start Service")
- Encouraging feedback messages ("Great work!", "Keep up the excellent service!")
- Direct, helpful error messages

This design system creates a cohesive, professional experience that builds trust with housemaids while maintaining operational efficiency.
