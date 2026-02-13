"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Star, CheckCircle, BarChart3, AlertTriangle, Info, Calendar, TrendingUp, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

type ViolationType = "minor" | "major";

interface Violation {
  id: string;
  type: ViolationType;
  title: string;
  description: string;
  bookingCode: string;
  date: string;
  pointsImpact: number;
  sanction?: string;
}

interface PerformanceStats {
  averageRating: number;
  completionRate: number;
  totalJobs: number;
  violations: {
    minor: number;
    major: number;
  };
}

import { HousemaidTierCard } from "@/components/HousemaidTierCard";

export default function PerformanceReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViolationType>("minor");

  // Fetch housemaid tiers from DB
  const { data: tiersData } = useQuery({
    queryKey: ["housemaidTiers"],
    queryFn: async () => {
      const res = await fetch("/api/lookups/housemaid-tiers");
      if (!res.ok) throw new Error("Failed to fetch tiers");
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch Profile Data for Points
  const { data: profile } = useQuery({
    queryKey: ["housemaidProfile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    }
  });

  // Fetch Performance Data
  const { data: performanceData, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ["performanceReports"],
    queryFn: async () => {
      const res = await fetch("/api/performance-reports");
      if (!res.ok) throw new Error("Failed to fetch performance reports");
      return res.json();
    }
  });

  console.log("Performance Data:", performanceData);

  const stats: PerformanceStats = performanceData?.stats || {
    averageRating: profile?.rating || 4.8,
    completionRate: 95,
    totalJobs: profile?.completedJobs || 0,
    violations: {
      minor: 0,
      major: 0,
    },
  };

  const violations: Violation[] = performanceData?.violations || [];

  // Check both stats AND the actual list. If list has items, show them.
  const hasViolations = (stats.violations.minor > 0 || stats.violations.major > 0) || violations.length > 0;
  const filteredViolations = violations.filter((v) => v.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Performance Reports" onBackClick={() => router.push("/profile")} showBack />
      <div className="p-4 space-y-6">
        <HousemaidTierCard
          tiers={tiersData?.tiers}
          currentPoints={profile?.asensoPointsBalance}
        />

        {/* Tier Details Entry */}
        <Card
          className="p-4 bg-gradient-to-r from-blue-50 to-white border-blue-100 cursor-pointer hover:shadow-md transition-all active:scale-[0.98]"
          onClick={() => router.push("/performance-reports/growth-path")}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Career Growth Path</div>
                <div className="text-xs text-gray-500">View salary tiers & benefits</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Star className="h-6 w-6 text-yellow fill-yellow mb-2" />
              <div className="text-xs text-gray-600 mb-1">Average Rating</div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle className="h-6 w-6 text-green-600 mb-2" />
              <div className="text-xs text-gray-600 mb-1">Completion Rate</div>
              <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <BarChart3 className="h-6 w-6 text-teal mb-2" />
              <div className="text-xs text-gray-600 mb-1">Total Jobs</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalJobs}</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="h-6 w-6 text-orange-500 mb-2" />
              <div className="text-xs text-gray-600 mb-1">Violations</div>
              <div className="text-xs text-gray-700 mt-1">
                <div>Minor: {stats.violations.minor}</div>
                <div>Major: {stats.violations.major}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Violation History</h2>
            <button
              onClick={() => router.push("/performance-reports/penalty-guidelines")}
              className="flex items-center gap-1 text-xs text-teal hover:underline font-medium"
            >
              <Info className="h-4 w-4" />
              View Guidelines
            </button>
          </div>

          {isLoadingPerformance ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal"></div>
            </div>
          ) : !hasViolations ? (
            <Card className="p-4">
              <div className="flex items-center gap-3 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">No violations - Great work!</span>
              </div>
            </Card>
          ) : (
            <>
              <div className="flex gap-6 border-b border-gray-200">
                <button onClick={() => setActiveTab("minor")} className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === "minor" ? "text-teal" : "text-gray-600"}`} data-testid="tab-minor">
                  Minor
                  {activeTab === "minor" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
                </button>
                <button onClick={() => setActiveTab("major")} className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === "major" ? "text-teal" : "text-gray-600"}`} data-testid="tab-major">
                  Major
                  {activeTab === "major" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal" />}
                </button>
              </div>
              <div className="space-y-3">
                {filteredViolations.length === 0 ? (
                  <Card className="p-4">
                    <div className="text-sm text-gray-600 text-center">No {activeTab} violations</div>
                  </Card>
                ) : (
                  filteredViolations.map((violation) => (
                    <Card
                      key={violation.id}
                      className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => router.push(`/performance-reports/violations/${violation.id}`)}
                      data-testid={`card-violation-${violation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Left: Violation Details */}
                        <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{violation.title}</div>
                          <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
                          {violation.sanction && (
                            <p className="text-xs text-red-500 mt-1 font-medium">Sanction: {violation.sanction}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span>{violation.bookingCode}</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{violation.date}</span>
                            </div>
                          </div>
                        </div>
                        {/* Right: Points Impact */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-lg font-bold text-orange-500">{violation.pointsImpact} PTS</div>
                          <div className="text-[10px] uppercase tracking-wide text-gray-400">Deduction</div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
