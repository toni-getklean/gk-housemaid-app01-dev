
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityEditorProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    currentStatus?: {
        status: 'AVAILABLE' | 'ABSENT';
        timeCommitment?: 'FULL_DAY' | 'HALF_DAY';
        reason?: string;
    } | null;
    isBooked?: boolean;
}

export function AvailabilityEditor({ isOpen, onClose, date, currentStatus, isBooked }: AvailabilityEditorProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [status, setStatus] = useState<'AVAILABLE' | 'ABSENT'>('AVAILABLE');
    const [timeCommitment, setTimeCommitment] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY');
    const [reason, setReason] = useState("");

    // Create derived state for 'radio' selection
    // Options: 'available_full', 'available_half', 'absent'
    const [selection, setSelection] = useState<string>('available_full');

    useEffect(() => {
        if (isOpen && currentStatus) {
            setStatus(currentStatus.status);
            setTimeCommitment(currentStatus.timeCommitment || 'FULL_DAY');
            setReason(currentStatus.reason || "");

            if (currentStatus.status === 'ABSENT') {
                setSelection('absent');
            } else if (currentStatus.status === 'AVAILABLE' && currentStatus.timeCommitment === 'HALF_DAY') {
                setSelection('available_half');
            } else {
                setSelection('available_full');
            }
        } else {
            // Default reset
            setStatus('AVAILABLE');
            setTimeCommitment('FULL_DAY');
            setReason("");
            setSelection('available_full');
        }
    }, [isOpen, currentStatus]);

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await fetch("/api/availability", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update availability");
            }
            return res.json();
        },
        onSuccess: () => {
            toast({
                title: "Availability Updated",
                description: "Your schedule has been updated successfully.",
            });
            queryClient.invalidateQueries({ queryKey: ["availability"] });
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSave = () => {
        if (!date) return;

        // Map selection to payload
        let finalStatus = 'AVAILABLE';
        let finalCommitment = 'FULL_DAY';

        if (selection === 'absent') {
            finalStatus = 'ABSENT';
            finalCommitment = 'FULL_DAY'; // Ignore
        } else if (selection === 'available_half') {
            finalStatus = 'AVAILABLE';
            finalCommitment = 'HALF_DAY';
        } else {
            finalStatus = 'AVAILABLE';
            finalCommitment = 'FULL_DAY';
        }

        mutation.mutate({
            date: format(date, "yyyy-MM-dd"),
            status: finalStatus,
            timeCommitment: finalStatus === 'AVAILABLE' ? finalCommitment : undefined,
            reason: reason,
        });
    };

    const handleReset = () => {
        // Resetting effectively means setting to Available Full Day (which deletes the record)
        if (!date) return;
        mutation.mutate({
            date: format(date, "yyyy-MM-dd"),
            status: 'AVAILABLE',
            timeCommitment: 'FULL_DAY',
            reason: '',
        });
    }

    if (!date) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="rounded-t-xl h-[90vh] sm:h-auto">
                <SheetHeader>
                    <SheetTitle>Edit Availability</SheetTitle>
                    <SheetDescription>
                        {format(date, "MMMM d, yyyy")}
                    </SheetDescription>
                </SheetHeader>

                {isBooked ? (
                    <div className="py-6 flex flex-col items-center text-center space-y-3">
                        <AlertCircle className="h-12 w-12 text-blue-500" />
                        <h3 className="font-semibold text-gray-900">Booked Date</h3>
                        <p className="text-sm text-gray-500">
                            This date has an active booking and cannot be edited.
                        </p>
                        <Button variant="outline" className="w-full" onClick={onClose}>Close</Button>
                    </div>
                ) : (
                    <div className="py-6 space-y-6">
                        <RadioGroup value={selection} onValueChange={(val) => {
                            setSelection(val);
                            // Update reason logic if needed
                        }}>
                            {/* Available Full Day */}
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelection('available_full')}>
                                <RadioGroupItem value="available_full" id="opt-full" />
                                <Label htmlFor="opt-full" className="flex-1 cursor-pointer">
                                    <span className="block font-medium text-gray-900">Available (Full Day)</span>
                                    <span className="block text-xs text-gray-500">Default availability (8 AM - 5 PM)</span>
                                </Label>
                                <div className="h-3 w-3 rounded-full bg-green-500" />
                            </div>

                            {/* Available Half Day */}
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelection('available_half')}>
                                <RadioGroupItem value="available_half" id="opt-half" />
                                <Label htmlFor="opt-half" className="flex-1 cursor-pointer">
                                    <span className="block font-medium text-gray-900">Available (Half Day)</span>
                                    <span className="block text-xs text-gray-500">Limited availability (4 hours)</span>
                                </Label>
                                <div className="h-3 w-3 rounded-full bg-orange-500" />
                            </div>

                            {/* Absent */}
                            <div className="flex items-center space-x-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => setSelection('absent')}>
                                <RadioGroupItem value="absent" id="opt-absent" />
                                <Label htmlFor="opt-absent" className="flex-1 cursor-pointer">
                                    <span className="block font-medium text-gray-900">Absent / Time Off</span>
                                    <span className="block text-xs text-gray-500">Mark as unavailable for bookings</span>
                                </Label>
                                <div className="h-3 w-3 rounded-full bg-red-500" />
                            </div>
                        </RadioGroup>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Doctor's appointment, Personal emergency"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                className="w-full bg-teal hover:bg-teal-hover text-white"
                                onClick={handleSave}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>

                            {/* Show Reset button if there is an existing record (meaning non-default state) */}
                            {currentStatus && (
                                <Button
                                    variant="ghost"
                                    className="w-full text-gray-500"
                                    onClick={handleReset}
                                    disabled={mutation.isPending}
                                >
                                    Reset to Default
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
