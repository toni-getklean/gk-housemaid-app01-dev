
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ClientRatingProps {
    bookingCode: string;
}

export function ClientRating({ bookingCode }: ClientRatingProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [hoveredRating, setHoveredRating] = useState(0);

    // 1. Fetch Existing Rating
    const { data: existingRating, isLoading } = useQuery({
        queryKey: ["clientRating", bookingCode],
        queryFn: async () => {
            const res = await fetch(`/api/bookings/${bookingCode}/rate-client`);
            if (!res.ok) throw new Error("Failed to fetch rating");
            return res.json();
        },
    });

    // 2. Submit Rating Mutation
    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch(`/api/bookings/${bookingCode}/rate-client`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating, feedback }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to submit rating");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Rating Submitted",
                description: "Thank you! Your feedback has been submitted.",
            });
            queryClient.invalidateQueries({ queryKey: ["clientRating", bookingCode] });
        },
        onError: (error: Error) => {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }

    // A. Read-Only View (Already Rated)
    if (existingRating) {
        return (
            <Card className="p-4 bg-gray-50 border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Your Rating
                </h3>
                <div className="flex gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`h-6 w-6 ${i < existingRating.rating
                                    ? "fill-yellow text-yellow"
                                    : "fill-gray-200 text-gray-200"
                                }`}
                        />
                    ))}
                </div>
                <p className="text-sm text-green-600 flex items-center gap-2 font-medium">
                    <CheckCircle className="h-4 w-4" />
                    "Thank you! Your feedback has been submitted."
                </p>

                {/* We generally wouldn't show the submitted feedback text unless requested, 
            but per spec "Your Rating" block implies showing the stars and gratitude. */}
            </Card>
        );
    }

    // B. Rating Form
    return (
        <Card className="p-4 border-teal/20">
            <h3 className="text-lg font-semibold text-teal mb-1">Rate Client</h3>
            <p className="text-sm text-gray-500 mb-4">
                How was the client experience? Your feedback helps us improve future bookings.
            </p>

            <div className="space-y-4">
                {/* Star Rating Input */}
                <div className="flex justify-center gap-2">
                    {Array.from({ length: 5 }).map((_, i) => {
                        const starValue = i + 1;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setRating(starValue)}
                                onMouseEnter={() => setHoveredRating(starValue)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className="focus:outline-none transition-transform active:scale-95"
                            >
                                <Star
                                    className={`h-8 w-8 transition-colors ${starValue <= (hoveredRating || rating)
                                            ? "fill-yellow text-yellow"
                                            : "fill-gray-200 text-gray-200"
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Feedback Input */}
                <Textarea
                    placeholder="Share your experience with the client (optional)"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    maxLength={500}
                    className="resize-none bg-white"
                    rows={3}
                />

                {/* Submit Button */}
                <Button
                    className="w-full bg-teal hover:bg-teal-hover text-white"
                    disabled={rating === 0 || mutation.isPending}
                    onClick={() => mutation.mutate()}
                >
                    {mutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Rating"
                    )}
                </Button>
            </div>
        </Card>
    );
}
