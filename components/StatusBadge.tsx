"use client";

import { Badge } from "@/components/ui/badge";

export type BookingStatus =
  | "for_review"
  | "pending_review"
  | "accepted"
  | "dispatched"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "rescheduled";

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case "for_review":
      case "pending_review":
        return { label: "For Review", variant: "secondary" as const };
      case "accepted":
        return { label: "Accepted", variant: "default" as const };
      case "dispatched":
        return { label: "Dispatched", variant: "default" as const };
      case "on_the_way":
        return { label: "On The Way", variant: "default" as const };
      case "arrived":
        return { label: "Arrived", variant: "default" as const };
      case "in_progress":
        return { label: "In Progress", variant: "default" as const };
      case "completed":
        return { label: "Completed", variant: "default" as const };
      case "cancelled":
        return { label: "Cancelled", variant: "destructive" as const };
      case "rescheduled":
        return { label: "Rescheduled", variant: "secondary" as const };
      default:
        return { label: (status as string)?.replace(/_/g, " ") || "Unknown", variant: "secondary" as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} data-testid={`badge-status-${status}`}>
      {config.label}
    </Badge>
  );
}
