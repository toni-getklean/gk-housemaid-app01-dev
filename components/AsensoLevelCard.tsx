import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

export const ASENSO_TIERS = [
    { id: "ENTRY", label: "Entry", minPoints: 10000, color: "text-blue-500", description: "Start your journey" },
    { id: "BASIC", label: "Basic", minPoints: 15000, color: "text-teal-500", description: "Unlock standard benefits" },
    { id: "ADVANCED", label: "Advanced", minPoints: 20000, color: "text-purple-500", description: "Higher earnings potential" },
    { id: "EXPERT", label: "Expert", minPoints: 30000, color: "text-yellow-500", description: "Maximum benefits unlocked" }
];

interface AsensoLevelCardProps {
    currentPoints?: number;
    variant?: "default" | "compact";
}

export const AsensoLevelCard: FC<AsensoLevelCardProps> = ({
    currentPoints = 28500,
    variant = "default",
}) => {
    // Determine current level and next level
    let currentLevel = ASENSO_TIERS[0];
    let nextLevel = ASENSO_TIERS[1];
    let isPreEntry = false;

    // Check if points are below the first tier
    if (currentPoints < ASENSO_TIERS[0].minPoints) {
        isPreEntry = true;
        currentLevel = { id: "STARTER", label: "Starter", minPoints: 0, color: "text-gray-500", description: "Start your journey" };
        nextLevel = ASENSO_TIERS[0];
    } else {
        // Iterate to find the highest tier met
        for (let i = ASENSO_TIERS.length - 1; i >= 0; i--) {
            if (currentPoints >= ASENSO_TIERS[i].minPoints) {
                currentLevel = ASENSO_TIERS[i];
                nextLevel = ASENSO_TIERS[i + 1];
                break;
            }
        }
    }

    // Calculate progress
    let progress = 0;
    let range = 100; // Default range
    let currentInLevel = 0;

    if (!nextLevel) {
        // Max level reached
        progress = 100;
    } else {
        const prevLevelPoints = currentLevel.minPoints;
        const nextLevelPoints = nextLevel.minPoints;
        range = nextLevelPoints - prevLevelPoints;
        currentInLevel = currentPoints - prevLevelPoints;

        progress = Math.min((currentInLevel / range) * 100, 100);
        progress = Math.max(progress, 0);
    }

    // Use the tier color or fallback to text-teal/text-gray
    const levelColor = currentLevel.color || "text-teal";

    if (variant === "compact") {
        return (
            <Card className="p-4 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gray-100/50 to-transparent pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    {/* Left: Icon & Level */}
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                            <Award className={`h-5 w-5 ${levelColor}`} />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Asenso Level</div>
                            <div className={`text-xl font-bold italic leading-none text-gray-900`}>{currentLevel.label}</div>
                        </div>
                    </div>

                    {/* Middle: Divider (hidden on small screens if needed, but useful here) */}
                    <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                    {/* Right: Points & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-2 gap-1">
                            <div className="text-xs text-gray-500 leading-tight">{currentLevel.description}</div>
                            <div className={`font-bold text-sm whitespace-nowrap sm:self-auto ${levelColor}`}>
                                {currentPoints.toLocaleString()} <span className="text-[10px] font-medium text-gray-400">PTS</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out bg-current ${levelColor}`}
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
                <Award className={`h-6 w-6 mb-2 ${levelColor}`} />

                {/* Label */}
                <div className="text-xs text-gray-600 mb-1">Asenso Level</div>

                {/* Level Value */}
                <div className="text-2xl font-bold text-gray-900 italic">{currentLevel.label}</div>

                {/* Description */}
                <div className="text-xs text-gray-500 mt-1">{currentLevel.description}</div>

                {/* Progress Section */}
                <div className="w-full mt-4 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Current Points</span>
                        <span className="font-semibold text-gray-900">{currentPoints.toLocaleString()} <span className="text-gray-500 font-normal">PTS</span></span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ease-out bg-current ${levelColor}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {nextLevel ? (
                            <>
                                Unlock <span className={`font-medium ${nextLevel.color || "text-teal"}`}>{nextLevel.label}</span> at {nextLevel.minPoints.toLocaleString()} points
                            </>
                        ) : (
                            <span className="font-medium text-teal">Max Level Reached!</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};


