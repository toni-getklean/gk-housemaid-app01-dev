import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Award, ArrowUp, Star, TrendingUp } from "lucide-react";
import { ServiceTierBadge } from "@/components/ServiceTierBadge";

// Default tiers used as fallback when DB data hasn't been passed yet
const DEFAULT_TIERS = [
    { id: "REGULAR", label: "Regular", minPoints: 0, color: "#334155", description: "Default starting tier for all new housemaids" },
    { id: "PLUS", label: "Plus", minPoints: 10000, color: "#1D4ED8", description: "Unlocked after achieving Advanced certification in any skill" },
    { id: "ALL_IN", label: "All-in", minPoints: 20000, color: "#B45309", description: "Unlocked after achieving Expert certification in any skill" }
];

export interface HousemaidTier {
    id: string;
    label: string;
    minPoints: number;
    color: string;
    description: string;
    estimatedBookings?: number;
}

interface HousemaidTierCardProps {
    currentPoints?: number;
    rating?: number;
    variant?: "default" | "compact";
    tiers?: HousemaidTier[];
}

export const HousemaidTierCard: FC<HousemaidTierCardProps> = ({
    currentPoints = 0,
    rating = 0,
    variant = "default",
    tiers,
}) => {
    // Use provided tiers or fallback to defaults
    const TIERS = tiers && tiers.length > 0 ? tiers : DEFAULT_TIERS;

    // Determine current level and next level
    let currentLevel = TIERS[0];
    let nextLevel = TIERS[1];

    if (currentPoints < TIERS[0].minPoints) {
        currentLevel = { id: "REGULAR", label: "Regular", minPoints: 0, color: "#9E9E9E", description: "Default starting tier for all new housemaids" };
        nextLevel = TIERS[0];
    } else {
        // Iterate to find the highest tier met
        for (let i = TIERS.length - 1; i >= 0; i--) {
            if (currentPoints >= TIERS[i].minPoints) {
                currentLevel = TIERS[i];
                nextLevel = TIERS[i + 1] || null;
                break;
            }
        }
    }

    // Calculate progress
    let progress = 0;
    let range = 100;
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

    // Calculate Performance Score (0-100) based on PRD formula
    // (Average Rating / 5) * 50 (Fallback to 4.5 if no rating)
    const ratingComponent = ((rating > 0 ? rating : 4.5) / 5) * 50;
    // Mocking Completion (30%) and Violations (20%) until DB provides them
    const completionComponent = 30; // 100% completion
    const violationsComponent = 20; // 0 violations
    
    const performanceScore = Math.round(ratingComponent + completionComponent + violationsComponent);

    let performanceLabel = "GOOD";
    if (performanceScore >= 95) performanceLabel = "EXCELLENT";
    else if (performanceScore >= 85) performanceLabel = "VERY GOOD";
    else if (performanceScore < 75) performanceLabel = "NEEDS IMPROVEMENT";

    return (
        <Card className="p-4 space-y-4">
            <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">
                Career Progress
            </h2>

            <div className="space-y-4">
                {/* Current Tier */}
                <div className="flex items-center gap-3 text-sm">
                    <Award className={`h-5 w-5 ${colorClass}`} style={colorStyle} />
                    <span className="text-gray-500 flex-1">Service Tier</span>
                    <ServiceTierBadge tier={currentLevel.id} />
                </div>

                {/* Next Milestone */}
                <div className="flex gap-3 text-sm">
                    <ArrowUp className="h-5 w-5 text-teal mt-0.5" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Next Milestone</span>
                            <span className="font-medium text-gray-900 uppercase">
                                {nextLevel ? nextLevel.label : "Max Tier"}
                            </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                            <div
                                className="h-full rounded-full transition-all duration-500 ease-out bg-teal"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Asenso Points */}
                <div className="flex items-center gap-3 text-sm">
                    <Star className="h-5 w-5 text-yellow" />
                    <div className="flex-1 flex justify-between items-center">
                        <span className="text-gray-500">Asenso Points</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-yellow px-2 py-0.5 bg-yellow/10 rounded-md">
                                +12 this week
                            </span>
                            <span className="font-medium text-gray-900">{currentPoints.toLocaleString()} pts</span>
                        </div>
                    </div>
                </div>

                {/* Performance */}
                <div className="flex items-center gap-3 text-sm">
                    <TrendingUp className="h-5 w-5 text-teal" />
                    <div className="flex-1 flex justify-between items-center">
                        <span className="text-gray-500">Performance</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-teal px-2 py-0.5 bg-teal/10 rounded-md uppercase tracking-wider">
                                {performanceLabel}
                            </span>
                            <span className="font-medium text-gray-900">{performanceScore} / 100</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};


