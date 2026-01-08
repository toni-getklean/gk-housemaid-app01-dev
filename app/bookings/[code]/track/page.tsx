"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useRouter, useParams } from "next/navigation";
import { Circle, CheckCircle2, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface StatusItem {
  status: string;
  substatus: string;
  date: string;
  time: string;
  notes: string;
  completed: boolean;
}

export default function TrackBooking() {
  const router = useRouter();
  const params = useParams();
  const bookingCode = params.code as string;

  const { data: activityLogs, isLoading } = useQuery({
    queryKey: ["booking-activity", bookingCode],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${bookingCode}/activity-log`);
      if (!response.ok) throw new Error("Failed to fetch activity log");
      return response.json();
    },
  });

  const statusTimeline: StatusItem[] = activityLogs?.map((log: any) => ({
    status: log.title,
    substatus: log.statusCode,
    date: new Date(log.createdAt).toLocaleDateString(),
    time: new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    notes: log.message,
    completed: true,
  })) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header
        title="Track booking"
        showBack={true}
        onBackClick={() => router.push(`/bookings/${params.code || '1'}`)}
        showNotifications={false}
        titleLeftAligned={true}
      />

      <div className="p-4">
        <div className="bg-white rounded-lg p-4 space-y-6">
          {statusTimeline.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            statusTimeline.map((item, index) => (
              <div key={index} className="relative">
                {index < statusTimeline.length - 1 && (
                  <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-300" />
                )}

                <div className="flex gap-4">
                  <div className="flex-shrink-0 relative z-10">
                    {item.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-teal fill-teal" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 pb-2">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        {item.status}
                      </h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-2">
                      {item.date}, {item.time}
                    </p>

                    <p className="text-sm text-gray-700 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>
                </div>
              </div>
            )))}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Tip:</strong> You can track your booking status here.
            You'll receive updates as your booking progresses through different stages.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
