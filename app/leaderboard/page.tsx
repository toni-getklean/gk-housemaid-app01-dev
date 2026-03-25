"use client";

import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, PlusCircle, MinusCircle, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data based on the HTML reference and instructions
const topPerformers = [
    { rank: 2, name: "Elena R.", points: 42500, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBdQ7JV5tDhFwmJjl-_tjwqe3Tz_9k_seb2heyMX7g37yFXvT4BL2DGHylL0PXviAUmcXKazffNmuKYXQCgKY01H_HnsCSfEIpzoKzRlTt0DKZd2zn89TXf3mdjGmqUoFYnkM-nEboVetFSTUeTJPYkxk42HaibEYfm2Yg7g2jsMs8LY-fNB76bLFVUMkakAfho7EvDCr9aT-OiPAUKZJ-ZVZX9l8GQYFFrq4eJGdXZ3Qk4-d3lqDOwEXXW66qIKkfbGybg9UFE7ig" },
    { rank: 1, name: "Marcus G.", points: 51200, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfl_Nl_ZfnW7X9DaegerOQMrIQ02no8sV89xt7yvca-CwNnETXg9oW1uTJ8Ogk1ZqcCWD-HsPppD3M43V8TUcANr_t1S9mFSRz8VH5eYdPof3-VtFmBIfFTjdDslG6CMtkBF_lB4V6xAvqE7JpOKo9G1SmidJkg9qqads8KJfwHHMXndBpvW4uBw4nynXq41tyAd6-IFINVogJ0a7q7Bo5sfsD--_54_joiKwG01DOKZspWbn_vGEJtF3hD7N3GReNJB9UWTG67xHn" },
    { rank: 3, name: "Sarah L.", points: 38900, avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5zECvTlY65qKgtIVE78GdN_2_AzGAO9AOsGW8eRPRHh-XR33nUV4vsnlD-0K_6UQqI3ouKVNnvfKaralcT-RIDOZTesHsUZWeTZOms0RIPmuGJV9Wf8fqAcUEy_o7uY4PmUEAyngSyAN2zsUYVThtOey5odePSm7Mo-xpmBm9YgVCIP0srRw6eXnzhq3PWxkTUqsNFRJKzHbviGzE5YqdSaKPKHfnlrmkECM0FsWu8mHi2ZuL8yX7Hnncpydmws51YnurF7VbUILL" },
];

const leaderboardList = [
    { rank: 4, name: "Sofia Vergara", points: 24500, tier: "All-in", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBs4vh9mIdL-yIOMosZhWj-lFbP0jayhIJEGH9hsOQ8s9cCTQEz-XOnjBW98znJhvgo0KRRrFYqlpTWnE3PhsCe_Dtt8hnBc-2ijMX_8dGZyrqRMkMgQOGpNz_XnX-u6TkZQuXRpnfDEgneoo4LNOV7qvYBn8TkKBVu8djuoduUG_dqMnfQqPLaPtneQZqDso3_ghFbFaCdfYRI81gBGbc-dNo_u44zx4if2t0fxeO-ywKHcxjBbOobr9izULNOMy5wx2-vuYbFTFYv", stats: { completed: 142, declined: 2, violations: 0, earnings: "32k" } },
    { rank: 5, name: "Ricardo D.", points: 21200, tier: "Plus", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0c9MeV2oT7GfRz2kB9YWjmy70txE_eJ3DSkZvy57oGoLz6bTm9Z-ioe9oLSzfogOuU7aI5gXXM1mowfS5_6qBvAlGNCvDA89XRgB-B1S0GuBGYjTGHyUTZGYwHJwf1BCcBVm-TQqftR7DGKLC6H02Swg5kdZWfWDhtjk0zf12Wb5RlKTbzsPUeO_pHmZmls3_5QJgl3qMOX8-c7A304zconZiLz7ypm5yM5gS7AmCqtmfK7Kow3r-5Pv6Quujqj72NH9RiCKMIkbk", stats: { completed: 118, declined: 5, violations: 1, earnings: "28k" } },
    { rank: 6, name: "Antonio L.", points: 19800, tier: "Regular", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAOgRaeJUURrs4hW__yUvlHxl6HyRwKiFAs--rl5dLb79xoXYiCyPKVqu5zV2YysLYrs1QMNXEhDxMjyVz1vYGXrJaBh0fXcjDhm4kMGBtOPtaEuw-NCXMBWH6L6iuA9JDxUOvmKUXth0y6tF3brJjyvx-7IBf-dIkHVeshXP6GxpA5yb0Iuc5aSVp6p6sxqGUfFbgZneFM7uTS_97aiIv_Qnj9x4v71J0Kk8aqjs3FAcU-qHfgU7CuE-tnsq6tVtKIWJs5aJ7p5HWm", stats: { completed: 95, declined: 1, violations: 0, earnings: "24k" } },
];

export default function LeaderboardPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header title="Leaderboard" onBackClick={() => router.back()} showBack />

            <div className="p-4 space-y-6">

                {/* Top Performers (Top 3) */}
                <section>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h2>
                    <div className="grid grid-cols-3 gap-3 items-end h-auto pt-2">
                        {topPerformers.map((performer, idx) => (
                            <Card
                                key={performer.rank}
                                className={`p-4 flex flex-col items-center text-center shadow-sm ${
                                    performer.rank === 1 ? 'ring-2 ring-yellow border-yellow' : 'border-gray-200'
                                }`}
                            >
                                <div className="relative mb-3">
                                    <Avatar className={performer.rank === 1 ? 'w-16 h-16' : 'w-12 h-12'}>
                                        <AvatarImage src={performer.avatar} alt={performer.name} />
                                        <AvatarFallback className="bg-gray-100 text-gray-500">
                                            {performer.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className={`absolute -bottom-2 -right-2 text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white text-white ${
                                        performer.rank === 1 ? 'bg-yellow w-7 h-7 -bottom-2 -right-2 text-xs' :
                                        performer.rank === 2 ? 'bg-gray-400' : 'bg-orange-400'
                                    }`}>
                                        {performer.rank}
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-gray-900 truncate w-full mb-1">{performer.name}</p>
                                <p className="text-xs text-teal font-bold">{performer.points.toLocaleString()} pts</p>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Your Rank Highlight */}
                <section>
                    <Card className="p-4 flex items-center justify-between border-teal bg-teal/5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar className="w-12 h-12 border-2 border-teal/20">
                                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRdmZxNKlB5j8qCcWZBi3lX9WcLK8nAEYwyaelee-3c6JVv0PZm2VGgtrA28QgiwBexEyVJos1Wgx1_br2grp6x4C3aQbF6foLmzX2L8RPC326PgFo6U_7YQN1UpejfuaOukXnGi2zQOjt-ir8UylbEz2TrsLqo_5DWEQ-BiiTHbcE-spN9SVc4HQFF4JxAYDqcYel3B-6XBqMNn9hdj_q_KFNde6HZWHgzbKoco-twrSc1R7aPLTFY6kpj-agTPrCp_si6FH4YvsQ" alt="You" />
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs uppercase text-teal font-medium mb-0.5">Your Current Rank</p>
                                <h3 className="text-lg font-bold text-gray-900">
                                    Rank #42 <span className="text-xs font-normal text-gray-500">(Top 15%)</span>
                                </h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">12,450</p>
                            <p className="text-xs text-gray-500 uppercase">Points</p>
                        </div>
                    </Card>
                </section>

                {/* How Ranking Works */}
                <section>
                    <Card className="p-5 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-gray-100 rounded-lg">
                                <Info className="h-4 w-4 text-gray-700" />
                            </div>
                            <h4 className="font-semibold text-gray-900 text-sm">How Ranking Works</h4>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                            Rankings are updated every Monday at 12:00 AM. Your position is calculated based on <span className="font-semibold text-teal">Asenso Points</span>, which are earned through completed bookings, high ratings, and platform reliability.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4 text-green-600" />
                                <span className="text-xs font-medium text-gray-700">+10 pts / Completion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MinusCircle className="h-4 w-4 text-red-600" />
                                <span className="text-xs font-medium text-gray-700">-5 pts / Violation</span>
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Leaderboard List */}
                <section>
                    <h4 className="font-semibold text-gray-900 mb-3 px-1">Top Performers</h4>
                    <div className="space-y-3">
                        {leaderboardList.map((user) => (
                            <Card key={user.rank} className="shadow-sm hover:bg-gray-50 transition-colors overflow-hidden">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-base font-bold text-gray-400 w-5 text-center">#{user.rank}</div>
                                        <Avatar className="w-10 h-10 border border-gray-100">
                                            <AvatarImage src={user.avatar} alt={user.name} />
                                            <AvatarFallback className="bg-gray-100 text-xs">{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h5 className="font-semibold text-sm text-gray-900">{user.name}</h5>
                                            <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-widest ${
                                                user.tier === 'All-in' ? 'bg-amber-50 text-amber-700' :
                                                user.tier === 'Plus' ? 'bg-blue-50 text-blue-700' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                                {user.tier}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col justify-center">
                                        <div className="text-sm font-bold text-teal">{user.points.toLocaleString()} pts</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 py-3 px-4 border-t border-gray-100 bg-gray-50/50">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase mb-1">COMPLETED</p>
                                        <p className="text-sm font-bold text-gray-900">{user.stats.completed}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase mb-1">DECLINED</p>
                                        <p className="text-sm font-bold text-gray-900">{user.stats.declined}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase mb-1">VIOLATION</p>
                                        <p className={`text-sm font-bold ${user.stats.violations > 0 ? 'text-red-600' : 'text-gray-900'}`}>{user.stats.violations}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 uppercase mb-1">EARNINGS</p>
                                        <p className="text-sm font-bold text-teal">₱{user.stats.earnings}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

            </div>

            <BottomNav />
        </div>
    );
}
