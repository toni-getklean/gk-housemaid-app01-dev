import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (date: string, time: string, reasonId: string) => void;
    isLoading: boolean;
}

const RESCHEDULE_REASONS = [
    { code: "OUT_OF_TOWN", label: "Out of Town" },
    { code: "CHANGE_OF_MIND", label: "Change of Mind" },
    { code: "EMERGENCY", label: "Emergency" },
    { code: "PREFERRED_HM_NOT_AVAILABLE", label: "Preferred HM Not Available" },
    { code: "BAD_WEATHER", label: "Bad Weather" },
    { code: "ERRANDS", label: "Errands" },
    { code: "OTHER", label: "Other" },
];

export function RescheduleModal({ isOpen, onClose, onConfirm, isLoading }: RescheduleModalProps) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (date && time && reason) {
            onConfirm(date, time, reason);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reschedule Booking</DialogTitle>
                    <DialogDescription>
                        Propose a new date and time for this booking.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Date</label>
                        <input
                            type="date"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Time</label>
                        <input
                            type="time"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason</label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                {RESCHEDULE_REASONS.map((r) => (
                                    <SelectItem key={r.code} value={r.code}>
                                        {r.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="gap-3 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-teal hover:bg-teal-hover text-white"
                        onClick={handleConfirm}
                        disabled={isLoading || !date || !time || !reason}
                    >
                        Confirm Reschedule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
