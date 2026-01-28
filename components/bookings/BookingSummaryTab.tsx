import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, ClipboardList, Star } from "lucide-react";
import { format } from "date-fns";
import { Booking } from "@/lib/database";
import { ProofOfArrivalCard } from "./ProofOfArrivalCard";

interface BookingSummaryTabProps {
    booking: Booking;
    onUploadSuccess?: () => void;
    onReschedule: () => void;
}

const POINTS_MAP: Record<string, number> = {
    "TRIAL": 150,
    "ONE_TIME": 150,
    "FLEXI": 300
};

export function BookingSummaryTab({ booking, onUploadSuccess, onReschedule }: BookingSummaryTabProps) {
    const getStatusLabel = (status: string) => {
        switch (status) {
            case "pending_review":
                return "For Review";
            case "accepted":
                return "Accepted";
            case "dispatched":
                return "Dispatched";
            case "on_the_way":
                return "On The Way";
            case "arrived":
                return "Arrived";
            case "in_progress":
                return "In Progress";
            case "completed":
                return "Completed";
            default:
                return status.replace(/_/g, " ");
        }
    };

    const pointsAwarded = booking.asensoPointsAwarded || 0;
    const estimatedPoints = POINTS_MAP[booking.bookingTypeCode || "ONE_TIME"] || 150;
    const isCancelled = booking.statusCode === "cancelled";

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-teal">Booking Summary</h2>
                    <Badge variant="secondary" data-testid="badge-status">
                        {getStatusLabel(booking.statusCode)}
                    </Badge>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-600">Created on</p>
                        <p className="text-sm font-medium text-gray-900">
                            {booking.bookingDate
                                ? format(new Date(booking.bookingDate), "MM/dd/yyyy")
                                : "N/A"}
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Service Details
                        </h3>

                        <div className="space-y-3">
                            {pointsAwarded > 0 ? (
                                <div className="flex items-start gap-3">
                                    <Star className="h-5 w-5 text-yellow fill-yellow flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Asenso Points Earned</p>
                                        <p className="text-sm font-bold text-teal">
                                            +{pointsAwarded} pts
                                        </p>
                                    </div>
                                </div>
                            ) : !isCancelled && (
                                <div className="flex items-start gap-3">
                                    <Star className="h-5 w-5 text-gray-400 fill-gray-100 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Points to be earned</p>
                                        <p className="text-sm font-bold text-gray-500">
                                            +{estimatedPoints} pts
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                <CalendarIcon className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Booking date</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {booking.serviceDate
                                            ? format(new Date(booking.serviceDate), "MM/dd/yyyy")
                                            : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Time</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {booking.time}
                                    </p>
                                    {(booking.statusCode === "accepted" || booking.statusCode === "dispatched") && (
                                        <button
                                            onClick={onReschedule}
                                            className="text-xs text-teal hover:text-teal-hover hover:underline mt-1 font-medium"
                                        >
                                            Reschedule Booking
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Service duration</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {/* TODO: Calculate duration based on service type or time */}
                                    {booking.serviceTypeCode?.replace(/_/g, " ")}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-600">Service type</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {booking.serviceTypeCode?.replace(/_/g, " ")}
                                </p>
                            </div>

                            {booking.duration && (
                                <div>
                                    <p className="text-sm text-gray-600">Duration</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <Badge variant="outline">
                                            {booking.duration.replace(/_/g, " ")}
                                        </Badge>
                                    </div>
                                </div>
                            )}

                            {booking.notes && (
                                <div className="mt-4 bg-gray-50 p-3 rounded-md">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                        Instructions
                                    </p>
                                    <p className="text-sm text-gray-600">{booking.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Card>
            <ProofOfArrivalCard booking={booking} onUploadSuccess={onUploadSuccess} />
        </div>
    );
}
