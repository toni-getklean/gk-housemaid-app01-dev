import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { PaymentCollectionDialog } from "./PaymentCollectionDialog";
import { TransportRequiredDialog } from "./TransportRequiredDialog";

interface BookingActionFooterProps {
    booking: Booking;
    onStatusUpdate: (newStatus: string, reason?: string) => Promise<void>;
    activeTab?: string;
    onReschedule: () => void;
    onSwitchToPaymentTab?: () => void;
    onSwitchToTransportTab?: () => void;
}

export function BookingActionFooter({
    booking,
    onStatusUpdate,
    activeTab,
    onReschedule,
    onSwitchToPaymentTab,
    onSwitchToTransportTab,
}: BookingActionFooterProps) {
    if (activeTab === "transport") return null;

    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    // showRescheduleModal moved to parent
    const [cancelReason, setCancelReason] = useState("");
    // rescheduleDate/Time moved to parent
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [declineReason, setDeclineReason] = useState("");
    const [customDeclineNote, setCustomDeclineNote] = useState("");
    const [showPaymentCollectionDialog, setShowPaymentCollectionDialog] = useState(false);
    const [transportDialogVariant, setTransportDialogVariant] = useState<"commute_to_client" | "return_fare" | null>(null);

    const DECLINE_REASONS = [
        { code: "NOT_AVAILABLE", label: "Not Available" },
        { code: "SCHEDULE_CONFLICT", label: "Schedule Conflict" },
        { code: "LOCATION_TOO_FAR", label: "Location Too Far" },
        { code: "PERSONAL_REASON", label: "Personal Reason" },
        { code: "OTHER", label: "Other" },
    ];

    const getLocationMetadata = async (): Promise<string> => {
        if (!navigator.geolocation) {
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                error: "Geolocation not supported",
            });
        }

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 5000,
                    enableHighAccuracy: true
                });
            });

            return JSON.stringify({
                timestamp: new Date().toISOString(),
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        } catch (error) {
            console.error("Location error:", error);
            return JSON.stringify({
                timestamp: new Date().toISOString(),
                error: "Location access denied or failed",
            });
        }
    };

    const handleAction = async (newStatus: string, payload?: any) => {
        setIsLoading(true);
        try {
            const metadata = await getLocationMetadata();

            // Construct payload merging metadata and any existing payload
            let finalPayload: any = { metadata };

            if (typeof payload === "string") {
                finalPayload.reason = payload;
            } else if (typeof payload === "object" && payload !== null) {
                finalPayload = { ...finalPayload, ...payload };
            }

            // For Decline action, we keep status as pending_review but pass reason
            await onStatusUpdate(newStatus, finalPayload);

            const isDecline = newStatus === "pending_review";
            const isCompleted = newStatus === "completed";

            if (isCompleted) {
                toast({
                    title: "Service Completed! 💰",
                    description: "Review booking payment and collect payment from customer.",
                });
                // Delay dialog so toast can display first without interference
                setTimeout(() => {
                    setShowPaymentCollectionDialog(true);
                }, 1500);
            } else {
                toast({
                    title: isDecline ? "Assignment Declined" : "Status Updated",
                    description: isDecline
                        ? "The booking has been returned for reassignment."
                        : "Booking status changed successfully.",
                });
            }

            if (isDecline) {
                router.push("/bookings");
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to update status. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            setShowCancelModal(false);
            // setShowRescheduleModal(false); // Handled by parent
            setShowDeclineModal(false);
        }
    };

    const handleDecline = () => {
        if (!declineReason) {
            toast({
                title: "Reason Required",
                description: "Please select a reason for declining.",
                variant: "destructive",
            });
            return;
        }

        // If 'Other' is selected, append the note if provided
        let finalReason = declineReason;
        if (declineReason === "OTHER" && customDeclineNote) {
            finalReason = `OTHER: ${customDeclineNote}`;
        }

        // Trigger update: keeping status 'pending_review' but sending reason
        // The API knows that pending_review + reason = decline action
        handleAction("pending_review", finalReason);
    };

    const renderButtons = () => {
        switch (booking.statusCode) {
            case "pending_review":
                // Check substatus rules
                // Show buttons ONLY if awaiting_housemaid_response or (legacy/seed default) null
                const canInteract = !booking.substatusCode || booking.substatusCode === "awaiting_housemaid_response";

                if (!canInteract) {
                    return (
                        <div className="w-full text-center p-4 bg-gray-100 rounded-lg text-gray-500 font-medium">
                            {booking.substatusCode === "reassignment_required" || booking.substatusCode === "housemaid_declined"
                                ? "Assignment Declined"
                                : "Awaiting Admin Review"}
                        </div>
                    );
                }

                return (
                    <div className="flex flex-col gap-3 w-full">
                        <Button
                            className="w-full bg-teal hover:bg-teal-hover text-white h-12 text-lg"
                            onClick={() => handleAction("accepted")}
                            disabled={isLoading}
                        >
                            Accept Booking
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="border-amber-200 text-amber-700 hover:bg-amber-50"
                                onClick={onReschedule}
                                disabled={isLoading}
                            >
                                Reschedule
                            </Button>
                            {/* Replaced Reschedule/Cancel with Decline as per requirements */}
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => setShowDeclineModal(true)}
                                disabled={isLoading}
                            >
                                Decline Assignment
                            </Button>
                        </div>
                    </div>
                );
            case "accepted":
                return (
                    <Button
                        className="w-full bg-teal hover:bg-teal-hover text-white"
                        onClick={() => handleAction("dispatched")}
                        disabled={isLoading}
                    >
                        Mark as Dispatched
                    </Button>
                );
            case "dispatched":
                return (
                    <Button
                        className="w-full bg-teal hover:bg-teal-hover text-white"
                        onClick={() => handleAction("on_the_way")}
                        disabled={isLoading}
                    >
                        Mark as On The Way
                    </Button>
                );
            case "on_the_way": // Mark as Arrived logic
                const canMarkArrived = !!booking.proofOfArrivalImg;
                const hasCommuteDetails = booking.transportationLegs?.some(
                    leg => leg.direction === "TO_CLIENT"
                );
                return (
                    <Button
                        className="w-full bg-teal hover:bg-teal-hover text-white"
                        onClick={() => {
                            if (!hasCommuteDetails) {
                                setTransportDialogVariant("commute_to_client");
                                return;
                            }
                            handleAction("arrived");
                        }}
                        disabled={isLoading || !canMarkArrived}
                        title={!canMarkArrived ? "Please upload proof of arrival first" : undefined}
                    >
                        Mark as Arrived
                    </Button>
                );
            case "arrived":
                return (
                    <Button
                        className="w-full bg-teal hover:bg-teal-hover text-white"
                        onClick={() => handleAction("in_progress")}
                        disabled={isLoading}
                    >
                        Start Service
                    </Button>
                );
            case "in_progress":
                return (
                    <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                            // Check for return details
                            const hasReturnDetails = booking.transportationLegs?.some(
                                leg => leg.direction === "RETURN"
                            );

                            if (!hasReturnDetails) {
                                setTransportDialogVariant("return_fare");
                                return;
                            }
                            handleAction("completed");
                        }}
                        disabled={isLoading}
                    >
                        Mark as Completed
                    </Button>
                );
            default:
                return null;
        }
    };

    const content = renderButtons();
    // Keep component mounted when a dialog is open (even if no action buttons to show)
    if (!content && !showPaymentCollectionDialog && !transportDialogVariant) return null;

    return (
        <>
            {content && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10 safe-area-bottom">
                    <div className="max-w-md mx-auto">{content}</div>
                </div>
            )}

            {/* Cancel/Decline Dialog */}
            <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Cancel Booking</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this booking? This action cannot be
                            undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Reason for cancellation (optional)"
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelModal(false)}
                            disabled={isLoading}
                        >
                            Back
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleAction("cancelled", cancelReason)}
                            disabled={isLoading}
                        >
                            Confirm Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Decline Assignment Dialog */}
            <Dialog open={showDeclineModal} onOpenChange={setShowDeclineModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Decline Assignment</DialogTitle>
                        <DialogDescription>
                            Select a reason for declining this booking. This will return the booking to the admin for reassignment.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                        <div className="flex flex-col gap-2">
                            {DECLINE_REASONS.map((reason) => (
                                <button
                                    key={reason.code}
                                    onClick={() => setDeclineReason(reason.code)}
                                    className={`p-3 rounded-md text-left text-sm border transition-all ${declineReason === reason.code
                                        ? "border-teal bg-teal/5 ring-1 ring-teal text-teal-700 font-medium"
                                        : "border-gray-200 hover:border-teal/50 hover:bg-gray-50 text-gray-700"
                                        }`}
                                >
                                    {reason.label}
                                </button>
                            ))}
                        </div>

                        {declineReason === "OTHER" && (
                            <Textarea
                                placeholder="Please specify reason..."
                                value={customDeclineNote}
                                onChange={(e) => setCustomDeclineNote(e.target.value)}
                                className="mt-2"
                            />
                        )}
                    </div>
                    <DialogFooter className="gap-3 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeclineModal(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDecline}
                            disabled={isLoading || !declineReason}
                        >
                            Confirm Decline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reschedule Dialog removed - handled by parent */}

            {/* Payment Collection Dialog - shown after booking completion */}
            <PaymentCollectionDialog
                isOpen={showPaymentCollectionDialog}
                onClose={() => setShowPaymentCollectionDialog(false)}
                booking={booking}
                onGoToPaymentTab={() => {
                    setShowPaymentCollectionDialog(false);
                    onSwitchToPaymentTab?.();
                }}
            />

            {/* Transport Required Dialog - shown when transport details are missing */}
            {transportDialogVariant && (
                <TransportRequiredDialog
                    isOpen={!!transportDialogVariant}
                    onClose={() => setTransportDialogVariant(null)}
                    variant={transportDialogVariant}
                    onGoToTransportTab={() => {
                        setTransportDialogVariant(null);
                        onSwitchToTransportTab?.();
                    }}
                />
            )}
        </>
    );
}
