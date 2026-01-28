import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

interface AsensoLevelCardProps {
    currentPoints?: number;
    nextLevelPoints?: number;
    level?: string;
    levelDescription?: string;
    variant?: "default" | "compact";
}

export const AsensoLevelCard: FC<AsensoLevelCardProps> = ({
    currentPoints = 28500,
    nextLevelPoints = 40000,
    level = "BASIC",
    levelDescription = "Unlock New Opportunities",
    variant = "default",
}) => {
    const progress = Math.min((currentPoints / nextLevelPoints) * 100, 100);

    if (variant === "compact") {
        return (
            <Card className="p-4 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-teal/5 to-transparent pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    {/* Left: Icon & Level */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                            <Award className="h-5 w-5 text-teal" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Asenso Level</div>
                            <div className="text-xl font-bold text-gray-900 italic leading-none">{level}</div>
                        </div>
                    </div>

                    {/* Middle: Divider (hidden on small screens if needed, but useful here) */}
                    <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                    {/* Right: Points & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-2 gap-1">
                            <div className="text-xs text-gray-500 leading-tight">{levelDescription}</div>
                            <div className="font-bold text-teal text-sm whitespace-nowrap sm:self-auto">
                                {currentPoints.toLocaleString()} <span className="text-[10px] font-medium text-gray-400">PTS</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                            <div
                                className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <Award className="h-6 w-6 text-teal mb-2" />

                {/* Label */}
                <div className="text-xs text-gray-600 mb-1">Asenso Level</div>

                {/* Level Value */}
                <div className="text-2xl font-bold text-gray-900 italic">{level}</div>

                {/* Description */}
                <div className="text-xs text-gray-500 mt-1">{levelDescription}</div>

                {/* Progress Section */}
                <div className="w-full mt-4 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Salary Upgrade Goal</span>
                        <span className="font-semibold text-gray-900">{currentPoints.toLocaleString()} <span className="text-gray-500 font-normal">PTS</span></span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        Unlock <span className="font-medium text-teal">Advance</span> at {nextLevelPoints.toLocaleString()} points
                    </div>
                </div>
            </div>
        </Card>
    );
};


