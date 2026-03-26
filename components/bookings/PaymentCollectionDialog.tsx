import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/database";
import { AlertCircle, CheckCircle2, Banknote, Bus } from "lucide-react";

interface PaymentCollectionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    booking: Booking;
    onGoToPaymentTab: () => void;
}

export function PaymentCollectionDialog({
    isOpen,
    onClose,
    booking,
    onGoToPaymentTab,
}: PaymentCollectionDialogProps) {
    const PAID_STATUSES = ["PAYMENT_RECEIVED", "PAYMENT_UNDER_VERIFICATION", "PAYMENT_VERIFIED"];
    const isServiceFeePaid = booking.paymentStatusCode
        ? PAID_STATUSES.includes(booking.paymentStatusCode)
        : false;

    const isPayToHousemaid = booking.settlementTypeCode === "DIRECT_TO_HM";

    // Service fee needs collection only if it's cash/direct AND not yet paid
    const needsServiceFeeCollection = isPayToHousemaid && !isServiceFeePaid;

    const handleGoToPayment = () => {
        onClose();
        onGoToPaymentTab();
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { /* Blocking: prevent closing via overlay */ }}>
            <DialogContent
                className="max-w-sm mx-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                // Hide the default close (X) button via CSS
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                        <Banknote className="h-6 w-6 text-amber-600" />
                    </div>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        Collect Payment from Customer
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                        Review the booking payment and collect from the customer before leaving.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-3 space-y-3">
                    {/* A. Service Fee */}
                    <div
                        className={`rounded-lg border p-3 ${needsServiceFeeCollection
                            ? "border-amber-200 bg-amber-50"
                            : "border-green-200 bg-green-50"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${needsServiceFeeCollection
                                    ? "bg-amber-100"
                                    : "bg-green-100"
                                    }`}
                            >
                                {needsServiceFeeCollection ? (
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">
                                        A. Service Fee
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        ₱{booking.totalAmount || "0.00"}
                                    </p>
                                </div>
                                {needsServiceFeeCollection ? (
                                    <p className="text-xs text-amber-700 mt-1 font-medium">
                                        ⚠ Not yet paid — Collect from customer
                                    </p>
                                ) : isServiceFeePaid ? (
                                    <p className="text-xs text-green-700 mt-1 font-medium">
                                        ✅ Already paid to company — No collection needed
                                    </p>
                                ) : (
                                    <p className="text-xs text-green-700 mt-1 font-medium">
                                        ✅ Paid online/office — Do not collect
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* B. Transport Fee */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                <Bus className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-gray-900">
                                        B. Transport Fee
                                    </p>
                                    <p className="text-sm font-bold text-gray-900">
                                        ₱{booking.totalTransportationCost || "0.00"}
                                    </p>
                                </div>
                                <p className="text-xs text-amber-700 mt-1 font-medium">
                                    🚌 Always collected directly — Collect from customer
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* C. Extension Fee */}
                    {(booking.extendedHours ?? 0) > 0 && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                    <Banknote className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-gray-900">
                                            C. Extension Fee (+{booking.extendedHours}h)
                                        </p>
                                        <p className="text-sm font-bold text-gray-900">
                                            ₱{Number(booking.extensionAmount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                    <p className="text-xs text-blue-700 mt-1 font-medium">
                                        🕒 Direct payment — Collect from customer
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Reminder Note */}
                    <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            <span className="font-semibold text-gray-800">Reminder:</span>{" "}
                            Always check if the service fee was already paid before collecting.
                            Transport fee is always collected directly from the customer.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col gap-2 sm:flex-col">
                    <Button
                        onClick={handleGoToPayment}
                        className="w-full bg-teal hover:bg-teal-hover text-white h-11 text-sm font-semibold"
                    >
                        Go to Payment Tab
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-700 text-xs h-9"
                    >
                        I've already collected — Dismiss
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
