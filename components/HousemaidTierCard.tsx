import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

// Default tiers used as fallback when DB data hasn't been passed yet
const DEFAULT_TIERS = [
    { id: "ENTRY", label: "Entry", minPoints: 10000, color: "#9E9E9E", description: "Start your journey" },
    { id: "BASIC", label: "Basic", minPoints: 15000, color: "#4CAF50", description: "Unlock standard benefits" },
    { id: "ADVANCED", label: "Advanced", minPoints: 20000, color: "#E67E22", description: "Higher earnings potential" },
    { id: "EXPERT", label: "Expert", minPoints: 30000, color: "#E74C3C", description: "Maximum benefits unlocked" }
];

export interface HousemaidTier {
    id: string;
    label: string;
    minPoints: number;
    color: string;
    description: string;
}

interface HousemaidTierCardProps {
    currentPoints?: number;
    variant?: "default" | "compact";
    tiers?: HousemaidTier[];
}

export const HousemaidTierCard: FC<HousemaidTierCardProps> = ({
    currentPoints = 28500,
    variant = "default",
    tiers,
}) => {
    // Use provided tiers or fallback to defaults
    const TIERS = tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS;

    // Determine current level and next level
    let currentLevel = TIERS[0];
    let nextLevel = TIERS[1];

    // Check if points are below the first tier
    if (currentPoints < TIERS[0].minPoints) {
        currentLevel = { id: "STARTER", label: "Starter", minPoints: 0, color: "#9E9E9E", description: "Start your journey" };
        nextLevel = TIERS[0];
    } else {
        // Iterate to find the highest tier met
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (currentPoints >= TIERS[i].minPoints) {
                currentLevel = TIERS[i];
                nextLevel = TIERS[i + 1];
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

    // Handle color: check if it's a hex code or class
    const levelColor = currentLevel.color || "#0d9488"; // default teal
    const isHex = levelColor.startsWith("#");
    const colorStyle = isHex ? { color: levelColor } : {};
    const colorClass = isHex ? "" : levelColor;

    if (variant === "compact") {
        return (
            <Card className="p-4 bg-white border border-gray-100 shadow-sm relative overflow-hidden">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-gray-100/50 to-transparent pointer-events-none" />

                <div className="flex items-center gap-4 relative z-10">
                    {/* Left: Icon & Level */}
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0`}>
                            <Award className={`h-5 w-5 ${colorClass}`} style={colorStyle} />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Housemaid Tier</div>
                            <div className={`text-xl font-bold italic leading-none text-gray-900`}>{currentLevel.label}</div>
                        </div>
                    </div>

                    {/* Middle: Divider (hidden on small screens if needed, but useful here) */}
                    <div className="h-8 w-px bg-gray-100 mx-2 hidden sm:block"></div>

                    {/* Right: Points & Progress */}
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-2 gap-1">
                            <div className="text-xs text-gray-500 leading-tight">{currentLevel.description}</div>
                            <div className={`font-bold text-sm whitespace-nowrap sm:self-auto ${colorClass}`} style={colorStyle}>
                                {currentPoints.toLocaleString()} <span className="text-[10px] font-medium text-gray-400">PTS</span>
                            </div>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ease-out bg-current ${colorClass}`}
                                style={{ width: `${progress}%`, ...colorStyle }}
                            />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Default Variant (Full)
    return (
        <Card className="p-4">
            <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <Award className={`h-6 w-6 mb-2 ${colorClass}`} style={colorStyle} />

                {/* Label */}
                <div className="text-xs text-gray-600 mb-1">Housemaid Tier</div>

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
                            className={`h-full rounded-full transition-all duration-500 ease-out bg-current ${colorClass}`}
                            style={{ width: `${progress}%`, ...colorStyle }}
                        />
                    </div>
                    <div className="text-xs text-gray-500">
                        {nextLevel ? (
                            <>
                                Unlock <span className={`font-medium ${nextLevel.color?.startsWith("#") ? "" : (nextLevel.color || "text-teal-600")}`} style={nextLevel.color?.startsWith("#") ? { color: nextLevel.color } : {}}>{nextLevel.label}</span> at {nextLevel.minPoints.toLocaleString()} points
                            </>
                        ) : (
                            <span className="font-medium text-teal-600">Max Level Reached!</span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};


