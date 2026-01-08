"use client";

import { Card } from "@/components/ui/card";
import { StatusBadge, BookingStatus } from "./StatusBadge";
import { ChevronRight, MapPin, Clock, User } from "lucide-react";

interface BookingCardProps {
  id: string;
  clientName: string;
  location: string;
  time: string;
  date?: string;
  status: BookingStatus;
  onClick?: () => void;
}

export function BookingCard({ id, clientName, location, time, date, status, onClick }: BookingCardProps) {
  return (
    <Card
      className="p-4 cursor-pointer"
      onClick={onClick}
      data-testid={`card-booking-${id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <StatusBadge status={status} />
            {date && <span className="text-xs text-gray-500 font-medium">{date}</span>}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{clientName}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="line-clamp-1">{location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{time}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </Card>
  );
}
