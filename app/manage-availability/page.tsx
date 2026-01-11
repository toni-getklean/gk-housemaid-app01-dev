
"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type DayStatus = "available" | "booked" | "blocked" | "half_day_am" | "half_day_pm";

interface AvailabilityData {
  exceptions: Array<{
    availabilityDate: string;
    statusCode: 'AVAILABLE' | 'ABSENT';
    timeCommitment: 'FULL_DAY' | 'HALF_DAY_AM' | 'HALF_DAY_PM' | null;
    reason?: string;
  }>;
  bookings: Array<{
    serviceDate: string;
    statusCode: string;
  }>;
}

export default function ManageAvailability() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  const [isEditExpanded, setIsEditExpanded] = useState(false);

  // Form State
  const [editStatus, setEditStatus] = useState<"available" | "blocked">("available");
  const [workingHoursType, setWorkingHoursType] = useState<"full-day" | "half-day-am" | "half-day-pm">("full-day");
  const [notes, setNotes] = useState("");

  // Fetch Data
  const month = currentMonth.getMonth() + 1;
  const year = currentMonth.getFullYear();

  const { data, isLoading } = useQuery<AvailabilityData>({
    queryKey: ["availability", month, year],
    queryFn: async () => {
      const res = await fetch(`/api/availability?month=${month}&year=${year}`);
      if (!res.ok) throw new Error("Failed to fetch availability");
      return res.json();
    },
  });

  // Calendar Helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Status Logic
  const getDayStatus = (date: Date): DayStatus => {
    if (!data) return "available";

    const dateStr = format(date, "yyyy-MM-dd");

    // 1. Check Bookings
    const booking = data.bookings.find(b => b.serviceDate === dateStr);
    if (booking) return "booked";

    // 2. Check Exceptions
    const exception = data.exceptions.find(e => e.availabilityDate === dateStr);
    if (exception) {
      if (exception.statusCode === 'ABSENT') return "blocked";
      if (exception.statusCode === 'AVAILABLE') {
        if (exception.timeCommitment === 'HALF_DAY_AM') return "half_day_am";
        if (exception.timeCommitment === 'HALF_DAY_PM') return "half_day_pm";
      }
    }

    return "available";
  };

  const getDayRecord = (date: Date) => {
    if (!data) return null;
    const dateStr = format(date, "yyyy-MM-dd");
    return data.exceptions.find(e => e.availabilityDate === dateStr);
  }

  // Styles
  const getStatusColor = (status: DayStatus): string => {
    switch (status) {
      case "available": return "bg-green-500";
      case "booked": return "bg-blue-500";
      case "blocked": return "bg-red-500";
      case "half_day_am": return "half_day_am"; // Special handling in render
      case "half_day_pm": return "half_day_pm"; // Special handling in render
    }
  };

  const getStatusLabel = (status: DayStatus): string => {
    switch (status) {
      case "available": return "Available";
      case "booked": return "Booked";
      case "blocked": return "Absent";
      case "half_day_am": return "Available (AM Only)";
      case "half_day_pm": return "Available (PM Only)";
    }
  };

  const getStatusEmoji = (status: DayStatus): string => {
    switch (status) {
      case "available": return "🟢";
      case "booked": return "🔵";
      case "blocked": return "🔴";
      case "half_day_am": return "Available (AM Only)";
      case "half_day_pm": return "Available (PM Only)";
    }
  };

  // Interaction Handlers
  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
    setIsEditExpanded(false);
  };

  // Select Date
  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsEditExpanded(false); // Reset edit mode on date change
  };

  // Toggle Edit Mode & Initialize Form
  const handleToggleEdit = () => {
    if (!selectedDate) return;

    if (!isEditExpanded) {
      // Initialize form with current data
      const currentStatus = getDayStatus(selectedDate);
      const record = getDayRecord(selectedDate);

      if (currentStatus === "blocked") {
        setEditStatus("blocked");
        setNotes(record?.reason || "");
        setWorkingHoursType("full-day"); // Default
      } else if (currentStatus === "half_day_am") {
        setEditStatus("available");
        setWorkingHoursType("half-day-am");
        setNotes("");
      } else if (currentStatus === "half_day_pm") {
        setEditStatus("available");
        setWorkingHoursType("half-day-pm");
        setNotes("");
      } else {
        // Default Available
        setEditStatus("available");
        setWorkingHoursType("full-day");
        setNotes("");
      }
    }
    setIsEditExpanded(!isEditExpanded);
  };

  const handleCancelEditing = () => {
    setIsEditExpanded(false);
  }

  // Mutation
  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update availability");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Availability Updated",
        description: "Your schedule has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      setIsEditExpanded(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSaveAvailability = () => {
    if (!selectedDate) return;

    let finalStatus = 'AVAILABLE';
    let finalCommitment = 'FULL_DAY';

    if (editStatus === 'blocked') {
      finalStatus = 'ABSENT';
      finalCommitment = 'FULL_DAY'; // Ignore
    } else {
      finalStatus = 'AVAILABLE';
      let commitment = 'FULL_DAY';
      if (workingHoursType === 'half-day-am') commitment = 'HALF_DAY_AM';
      if (workingHoursType === 'half-day-pm') commitment = 'HALF_DAY_PM';
      finalCommitment = commitment;
    }

    mutation.mutate({
      date: format(selectedDate, "yyyy-MM-dd"),
      status: finalStatus,
      timeCommitment: finalStatus === 'AVAILABLE' ? finalCommitment : undefined,
      reason: notes,
    });
  };

  const selectedStatus = selectedDate ? getDayStatus(selectedDate) : null;
  const selectedRecord = selectedDate ? getDayRecord(selectedDate) : null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Manage Availability" onBackClick={() => router.push("/profile")} showBack />

      <div className="p-4 space-y-4">
        {/* Calendar Card */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePrevMonth} className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, "MMMM yyyy")}</h2>
            <button onClick={handleNextMonth} className="flex items-center justify-center h-8 w-8 rounded-md hover:bg-gray-100 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handleToday} className="w-full mb-4">Today</Button>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
              <div key={i} className="text-center text-xs font-medium text-gray-600 py-1">{day}</div>
            ))}
          </div>

          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const status = getDayStatus(day);
                const statusColor = getStatusColor(status);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(day)}
                    disabled={!isCurrentMonth}
                    className={`aspect-square p-1 rounded-md flex flex-col items-center justify-center ${isCurrentMonth ? "hover:bg-gray-50" : "opacity-30"} ${isSelected ? "ring-2 ring-teal bg-teal/5" : ""}`}
                  >
                    <span className={`text-sm ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}`}>{format(day, "d")}</span>
                    {isCurrentMonth && (
                      <div
                        className={`h-2 w-2 rounded-full mt-1 ${status === 'half_day_am' ? '' :
                          status === 'half_day_pm' ? '' :
                            statusColor
                          }`}
                        style={{
                          background: status === 'half_day_am' ? 'linear-gradient(90deg, #F97316 50%, #e0e0e0 50%)' :
                            status === 'half_day_pm' ? 'linear-gradient(90deg, #e0e0e0 50%, #F97316 50%)' :
                              undefined
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-3 text-xs justify-center">
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-green-500" /><span className="text-gray-600">Available</span></div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ background: 'linear-gradient(90deg, #F97316 50%, #e0e0e0 50%)' }} />
              <span className="text-gray-600">AM Only</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full" style={{ background: 'linear-gradient(90deg, #e0e0e0 50%, #F97316 50%)' }} />
              <span className="text-gray-600">PM Only</span>
            </div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-blue-500" /><span className="text-gray-600">Booked</span></div>
            <div className="flex items-center gap-1"><div className="h-3 w-3 rounded-full bg-red-500" /><span className="text-gray-600">Blocked</span></div>
          </div>
        </Card>

        {/* Editor Card */}
        {selectedDate && selectedStatus && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-teal" />
              <h3 className="font-semibold text-gray-900">{format(selectedDate, "EEEE, MMMM d, yyyy")}</h3>
            </div>

            {/* Read Only View */}
            {!isEditExpanded ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm font-medium text-gray-900">{getStatusEmoji(selectedStatus)} {getStatusLabel(selectedStatus)}</span>
                </div>
                {selectedRecord?.reason && (
                  <div className="flex items-start gap-2">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <span className="text-sm text-gray-700">{selectedRecord.reason}</span>
                  </div>
                )}

                {selectedStatus === 'booked' ? (
                  <div className="p-3 bg-blue-50 text-blue-700 text-sm rounded-md text-center">
                    This date is booked and cannot be edited.
                  </div>
                ) : (
                  <Button variant="outline" className="w-full" onClick={handleToggleEdit}>
                    {selectedStatus === 'available' ? 'Edit Availability' : 'Cancel Editing / Reset'}
                  </Button>
                )}
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-4 pt-2 border-t">
                <Button variant="outline" className="w-full mb-4" onClick={handleCancelEditing}>
                  Cancel Editing
                </Button>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Current Status:</div>
                  <div className="text-sm font-medium text-gray-900">{getStatusEmoji(selectedStatus)} {getStatusLabel(selectedStatus)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-900 mb-3 block">Change to:</Label>
                  <RadioGroup value={editStatus} onValueChange={(value) => setEditStatus(value as "available" | "blocked")}>
                    <div className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value="available" id="status-available" />
                      <Label htmlFor="status-available" className="font-normal cursor-pointer">Available</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="blocked" id="status-blocked" />
                      <Label htmlFor="status-blocked" className="font-normal cursor-pointer">Absent</Label>
                    </div>
                  </RadioGroup>
                </div>

                {editStatus === "available" && (
                  <div>
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">Working Hours:</Label>
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 py-2 px-1 text-xs font-medium rounded-full border transition-colors ${workingHoursType === 'full-day'
                          ? 'bg-blue-100 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setWorkingHoursType('full-day')}
                      >
                        Full Day
                      </button>
                      <button
                        className={`flex-1 py-2 px-1 text-xs font-medium rounded-full border transition-colors ${workingHoursType === 'half-day-am'
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setWorkingHoursType('half-day-am')}
                      >
                        Morning (AM)
                      </button>
                      <button
                        className={`flex-1 py-2 px-1 text-xs font-medium rounded-full border transition-colors ${workingHoursType === 'half-day-pm'
                          ? 'bg-orange-100 border-orange-500 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        onClick={() => setWorkingHoursType('half-day-pm')}
                      >
                        Afternoon (PM)
                      </button>
                    </div>
                  </div>
                )}

                {editStatus === "blocked" && (
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-900 mb-2 block">Notes/Reason:</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Reason for being absent..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <Button
                  className="w-full bg-yellow hover:bg-yellow-hover text-gray-900 font-medium"
                  onClick={handleSaveAvailability}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
