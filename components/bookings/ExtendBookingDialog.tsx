"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface ExtendBookingDialogProps {
    bookingCode: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function ExtendBookingDialog({ bookingCode, isOpen, onClose, onSuccess }: ExtendBookingDialogProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [additionalHours, setAdditionalHours] = useState<number>(1);
    const [notes, setNotes] = useState("");
    const [clientApproved, setClientApproved] = useState(false);

    const handleSubmit = async () => {
        if (!clientApproved) {
            toast({
                title: "Client Approval Required",
                description: "You must confirm that the client approved the additional time and charge.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/bookings/${bookingCode}/extend`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ additionalHours, notes, clientApproved })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to extend booking");
            }

            toast({
                title: "Booking Extended",
                description: `Successfully added ${additionalHours} hour(s).`
            });
            
            router.refresh(); // Invalidate cache & refresh summary / DB sync
            
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Something went wrong.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md mx-auto rounded-lg" style={{width: '90%'}}>
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl">Request Extension</DialogTitle>
                    <DialogDescription className="mt-1.5">
                        Extend the current booking if the client requested more time. Extension rate is ₱100/hr.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Select Additional Hours</Label>
                        <RadioGroup
                            defaultValue="1"
                            onValueChange={(val) => setAdditionalHours(parseInt(val))}
                            className="flex flex-col space-y-2 mt-2"
                        >
                            <div className="flex items-center space-x-3 border p-3 rounded-md has-[[data-state=checked]]:border-teal has-[[data-state=checked]]:bg-teal/5 cursor-pointer">
                                <RadioGroupItem value="1" id="r1" />
                                <Label htmlFor="r1" className="cursor-pointer font-medium w-full">+1 Hour (+₱100)</Label>
                            </div>
                            <div className="flex items-center space-x-3 border p-3 rounded-md has-[[data-state=checked]]:border-teal has-[[data-state=checked]]:bg-teal/5 cursor-pointer">
                                <RadioGroupItem value="2" id="r2" />
                                <Label htmlFor="r2" className="cursor-pointer font-medium w-full">+2 Hours (+₱200)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">Notes (Optional)</Label>
                        <Textarea 
                            placeholder="Client requested more time to finish the kitchen..." 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                        />
                    </div>

                    <div className="flex items-start space-x-3 bg-amber-50 p-3 rounded-md border border-amber-100">
                        <Checkbox 
                            id="approval" 
                            checked={clientApproved}
                            onCheckedChange={(c: boolean) => setClientApproved(c)}
                            className="mt-1"
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="approval"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-amber-900"
                            >
                                Confirm Client Approval
                            </Label>
                            <p className="text-xs text-amber-700 leading-snug">
                                I confirm that the client verbally approved the additional time and cost.
                            </p>
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading || !clientApproved} className="w-full sm:w-auto bg-teal hover:bg-teal-hover">
                        {isLoading ? "Extending..." : "Confirm Extension"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
