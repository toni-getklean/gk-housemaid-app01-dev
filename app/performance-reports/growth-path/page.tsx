"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Award, Target, Info, Loader2, Wallet, TrendingUp, Star, CheckCircle2, Circle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

export default function GrowthPath() {
    const router = useRouter();

    // Fetch Profile Data for Points
    const { data: profile, isLoading } = useQuery({
        queryKey: ["housemaidProfile"],
        queryFn: async () => {
            const res = await fetch("/api/profile");
            if (!res.ok) throw new Error("Failed to fetch profile");
            return res.json();
        }
    });

    const currentPoints = profile?.asensoPointsBalance || 0;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header 
                title="Growth Path" 
                onBackClick={() => router.back()} 
                showBack 
                rightAction={
                    <button
                        onClick={() => router.push("/leaderboard")}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="View Leaderboard"
                    >
                        <Trophy className="h-5 w-5 text-gray-700" />
                    </button>
                }
            />

            <div className="p-4 space-y-6">

                {/* Housemaid Tier Snapshot */}
                <Card className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-teal">Housemaid Tier</h2>
                        <span className="px-3 py-1 bg-teal/10 text-teal rounded-full text-[10px] font-bold tracking-widest uppercase">
                            Active
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        {/* Current Tier & Base Earnings */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Award className="h-3 w-3 text-teal" /> Current Rank
                            </div>
                            <div className="text-xl font-bold text-gray-900 leading-none mb-1">Regular</div>
                            <div className="text-sm font-semibold text-blue-600">₱650 <span className="text-xs font-medium text-gray-500">/ day</span></div>
                        </div>

                        {/* Next Milestone */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                Next Milestone <TrendingUp className="h-3 w-3 text-teal" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 leading-none mb-1">Plus</div>
                            <div className="text-xs font-medium text-teal flex items-center gap-1">
                                Goal
                            </div>
                        </div>
                    </div>

                    {/* Asenso Points Integration */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow fill-yellow" />
                            <div>
                                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Asenso Points</div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">{currentPoints}</span>
                                    <span className="text-xs font-medium text-gray-500">pts</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-yellow text-gray-900 text-xs font-bold rounded-lg hover:bg-yellow-hover transition-colors">
                            Use Points
                        </button>
                    </div>
                </Card>

                {/* Tier Progression */}
                <div className="space-y-4 pt-2">
                    <h3 className="text-lg font-semibold text-gray-900">Tier Progression</h3>

                    <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                        <div className="space-y-6">

                            {/* Regular (Active) */}
                            <div className="relative">
                                {/* Vertical connection line */}
                                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-teal" />

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 relative z-10">
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-white" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-base font-semibold text-gray-900">Regular</h3>
                                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-800 rounded">₱650/Day</span>
                                        </div>
                                        <p className="text-xs font-semibold text-teal uppercase tracking-widest mb-1.5">Current Tier</p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Standard benefits and initial verification complete.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Plus (Upcoming) */}
                            <div className="relative">
                                <div className="absolute left-[11px] top-8 bottom-[-24px] w-0.5 bg-gray-200" />

                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 relative z-10">
                                        <Circle className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-base font-semibold text-gray-500">PLUS</h3>
                                            <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded">₱850/Day</span>
                                        </div>

                                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Requirements for Plus</div>
                                            <ul className="text-xs text-gray-600 space-y-2">
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300" /> Complete 5+ bookings
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300" /> Maintain 4.8★ user rating
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300" /> Pass Advanced Cert in any skill
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* All-In (Future) */}
                            <div className="relative">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 relative z-10">
                                        <Circle className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="text-base font-semibold text-gray-400">ALL-IN</h3>
                                            <span className="text-xs font-semibold px-2 py-1 bg-amber-50 text-amber-700 rounded">₱1,200/Day</span>
                                        </div>
                                        <p className="text-sm text-gray-500 italic mt-1 leading-relaxed">
                                            Unlock senior mentorship and specialized clinical cleaning tracks. Requires Expert certification in any skill.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Certification Matrix */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Certification Matrix</h3>

                    {/* Housekeeping */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Housekeeping </h4>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">BASIC LEVEL REACHED</div>
                            </div>
                            <span className="text-sm font-bold text-teal">50%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                            <div className="bg-teal h-1.5 rounded-full" style={{ width: '50%' }}></div>
                        </div>
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center">
                            <div>
                                <div className="text-teal mb-0.5">Entry</div>
                                <div className="leading-tight text-gray-600">Linis 101</div>
                            </div>
                            <div>
                                <div className="text-teal mb-0.5">Basic</div>
                                <div className="leading-tight text-gray-600">Level-up Linis</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Adv</div>
                                <div className="leading-tight text-gray-400">Advanced Cleaning</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Expert</div>
                                <div className="leading-tight text-gray-400">Linis Expert</div>
                            </div>
                        </div>
                    </Card>

                    {/* Laundry */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Laundry </h4>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">NOT STARTED</div>
                            </div>
                            <span className="text-sm font-bold text-gray-400">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3" />
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center">
                            <div>
                                <div className="text-gray-400 mb-0.5">Entry</div>
                                <div className="leading-tight text-gray-400">Panimula sa labada</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Basic</div>
                                <div className="leading-tight text-gray-400">Labada: Hugas Husay</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Adv</div>
                                <div className="leading-tight text-gray-400">Advanced Laundry</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Expert</div>
                                <div className="leading-tight text-gray-400">Laundry Expert</div>
                            </div>
                        </div>
                    </Card>

                    {/* Childcare */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Childcare </h4>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">NOT STARTED</div>
                            </div>
                            <span className="text-sm font-bold text-gray-400">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3" />
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center">
                            <div>
                                <div className="text-gray-400 mb-0.5">Entry</div>
                                <div className="leading-tight text-gray-400">Bantay Bata</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Basic</div>
                                <div className="leading-tight text-gray-400">Kalinga Kids</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Adv</div>
                                <div className="leading-tight text-gray-400">Advanced Childcare</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Expert</div>
                                <div className="leading-tight text-gray-400">Childcare Expert</div>
                            </div>
                        </div>
                    </Card>

                    {/* Pet Care */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Pet care </h4>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">NOT STARTED</div>
                            </div>
                            <span className="text-sm font-bold text-gray-400">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3" />
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center">
                            <div>
                                <div className="text-gray-400 mb-0.5">Entry</div>
                                <div className="leading-tight text-gray-400">Starters sa Alaga</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Basic</div>
                                <div className="leading-tight text-gray-400">Pet Tropa Basics</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Adv</div>
                                <div className="leading-tight text-gray-400">Advanced Pet Care</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Expert</div>
                                <div className="leading-tight text-gray-400">Petcare Expert</div>
                            </div>
                        </div>
                    </Card>

                    {/* Ironing */}
                    <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Ironing </h4>
                                <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">NOT STARTED</div>
                            </div>
                            <span className="text-sm font-bold text-gray-400">0%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3" />
                        <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center">
                            <div>
                                <div className="text-gray-400 mb-0.5">Entry</div>
                                <div className="leading-tight text-gray-400">Plantsa 101</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Basic</div>
                                <div className="leading-tight text-gray-400">Plantsa Basics</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Adv</div>
                                <div className="leading-tight text-gray-400">Advanced Ironing</div>
                            </div>
                            <div>
                                <div className="text-gray-400 mb-0.5">Expert</div>
                                <div className="leading-tight text-gray-400">Ironcare Expert</div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* How to level up */}
                <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">How to level up</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4 items-start">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none">01</div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">Earn Points</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Accumulate Asenso points for every successfully completed job and positive feedback.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none">02</div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">Pass Certifications</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Use points to enroll in professional training modules to increase your skill ratings.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none">03</div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-900 mb-1">Auto-Tier Update</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Once requirements are met, your daily base rate automatically increases the following week.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <BottomNav />
        </div>
    );
}
