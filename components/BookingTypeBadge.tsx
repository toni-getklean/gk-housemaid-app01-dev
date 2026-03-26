"use client";

import { Badge } from "@/components/ui/badge";

export type BookingType = "TRIAL" | "ONE_TIME" | "REPEAT" | "FLEXI" | "SUBSCRIPTION";

interface BookingTypeBadgeProps {
  type: BookingType | string;
  className?: string;
}

export function BookingTypeBadge({ type, className }: BookingTypeBadgeProps) {
  const getTypeConfig = (typeStr: string) => {
    switch (typeStr.toUpperCase()) {
      case "TRIAL":
        return { label: "Trial", variant: "typeTrial" as const };
      case "ONE_TIME":
      case "ONE-TIME":
        return { label: "One-Time", variant: "typeOneTime" as const };
      case "FLEXI":
      case "SUBSCRIPTION":
        return { label: "Flexi", variant: "typeFlexi" as const };
      case "REPEAT":
        // Fallback for Repeat if it doesn't have a distinct PRD color, default to Green/OneTime or Secondary
        return { label: "Repeat", variant: "typeOneTime" as const };
      default:
        return { label: typeStr.replace(/_/g, " "), variant: "secondary" as const };
    }
  };

  const config = getTypeConfig(type);

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-type-${type.toLowerCase()}`}>
      {config.label}
    </Badge>
  );
}
