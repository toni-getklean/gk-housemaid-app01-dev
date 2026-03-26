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
                <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Housemaid Tier</h2>
                        <span className="text-xs font-medium text-teal px-2 py-0.5 bg-teal/10 rounded-md uppercase tracking-wider">
                            ACTIVE
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {/* Current Tier & Base Earnings */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Award className="h-3 w-3 text-teal" /> Current Rank
                            </div>
                            <div className="text-xl font-bold text-gray-900 leading-none mb-1 capitalize">
                                {profile?.currentServiceTierCode ? profile.currentServiceTierCode.toLowerCase().replace('_', '-') : "Regular"}
                            </div>
                            <div className="text-sm font-semibold text-blue-600">
                                ₱{profile?.currentServiceTierCode === 'ALL_IN' ? '1,200' : profile?.currentServiceTierCode === 'PLUS' ? '850' : '650'} <span className="text-xs font-medium text-gray-500">/ day</span>
                            </div>
                        </div>

                        {/* Next Milestone */}
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-center">
                            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                                Next <TrendingUp className="h-3 w-3 text-teal" />
                            </div>
                            <div className="text-xl font-bold text-gray-900 leading-none mb-1 capitalize">
                                {profile?.currentServiceTierCode === 'REGULAR' ? 'Plus' : profile?.currentServiceTierCode === 'PLUS' ? 'All-in' : 'Capped'}
                            </div>
                            <div className="text-xs font-medium text-teal flex items-center gap-1">
                                {profile?.currentServiceTierCode === 'ALL_IN' ? 'Highest Tier Reached' : 'Goal'}
                            </div>
                        </div>
                    </div>

                    {/* Asenso Points Integration */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow fill-yellow mt-0.5" />
                            <div>
                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Asenso Points</div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-gray-900">{currentPoints}</span>
                                    <span className="text-xs font-medium text-gray-500">pts</span>
                                </div>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 bg-[#FFE174] text-[#4C3E00] text-xs font-bold rounded-lg hover:brightness-95 transition-all shadow-sm">
                            USE POINTS
                        </button>
                    </div>
                </Card>

                {/* Tier Progression */}
                <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Tier Progression</h2>

                    <div className="space-y-6 pt-2">
                        {/* Regular */}
                        <div className="relative">
                            {/* Vertical connection line */}
                            <div className={`absolute left-[11px] top-8 bottom-[-24px] w-0.5 ${profile?.currentServiceTierCode === 'REGULAR' ? 'bg-teal' : 'bg-teal'}`} />

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 relative z-10">
                                    {profile?.currentServiceTierCode === 'REGULAR' ? (
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-white" />
                                    ) : (
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-teal-100" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-gray-900 text-sm">Regular</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-800 rounded">₱650/Day</span>
                                    </div>
                                    {profile?.currentServiceTierCode === 'REGULAR' && <p className="text-[10px] font-semibold text-teal uppercase tracking-widest mb-1.5">CURRENT TIER</p>}
                                    <p className="text-xs text-gray-600 leading-relaxed mt-1">
                                        Standard benefits and initial verification complete.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Plus */}
                        <div className="relative">
                            <div className={`absolute left-[11px] top-8 bottom-[-24px] w-0.5 ${profile?.currentServiceTierCode === 'PLUS' ? 'bg-teal' : 'bg-gray-200'}`} />

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 relative z-10">
                                    {profile?.currentServiceTierCode === 'REGULAR' ? (
                                        <Circle className="h-6 w-6 text-gray-300" />
                                    ) : profile?.currentServiceTierCode === 'PLUS' ? (
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-white" />
                                    ) : (
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-teal-100" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold text-sm ${profile?.currentServiceTierCode === 'REGULAR' ? 'text-gray-500' : 'text-gray-900'}`}>PLUS</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded">₱850/Day</span>
                                    </div>

                                    {profile?.currentServiceTierCode === 'PLUS' && <p className="text-[10px] font-semibold text-teal uppercase tracking-widest mb-1.5">CURRENT TIER</p>}

                                    {profile?.currentServiceTierCode === 'REGULAR' && (
                                        <div className="mt-3 bg-gray-50 p-3 rounded-lg border-l-2 border-gray-300">
                                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Requirements for Plus</div>
                                            <ul className="text-xs text-gray-600 space-y-2">
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" /> Complete 5+ bookings
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" /> Maintain 4.8★ user rating
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <Circle className="h-3 w-3 text-gray-300 flex-shrink-0" /> Pass Advanced Cert in any skill
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* All-In */}
                        <div className="relative">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 relative z-10">
                                    {profile?.currentServiceTierCode === 'ALL_IN' ? (
                                        <CheckCircle2 className="h-6 w-6 text-teal fill-white" />
                                    ) : (
                                        <Circle className="h-6 w-6 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 pb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-semibold text-sm ${profile?.currentServiceTierCode === 'ALL_IN' ? 'text-gray-900' : 'text-gray-400'}`}>ALL-IN</h3>
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-amber-50 text-amber-700 rounded">₱1,200/Day</span>
                                    </div>
                                    {profile?.currentServiceTierCode === 'ALL_IN' && <p className="text-[10px] font-semibold text-teal uppercase tracking-widest mb-1.5">CURRENT TIER</p>}
                                    
                                    {profile?.currentServiceTierCode !== 'ALL_IN' ? (
                                        <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">
                                            Unlock senior mentorship and specialized clinical cleaning tracks. Requires Expert certification in any skill.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                                            Senior mentorship and specialized clinical cleaning tracks unlocked.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Certification Matrix */}
                <div className="space-y-4">
                    <h2 className="font-semibold text-teal text-sm uppercase tracking-wide px-1">Certification Matrix</h2>
                    
                    {[
                        { 
                            id: "Housekeeping", 
                            name: "Housekeeping", 
                            levels: [
                                { key: "ENTRY", label: "Entry", desc: "Linis 101" },
                                { key: "BASIC", label: "Basic", desc: "Level-up Linis" },
                                { key: "ADVANCED", label: "Adv", desc: "Advanced Cleaning" },
                                { key: "EXPERT", label: "Expert", desc: "Linis Expert" }
                            ]
                        },
                        { 
                            id: "Laundry", 
                            name: "Laundry", 
                            levels: [
                                { key: "ENTRY", label: "Entry", desc: "Panimula sa labada" },
                                { key: "BASIC", label: "Basic", desc: "Labada: Hugas Husay" },
                                { key: "ADVANCED", label: "Adv", desc: "Advanced Laundry" },
                                { key: "EXPERT", label: "Expert", desc: "Laundry Expert" }
                            ]
                        },
                        { 
                            id: "Childcare", 
                            name: "Childcare", 
                            levels: [
                                { key: "ENTRY", label: "Entry", desc: "Bantay Bata" },
                                { key: "BASIC", label: "Basic", desc: "Kalinga Kids" },
                                { key: "ADVANCED", label: "Adv", desc: "Advanced Childcare" },
                                { key: "EXPERT", label: "Expert", desc: "Childcare Expert" }
                            ]
                        },
                        { 
                            id: "Petcare", 
                            name: "Petcare", 
                            levels: [
                                { key: "ENTRY", label: "Entry", desc: "Starters sa Alaga" },
                                { key: "BASIC", label: "Basic", desc: "Pet Tropa Basics" },
                                { key: "ADVANCED", label: "Adv", desc: "Advanced Pet Care" },
                                { key: "EXPERT", label: "Expert", desc: "Petcare Expert" }
                            ]
                        }
                    ].map((skill, index) => {
                        // Find the highest certification achieved for this skill category
                        const relevantCerts = (profile?.certifications || []).filter((c: any) => c.skillCategory.toLowerCase() === skill.id.toLowerCase());
                        const progressLevels = ["ENTRY", "BASIC", "ADVANCED", "EXPERT"];
                        
                        let highestLevelIndex = -1;
                        if (relevantCerts.length > 0) {
                            // Find max index based on progressLevels array
                            relevantCerts.forEach((c: any) => {
                                const lidx = progressLevels.indexOf(c.trainingLevel);
                                if (lidx > highestLevelIndex) highestLevelIndex = lidx;
                            });
                        }
                        
                        const progressPercent = (highestLevelIndex + 1) * 25;
                        const statusLabel = highestLevelIndex === -1 ? "NOT STARTED" : highestLevelIndex === 3 ? "EXPERT ATTAINED" : `${progressLevels[highestLevelIndex]} LEVEL REACHED`;
                        const statusColor = highestLevelIndex === -1 ? "text-gray-500" : "text-teal";
                        
                        return (
                            <Card key={skill.id} className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold text-gray-900 text-sm">{skill.name}</h4>
                                        <div className={`text-[10px] ${statusColor} font-semibold uppercase tracking-widest`}>{statusLabel}</div>
                                    </div>
                                    <span className={`text-sm font-bold ${highestLevelIndex === -1 ? "text-gray-400" : "text-teal"}`}>{progressPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className="bg-teal h-1.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                                <div className="grid grid-cols-4 gap-1 text-[9px] font-medium uppercase tracking-wider text-center border-t border-gray-100 pt-3">
                                    {skill.levels.map((lvl, index) => {
                                        const isAchieved = index <= highestLevelIndex;
                                        return (
                                            <div key={lvl.key} className="space-y-1 mt-1">
                                                <div className={`${isAchieved ? "text-teal font-bold" : "text-gray-400"} mb-0.5`}>{lvl.label}</div>
                                                <div className={`leading-tight ${isAchieved ? "text-gray-600" : "text-gray-400"}`}>{lvl.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* How to level up */}
                <Card className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">How to level up</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none mt-0.5">01</div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-sm text-gray-900">Earn Points</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Accumulate Asenso points for every successfully completed job and positive feedback.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none mt-0.5">02</div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-sm text-gray-900">Pass Certifications</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Use points to enroll in professional training modules to increase your skill ratings.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="text-2xl font-bold text-gray-200 select-none leading-none mt-0.5">03</div>
                            <div className="flex-1 space-y-1">
                                <h4 className="font-semibold text-sm text-gray-900">Auto-Tier Update</h4>
                                <p className="text-xs text-gray-600 leading-relaxed">Once requirements are met, your daily base rate automatically increases the following week.</p>
                            </div>
                        </div>
                    </div>
                </Card>

            </div>

            <BottomNav />
        </div>
    );
}
