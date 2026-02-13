"use client";

import React from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Info, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ViolationType = {
    violationCode: string;
    type: string;
    title: string;
    description: string;
    points: number;
    sanction: string | null;
}

export default function PenaltyGuidelinesPage() {
    const router = useRouter();

    const { data: guidelines, isLoading, error } = useQuery<ViolationType[]>({
        queryKey: ["penaltyGuidelines"],
        queryFn: async () => {
            const res = await fetch("/api/performance-reports/penalty-guidelines");
            if (!res.ok) throw new Error("Failed to fetch guidelines");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                <Header title="Penalty Guidelines" showBack onBackClick={() => router.back()} />
                <div className="flex-1 p-4 flex justify-center pt-20">Loading guidelines...</div>
                <BottomNav />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                <Header title="Penalty Guidelines" showBack onBackClick={() => router.back()} />
                <div className="flex-1 p-4 flex flex-col items-center text-center pt-20">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                    <p className="text-gray-600">Failed to load guidelines.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-blue-600 font-medium"
                    >
                        Retry
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    const majorViolations = guidelines?.filter(g => g.type === "MAJOR") || [];
    const minorViolations = guidelines?.filter(g => g.type === "MINOR") || [];

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <Header title="Penalty Guidelines" showBack onBackClick={() => router.back()} />

            <div className="flex-1 overflow-y-auto pb-20 pt-2">
                <div className="p-4 space-y-6">

                    {/* Introduction */}
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800 leading-relaxed">
                                Violations are categorized into <span className="font-bold">Major</span> and <span className="font-bold">Minor</span> offenses.
                                Points are deducted from your overall performance score, and repeated offenses may lead to sanctions or termination.
                            </p>
                        </div>
                    </div>

                    {/* Major Violations */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-red-100 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Major Violations</h2>
                        </div>

                        {majorViolations.map((violation) => (
                            <Card key={violation.violationCode} className="p-4 border-l-4 border-l-red-500">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{violation.title}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{violation.violationCode}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-500 mb-1">Deduction</p>
                                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-sm whitespace-nowrap">
                                                {violation.points} PTS
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                        {violation.description}
                                    </p>

                                    {violation.sanction && (
                                        <div className="flex items-start gap-2 text-xs">
                                            <span className="font-bold text-gray-700 flex-shrink-0">Sanction:</span>
                                            <span className="text-red-700 font-medium">{violation.sanction}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                        {majorViolations.length === 0 && <p className="text-gray-500 text-sm italic">No major violations found.</p>}
                    </div>

                    {/* Minor Violations */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-yellow-100 rounded-full">
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Minor Violations</h2>
                        </div>

                        {minorViolations.map((violation) => (
                            <Card key={violation.violationCode} className="p-4 border-l-4 border-l-yellow-500">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{violation.title}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1">{violation.violationCode}</p>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs text-gray-500 mb-1">Deduction</p>
                                            <span className="font-bold text-red-600 bg-red-50 px-2 py-1 rounded text-sm whitespace-nowrap">
                                                {violation.points} PTS
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                        {violation.description}
                                    </p>

                                    {violation.sanction && (
                                        <div className="flex items-start gap-2 text-xs">
                                            <span className="font-bold text-gray-700 flex-shrink-0">Sanction:</span>
                                            <span className="text-gray-700 font-medium">{violation.sanction}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                        {minorViolations.length === 0 && <p className="text-gray-500 text-sm italic">No minor violations found.</p>}
                    </div>

                </div>
            </div>

            <BottomNav />
        </div>
    );
}
