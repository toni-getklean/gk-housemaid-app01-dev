"use client";

import { Badge } from "@/components/ui/badge";

export type BookingStatus =
  | "needs_confirmation"
  | "for_review"
  | "pending_review"
  | "accepted"
  | "dispatched"
  | "on_the_way"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show"
  | "rescheduled";

interface StatusBadgeProps {
  status: BookingStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case "for_review":
      case "pending_review":
      case "needs_confirmation":
      case "rescheduled":
        return { label: (status as string).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), variant: "statusYellow" as const };
      case "dispatched":
      case "on_the_way":
      case "arrived":
      case "in_progress":
        return { label: (status as string).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), variant: "statusBlue" as const };
      case "accepted":
      case "completed":
        return { label: (status as string).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), variant: "statusGreen" as const };
      case "cancelled":
      case "no_show":
        return { label: (status as string).replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), variant: "statusRed" as const };
      default:
        return { label: (status as string)?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Unknown", variant: "secondary" as const };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} data-testid={`badge-status-${status}`}>
      {config.label}
    </Badge>
  );
}
