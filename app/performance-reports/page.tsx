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
  violationCode: string;
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
    queryKey: ["trainingLevels"],
    queryFn: async () => {
      const res = await fetch("/api/lookups/training-levels");
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

  // Derived Performance Score calculations based on PRD
  const avgRating = stats.averageRating > 0 ? stats.averageRating : 4.5;
  const ratingPoints = Math.round((avgRating / 5) * 50);
  
  // Mock values based on PRD (assuming 30 points max for completion)
  const completionPercent = stats.completionRate || 95;
  const completionPoints = Math.round((completionPercent / 100) * 30);
  
  // Violations (20% weight, starting at 20 points, deduct from there)
  // Mocking deduction (using arbitary weights for demo purposes if minor/major > 0)
  const totalViolations = (stats.violations.minor * 5) + (stats.violations.major * 15);
  const violationsPoints = Math.max(0, 20 - totalViolations);
  
  const performanceScore = ratingPoints + completionPoints + violationsPoints;

  let performanceLabel = "GOOD";
  let performanceColor = "bg-yellow-100 text-yellow-800"; // fallback
  if (performanceScore >= 95) {
    performanceLabel = "EXCELLENT";
    performanceColor = "bg-[#FFE174] text-[#4C3E00]"; // yellow pill matching design
  }
  else if (performanceScore >= 85) {
    performanceLabel = "VERY GOOD";
    performanceColor = "bg-[#D4E3FF] text-[#001C39]";
  }
  else if (performanceScore < 75) {
    performanceLabel = "NEEDS IMPROVEMENT";
    performanceColor = "bg-red-100 text-red-800";
  }

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
          className="p-4 bg-white border border-gray-200 cursor-pointer hover:shadow-md transition-all active:scale-[0.98] rounded-xl shadow-sm"
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

        {/* Unified Performance & Score Breakdown Card */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">
            Performance Score
          </h2>
          
          <div className="space-y-4">
            {/* Overall Score */}
            <div className="flex items-center gap-3 text-sm">
              <TrendingUp className="h-5 w-5 text-teal" />
              <div className="flex-1 flex justify-between items-center">
                  <span className="text-gray-500">Overall Score</span>
                  <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-teal px-2 py-0.5 bg-teal/10 rounded-md uppercase tracking-wider">
                          {performanceLabel}
                      </span>
                      <span className="font-medium text-gray-900">{performanceScore} / 100</span>
                  </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-3">
              {/* Rating */}
              <div className="flex gap-3 text-sm">
                <Star className="h-5 w-5 text-yellow mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Rating ({avgRating.toFixed(1)}/5)</span>
                    <span className="font-medium text-gray-900">{ratingPoints} pts</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${(ratingPoints / 50) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Completion */}
              <div className="flex gap-3 text-sm">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Completion ({completionPercent}%)</span>
                    <span className="font-medium text-gray-900">{completionPoints} pts</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${(completionPoints / 30) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Violations */}
              <div className="flex gap-3 text-sm">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Violations ({stats.violations.minor + stats.violations.major})</span>
                    <span className="font-medium text-gray-900">{violationsPoints} pts</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-teal rounded-full transition-all duration-500" style={{ width: `${(violationsPoints / 20) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

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
                      onClick={() => router.push(`/performance-reports/violations/${violation.violationCode}`)}
                      data-testid={`card-violation-${violation.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Left: Violation Details */}
                        <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{violation.title}</div>
                          <p className="text-xs text-gray-500 mb-1 font-mono">{violation.violationCode}</p>
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
