"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, User, Car, CreditCard, Route, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Booking } from "@/lib/database";
import { BookingSummaryTab } from "@/components/bookings/BookingSummaryTab";
import { BookingClientTab } from "@/components/bookings/BookingClientTab";
import { BookingTransportTab } from "@/components/bookings/BookingTransportTab";
import { BookingPaymentTab } from "@/components/bookings/BookingPaymentTab";
import { BookingActionFooter } from "@/components/bookings/BookingActionFooter";
import { useToast } from "@/hooks/use-toast";

import { RescheduleModal } from "@/components/bookings/RescheduleModal";

export default function BookingDetails() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("summary");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const bookingCode = params.code as string;

  const { data: booking, isLoading, error } = useQuery<Booking>({
    queryKey: ["booking", bookingCode],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingCode}`);
      if (!response.ok) {
        throw new Error("Failed to fetch booking");
      }
      return response.json();
    },
  });

  const handleStatusUpdate = async (newStatus: string, payload?: any) => {
    try {
      let body: any = { status: newStatus };

      if (typeof payload === "string") {
        body.reason = payload;
      } else if (typeof payload === "object" && payload !== null) {
        body = { ...body, ...payload };
      }

      const response = await fetch(`/api/bookings/${bookingCode}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update status");
      }

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["booking", bookingCode] });

      // Also invalidate the list query
      queryClient.invalidateQueries({ queryKey: ["bookings"] });

    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const handleRescheduleConfirm = async (date: string, time: string, reasonId: string) => {
    setIsRescheduling(true);
    try {
      await handleStatusUpdate("rescheduled", {
        proposedDate: date,
        proposedTime: time,
        reasonId: reasonId
      });

      toast({
        title: "Reschedule Proposed",
        description: "Your reschedule request has been sent for approval.",
      });

      setShowRescheduleModal(false);
      router.push("/bookings");
    } catch (error) {
      toast({
        title: "Reschedule Failed",
        description: "Failed to submit reschedule request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleTransportUpdate = async (data: any) => {
    try {
      const response = await fetch(`/api/bookings/${bookingCode}/transport`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update transportation");
      }

      queryClient.invalidateQueries({ queryKey: ["booking", bookingCode] });
    } catch (error) {
      console.error("Error updating transportation:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load booking details</p>
          <button
            onClick={() => router.back()}
            className="text-teal hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header
        title={booking.bookingCode || undefined}
        showBack={true}
        onBackClick={() => router.push("/bookings")}
        showNotifications={false}
        rightAction={
          <button
            onClick={() => router.push(`/bookings/${booking.bookingCode}/track`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            data-testid="button-track-booking"
          >
            <Route className="h-5 w-5 text-gray-700" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 mb-6 bg-white">
            <TabsTrigger
              value="summary"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:text-teal data-[state=active]:border-b-2 data-[state=active]:border-teal"
              data-testid="tab-summary"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="text-xs">Summary</span>
            </TabsTrigger>
            <TabsTrigger
              value="client"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:text-teal data-[state=active]:border-b-2 data-[state=active]:border-teal"
              data-testid="tab-client"
            >
              <User className="h-5 w-5" />
              <span className="text-xs">Client</span>
            </TabsTrigger>
            <TabsTrigger
              value="transport"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:text-teal data-[state=active]:border-b-2 data-[state=active]:border-teal"
              data-testid="tab-transport"
            >
              <Car className="h-5 w-5" />
              <span className="text-xs">Transport</span>
            </TabsTrigger>
            <TabsTrigger
              value="payment"
              className="flex flex-col items-center gap-1 py-3 data-[state=active]:text-teal data-[state=active]:border-b-2 data-[state=active]:border-teal"
              data-testid="tab-payment"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Payment</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <BookingSummaryTab
              booking={booking}
              onUploadSuccess={() => {
                queryClient.invalidateQueries({ queryKey: ["booking", bookingCode] });
              }}
              onReschedule={() => setShowRescheduleModal(true)}
            />
          </TabsContent>

          <TabsContent value="client">
            <BookingClientTab booking={booking} />
          </TabsContent>

          <TabsContent value="transport">
            <BookingTransportTab
              booking={booking}
              onUpdate={handleTransportUpdate}
            />
          </TabsContent>

          <TabsContent value="payment">
            <BookingPaymentTab booking={booking} />
          </TabsContent>
        </Tabs>
      </div>

      <BookingActionFooter
        booking={booking}
        onStatusUpdate={handleStatusUpdate}
        activeTab={activeTab}
        onReschedule={() => setShowRescheduleModal(true)}
      />

      <RescheduleModal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        onConfirm={handleRescheduleConfirm}
        isLoading={isRescheduling}
      />
    </div>
  );
}
