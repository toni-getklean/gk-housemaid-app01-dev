# DESIGN.md — GetKlean Housemaid App Design System

> **Purpose**: This document is the single source of truth for creating new pages and components in the housemaid app. It documents the **actual** design tokens, component patterns, and conventions currently in the codebase.

---

## 1. Tech Stack (UI Layer)

| Layer | Technology | Config File |
|---|---|---|
| CSS Framework | Tailwind CSS v3 | `tailwind.config.ts` |
| CSS Tokens | HSL custom properties (light + dark) | `app/globals.css` |
| Component Library | shadcn/ui (new-york style) | `components.json` |
| UI Primitives | Radix UI | `package.json` |
| Variant System | `class-variance-authority` (cva) | Used in `components/ui/` |
| Class Merging | `clsx` + `tailwind-merge` → `cn()` | `lib/utils.ts` |
| Icons | `lucide-react` (primary) + `react-icons` (social) | — |
| Animations | `framer-motion` + `tailwindcss-animate` + `tw-animate-css` | — |
| Data Fetching | `@tanstack/react-query` (client), Server Components (server) | — |

---

## 2. Color System

### 2.1 Brand Colors (Tailwind tokens)

Defined in `tailwind.config.ts` under `theme.extend.colors`:

| Token | Hex Value | Usage |
|---|---|---|
| `yellow` | `#F4D03F` | Primary CTA buttons, GETKLEAN branding ("GET"), active nav state |
| `yellow-hover` | `#E4C02F` | Yellow button hover state |
| `teal` | `#1D72C6` | GETKLEAN branding ("KLEAN"), links, section accents |
| `teal-hover` | `#1562B6` | Teal hover state |

> **Usage**: `bg-yellow`, `text-teal`, `hover:bg-yellow-hover`, etc.

### 2.2 Semantic CSS Variable Tokens (HSL)

Defined in `app/globals.css` as CSS custom properties. Used via `hsl(var(--token))` in Tailwind config.

| Token | Light Mode (HSL) | Purpose |
|---|---|---|
| `--background` | `0 0% 100%` | Page background (white) |
| `--foreground` | `222 47% 11%` | Primary text |
| `--primary` | `207 70% 42%` | Primary actions (maps to a blue ~`#1D72C6`) |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary` | `210 20% 90%` | Secondary backgrounds |
| `--secondary-foreground` | `222 47% 11%` | Text on secondary |
| `--muted` | `210 20% 93%` | Muted backgrounds |
| `--muted-foreground` | `215 16% 47%` | Muted text |
| `--accent` | `210 17% 88%` | Accent backgrounds |
| `--destructive` | `0 84% 60%` | Error/danger actions |
| `--border` | `220 13% 91%` | Default borders |
| `--input` | `214 32% 85%` | Input borders |
| `--ring` | `207 70% 42%` | Focus ring |
| `--card` | `0 0% 100%` | Card backgrounds |
| `--popover` | `210 20% 94%` | Popover backgrounds |
| `--radius` | `0.5rem` (8px) | Default border radius |

Dark mode tokens are also defined in `.dark {}` — see `globals.css`.

### 2.3 Status Colors (Hardcoded, Not Tokenized)

Currently used via inline Tailwind classes — **not** as design tokens:

| Status | Background | Text | Used In |
|---|---|---|---|
| Completed/Valid | `bg-green-50` / `bg-green-500` | `text-green-600` | Dashboard stats, badges |
| Accepted/Info | `bg-blue-50` / `bg-blue-500` | `text-blue-600` | Dashboard stats, badges |
| Dispatched | `bg-teal-50` | `text-teal` | — |
| On the Way / In Progress | `bg-purple-50` | `text-purple-600` | — |
| Rescheduled/Pending | `bg-yellow-50` / `bg-yellow-500` | `text-yellow-600` | Dashboard stats, badges |
| For Review/Followup | `bg-orange-50` / `bg-orange-500` | `text-orange-600` | Dashboard banner |
| Cancelled/Error | `bg-red-50` `bg-destructive` | `text-red-600` | Badges, toasts |
| Disabled/Off | `bg-gray-50` | `text-gray-400` / `text-gray-500` | — |

### 2.4 Chart Colors (CSS Variables)

| Token | Light HSL | Approx Color |
|---|---|---|
| `--chart-1` | `207 70% 42%` | Blue (primary) |
| `--chart-2` | `45 93% 58%` | Yellow |
| `--chart-3` | `207 90% 54%` | Lighter blue |
| `--chart-4` | `142 71% 45%` | Green |
| `--chart-5` | `262 83% 58%` | Purple |

---

## 3. Typography

### 3.1 Font Stack

**No custom Google Font is loaded.** The app uses the browser default sans-serif stack. The `layout.tsx` does not configure any `next/font` import.

### 3.2 Text Hierarchy (Actual Usage)

| Role | Classes Used | Example |
|---|---|---|
| Page title | `text-xl font-semibold text-gray-900` | Dashboard "Quick Stats" |
| Section heading | `text-lg font-semibold text-gray-900` | Header title |
| Card title / Label | `font-medium text-gray-900` | BookingCard client name |
| Body text | `text-sm text-gray-600` | Dashboard booking details |
| Secondary text | `text-xs text-gray-500` | Metadata, dates |
| Tertiary / Micro | `text-[9px] text-gray-500 tracking-widest` | Logo tagline |
| Stat numbers | `text-2xl font-bold text-gray-900` | Dashboard stat values |

---

## 4. Layout Patterns

### 4.1 Page Shell

Every authenticated page follows this structure:

```tsx
<div className="min-h-screen bg-gray-50 pb-20">
  <Header />           {/* sticky top-0, z-40, h-16 */}
  <div className="p-4 space-y-6">
    {/* Page content */}
  </div>
  <BottomNav />        {/* fixed bottom-0, z-50, h-16 */}
</div>
```

**Key notes:**
- `pb-20` prevents content from being hidden under the fixed BottomNav
- Page background is `bg-gray-50` (light gray), not white
- Content padding is `p-4` (16px)
- Section spacing is `space-y-6` (24px)

### 4.2 Grid System

- **Stats**: `grid grid-cols-2 gap-3`
- **Forms**: Single column, full width
- **Lists**: Single column, `space-y-2` or `space-y-3`

---

## 5. Component Reference

### 5.1 Available UI Primitives (`components/ui/`)

| Component | File | Variants/Notes |
|---|---|---|
| Accordion | `accordion.tsx` | Radix-based |
| Alert | `alert.tsx` | — |
| Avatar | `avatar.tsx` | — |
| Badge | `badge.tsx` | `default`, `secondary`, `destructive`, `outline`, `success`, `warning` |
| Button | `button.tsx` | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` / Sizes: `default`, `sm`, `lg`, `icon` |
| Card | `card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` |
| Dialog | `dialog.tsx` | Full modal |
| Input | `input.tsx` | Basic styled input |
| InputOTP | `input-otp.tsx` | OTP-specific |
| Label | `label.tsx` | — |
| RadioGroup | `radio-group.tsx` | — |
| Select | `select.tsx` | Full select with trigger, content, items |
| Separator | `separator.tsx` | — |
| Sheet | `sheet.tsx` | Side/bottom drawers |
| Tabs | `tabs.tsx` | `TabsList`, `TabsTrigger`, `TabsContent` |
| Textarea | `textarea.tsx` | — |
| Toast | `toast.tsx` | `default`, `destructive` |
| Toaster | `toaster.tsx` | Auto-rendering toast container |
| Tooltip | `tooltip.tsx` | — |

### 5.2 Shared App Components (`components/`)

| Component | File | Description |
|---|---|---|
| Header | `Header.tsx` | Sticky top header with logo, back button, notifications, custom right action |
| BottomNav | `BottomNav.tsx` | Fixed bottom navigation (Dashboard, Bookings, Earnings, Profile) |
| BookingCard | `BookingCard.tsx` | Compact booking summary card with status, client, location, time |
| StatusBadge | `StatusBadge.tsx` | Maps `BookingStatus` enum to badge variants |
| HousemaidTierCard | `HousemaidTierCard.tsx` | Tier/level display card |
| PesoIcon | `icons/PesoIcon.tsx` | Custom ₱ icon for earnings |

### 5.3 Feature Components

| Directory | Components | Feature |
|---|---|---|
| `components/bookings/` | 10 components | Booking detail tabs, actions, modals |
| `components/availability/` | 2 components | Calendar availability editor & filter |

---

## 6. Interaction Patterns

### 6.1 Navigation

- **Bottom Nav**: 4 items (Dashboard, Bookings, Earnings, Profile)
  - Active: `bg-yellow text-gray-900` with pill shape + label
  - Inactive: `text-gray-500`, icon only
- **Back navigation**: `Header` with `showBack={true}` + `onBackClick`
- **Routing**: Next.js App Router via `useRouter()` and `<Link>`

### 6.2 Data Fetching Patterns

```tsx
// Client-side with React Query
const { data, isLoading } = useQuery({
  queryKey: ["dashboardStats"],
  queryFn: async () => {
    const res = await fetch("/api/dashboard");
    if (!res.ok) throw new Error("Failed");
    return res.json();
  }
});
```

### 6.3 Loading States

- Full-page spinner: `<Loader2 className="h-8 w-8 animate-spin text-gray-400" />`
- Centered in: `min-h-screen flex items-center justify-center`

### 6.4 Empty States

```tsx
<Card className="p-8 text-center">
  <p className="text-gray-500">No bookings for today</p>
</Card>
```

### 6.5 Touch Targets

- Buttons: `h-9` default, `h-14` for primary CTAs (login)
- List items: Cards with `cursor-pointer` + `hover:bg-gray-50 transition-colors`
- Nav items: Pill-shaped with adequate padding

---

## 7. Common Patterns for New Pages

### 7.1 Boilerplate

```tsx
"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function NewPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["newPageData"],
    queryFn: async () => {
      const res = await fetch("/api/new-endpoint");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Page Title" showBack onBackClick={() => {}} />
      <div className="p-4 space-y-6">
        {/* Content here */}
      </div>
      <BottomNav />
    </div>
  );
}
```

### 7.2 Stat Cards

```tsx
<div className="grid grid-cols-2 gap-3">
  <Card className="p-4">
    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
      <Icon className="h-5 w-5" />
    </div>
    <p className="text-2xl font-bold text-gray-900">42</p>
    <p className="text-xs text-gray-600 mt-1">Label</p>
  </Card>
</div>
```

### 7.3 List with Cards

```tsx
<div className="space-y-3">
  {items.map((item) => (
    <Card key={item.id} className="p-4 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        {/* Content */}
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </Card>
  ))}
</div>
```

---

## 8. ⚠️ Known Gaps & Issues

These are discrepancies between `design_guidelines.md` and the actual codebase. They should be addressed before building new pages to ensure consistency.

### 🔴 Critical

| # | Issue | Details |
|---|---|---|
| 1 | **Teal color mismatch** | `tailwind.config.ts` defines `teal: '#1D72C6'` which is actually **blue** (`hsl(207, 72%, 45%)`). The `design_guidelines.md` says teal should be `#4A9B8E` (actual teal/green). The CSS `--primary` also maps to `207 70% 42%` (the same blue). **Decision needed**: Is the brand color intentionally blue, or should it be actual teal? |
| 2 | **No Google Font loaded** | `design_guidelines.md` says "System fonts" but `ui-shadcn-tailwind` skill recommends modern typography. `app/layout.tsx` has **no `next/font` import** — the app renders in browser-default sans-serif. Consider loading Inter or similar. |
| 3 | **StatusBadge doesn't use per-status colors** | `design_guidelines.md` defines distinct colors per status (green for completed, purple for on_the_way, etc.), but `StatusBadge.tsx` maps nearly everything to the generic `default` badge variant (blue/primary). Visual distinction between booking states is lost. |

### 🟡 Medium

| # | Issue | Details |
|---|---|---|
| 4 | **No brand button variants** | `button.tsx` has generic shadcn variants (`default`, `destructive`, etc.) but no `yellow` (primary CTA) or `teal` (secondary action) variant as described in the design guidelines. Login page works around this with inline `className` overrides (`bg-[#1877F2]`). |
| 5 | **Toast has no `success` variant** | Only `default` and `destructive`. Guidelines call for green success toasts. |
| 6 | **Status colors not tokenized** | Status colors (`bg-orange-50`, `bg-blue-50`, etc.) are hardcoded per-page instead of being centralized as reusable tokens or a status utility. |
| 7 | **Missing common UI components** | Not yet installed from shadcn/ui: `Checkbox` (only Radix dep exists), `Switch`, `Slider`, `Progress` bar, `DropdownMenu`, `Popover`, `ScrollArea`, `Calendar` (day picker), `Command` (cmdk). These will be needed for forms and upcoming features. |
| 8 | **Dark mode not actively used** | CSS variables for `.dark` are defined in `globals.css`, but no theme toggle exists and the app renders in light mode only. `next-themes` is installed but not configured in providers. |

### 🟢 Low / Nice-to-Have

| # | Issue | Details |
|---|---|---|
| 9 | **No skeleton loading components** | Guidelines mention "skeleton screens" but no `Skeleton` component exists. Currently uses spinner only. |
| 10 | **No animated page transitions** | Guidelines call for "Slide animations (300ms)" between pages. Not yet implemented. |
| 11 | **Hardcoded copyright year** | Login page has `© 2024` instead of dynamic year. |
| 12 | **Icons skill mismatch** | `design_guidelines.md` says "Use Heroicons" but codebase actually uses `lucide-react`. This is fine — just update the guideline doc. |
| 13 | **`design_guidelines.md` references "Replit Object Storage"** | Line 222 references Replit for receipt photos, but the app uses UploadThing. Outdated reference. |

---

## 9. File Reference Quick Links

| File | Purpose |
|---|---|
| `app/globals.css` | CSS custom properties (light/dark tokens) |
| `tailwind.config.ts` | Tailwind theme extensions, brand colors |
| `components.json` | shadcn/ui configuration |
| `lib/utils.ts` | `cn()` utility function |
| `components/ui/` | Reusable UI primitives (19 components) |
| `components/Header.tsx` | Global header |
| `components/BottomNav.tsx` | Global bottom navigation |
| `components/StatusBadge.tsx` | Booking status badge mapper |
| `design_guidelines.md` | Original design guidelines (has outdated references) |
