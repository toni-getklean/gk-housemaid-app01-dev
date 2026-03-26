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
    hmExtensionEarnings?: number;
    extendedHours?: number;
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
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4" data-testid="card-earning-summary">
          <div className="text-center space-y-2 py-2">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest" data-testid="text-booking-code">
              {earning.bookingCode}
            </p>
            <p className="text-4xl font-bold text-gray-900" data-testid="text-total-amount">
              ₱{breakdown.hmTotalShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 font-medium">Your Total Earnings</p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <span
                className={`py-1 px-3 text-[10px] font-bold rounded-full uppercase tracking-widest ${earning.paymentStatusCode === "PAYMENT_RECEIVED"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"}`}
                data-testid="badge-payment-status"
              >
                {earning.paymentStatusCode === "PAYMENT_RECEIVED" ? "Received" : "Pending"}
              </span>
              {isWeekend && (
                 <span className="py-1 px-3 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700 uppercase tracking-widest" data-testid="badge-weekend-surge">
                  Weekend +10%
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Income Breakdown Card */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4" data-testid="card-income-breakdown">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Income Breakdown</h2>

          <div className="space-y-4 pt-1">
            {/* Your Share (HM) */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 min-h-[44px] bg-blue-500 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Your Share (HM)</p>
                    <p className="text-[10px] text-blue-600 uppercase tracking-widest font-semibold mt-0.5">
                      Base Service Rate
                    </p>
                  </div>
                  <p className="text-lg font-bold text-blue-600" data-testid="text-hm-share">
                    ₱{breakdown.hmServiceShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Surge Bonus */}
            {breakdown.hmSurgeBonus > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 min-h-[44px] bg-orange-400 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Surge Bonus</p>
                      <p className="text-[10px] text-orange-600 uppercase tracking-widest font-semibold mt-0.5">
                        WEEKEND/HOLIDAY
                      </p>
                    </div>
                    <p className="text-lg font-bold text-orange-600" data-testid="text-hm-surge">
                      ₱{breakdown.hmSurgeBonus.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Extension Bonus */}
            {(breakdown.hmExtensionEarnings ?? 0) > 0 && (
              <div className="flex items-start gap-3">
                <div className="w-1.5 min-h-[44px] bg-indigo-500 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Extension Earnings</p>
                      <p className="text-[10px] text-indigo-600 uppercase tracking-widest font-semibold mt-0.5">
                        +{breakdown.extendedHours} HR(S) ONSITE
                      </p>
                    </div>
                    <p className="text-lg font-bold text-indigo-600" data-testid="text-hm-extension">
                      ₱{breakdown.hmExtensionEarnings!.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Transportation Cost */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 min-h-[22px] bg-red-400 rounded-full shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Transportation Cost</p>
                  </div>
                  <p className="text-lg font-bold text-red-600" data-testid="text-transpo-allowance">
                    ₱{parseFloat(earning.transportationAmount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Company Share (GK) */}
            <div className="flex items-start gap-3">
              <div className="w-1.5 min-h-[44px] bg-gray-300 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-700 text-sm">Company Share (GK)</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">
                      PLATFORM FEE
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-500" data-testid="text-gk-share">
                    ₱{breakdown.companyShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 pt-4">
              {/* Points Earned */}
              <div className="flex items-center justify-between bg-teal/5 border border-teal/10 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-none">
                      {earning.paymentStatusCode === "PAYMENT_RECEIVED" ? "Points Earned" : "Points to be Earned"}
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-teal mt-1 font-bold">{earning.bookingDetails.type} Booking Bonus</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-teal">
                  <p className="text-xl font-bold" data-testid="text-points-earned">
                    +{earning.pointsEarned || 0}
                  </p>
                  <span className="text-[10px] font-bold uppercase tracking-widest mt-1">PTS</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-gray-50 p-3 rounded-lg border-l-2 border-gray-300 mt-2">
                <p className="text-xs text-gray-600 leading-relaxed">
                  <span className="font-semibold">Note:</span> Weekend surge (+10%), extension earnings, and transportation costs are fully credited to your account.
                </p>
            </div>
          </div>
        </Card>

        {/* Transaction Details */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4" data-testid="card-transaction-details">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Transaction Details</h2>
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-500 font-medium">Earning ID</p>
              <p className="font-semibold text-gray-900 font-mono text-xs bg-gray-50 px-2 py-0.5 rounded" data-testid="text-earning-id">
                {earning.earningId}
              </p>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-500 font-medium">Booking Type</p>
              <p className="font-semibold text-gray-900 capitalize" data-testid="text-booking-type">
                {earning.bookingDetails.type.toLowerCase()}
              </p>
            </div>
            <div className="border-t border-gray-100" />

            {/* Client Payment */}
            <div className="flex justify-between items-center text-sm">
              <p className="text-gray-900 font-semibold">Client Payment</p>
              <p className="font-bold text-gray-900" data-testid="text-client-paid">
                ₱{earning.clientPaidAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
              </p>
            </div>

            {/* Deductions (Company Share) */}
            <div className="flex justify-between items-center text-sm text-red-600">
              <p className="font-semibold">Less: Company Share</p>
              <p className="font-bold" data-testid="text-company-share-deduction">
                - ₱{breakdown.companyShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-1" />

            {/* Net Earnings */}
            <div className="flex justify-between items-center">
              <p className="text-sm font-bold text-blue-600">Your Net Earnings</p>
              <p className="text-lg font-bold text-blue-600" data-testid="text-total-breakdown">
                ₱{earning.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Information */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4" data-testid="card-payment-info">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Payment Information</h2>
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Payment Method</p>
                <p className="text-sm font-bold text-gray-900 capitalize leading-none" data-testid="text-payment-method">
                  {earning.paymentMethodCode.replace(/_/g, " ").toLowerCase()}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-0.5">Transaction Date</p>
                <p className="text-sm font-bold text-gray-900 leading-none" data-testid="text-transaction-date">
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
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4" data-testid="card-booking-details">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Booking Information</h2>
          <div className="space-y-4 pt-1">
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1.5">Client Name</p>
              <p className="text-sm font-bold text-gray-900 leading-none" data-testid="text-client-name">
                {earning.clientName}
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-teal" />
              </div>
              <div className="flex-1 py-0.5">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Location</p>
                <p className="text-sm font-medium text-gray-900 leading-tight" data-testid="text-location">
                  {earning.bookingDetails.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                  <Calendar className="h-5 w-5 text-teal" />
              </div>
              <div className="flex-1 py-0.5">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Service Date</p>
                <p className="text-sm font-medium text-gray-900" data-testid="text-service-date">
                  {new Date(earning.bookingDetails.serviceDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5 text-teal" />
              </div>
              <div className="flex-1 py-0.5">
                <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Service Time</p>
                <p className="text-sm font-medium text-gray-900" data-testid="text-service-time">
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
