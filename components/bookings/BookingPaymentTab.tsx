import { Card } from "@/components/ui/card";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Booking } from "@/lib/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BookingPaymentTabProps {
    booking: Booking;
}

// TODO: Payment fields (payment_method, total_amount) need to be added to the
// BookingWithParsedFields type and fetched via a JOIN with bookingPayments table.
// For now, casting as any to allow the component to compile.

export function BookingPaymentTab({ booking }: BookingPaymentTabProps) {
    const { paymentMethod, totalAmount } = booking;
    const isCashPayment = paymentMethod === "cash_to_hm";
    const isOnlinePayment = [
        "aub",
        "gcash",
        "other_bank",
        "credit_card",
        "cash_to_office",
        "pdc",
        "bank_transfer"
    ].includes(paymentMethod || "");

    return (
        <div className="space-y-4">
            {/* Payment Method Banners */}
            {isCashPayment && (
                <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />

                    <AlertTitle className="text-yellow-800">COLLECT PAYMENT</AlertTitle>
                    <AlertDescription className="text-yellow-700">
                        Please collect payment from the client upon completion.
                    </AlertDescription>
                </Alert>
            )}

            {isOnlinePayment && (
                <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">PAID ONLINE</AlertTitle>
                    <AlertDescription className="text-green-700">
                        Do not collect payment. Client has paid online/to office.
                    </AlertDescription>
                </Alert>
            )}

            <Card className="p-4">
                <h2 className="text-lg font-semibold text-teal mb-4">
                    Payment Summary
                </h2>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pay To</span>
                        <span className="text-sm font-medium text-gray-900">
                            {paymentMethod === "cash_to_hm"
                                ? "Housemaid"
                                : "Office/Online"}
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Payment Method</span>
                        <span className="text-sm font-medium text-gray-900">
                            {paymentMethod?.replace(/_/g, " ").toUpperCase() || "N/A"}
                        </span>
                    </div>

                    <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-base font-semibold text-gray-900">
                                Total Amount Due
                            </span>
                            <span
                                className={`text-lg font-bold ${isCashPayment ? "text-red-600" : "text-teal"
                                    }`}
                            >
                                ₱{totalAmount || "0.00"}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-4 bg-gray-50 border-none">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                    Payment Terms
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                    Payment will be received after successful completion of service. Please
                    ensure all tasks are completed to the client's satisfaction before
                    leaving the premises.
                </p>
            </Card>
        </div>
    );
}
