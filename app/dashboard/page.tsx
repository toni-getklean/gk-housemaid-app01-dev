"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { BookingCard } from "@/components/BookingCard";
import { Calendar, CheckCircle2, Clock, Bell, ChevronDown, ChevronUp, ChevronRight, User, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { PesoIcon } from "@/components/icons/PesoIcon";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Dashboard() {
  const router = useRouter();
  const [isForReviewExpanded, setIsForReviewExpanded] = useState(true);

  // Fetch Dashboard Data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    }
  });

  const statsData = data?.stats || { today: 0, forReview: 0, earnings: 0, thisMonth: 0 };
  const forReviewBookings = data?.lists?.forReview || [];
  const todayBookings = data?.lists?.today || [];
  const upcomingBookings = data?.lists?.upcoming || [];


  const stats = [
    {
      label: "Today's Jobs",
      value: String(statsData.today),
      icon: Calendar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "For Review",
      value: String(statsData.forReview),
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      label: "Earnings",
      value: `₱${statsData.earnings.toLocaleString()}`,
      icon: PesoIcon,
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      label: "This Month",
      value: String(statsData.thisMonth),
      icon: CheckCircle2,
      color: "bg-green-50 text-green-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Stats
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="p-4"
                  data-testid={`card-stat-${index}`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {forReviewBookings.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setIsForReviewExpanded(!isForReviewExpanded)}
              className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between hover:bg-orange-100 transition-colors"
              data-testid="for-review-banner"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-orange-900">
                    {forReviewBookings.length} booking{forReviewBookings.length > 1 ? 's' : ''} awaiting review
                  </p>
                  <p className="text-sm text-orange-700">
                    Tap to {isForReviewExpanded ? 'collapse' : 'expand'}
                  </p>
                </div>
              </div>
              {isForReviewExpanded ? (
                <ChevronUp className="h-5 w-5 text-orange-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-orange-600" />
              )}
            </button>

            {isForReviewExpanded && (
              <div className="space-y-2">
                {forReviewBookings.map((booking: any) => (
                  <Card
                    key={booking.bookingId}
                    className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                    data-testid={`for-review-item-${booking.bookingId}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate">
                              {booking.customerName || "Unknown Client"}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 flex-shrink-0">
                              For Review
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {format(new Date(booking.serviceDate), "MMM d, yyyy")} • {booking.parsedStartTime}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="today" data-testid="tab-today">
                Today
              </TabsTrigger>
              <TabsTrigger value="upcoming" data-testid="tab-upcoming">
                Upcoming
              </TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="space-y-3">
              {todayBookings.length > 0 ? (
                todayBookings.map((booking: any) => (
                  <BookingCard
                    key={booking.bookingId}
                    id={booking.bookingCode} // Ensure BookingCard accepts Code
                    clientName={booking.customerName}
                    location={booking.city} // Simplified location
                    time={booking.parsedStartTime}
                    status={booking.statusCode}
                    date={format(new Date(booking.serviceDate), "MMM d")}
                    onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No bookings for today</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-3">
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map((booking: any) => (
                  <BookingCard
                    key={booking.bookingId}
                    id={booking.bookingCode}
                    clientName={booking.customerName}
                    location={booking.city}
                    time={booking.parsedStartTime}
                    status={booking.statusCode}
                    date={format(new Date(booking.serviceDate), "MMM d")}
                    onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                  />
                ))
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No upcoming bookings</p>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

