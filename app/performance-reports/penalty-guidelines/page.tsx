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
    performanceDeduction: number;
    asensoDeduction: number;
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
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-6 w-1 bg-red-500 rounded-full"></span>
                            <h3 className="text-lg font-bold text-gray-900">Major Violations</h3>
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-red-500">Critical Impact</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {majorViolations.map((violation) => (
                                <Card key={violation.violationCode} className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm transition-all hover:bg-gray-50 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-red-50 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Performance</span>
                                                <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs min-w-[2.5rem] text-center">
                                                    {violation.performanceDeduction}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Asenso</span>
                                                <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded text-xs min-w-[2.5rem] text-center">
                                                    {violation.asensoDeduction}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{violation.title}</h4>
                                    <p className="text-xs text-gray-500 leading-normal mb-4 flex-1">
                                        {violation.description}
                                    </p>
                                    
                                    {violation.sanction && (
                                        <div className="pt-4 border-t border-gray-100 flex items-center">
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">
                                                Sanction: {violation.sanction}
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            ))}
                            {majorViolations.length === 0 && <p className="text-gray-500 text-sm italic">No major violations found.</p>}
                        </div>
                    </div>

                    {/* Minor Violations */}
                    <div className="space-y-4 pt-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-6 w-1 bg-yellow rounded-full"></span>
                            <h3 className="text-lg font-bold text-gray-900">Minor Violations</h3>
                            <span className="ml-auto text-[10px] font-bold uppercase tracking-widest text-yellow-800">Standard Conduct</span>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {minorViolations.map((violation) => (
                                <Card key={violation.violationCode} className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm transition-all hover:bg-gray-50 flex flex-col h-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-yellow-50 rounded-lg">
                                            <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Performance</span>
                                                <span className="font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded text-xs min-w-[2.5rem] text-center">
                                                    {violation.performanceDeduction}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Asenso</span>
                                                <span className="font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded text-xs min-w-[2.5rem] text-center">
                                                    {violation.asensoDeduction}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{violation.title}</h4>
                                    <p className="text-xs text-gray-500 leading-normal flex-1">
                                        {violation.description}
                                    </p>
                                    
                                    {violation.sanction && (
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center">
                                            <span className="text-[10px] font-bold text-yellow-700 uppercase tracking-widest">
                                                Sanction: {violation.sanction}
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            ))}
                            {minorViolations.length === 0 && <p className="text-gray-500 text-sm italic">No minor violations found.</p>}
                        </div>
                    </div>

                    {/* Footer Help */}
                    <div className="text-center pt-8 pb-4">
                        <p className="text-sm text-gray-500 mb-4">Need to appeal a penalty decision?</p>
                        <button className="bg-gray-100 px-6 py-2.5 rounded-full text-sm font-semibold text-gray-900 hover:bg-gray-200 transition-colors">
                            Contact Support
                        </button>
                    </div>

                </div>
            </div>

            <BottomNav />
        </div>
    );
}
