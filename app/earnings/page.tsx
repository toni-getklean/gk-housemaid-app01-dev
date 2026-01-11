"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TrendingUp, Calendar } from "lucide-react";
import { PesoIcon } from "@/components/icons/PesoIcon";
import { useRouter } from "next/navigation";

export default function Earnings() {
  const router = useRouter();
  const summary = {
    today: "₱1,200",
    week: "₱6,500",
    month: "₱28,400",
  };

  const earnings = [
    {
      id: "1",
      bookingCode: "HM0225-5495",
      date: "Today, 2:30 PM",
      client: "Maria Santos",
      amount: "₱650",
      status: "Completed",
    },
    {
      id: "2",
      bookingCode: "HM0225-5496",
      date: "Today, 9:00 AM",
      client: "Jose Reyes",
      amount: "₱550",
      status: "Completed",
    },
    {
      id: "3",
      bookingCode: "HM0224-5480",
      date: "Yesterday, 3:00 PM",
      client: "Ana Cruz",
      amount: "₱700",
      status: "Completed",
    },
    {
      id: "4",
      bookingCode: "HM0228-5512",
      date: "Nov 28, 10:00 AM",
      client: "Carlos Mendoza",
      amount: "₱600",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Earnings" onMenuClick={() => console.log("Menu clicked")} />

      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-3">
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
              {earnings.map((earning) => (
                <Card
                  key={earning.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/earnings/${earning.id}`)}
                  data-testid={`card-earning-${earning.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-blue" data-testid={`text-booking-code-${earning.id}`}>
                        {earning.bookingCode}
                      </p>
                      <p className="font-medium text-gray-900">{earning.client}</p>
                      <p className="text-sm text-gray-600">{earning.date}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${earning.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {earning.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{earning.amount}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {earnings.filter(e => e.status === "Pending").map((earning) => (
                <Card
                  key={earning.id}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => router.push(`/earnings/${earning.id}`)}
                  data-testid={`card-earning-${earning.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-blue" data-testid={`text-booking-code-${earning.id}`}>
                        {earning.bookingCode}
                      </p>
                      <p className="font-medium text-gray-900">{earning.client}</p>
                      <p className="text-sm text-gray-600">{earning.date}</p>
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                        {earning.status}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{earning.amount}</p>
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
