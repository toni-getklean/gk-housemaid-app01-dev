import { Card } from "@/components/ui/card";
import { User, Phone, MapPin } from "lucide-react";
import { Booking } from "@/lib/database";
import { ClientRating } from "./ClientRating";


interface BookingClientTabProps {
    booking: Booking;
}

export function BookingClientTab({ booking }: BookingClientTabProps) {
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h2 className="text-lg font-semibold text-teal mb-4">
                    Client Information
                </h2>

                <div className="space-y-4">
                    <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Client Name</p>
                            <p className="text-sm font-medium text-gray-900">
                                {booking.customerName}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-gray-600">Mobile Number</p>
                            <a
                                href={`tel:${booking.contactNumber}`}
                                className="text-sm font-medium text-teal hover:underline"
                            >
                                {booking.contactNumber || "N/A"}
                            </a>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex items-start gap-3 mb-3">
                            <MapPin className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-gray-600">Address</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {booking.address}
                                </p>
                                {booking.city && (
                                    <p className="text-sm text-gray-500">{booking.city}</p>
                                )}
                            </div>
                        </div>

                        {booking.landmark && (
                            <div className="ml-8 mt-2">
                                <p className="text-sm text-gray-600">Landmark</p>
                                <p className="text-sm font-medium text-gray-900">
                                    {booking.landmark}
                                </p>
                            </div>
                        )}

                        {/* Map Placeholder */}
                        <div className="mt-4 h-40 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                            <div className="text-center">
                                <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">Map View</p>
                                {booking.addressLink && (
                                    <a
                                        href={booking.addressLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-teal hover:underline mt-1 block"
                                    >
                                        Open in Google Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {booking.statusCode === "completed" && (
                <ClientRating bookingCode={booking.bookingCode || ""} />
            )}
        </div>
    );
}
