"use client";

import { use } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Calendar, Wallet, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EarningDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const earningData: Record<string, {
    earningId: string;
    housemaidId: string;
    type: string;
    bookingCode: string;
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
  }> = {
    "1": {
      earningId: "ERN_001",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0225-5495",
      serviceAmount: 3000,
      transportationAmount: 150.5,
      totalAmount: 3150.5,
      paymentMethod: "Cash",
      paymentValidation: "completed",
      transactionDate: "2025-02-25",
      createdAt: "2025-02-25 14:30:00",
      clientName: "Maria Santos",
      location: "123 Ayala Avenue, Makati City",
      serviceDate: "February 25, 2025",
      serviceTime: "9:00 AM - 12:00 PM",
    },
    "2": {
      earningId: "ERN_002",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0225-5496",
      serviceAmount: 2500,
      transportationAmount: 50,
      totalAmount: 2550,
      paymentMethod: "GCash",
      paymentValidation: "completed",
      transactionDate: "2025-02-25",
      createdAt: "2025-02-25 09:00:00",
      clientName: "Jose Reyes",
      location: "456 BGC, Taguig City",
      serviceDate: "February 25, 2025",
      serviceTime: "9:00 AM - 11:00 AM",
    },
    "3": {
      earningId: "ERN_003",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0224-5480",
      serviceAmount: 3200,
      transportationAmount: 100,
      totalAmount: 3300,
      paymentMethod: "Cash",
      paymentValidation: "completed",
      transactionDate: "2025-02-24",
      createdAt: "2025-02-24 15:00:00",
      clientName: "Ana Cruz",
      location: "789 Ortigas Center, Pasig City",
      serviceDate: "February 24, 2025",
      serviceTime: "3:00 PM - 6:00 PM",
    },
    "4": {
      earningId: "ERN_004",
      housemaidId: "HM_12345",
      type: "earning",
      bookingCode: "HM0228-5512",
      serviceAmount: 2800,
      transportationAmount: 80,
      totalAmount: 2880,
      paymentMethod: "Bank Transfer",
      paymentValidation: "pending",
      transactionDate: "2025-02-28",
      createdAt: "2025-02-28 10:00:00",
      clientName: "Carlos Mendoza",
      location: "321 Quezon City",
      serviceDate: "February 28, 2025",
      serviceTime: "10:00 AM - 1:00 PM",
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
              ₱{earning.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <Badge 
              variant={earning.paymentValidation === "completed" ? "default" : "secondary"}
              className={earning.paymentValidation === "completed" 
                ? "bg-green-100 text-green-700 hover:bg-green-100" 
                : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"}
              data-testid="badge-payment-status"
            >
              {earning.paymentValidation === "completed" ? "Payment Completed" : "Payment Pending"}
            </Badge>
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
              <p className="text-sm text-gray-600">Service Amount</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-service-amount">
                ₱{earning.serviceAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Transportation</p>
              <p className="text-sm font-medium text-gray-900" data-testid="text-transportation-amount">
                ₱{earning.transportationAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="border-t border-gray-200" />
            <div className="flex justify-between items-center">
              <p className="text-sm font-semibold text-gray-900">Total Earning</p>
              <p className="text-sm font-bold text-gray-900" data-testid="text-total-breakdown">
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
