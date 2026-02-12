"use client";

import { use } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, Wallet, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

interface EarningDetails {
  earningId: string;
  bookingCode: string;
  clientName: string;
  clientPaidAmount: number;
  totalAmount: number; // HM Share + Transpo
  paymentMethodCode: string;
  paymentStatusCode: string;
  transactionDate: string;
  serviceAmount: string; // HM Share Base + Surge
  transportationAmount: string;
  pointsEarned: number;

  // Calculation breakdown from backend
  calculation: {
    hmServiceShare: number;
    hmSurgeBonus: number;
    hmTransportation: number;
    hmTotalShare: number;
    companyShare: number;
  };

  bookingDetails: {
    serviceDate: string;
    serviceTime: string;
    location: string;
    type: string;
    duration: string;
  };
}





export default function EarningDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const { data: earning, isLoading, error } = useQuery({
    queryKey: ["earning", id],
    queryFn: async () => {
      const res = await fetch(`/api/earnings/${id}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch earning details");
      }
      return res.json() as Promise<EarningDetails>;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading earning details...</p>
      </div>
    );
  }

  if (error || !earning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Earning not found</p>
      </div>
    );
  }

  // Use calculation from backend
  const breakdown = earning.calculation;

  // Prepare display values
  const isWeekend = breakdown.hmSurgeBonus > 0;
  const surgePercentage = 10; // This could also be dynamic from backend if needed

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Earning Details"
        showBack={true}
        onBackClick={() => router.push("/earnings")}
      />

      <div className="p-4 space-y-4">
        {/* Earning Summary Card */}
        <Card className="p-6" data-testid="card-earning-summary">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-blue" data-testid="text-booking-code">
              {earning.bookingCode}
            </p>
            <p className="text-4xl font-bold text-gray-900" data-testid="text-total-amount">
              ₱{breakdown.hmTotalShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500">Your Total Earnings</p>
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={earning.paymentStatusCode === "PAYMENT_RECEIVED" ? "default" : "secondary"}
                className={earning.paymentStatusCode === "PAYMENT_RECEIVED"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}
                data-testid="badge-payment-status"
              >
                {earning.paymentStatusCode === "PAYMENT_RECEIVED" ? "Payment Received" : "Payment Pending"}
              </Badge>
              {isWeekend && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100" data-testid="badge-weekend-surge">
                  Weekend +10%
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Income Breakdown Card */}
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30" data-testid="card-income-breakdown">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Income Breakdown</h2>

          <div className="space-y-4">
            {/* Your Share (HM) */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full min-h-[48px] bg-blue-500 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-gray-900">Your Share (HM)</p>
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium">
                      Base Service Rate
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600" data-testid="text-hm-share">
                    ₱{breakdown.hmTotalShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

              </div>
            </div>

            {/* Transportation Fee */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full min-h-[48px] bg-gray-300 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-gray-700">Transportation Fee</p>
                  </div>
                  <p className="text-xl font-bold text-gray-500" data-testid="text-gk-share">
                    ₱{parseFloat(earning.transportationAmount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Share (GK) */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-full min-h-[48px] bg-gray-300 rounded-full" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-base font-semibold text-gray-700">Company Share (GK)</p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                      PLATFORM FEE
                    </p>
                  </div>
                  <p className="text-xl font-bold text-gray-500" data-testid="text-gk-share">
                    ₱{breakdown.companyShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-3">
              {/* Points Earned */}
              <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {earning.paymentStatusCode === "PAYMENT_RECEIVED" ? "Points Earned" : "Points to be Earned"}
                    </p>
                    <p className="text-xs text-gray-500">{earning.bookingDetails.type} Booking Bonus</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-teal-600" data-testid="text-points-earned">
                  +{earning.pointsEarned || 0} pts
                </p>
              </div>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 italic pt-2">
              Note: Weekend surge (+10%) and transportation allowances are fully credited to your account.
            </p>
          </div>
        </Card>

        {/* Transaction Details */}
        <Card className="p-6" data-testid="card-transaction-details">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Earning ID</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-earning-id">
                {earning.earningId}
              </p>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Booking Type</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900" data-testid="text-booking-type">
                  {earning.bookingDetails.type}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200" />

            {/* Client Payment */}
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-900 font-medium">Client Payment</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-client-paid">
                ₱{earning.clientPaidAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>

            {/* Deductions (Company Share) */}
            <div className="flex justify-between items-center text-red-600">
              <p className="text-sm">Less: Company Share</p>
              <p className="text-sm font-medium" data-testid="text-company-share-deduction">
                - ₱{breakdown.companyShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-gray-200" />

            {/* Net Earnings */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-blue-600">Your Net Earnings</p>
              <p className="text-sm font-bold text-blue-600" data-testid="text-total-breakdown">
                ₱{earning.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="p-6" data-testid="card-payment-info">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Payment Method</p>
                <p className="text-sm font-medium text-gray-900" data-testid="text-payment-method">
                  {earning.paymentMethodCode}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Transaction Date</p>
                <p className="text-sm font-medium text-gray-900" data-testid="text-transaction-date">
                  {new Date(earning.transactionDate).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Details */}
        <Card className="p-6" data-testid="card-booking-details">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-900" data-testid="text-client-name">
                {earning.clientName}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Location</p>
                <p className="text-sm text-gray-900" data-testid="text-location">
                  {earning.bookingDetails.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Service Date</p>
                <p className="text-sm text-gray-900" data-testid="text-service-date">
                  {new Date(earning.bookingDetails.serviceDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Service Time</p>
                <p className="text-sm text-gray-900" data-testid="text-service-time">
                  {earning.bookingDetails.serviceTime} ({earning.bookingDetails.duration})
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
