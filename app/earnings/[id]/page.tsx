"use client";

import { use } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, Wallet, Star, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

// ============================================
// GetKlean Financial Rules Configuration
// ============================================
// NCR Pricing Table - Fixed HM Rates (not percentage-based)
// 
// ONE-TIME BOOKING:
// Whole Day (₱1,390 total):
//   - Weekday: HM gets ₱650 fixed, GK gets ₱740
//   - Weekend: HM gets ₱715 (₱650 + 10% surge = ₱65), GK gets ₱675
//
// Half Day (₱1,090 total):
//   - Weekday: HM gets ₱510 fixed, GK gets ₱580
//   - Weekend: HM gets ₱561 (₱510 + 10% surge = ₱51), GK gets ₱529
//
// TRIAL BOOKING: 100% goes to Housemaid
//
// Transportation: 100% goes to Housemaid (always)
// ============================================

interface EarningData {
  earningId: string;
  housemaidId: string;
  type: string;
  bookingCode: string;
  clientPaidAmount: number; // Total amount paid by client
  serviceAmount: number;
  transportationAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentValidation: string;
  transactionDate: string;
  createdAt: string;
  clientName: string;
  location: string;
  serviceDate: string;
  serviceTime: string;
  bookingType: "OneTime" | "Flexi" | "Trial";
  serviceType: "WholeDay" | "HalfDay";
  isWeekend: boolean;
}

// Financial calculation helper
function calculateIncomeBreakdown(earning: EarningData) {
  // Base HM rates (fixed, not percentage)
  const baseRates = {
    WholeDay: 650,
    HalfDay: 510,
  };

  // Trial bookings: 100% to HM
  if (earning.bookingType === "Trial") {
    const hmServiceShare = earning.serviceAmount;
    return {
      hmServiceShare,
      hmSurgeBonus: 0,
      hmTransportation: earning.transportationAmount,
      hmTotalShare: hmServiceShare + earning.transportationAmount,
      gkShare: 0,
      surgeApplied: false,
      surgePercentage: 0,
    };
  }

  // Get base rate for service type
  const baseHmRate = baseRates[earning.serviceType] || baseRates.WholeDay;

  // Calculate surge (10% for weekend/holiday)
  const surgePercentage = earning.isWeekend ? 10 : 0;
  const surgeBonus = earning.isWeekend ? Math.round(baseHmRate * 0.10) : 0;

  // HM Share = Base Rate + Surge Bonus + Transportation (100%)
  const hmServiceShare = baseHmRate;
  const hmTotalShare = hmServiceShare + surgeBonus + earning.transportationAmount;

  // GK Share = Total Service Amount - HM Service Share - Surge Bonus
  // (Transportation is NOT included in GK calculation - it's 100% HM)
  const gkShare = earning.serviceAmount - hmServiceShare - surgeBonus;

  return {
    hmServiceShare,
    hmSurgeBonus: surgeBonus,
    hmTransportation: earning.transportationAmount,
    hmTotalShare,
    gkShare,
    surgeApplied: earning.isWeekend,
    surgePercentage,
  };
}

export default function EarningDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  // Expanded earning data with new fields for financial calculation
  const earningData: Record<string, EarningData> = {
    "1": {
      earningId: "ERN_001",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0225-5495",
      clientPaidAmount: 1390, // What client paid for service
      serviceAmount: 1390,
      transportationAmount: 150.5,
      totalAmount: 1540.5,
      paymentMethod: "Cash",
      paymentValidation: "completed",
      transactionDate: "2025-02-25", // Tuesday - Weekday
      createdAt: "2025-02-25 14:30:00",
      clientName: "Maria Santos",
      location: "123 Ayala Avenue, Makati City",
      serviceDate: "February 25, 2025",
      serviceTime: "9:00 AM - 12:00 PM",
      bookingType: "OneTime",
      serviceType: "WholeDay",
      isWeekend: false,
    },
    "2": {
      earningId: "ERN_002",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0225-5496",
      clientPaidAmount: 1090, // Half day
      serviceAmount: 1090,
      transportationAmount: 50,
      totalAmount: 1140,
      paymentMethod: "GCash",
      paymentValidation: "completed",
      transactionDate: "2025-02-22", // Saturday - Weekend
      createdAt: "2025-02-22 09:00:00",
      clientName: "Jose Reyes",
      location: "456 BGC, Taguig City",
      serviceDate: "February 22, 2025",
      serviceTime: "9:00 AM - 11:00 AM",
      bookingType: "OneTime",
      serviceType: "HalfDay",
      isWeekend: true, // Weekend!
    },
    "3": {
      earningId: "ERN_003",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0224-5480",
      clientPaidAmount: 1390,
      serviceAmount: 1390,
      transportationAmount: 100,
      totalAmount: 1490,
      paymentMethod: "Cash",
      paymentValidation: "completed",
      transactionDate: "2025-02-23", // Sunday - Weekend
      createdAt: "2025-02-23 15:00:00",
      clientName: "Ana Cruz",
      location: "789 Ortigas Center, Pasig City",
      serviceDate: "February 23, 2025",
      serviceTime: "3:00 PM - 6:00 PM",
      bookingType: "Flexi",
      serviceType: "WholeDay",
      isWeekend: true, // Weekend!
    },
    "4": {
      earningId: "ERN_004",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0228-5512",
      clientPaidAmount: 650, // Trial - Whole Day
      serviceAmount: 650,
      transportationAmount: 80,
      totalAmount: 730,
      paymentMethod: "Bank Transfer",
      paymentValidation: "pending",
      transactionDate: "2025-02-28",
      createdAt: "2025-02-28 10:00:00",
      clientName: "Carlos Mendoza",
      location: "321 Quezon City",
      serviceDate: "February 28, 2025",
      serviceTime: "10:00 AM - 1:00 PM",
      bookingType: "Trial",
      serviceType: "WholeDay",
      isWeekend: false,
    },
  };

  const earning = earningData[id];

  if (!earning) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Earning not found</p>
      </div>
    );
  }

  // Calculate income breakdown
  const breakdown = calculateIncomeBreakdown(earning);
  const pointsEarned = earning.bookingType === "Flexi" ? 300 : 150;

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
                variant={earning.paymentValidation === "completed" ? "default" : "secondary"}
                className={earning.paymentValidation === "completed"
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}
                data-testid="badge-payment-status"
              >
                {earning.paymentValidation === "completed" ? "Payment Completed" : "Payment Pending"}
              </Badge>
              {breakdown.surgeApplied && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100" data-testid="badge-weekend-surge">
                  Weekend +10%
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Income Breakdown Card - NEW */}
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
                      SERVICE FEE + TRANSPO
                    </p>
                  </div>
                  <p className="text-xl font-bold text-blue-600" data-testid="text-hm-share">
                    ₱{breakdown.hmTotalShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                {/* Breakdown details */}
                <div className="mt-2 ml-0 bg-white/60 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Base Service Rate ({earning.serviceType === "WholeDay" ? "Whole Day" : "Half Day"})</span>
                    <span className="text-gray-700 font-medium">₱{breakdown.hmServiceShare.toLocaleString()}</span>
                  </div>
                  {breakdown.surgeApplied && (
                    <div className="flex justify-between text-xs">
                      <span className="text-orange-600">Weekend Surge (+{breakdown.surgePercentage}%)</span>
                      <span className="text-orange-600 font-medium">+₱{breakdown.hmSurgeBonus.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Transportation Fee</span>
                    <span className="text-gray-700 font-medium">₱{breakdown.hmTransportation.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                  </div>
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
                    ₱{breakdown.gkShare.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 pt-3">
              {/* Points Earned - Moved here from Payment Information */}
              <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {earning.paymentValidation === "completed" ? "Points Earned" : "Points to be Earned"}
                    </p>
                    <p className="text-xs text-gray-500">{earning.bookingType} Booking Bonus</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-teal-600" data-testid="text-points-earned">
                  +{pointsEarned} pts
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
                  {earning.bookingType}
                </p>
                <Badge variant="outline" className="text-xs">
                  {earning.serviceType === "WholeDay" ? "Whole Day" : "Half Day"}
                </Badge>
              </div>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Client Paid</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-client-paid">
                ₱{earning.clientPaidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">+ Transportation</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-transportation-amount">
                ₱{earning.transportationAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-900">Total Transaction</p>
              <p className="text-sm font-bold text-gray-900" data-testid="text-total-breakdown">
                ₱{earning.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Information - Points removed, kept payment details */}
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
                  {earning.paymentMethod}
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
                  {earning.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Service Date</p>
                <p className="text-sm text-gray-900" data-testid="text-service-date">
                  {earning.serviceDate}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-600 mb-1">Service Time</p>
                <p className="text-sm text-gray-900" data-testid="text-service-time">
                  {earning.serviceTime}
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
