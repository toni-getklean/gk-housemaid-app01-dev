import { Card } from "@/components/ui/card";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { Booking } from "@/lib/database";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import serviceFeeQr from "@/assets/images/service-fee-qr-ph.png";

interface BookingPaymentTabProps {
    booking: Booking;
}

export function BookingPaymentTab({ booking }: BookingPaymentTabProps) {
    const { paymentMethod, totalAmount, settlementTypeCode, transportPaymentStatus } = booking;
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [hasTransportFeeBeenPaid, setHasTransportFeeBeenPaid] = useState(transportPaymentStatus === "PAYMENT_RECEIVED");

    // Update local state if prop changes (e.g. after refresh)
    if (transportPaymentStatus === "PAYMENT_RECEIVED" && !hasTransportFeeBeenPaid) {
        setHasTransportFeeBeenPaid(true);
    }

    const [hasServiceFeeBeenPaid, setHasServiceFeeBeenPaid] = useState(booking.paymentStatusCode === "PAYMENT_RECEIVED");

    const isPayToHousemaid = paymentMethod === "CASH" && settlementTypeCode === "DIRECT_TO_HM";
    const isServiceFeePaid = booking.paymentStatusCode === "PAYMENT_RECEIVED" || hasServiceFeeBeenPaid;
    const isTransportFeePaid = transportPaymentStatus === "PAYMENT_RECEIVED" || hasTransportFeeBeenPaid;
    const isFullyPaid = isServiceFeePaid && isTransportFeePaid;

    const handleServiceFeePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bookings/${booking.bookingCode}/pay-service-fee`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Payment failed");

            toast({ title: "Success", description: "Service Fee marked as paid." });
            setHasServiceFeeBeenPaid(true);
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update payment status.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleTransportFeePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bookings/${booking.bookingCode}/pay-transport-fee`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Payment failed");

            toast({ title: "Success", description: "Transport Fee marked as paid." });
            setHasTransportFeeBeenPaid(true);
            router.refresh();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update payment status.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Card className="p-4">
                <h2 className="text-lg font-semibold text-teal mb-4">
                    Pricing Specification
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="text-sm font-medium text-gray-900">
                            {booking.location || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Tier</p>
                        <div className="mt-1">
                            <Badge variant="outline">
                                {booking.tierCode?.replace(/_/g, " ") || "N/A"}
                            </Badge>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Booking Type</p>
                        <p className="text-sm font-medium text-gray-900">
                            {booking.bookingTypeCode?.replace(/_/g, " ") || "N/A"}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="text-sm font-medium text-gray-900">
                            {booking.duration?.replace(/_/g, " ") || "N/A"}
                        </p>
                    </div>
                </div>
            </Card>

            {isPayToHousemaid ? (
                <div className="space-y-4">
                    {/* Reminder Banner */}
                    {!isFullyPaid && (
                        <Alert variant="destructive" className="bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertTitle className="text-yellow-800">Payment Pending</AlertTitle>
                            <AlertDescription className="text-yellow-700">
                                {!isServiceFeePaid && !isTransportFeePaid
                                    ? "Please complete both Service Fee and Transport Fee payments."
                                    : !isServiceFeePaid
                                        ? "Please complete the Service Fee payment."
                                        : "Please complete the Transport Fee payment."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="p-4">
                        <Tabs defaultValue={!isServiceFeePaid ? "service-fee" : "transport-fee"} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="service-fee">Service Fee</TabsTrigger>
                                <TabsTrigger value="transport-fee">Transport Fee</TabsTrigger>
                            </TabsList>

                            {/* Service Fee Content */}
                            <TabsContent value="service-fee" className="space-y-4 pt-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Service Fee</p>
                                    <h3 className="text-3xl font-bold text-gray-900">₱{totalAmount || "0.00"}</h3>
                                </div>

                                <Card className="p-6 flex flex-col items-center justify-center bg-white border-dashed">
                                    <div className="w-full mb-4">
                                        <Image
                                            src={serviceFeeQr}
                                            alt="Service Fee QR Code"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-1 mb-4">Scan using GCash or Maya</p>
                                    <div className="w-full border-t border-gray-100 pt-3 mt-1 text-center space-y-1">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Or Transfer To</p>
                                        <p className="text-sm text-gray-700">Bank: Netbank (A Rural Bank), Inc</p>
                                        <p className="text-sm font-semibold text-gray-900">Account Name: Getklean Inc</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                Account number: 038-000-01238-0
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <p className="text-xs text-blue-700">
                                        {isServiceFeePaid
                                            ? "Service Fee Paid — Confirmation in Progress"
                                            : "This payment covers the platform service only. Transport fee is paid separately."}
                                    </p>
                                </Alert>

                                {isServiceFeePaid ? (
                                    <div className="w-full bg-green-50 text-green-700 p-2 rounded text-center text-sm font-medium border border-green-200">
                                        <CheckCircle2 className="inline-block mr-2 h-4 w-4" /> Service Fee Paid
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleServiceFeePayment}
                                        disabled={isLoading || booking.statusCode !== 'completed'}
                                        className="w-full bg-teal hover:bg-teal/90"
                                    >
                                        Customer Paid the Service Fee
                                    </Button>
                                )}
                            </TabsContent>

                            {/* Transport Fee Content */}
                            <TabsContent value="transport-fee" className="space-y-4 pt-4">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500 mb-1">Transport Fee</p>
                                    <h3 className="text-3xl font-bold text-gray-900">₱{booking.totalTransportationCost || "0.00"}</h3>
                                </div>

                                <Card className="p-6 flex flex-col items-center justify-center bg-white border-dashed">
                                    <div className="w-full mb-4">
                                        <Image
                                            src={serviceFeeQr}
                                            alt="Transport Fee QR Code"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center mt-1 mb-4">Scan using GCash or Maya</p>
                                    <div className="w-full border-t border-gray-100 pt-3 mt-1 text-center space-y-1">
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Or Transfer To</p>
                                        <p className="text-sm font-semibold text-gray-900">GCash</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                                {booking.gcashNumber || "No GCash number registered"}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                <Alert className="bg-green-50 border-green-200">
                                    <p className="text-xs text-green-700">
                                        {isTransportFeePaid
                                            ? "Transportation payment has been received by the housemaid."
                                            : "This payment goes directly to the housemaid and is not collected by the platform."}
                                    </p>
                                </Alert>

                                {isTransportFeePaid ? (
                                    <div className="w-full bg-green-50 text-green-700 p-2 rounded text-center text-sm font-medium border border-green-200">
                                        <CheckCircle2 className="inline-block mr-2 h-4 w-4" /> Transport Fee Paid
                                    </div>
                                ) : (
                                    <Button
                                        onClick={handleTransportFeePayment}
                                        disabled={isLoading || booking.statusCode !== 'completed'}
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        Mark Transport Fee as Paid
                                    </Button>
                                )}
                            </TabsContent>
                        </Tabs>
                    </Card>
                </div>
            ) : (
                /* Fallback / Original View for Non-Split Payment */
                <>
                    {!isPayToHousemaid && (
                        <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">PAID ONLINE / OFFICE</AlertTitle>
                            <AlertDescription className="text-green-700">
                                Do not collect payment from the client directly.
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
                                    {isPayToHousemaid ? "Housemaid" : "Office/Online"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Payment Method</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {paymentMethod?.replace(/_/g, " ").toUpperCase() || "N/A"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Settlement</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {settlementTypeCode?.replace(/_/g, " ") || "N/A"}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Payment Status </span>
                                <div className="mt-1">
                                    <Badge variant={booking.paymentStatusCode === 'PAYMENT_RECEIVED' ? 'default' : 'secondary'}>
                                        {booking.paymentStatusCode?.replace(/_/g, " ") || "PENDING"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="border-t pt-3 mt-3">
                                {booking.statusCode === 'completed' && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Transport Cost</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            ₱{booking.totalTransportationCost || "0.00"}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-base font-semibold text-gray-900">
                                        Total Amount Due
                                    </span>
                                    <span
                                        className={`text-lg font-bold ${isPayToHousemaid ? "text-red-600" : "text-teal"
                                            }`}
                                    >
                                        ₱{totalAmount || "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </>
            )}

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
