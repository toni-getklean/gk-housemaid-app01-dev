"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  ChevronRight as ArrowRight,
  Loader2,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Booking } from "@/lib/database";

// Tab status mappings
const STATUS_TABS = {
  upcoming: ["accepted", "dispatched", "on_the_way", "arrived", "in_progress"],
  pending: ["pending_review", "needs_confirmation"],
  completed: ["completed"],
} as const;

export default function Bookings() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "completed">("upcoming");

  const getDaysToShow = () => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  };

  const days = getDaysToShow();

  // Build query parameters for the current tab
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();

    // Add status filter based on active tab
    params.append("status", STATUS_TABS[activeTab].join(","));

    // Add date filter
    if (selectedDate) {
      params.append("date", selectedDate.toISOString());
    } else {
      params.append("date", "all");
    }

    // Add search term
    if (searchQuery.trim()) {
      params.append("search", searchQuery.trim());
    }

    return params.toString();
  }, [activeTab, selectedDate, searchQuery]);

  // Fetch bookings with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["bookings", queryParams],
    queryFn: async () => {
      const response = await fetch(`/api/bookings?${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }
      return response.json();
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  const allBookings: Booking[] = data?.bookings || [];
  const currentTabBookings = allBookings;

  // Fetch all bookings (without tab filter) for calendar dots
  const { data: calendarData } = useQuery({
    queryKey: ["bookings-calendar"],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Status filter for calendar dots should include all statuses
      params.append("status", [...STATUS_TABS.upcoming, ...STATUS_TABS.pending, ...STATUS_TABS.completed].join(","));
      params.append("date", "all");

      const response = await fetch(`/api/bookings?${params.toString()}`);
      if (!response.ok) return { bookings: [] };
      return response.json();
    },
    staleTime: 0, // Always fetch fresh calendar data
  });

  const calendarBookings: Booking[] = calendarData?.bookings || [];

  const getBookingCountForDate = (date: Date) => {
    return calendarBookings.filter((b) =>
      b.parsedServiceDate && isSameDay(b.parsedServiceDate, date)
    ).length;
  };

  // Calculate counts for all tabs (for display in tab headers)
  // These counts should respect the selectedDate filter
  const upcomingCount = useMemo(() => {
    const filteredBookings = selectedDate
      ? calendarBookings.filter((b) =>
        b.parsedServiceDate && isSameDay(b.parsedServiceDate, selectedDate)
      )
      : calendarBookings;

    return filteredBookings.filter((b) =>
      STATUS_TABS.upcoming.includes(b.statusCode as any)
    ).length;
  }, [calendarBookings, selectedDate]);

  const pendingCount = useMemo(() => {
    const filteredBookings = selectedDate
      ? calendarBookings.filter((b) =>
        b.parsedServiceDate && isSameDay(b.parsedServiceDate, selectedDate)
      )
      : calendarBookings;

    return filteredBookings.filter((b) =>
      STATUS_TABS.pending.includes(b.statusCode as any)
    ).length;
  }, [calendarBookings, selectedDate]);

  const completedCount = useMemo(() => {
    const filteredBookings = selectedDate
      ? calendarBookings.filter((b) =>
        b.parsedServiceDate && isSameDay(b.parsedServiceDate, selectedDate)
      )
      : calendarBookings;

    return filteredBookings.filter((b) =>
      STATUS_TABS.completed.includes(b.statusCode as any)
    ).length;
  }, [calendarBookings, selectedDate]);

  // Auto-select the best tab when date changes
  // Priority: For Review > Upcoming > Completed
  useEffect(() => {
    // Determine which tab to show based on counts
    if (pendingCount > 0) {
      // Highest priority: For Review tab
      setActiveTab("pending");
    } else if (upcomingCount > 0) {
      // Second priority: Upcoming tab
      setActiveTab("upcoming");
    } else if (completedCount > 0) {
      // Fallback: Completed tab
      setActiveTab("completed");
    } else {
      // No bookings at all, default to upcoming
      setActiveTab("upcoming");
    }
  }, [selectedDate, pendingCount, upcomingCount, completedCount]);

  const handlePrevWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header onMenuClick={() => console.log("Menu clicked")} />

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-teal" />
            <h1 className="text-xl font-semibold text-teal">Bookings</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/manage-availability")}
            className="text-sm"
            data-testid="button-set-availability"
          >
            📆 Set Availability
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Booking code, Client name"
            defaultValue={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              // Debounce search update
              const timeoutId = setTimeout(() => {
                setSearchQuery(value);
              }, 500);
              return () => clearTimeout(timeoutId);
            }}
            className="pl-10 pr-4 h-11"
            data-testid="input-search-bookings"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedDate(null)}
            className={`text-xs px-1 ${!selectedDate ? "bg-gray-200" : ""}`}
            data-testid="button-all-dates"
          >
            All Dates
          </Button>
          <button
            onClick={handlePrevWeek}
            className="flex items-center justify-center h-5 w-5 rounded-md hover:bg-gray-100 transition-colors"
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const bookingCount = getBookingCountForDate(day);
              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-center py-1.5 px-0.5 rounded-lg transition-colors ${isSelected
                    ? "bg-teal text-white"
                    : "bg-white hover:bg-gray-100"
                    }`}
                  data-testid={`button-date-${index}`}
                >
                  <span className="text-[10px] font-medium">
                    {format(day, "EEE").toUpperCase()}
                  </span>
                  <span className="text-base font-bold">
                    {format(day, "d")}
                  </span>
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {Array.from({ length: Math.min(bookingCount, 3) }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className={`w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-teal"
                            }`}
                        />
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNextWeek}
            className="flex items-center justify-center h-5 w-5 rounded-md hover:bg-gray-100 transition-colors"
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {selectedDate && (
          <h2 className="text-base font-semibold text-gray-900">
            {format(selectedDate, "MMMM d, yyyy")}
          </h2>
        )}

        <Tabs
          value={activeTab}
          className="w-full"
          onValueChange={(value) => setActiveTab(value as "upcoming" | "pending" | "completed")}
        >
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming" data-testid="tab-upcoming">
              Upcoming (<span className={upcomingCount > 0 ? "font-bold" : ""}>{upcomingCount}</span>)
            </TabsTrigger>
            <TabsTrigger value="pending" data-testid="tab-pending">
              For Review (<span className={pendingCount > 0 ? "font-bold" : ""}>{pendingCount}</span>)
            </TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">
              Completed (<span className={completedCount > 0 ? "font-bold" : ""}>{completedCount}</span>)
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : error ? (
            <Card className="p-8 text-center">
              <p className="text-red-500">Failed to load bookings. Please try again.</p>
              <Button onClick={() => refetch()} className="mt-4" variant="outline">
                Retry
              </Button>
            </Card>
          ) : (
            <>
              <TabsContent value="upcoming" className="space-y-3">
                {currentTabBookings.length > 0 ? (
                  currentTabBookings.map((booking) => (
                    <Card
                      key={booking.bookingId}
                      className="p-4 cursor-pointer"
                      onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                      data-testid={`card-booking-${booking.bookingId}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {booking.bookingCode}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {booking.customerName}
                      </h3>
                      <Badge
                        variant={
                          booking.statusCode === "accepted" ? "default" : "secondary"
                        }
                        className="mb-2"
                      >
                        {booking.statusDisplayName || booking.statusCode}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-1">
                        {booking.parsedServiceDate
                          ? format(booking.parsedServiceDate, "MMMM d, yyyy")
                          : booking.serviceDate
                        }, {booking.time}
                      </p>
                      <p className="text-sm text-gray-600">{booking.address}</p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? "No bookings match your search" :
                        selectedDate ? "No bookings for this date" :
                          "No upcoming bookings"}
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-3">
                {currentTabBookings.length > 0 ? (
                  currentTabBookings.map((booking) => (
                    <Card
                      key={booking.bookingId}
                      className="p-4 cursor-pointer"
                      onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                      data-testid={`card-booking-${booking.bookingCode}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {booking.bookingCode}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {booking.customerName}
                      </h3>
                      <Badge variant="secondary" className="mb-2">
                        For Review
                      </Badge>
                      <p className="text-sm text-gray-600 mb-1">
                        {booking.parsedServiceDate
                          ? format(booking.parsedServiceDate, "MMMM d, yyyy")
                          : booking.serviceDate
                        }, {booking.time}
                      </p>
                      <p className="text-sm text-gray-600">{booking.address}</p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? "No bookings match your search" :
                        selectedDate ? "No bookings for this date" :
                          "No for review bookings"}
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-3">
                {currentTabBookings.length > 0 ? (
                  currentTabBookings.map((booking) => (
                    <Card
                      key={booking.bookingId}
                      className="p-4 cursor-pointer"
                      onClick={() => router.push(`/bookings/${booking.bookingCode}`)}
                      data-testid={`card-booking-${booking.bookingCode}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {booking.bookingCode}
                        </span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        {booking.customerName}
                      </h3>
                      <Badge variant="default" className="mb-2">
                        Completed
                      </Badge>
                      <p className="text-sm text-gray-600 mb-1">
                        {booking.parsedServiceDate
                          ? format(booking.parsedServiceDate, "MMMM d, yyyy")
                          : booking.serviceDate
                        }, {booking.time}
                      </p>
                      <p className="text-sm text-gray-600">{booking.address}</p>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-gray-500">
                      {searchQuery ? "No bookings match your search" :
                        selectedDate ? "No bookings for this date" :
                          "No completed bookings"}
                    </p>
                  </Card>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
}
