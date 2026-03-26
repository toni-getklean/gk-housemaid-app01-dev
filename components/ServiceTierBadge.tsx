"use client";

import { Badge } from "@/components/ui/badge";

export type ServiceTier = "REGULAR" | "PLUS" | "ALL_IN";

interface ServiceTierBadgeProps {
  tier: ServiceTier | string;
  className?: string;
}

export function ServiceTierBadge({ tier, className }: ServiceTierBadgeProps) {
  const getTierConfig = (tierStr: string) => {
    switch (tierStr.toUpperCase()) {
      case "REGULAR":
        return { label: "Regular", variant: "tierRegular" as const };
      case "PLUS":
        return { label: "Plus", variant: "tierPlus" as const };
      case "ALL_IN":
      case "ALL-IN":
        return { label: "All-In", variant: "tierAllIn" as const };
      default:
        return { label: tierStr, variant: "secondary" as const };
    }
  };

  const config = getTierConfig(tier);

  return (
    <Badge variant={config.variant} className={className} data-testid={`badge-tier-${tier.toLowerCase()}`}>
      {config.label}
    </Badge>
  );
}
