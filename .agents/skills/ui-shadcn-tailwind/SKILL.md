---
name: ui-shadcn-tailwind
description: Guidelines for creating and modifying UI components using Tailwind CSS and Radix UI.
---

# UI Components & Styling Skill

This project relies on a highly customized UI system built with **Tailwind CSS**, **Radix UI** primitives (`shadcn/ui` style architecture), `lucide-react` for icons, and `tw-animate-css`/`framer-motion` for animations. 

## Architectural Rules

1. **Do not reinvent the wheel**: Before building any net-new generic UI element (like a Button, Dialog, Switch, Select, or Input), check if one already exists in the `components/ui/` directory.
2. **Read the Design Guidelines First**: The user has provided explicit `DESIGN.md` and `design_guidelines.md` files in the repository root. **You must review these** before making visual UI changes. They dictate colors, spacing, typography, and interactive behaviors.
3. **Ad-Hoc Tailwind Classes**: Avoid using ad-hoc magic numbers or custom arbitrary values (e.g., `text-[#123456]`) unless directed. Use the predefined theme color tokens defined in `tailwind.config.ts` (or `index.css`/`globals.css`).

## Component Structure

- **`components/ui/`**: This directory contains primitive, highly reusable components (Buttons, Inputs, Cards). These are generally built using Radix UI primitives and styled with `class-variance-authority` (cva) and `tailwind-merge` (`cn` utility).
- **Page-specific vs. Shared**: 
  - If a component is only used on a single specific page (e.g., a specific dashboard chart), place it near that page or in a logical `components/` subfolder. 
  - If it's a structural element used across many pages (like a sidebar, complex generic data table layout), it belongs in the shared components directory.

## Animations and Transitions

The design places a high premium on visual excellence and dynamic interfaces.
- Use `framer-motion` for complex entering/exiting layout animations.
- Use native Tailwind transition utilities (e.g., `transition-all duration-300`) for simple hover and active states.
- Micro-interactions matter: Modals, dropdowns, and buttons must feel responsive and fluid.

## File References
- When writing components, always use `clsx` and `tailwind-merge` to allow robust class overriding:
  ```tsx
  import { cn } from "@/lib/utils"; // (or wherever your utility file resides)
  ```
