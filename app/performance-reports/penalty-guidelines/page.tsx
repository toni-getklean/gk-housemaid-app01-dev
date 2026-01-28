"use client";

import { Header } from "@/components/Header";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function PenaltyGuidelines() {
    const router = useRouter();

    const majorViolations = [
        { name: "THEFT", sanction: "Termination", points: "-" },
        { name: "SULOT CLIENT", sanction: "1st - 30 days suspension\n2nd - termination", points: "10,000 ASENSO PTS" },
        { name: "DAMAGE TO PROPERTY", sanction: "3 days suspension kung\nkapabayaan ng HM", points: "5,000 ASENSO PTS" },
        { name: "INCORRECT SHARE AMOUNT", sanction: "1st - 10 days suspension\n2nd - 20 days suspension\n3rd - Termination", points: "5,000 ASENSO PTS" },
        { name: "GROSS MISCONDUCT", sanction: "5 Days suspension if\nproven guilty", points: "5,000 ASENSO PTS" },
        { name: "ALCOHOL / DRUG ABUSE", sanction: "5 Days suspension if\nproven guilty", points: "3,500 ASENSO PTS" },
        { name: "FAKE TRANSPO", sanction: "5 Days suspension if\nproven guilty", points: "2,000 ASENSO PTS" },
        { name: "NO SHOW TO BOOKING", sanction: "3 Days suspension", points: "1,500 ASENSO PTS" },
        { name: "IMPROPER BACKOUT", sanction: "3 Days suspension", points: "1,500 ASENSO PTS" },
        { name: "UNAUTHORIZED USE OF\nCLIENTS PROPERTY", sanction: "3 Days suspension", points: "1,000 ASENSO PTS" },
    ];

    const minorViolations = [
        { name: "LATE ARRIVAL", points: "200 ASENSO PTS" },
        { name: "UNPROFESSIONAL BEHAVIOR", points: "300 ASENSO PTS" },
        { name: "NOT UPDATING", points: "150 ASENSO PTS" },
        { name: "PICTURE WITHOUT PERMISSION", points: "200 ASENSO PTS" },
    ];

    const minorSanction = "1st - Verbal Warning\n2nd - Written Warning\n3rd - 2 Days Suspension\n4th - 5 Days Suspension\n5th - 10 Days Suspension";

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Header title="Penalty Guidelines" onBackClick={() => router.back()} showBack />

            <div className="p-4 space-y-8">
                {/* MAJOR VIOLATIONS */}
                <section className="space-y-3">
                    <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Major Violations</h2>
                    <Card className="overflow-hidden border-0 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-teal/5 text-teal font-semibold border-b border-teal/10">
                                    <tr>
                                        <th className="p-3 border-r border-teal/10 w-[40%]">VIOLATION</th>
                                        <th className="p-3 border-r border-teal/10 text-center w-[35%]">SANCTION</th>
                                        <th className="p-3 text-right w-[25%]">DEDUCTION</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {majorViolations.map((item, index) => (
                                        <tr key={index} className={`border-b border-gray-200 last:border-0 hover:bg-teal/5 transition-colors ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                                            <td className="p-3 font-medium text-gray-900 border-r border-gray-200 uppercase align-middle">
                                                {item.name}
                                            </td>
                                            <td className="p-3 text-center border-r border-gray-200 whitespace-pre-line leading-tight align-middle">
                                                {item.sanction}
                                            </td>
                                            <td className="p-3 text-right font-bold text-orange-500 align-middle">
                                                {item.points !== "-" ? item.points.replace(" ASENSO PTS", "") : "-"}
                                                {item.points !== "-" && <span className="text-[10px] font-normal text-gray-400 block">PTS</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>

                {/* MINOR VIOLATIONS */}
                <section className="space-y-3">
                    <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Minor Violations</h2>
                    <Card className="overflow-hidden border-0 shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left border-collapse">
                                <thead className="bg-teal/5 text-teal font-semibold border-b border-teal/10">
                                    <tr>
                                        <th className="p-3 border-r border-teal/10 w-[40%]">VIOLATION</th>
                                        <th className="p-3 border-r border-teal/10 text-center w-[35%]">SANCTION</th>
                                        <th className="p-3 text-right w-[25%]">DEDUCTION</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {minorViolations.map((item, index) => (
                                        <tr key={index} className={`border-b border-gray-200 last:border-0 hover:bg-teal/5 transition-colors ${index % 2 === 1 ? "bg-gray-50" : "bg-white"}`}>
                                            <td className="p-3 font-medium text-gray-900 border-r border-gray-200 uppercase align-middle">
                                                {item.name}
                                            </td>

                                            {/* Sanction Column - Uses rowSpan */}
                                            {index === 0 && (
                                                <td
                                                    rowSpan={minorViolations.length}
                                                    className="p-3 text-center border-r border-gray-200 whitespace-pre-line leading-tight align-middle bg-white"
                                                >
                                                    {minorSanction}
                                                </td>
                                            )}

                                            <td className="p-3 text-right font-bold text-orange-500 align-middle">
                                                {item.points.replace(" ASENSO PTS", "")}
                                                <span className="text-[10px] font-normal text-gray-400 block">PTS</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
