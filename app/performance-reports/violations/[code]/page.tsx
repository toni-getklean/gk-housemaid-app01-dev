"use client";

import React, { use } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Info, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViolationDetailsPage({ params }: { params: Promise<{ code: string }> }) {
    const router = useRouter();
    const { code } = use(params);

    const { data: violation, isLoading, error } = useQuery({
        queryKey: ["violationDetails", code],
        queryFn: async () => {
            const res = await fetch(`/api/performance-reports/violations/${code}`);
            if (!res.ok) throw new Error("Failed to fetch violation details");
            return res.json();
        },
    });

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                <Header title="Violation Details" showBack onBackClick={() => router.back()} />
                <div className="flex-1 p-4 flex justify-center pt-20">Loading details...</div>
                <BottomNav />
            </div>
        );
    }

    if (error || !violation) {
        return (
            <div className="flex flex-col h-screen bg-gray-50">
                <Header title="Violation Details" showBack onBackClick={() => router.back()} />
                <div className="flex-1 p-4 flex flex-col items-center text-center pt-20">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
                    <p className="text-gray-600">Failed to load violation details.</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 text-blue-600 font-medium"
                    >
                        Go Back
                    </button>
                </div>
                <BottomNav />
            </div>
        );
    }

    const isResolved = violation.status === "RESOLVED";

    return (
        <div className="flex flex-col h-screen bg-gray-50 pb-20">
            <Header title="Violation Details" showBack onBackClick={() => router.back()} />

            <div className="flex-1 overflow-y-auto pt-2">
                <div className="p-4 space-y-6">

                    {/* Violation Information */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">
                                Violation Information
                            </h2>
                            {isResolved ? (
                                <span className="text-xs font-medium text-teal px-2 py-0.5 bg-teal/10 rounded-md uppercase tracking-wider">RESOLVED</span>
                            ) : (
                                <span className="text-xs font-medium text-orange-700 px-2 py-0.5 bg-orange-100 rounded-md uppercase tracking-wider">PENDING</span>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <AlertTriangle className={`h-5 w-5 mt-0.5 ${violation.type === "major" ? "text-red-500" : "text-orange-500"}`} />
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-medium text-gray-900">{violation.title}</p>
                                        <Badge variant={violation.type === "major" ? "destructive" : "secondary"} className="uppercase text-[10px] px-2 py-0 border-none shrink-0">
                                            {violation.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 font-mono">{violation.violationCode}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 text-sm">
                                <Calendar className="h-5 w-5 text-teal mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-gray-500">Reported Date</p>
                                    <p className="font-medium text-gray-900">{violation.date}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3 flex gap-3 text-sm">
                                <FileText className="h-5 w-5 text-teal mt-0.5" />
                                <div className="flex-1 space-y-2">
                                    <p className="text-gray-500">Description</p>
                                    <p className="font-medium text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                                        {violation.description || "No description provided."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Related Booking */}
                    {violation.booking && (
                        <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                            <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Related Booking</h2>
                            <div className="space-y-4">
                                <div className="flex gap-3 text-sm">
                                    <div className="h-5 w-5 flex justify-center items-center mt-0.5 font-bold text-teal">#</div>
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="text-gray-500">Booking Code</p>
                                        <p className="font-medium text-gray-900">{violation.booking.code}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 text-sm">
                                    <Calendar className="h-5 w-5 text-teal mt-0.5" />
                                    <div className="flex-1 flex justify-between items-center">
                                        <p className="text-gray-500">Service Date</p>
                                        <p className="font-medium text-gray-900">{violation.booking.serviceDate}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Impact & Sanction */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                        <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Impact & Sanction</h2>
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                                <div className="flex-1 flex justify-between items-center">
                                    <span className="text-gray-500">Points Deducted</span>
                                    <span className="font-bold text-orange-500 text-base">{violation.pointsImpact} PTS</span>
                                </div>
                            </div>

                            <div className="flex gap-3 text-sm">
                                <Info className="h-5 w-5 text-teal mt-0.5" />
                                <div className="flex-1 space-y-1">
                                    <span className="text-gray-500">Sanction Applied</span>
                                    <p className="font-medium text-gray-900">
                                        {violation.sanction || "No specific sanction recorded."}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                        For more information, please refer to the{" "}
                                        <button onClick={() => router.push("/performance-reports/penalty-guidelines")} className="font-medium text-teal hover:underline inline-block">
                                            Penalty Guidelines
                                        </button>.
                                    </span>
                                </p>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>

            <BottomNav />
        </div>
    );
}
