
"use client";

import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";

interface AvailabilityFilterProps {
    onReset: () => void;
}

export function AvailabilityFilter({ onReset }: AvailabilityFilterProps) {
    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 gap-2 text-gray-600">
                <Filter className="h-4 w-4" />
                Filter
            </Button>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-gray-500 hover:text-teal"
                onClick={onReset}
            >
                <RotateCcw className="h-4 w-4" />
                Reset View
            </Button>
        </div>
    );
}
