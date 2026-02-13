"use client";

import React, { use } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Calendar, Info, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ViolationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);

    const { data: violation, isLoading, error } = useQuery({
        queryKey: ["violationDetails", id],
        queryFn: async () => {
            const res = await fetch(`/api/performance-reports/violations/${id}`);
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
        <div className="flex flex-col h-screen bg-gray-50">
            <Header title="Violation Details" showBack onBackClick={() => router.back()} />

            <div className="flex-1 overflow-y-auto pb-20 pt-2">
                <div className="p-4 space-y-4">

                    {/* Violation Information */}
                    <Card className="p-4">
                        <h2 className="text-lg font-semibold text-teal mb-4">
                            Violation Information
                        </h2>

                        <div className="space-y-4">
                            {/* Status - Added here as it fits the info card structure since banner is removed */}
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    {isResolved ? (
                                        <CheckCircle className="h-5 w-5 text-teal" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-orange-500" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Status</p>
                                    <p className={`text-sm font-medium ${isResolved ? 'text-teal' : 'text-orange-600'}`}>
                                        {isResolved ? 'Resolved' : 'Pending Resolution'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${violation.type === "major" ? "text-red-500" : "text-teal"}`} />
                                <div>
                                    <p className="text-sm text-gray-600">Violation Type</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-gray-900">{violation.title}</p>
                                        <Badge variant={violation.type === "major" ? "destructive" : "secondary"} className="uppercase text-[10px] px-2 py-0 border-none">
                                            {violation.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{violation.violationCode}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Reported Date</p>
                                    <p className="text-sm font-medium text-gray-900">{violation.date}</p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Description</p>
                                        <p className="text-sm font-medium text-gray-900 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">
                                            {violation.description || "No description provided."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Related Booking */}
                    {violation.booking && (
                        <Card className="p-4">
                            <h2 className="text-lg font-semibold text-teal mb-4">Related Booking</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-5 flex justify-center mt-0.5">
                                        <span className="text-sm font-bold text-teal">#</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Booking Code</p>
                                        <p className="text-sm font-medium text-gray-900">{violation.booking.code}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-600">Service Date</p>
                                        <p className="text-sm font-medium text-gray-900">{violation.booking.serviceDate}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Impact & Sanction */}
                    <Card className="p-4">
                        <h2 className="text-lg font-semibold text-teal mb-4">Impact & Sanction</h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-5 w-5 flex items-center justify-center mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Points Deducted</p>
                                    <p className="text-lg font-bold text-red-600">{violation.pointsImpact} PTS</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Info className="h-5 w-5 text-teal flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600">Sanction Applied</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {violation.sanction || "No specific sanction recorded."}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-2">
                                <p className="text-sm text-gray-600">
                                    For more information, please refer to the{" "}
                                    <a href="/performance-reports/penalty-guidelines" className="text-sm font-medium text-teal hover:underline inline-block">
                                        Penalty Guidelines
                                    </a>.
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
