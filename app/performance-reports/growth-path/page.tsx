"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, ShieldCheck, ChevronRight, Loader2, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HousemaidTier } from "@/components/HousemaidTierCard";

// Static UI Configuration
const TIER_CONFIG: Record<string, { tagline: string; months: string; color: string; step: string }> = {
    "ENTRY": {
        tagline: "THE STARTING LINE",
        months: "2.5",
        color: "#9E9E9E", // Gray
        step: "STEP 01"
    },
    "BASIC": {
        tagline: "PROVEN PROFESSIONAL",
        months: "3.5",
        color: "#4CAF50", // Green
        step: "STEP 02"
    },
    "ADVANCED": {
        tagline: "ELITE SERVICE PARTNER",
        months: "5.0",
        color: "#E67E22", // Orange
        step: "STEP 03"
    },
    "EXPERT": {
        tagline: "THE GOLD STANDARD",
        months: "7.0",
        color: "#E74C3C", // Red
        step: "STEP 04"
    }
};

export default function GrowthPath() {
    const router = useRouter();
    // Assuming a current points value for demo - in real app would come from profile
    // Fetch Profile Data for Points
    const { data: profile } = useQuery({
        queryKey: ["housemaidProfile"],
        queryFn: async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        }
    });

    const currentPoints = profile?.asensoPointsBalance || 0;

    // Fetch housemaid tiers from DB
    const { data: tiersData, isLoading } = useQuery({
        queryKey: ["housemaidTiers"],
        queryFn: async () => {
            const res = await fetch("/api/lookups/housemaid-tiers");
            if (!res.ok) throw new Error("Failed to fetch tiers");
            return res.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const isCurrentTier = (tier: HousemaidTier, allTiers: HousemaidTier[]) => {
        // Simple Logic: Highest tier where currentPoints >= minPoints
        // This assumes tiers are sorted by minPoints ASC
        if (!allTiers) return false;

        let activeTier = allTiers[0];
        for (let i = allTiers.length - 1; i >= 0; i--) {
            if (currentPoints >= allTiers[i].minPoints) {
                activeTier = allTiers[i];
                break;
            }
        }
        return activeTier?.id === tier.id;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    const tiers = tiersData?.tiers || [];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Growth Path" onBackClick={() => router.back()} showBack />

            <div className="pt-4 px-4 text-center">
                <h1 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">GROWTH PATH</h1>
                <h2 className="text-3xl font-extrabold text-gray-900 italic">HOUSEMAID TIERS</h2>

                {/* Simple Step Indicators (Visual Only) */}
                <div className="flex justify-center items-center gap-2 mt-4 mb-8">
                    {tiers.map((tier: HousemaidTier, idx: number) => {
                        const isActive = isCurrentTier(tier, tiers);
                        const config = TIER_CONFIG[tier.id] || { color: "#ccc" };
                        return (
                            <div key={tier.id} className="flex items-center">
                                <div
                                    className={`h-3 w-3 rounded-full transition-all duration-300 ${isActive ? 'scale-125 ring-2 ring-offset-2 ring-gray-200' : 'opacity-30'}`}
                                    style={{ backgroundColor: config.color }}
                                />
                                {idx < tiers.length - 1 && <div className="w-8 h-px bg-gray-200 mx-1" />}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="px-4 space-y-6">
                {tiers.map((tier: HousemaidTier) => {
                    const config = TIER_CONFIG[tier.id] || { tagline: "", months: "-", color: "#000", step: "STEP ??" };
                    const isCurrent = isCurrentTier(tier, tiers);

                    return (
                        <Card
                            key={tier.id}
                            className={`p-6 relative overflow-hidden transition-all duration-300 ${isCurrent ? 'ring-2 ring-offset-2' : ''}`}
                            style={{
                                borderColor: isCurrent ? config.color : 'transparent',
                                boxShadow: isCurrent ? `0 10px 30px -10px ${config.color}33` : 'none'
                            }}
                        >
                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-6">
                                <Badge
                                    className="px-3 py-1 font-bold text-xs text-white rounded-full pointer-events-none"
                                    style={{ backgroundColor: config.color }}
                                >
                                    {config.step}
                                </Badge>

                                {isCurrent && (
                                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 tracking-wide">
                                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                        CURRENT RANK
                                    </div>
                                )}
                            </div>

                            {/* Title & Tagline */}
                            <div className="mb-6">
                                <h3 className="text-4xl font-black italic text-gray-900 leading-none mb-1">{tier.label.toUpperCase()}</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{config.tagline}</p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-2 mb-8">
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                        {(tier.minPoints / 1000).toFixed(0)}K
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">POINTS</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                        {tier.estimatedBookings ?? "-"}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">JOBS</div>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-3 text-center">
                                    <div className="text-lg font-bold text-gray-900 leading-tight">
                                        {config.months}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase">MONTHS</div>
                                </div>
                            </div>

                            {/* Benefits / Unlocked Items */}
                            <div className="space-y-3">
                                {/* Standard Benefit 1 */}
                                <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
                                        <DollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800 uppercase">
                                            {tier.id === 'ENTRY' ? 'STANDARD PLATFORM ACCESS' :
                                                tier.id === 'EXPERT' ? 'MAXIMUM EARNING POWER' :
                                                    tier.id === 'ADVANCED' ? 'EXPERT TIER EARNINGS' : 'UNLOCK HIGHER WAGES'}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">BASE RATE UPGRADE</div>
                                    </div>
                                </div>

                                {/* Standard Benefit 2 */}
                                <div className="flex items-center gap-4 bg-gray-50/50 p-3 rounded-xl">
                                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-gray-800 uppercase">
                                            {tier.id === 'ENTRY' ? 'BASE RATE EARNINGS' :
                                                tier.id === 'EXPERT' ? 'PREMIUM CLIENT ACCESS' :
                                                    tier.id === 'ADVANCED' ? 'INSTANT PAYOUTS' : 'PRIORITY JOB ACCESS'}
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">PLATFORM STATUS</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {/* Protocol Footer */}
                <div className="bg-[#111827] rounded-3xl p-6 text-white mt-8 mb-8">
                    <h3 className="text-lg font-black italic mb-3">TIER PROTOCOL</h3>
                    <p className="text-xs text-gray-400 leading-relaxed uppercase font-semibold">
                        SALARY UPGRADES ARE PROCESSED AUTOMATICALLY ONCE MILESTONES ARE VERIFIED.
                        MAINTAINING SERVICE QUALITY IS ESSENTIAL FOR TIER PRESERVATION.
                    </p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
