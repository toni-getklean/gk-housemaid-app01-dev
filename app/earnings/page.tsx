"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";
import { PesoIcon } from "@/components/icons/PesoIcon";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { HousemaidTierCard } from "@/components/HousemaidTierCard";

interface Earning {
  id: string;
  bookingCode: string;
  date: string;
  client: string;
  amount: string;
  status: string;
  bookingType: string;
  points: number;
}

export default function Earnings() {
  const router = useRouter();

  // Fetch housemaid tiers from DB
  const { data: tiersData } = useQuery({
    queryKey: ["housemaidTiers"],
    queryFn: async () => {
      const res = await fetch("/api/lookups/housemaid-tiers");
      if (!res.ok) throw new Error("Failed to fetch tiers");
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - tiers rarely change
  });

  // Fetch earnings data from API
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ["earnings"],
    queryFn: async () => {
      const res = await fetch("/api/earnings");
      if (!res.ok) throw new Error("Failed to fetch earnings");
      return res.json();
    },
  });

  const summary = earningsData?.summary || {
    today: "₱0.00",
    week: "₱0.00",
    month: "₱0.00",
  };

  const earnings = earningsData?.earnings || [];

  const getPoints = (points: number) => {
    return points || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Earnings" onMenuClick={() => console.log("Menu clicked")} />

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <HousemaidTierCard
            variant="compact"
            tiers={tiersData?.tiers}
            currentPoints={earningsData?.currentPoints}
          />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Card className="p-4" data-testid="card-today-earnings">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-3">
                <PesoIcon className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.today}</p>
              <p className="text-xs text-gray-600 mt-1">Today</p>
            </Card>

            <Card className="p-4" data-testid="card-week-earnings">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.week}</p>
              <p className="text-xs text-gray-600 mt-1">This Week</p>
            </Card>

            <Card className="p-4" data-testid="card-month-earnings">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Calendar className="h-5 w-5" />
              </div>
              <p className="text-lg font-bold text-gray-900">{summary.month}</p>
              <p className="text-xs text-gray-600 mt-1">This Month</p>
            </Card>
          </div>
        </div>

        <div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-4">
              <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {earnings.map((earning: Earning) => (
                <Card
                  key={earning.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/earnings/${earning.id}`)}
                  data-testid={`card-earning-${earning.id}`}
                >
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-blue" data-testid={`text-booking-code-${earning.id}`}>
                        {earning.bookingCode}
                      </p>
                      <p className="font-medium text-gray-900">{earning.client}</p>
                      <p className="text-sm text-gray-600">{new Date(earning.date).toLocaleDateString()}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${earning.status === "completed" || earning.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {earning.status}
                      </span>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <p className="text-lg font-bold text-gray-900">₱{parseFloat(earning.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-teal">
                        <span className="text-xs font-bold">+{getPoints(earning.points)}</span>
                        <span className="text-[10px] font-medium uppercase text-teal/70">PTS</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {earnings.filter((e: Earning) => e.status !== "completed" && e.status !== "Completed").map((earning: Earning) => (
                <Card
                  key={earning.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/earnings/${earning.id}`)}
                  data-testid={`card-earning-${earning.id}`}
                >
                  <div className="flex justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-blue" data-testid={`text-booking-code-${earning.id}`}>
                        {earning.bookingCode}
                      </p>
                      <p className="font-medium text-gray-900">{earning.client}</p>
                      <p className="text-sm text-gray-600">{new Date(earning.date).toLocaleDateString()}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        {earning.status}
                      </span>
                    </div>
                    <div className="text-right flex flex-col justify-between items-end">
                      <p className="text-lg font-bold text-gray-900">₱{parseFloat(earning.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                      <div className="flex items-center justify-end gap-1 mt-1 text-teal">
                        <span className="text-xs font-bold">+{getPoints(earning.points)}</span>
                        <span className="text-[10px] font-medium uppercase text-teal/70">PTS</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>


      <BottomNav />
    </div>
  );
}
