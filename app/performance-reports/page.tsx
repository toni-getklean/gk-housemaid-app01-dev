"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Star, CheckCircle, BarChart3, AlertTriangle, Info, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

type ViolationType = "minor" | "major";

interface Violation {
  id: string;
  type: ViolationType;
  title: string;
  description: string;
  bookingCode: string;
  date: string;
  pointsImpact: number;
}

import { AsensoLevelCard } from "@/components/AsensoLevelCard";

export default function PerformanceReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ViolationType>("minor");

  const stats = {
    averageRating: 4.8,
    completionRate: 95,
    totalJobs: 145,
    violations: {
      minor: 2,
      major: 0,
    },
  };

  const violations: Violation[] = [
    {
      id: "1",
      type: "minor",
      title: "Late arrival",
      description: "Rosa Dela Cruz encountered a transportation issue on the way.",
      bookingCode: "HM0225-5496",
      date: "April 24, 2025",
      pointsImpact: -150,
    },
    {
      id: "2",
      type: "minor",
      title: "Not updating the team/client",
      description: "Rosa Dela Cruz forgot to notify the team/client that she had already arrived at the location.",
      bookingCode: "HM0225-5497",
      date: "Feb 01, 2025",
      pointsImpact: -100,
    },
  ];

  const hasViolations = stats.violations.minor > 0 || stats.violations.major > 0;
  const filteredViolations = violations.filter((v) => v.type === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Performance Reports" onBackClick={() => router.push("/profile")} showBack />
      <div className="p-4 space-y-6">
        <AsensoLevelCard />
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Star className="h-6 w-6 text-yellow fill-yellow mb-2" />
              <div className="text-xs text-gray-600 mb-1">Average Rating</div>
              <div className="text-2xl font-bold text-gray-900">{stats.averageRating}</div>
              <div className="text-xs text-gray-500">/5</div>
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
          {!hasViolations ? (

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
                    <Card key={violation.id} className="p-4" data-testid={`card-violation-${violation.id}`}>
                      <div className="flex items-start gap-3">
                        {/* Left: Violation Details */}
                        <Info className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">{violation.title}</div>
                          <p className="text-sm text-gray-600 mt-1">{violation.description}</p>
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
