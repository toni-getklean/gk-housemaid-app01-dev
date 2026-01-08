import { useState, useEffect, useRef } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Trash2, Upload, Save, Loader2, Check, AlertCircle } from "lucide-react";
import { Booking } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";

interface TransportEntry {
    info_sequence: number;
    mode: string;
    cost: number;
    receipt_url: string;
    notes: string;
}

interface BookingTransportTabProps {
    booking: Booking;
    onUpdate: (data: any) => Promise<void>;
}

const VALID_MODES = ['jeepney', 'bus', 'tricycle', 'mrt_lrt', 'taxi_grab', 'motorcycle', 'walking'];

export function BookingTransportTab({ booking, onUpdate }: BookingTransportTabProps) {
    const { toast } = useToast();
    const [commuteEntries, setCommuteEntries] = useState<TransportEntry[]>([]);
    const [returnEntries, setReturnEntries] = useState<TransportEntry[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{type: string, index: number, field: string}[]>([]);
    const { startUpload, isUploading: isUTUploading } = useUploadThing("transportReceipt");
    
    const lastSaveRef = useRef<string>('');

    const sanitizeCost = (value: any): number => {
        if (value === null || value === undefined || value === '') return 0;
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? 0 : num;
    };

    const validateEntries = (commute: TransportEntry[], returnLegs: TransportEntry[]): {type: string, index: number, field: string}[] => {
        const errors: {type: string, index: number, field: string}[] = [];
        
        commute.forEach((entry, index) => {
            if (!entry.mode || !VALID_MODES.includes(entry.mode)) {
                errors.push({ type: 'commute', index, field: 'mode' });
            }
        });
        
        returnLegs.forEach((entry, index) => {
            if (!entry.mode || !VALID_MODES.includes(entry.mode)) {
                errors.push({ type: 'return', index, field: 'mode' });
            }
        });
        
        return errors;
    };

    const hasValidationError = (type: string, index: number, field: string): boolean => {
        return validationErrors.some(e => e.type === type && e.index === index && e.field === field);
    };

    const checkForChanges = (commute: TransportEntry[], returnLegs: TransportEntry[]) => {
        const totalCost = commute.reduce((sum, e) => sum + sanitizeCost(e.cost), 0) +
                          returnLegs.reduce((sum, e) => sum + sanitizeCost(e.cost), 0);
        
        const dataToCheck = {
            commute_to_client_infos: commute.map(e => ({
                ...e,
                cost: sanitizeCost(e.cost),
            })),
            return_from_client_infos: returnLegs.map(e => ({
                ...e,
                cost: sanitizeCost(e.cost),
            })),
            total_transportation_cost: totalCost,
        };

        const dataHash = JSON.stringify(dataToCheck);
        setHasUnsavedChanges(dataHash !== lastSaveRef.current);
    };

    const handleSave = async () => {
        const errors = validateEntries(commuteEntries, returnEntries);
        if (errors.length > 0) {
            setValidationErrors(errors);
            toast({
                title: "Validation Error",
                description: "Please select a transit type for all entries before saving.",
                variant: "destructive",
            });
            return;
        }

        setValidationErrors([]);
        setIsSaving(true);

        try {
            const totalCost = commuteEntries.reduce((sum, e) => sum + sanitizeCost(e.cost), 0) +
                              returnEntries.reduce((sum, e) => sum + sanitizeCost(e.cost), 0);
            
            const dataToSave = {
                commute_to_client_infos: commuteEntries.map(e => ({
                    ...e,
                    cost: sanitizeCost(e.cost),
                })),
                return_from_client_infos: returnEntries.map(e => ({
                    ...e,
                    cost: sanitizeCost(e.cost),
                })),
                total_transportation_cost: totalCost,
            };

            await onUpdate(dataToSave);
            lastSaveRef.current = JSON.stringify(dataToSave);
            setHasUnsavedChanges(false);
            
            toast({
                title: "Saved",
                description: "Transportation details saved successfully.",
            });
        } catch (error) {
            console.error("Save failed:", error);
            toast({
                title: "Save Error",
                description: "Failed to save transportation details. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (booking.transportationLegs) {
            const commute = booking.transportationLegs
                .filter(leg => leg.direction === "TO_CLIENT")
                .map(leg => ({
                    info_sequence: leg.legSequence,
                    mode: leg.mode,
                    cost: sanitizeCost(leg.cost),
                    receipt_url: leg.receiptUrl || "",
                    notes: leg.notes || "",
                }));
            setCommuteEntries(commute);

            const returnLegs = booking.transportationLegs
                .filter(leg => leg.direction === "RETURN")
                .map(leg => ({
                    info_sequence: leg.legSequence,
                    mode: leg.mode,
                    cost: sanitizeCost(leg.cost),
                    receipt_url: leg.receiptUrl || "",
                    notes: leg.notes || "",
                }));
            setReturnEntries(returnLegs);

            const totalCost = commute.reduce((sum, e) => sum + e.cost, 0) + returnLegs.reduce((sum, e) => sum + e.cost, 0);
            const dataHash = JSON.stringify({
                commute_to_client_infos: commute,
                return_from_client_infos: returnLegs,
                total_transportation_cost: totalCost,
            });
            lastSaveRef.current = dataHash;
        }
    }, [booking]);

    const addEntry = (type: "commute" | "return") => {
        const newEntry: TransportEntry = {
            info_sequence: Date.now(),
            mode: "",
            cost: 0,
            receipt_url: "",
            notes: "",
        };

        if (type === "commute") {
            const updated = [...commuteEntries, newEntry];
            setCommuteEntries(updated);
            checkForChanges(updated, returnEntries);
        } else {
            const updated = [...returnEntries, newEntry];
            setReturnEntries(updated);
            checkForChanges(commuteEntries, updated);
        }
    };

    const removeEntry = (type: "commute" | "return", index: number) => {
        if (type === "commute") {
            const updated = [...commuteEntries];
            updated.splice(index, 1);
            setCommuteEntries(updated);
            checkForChanges(updated, returnEntries);
            setValidationErrors(prev => prev.filter(e => !(e.type === 'commute' && e.index === index)));
        } else {
            const updated = [...returnEntries];
            updated.splice(index, 1);
            setReturnEntries(updated);
            checkForChanges(commuteEntries, updated);
            setValidationErrors(prev => prev.filter(e => !(e.type === 'return' && e.index === index)));
        }
    };

    const updateEntry = (
        type: "commute" | "return",
        index: number,
        field: keyof TransportEntry,
        value: any
    ) => {
        if (type === "commute") {
            const entries = [...commuteEntries];
            if (field === 'cost') {
                entries[index] = { ...entries[index], [field]: sanitizeCost(value) };
            } else {
                entries[index] = { ...entries[index], [field]: value };
            }
            setCommuteEntries(entries);
            checkForChanges(entries, returnEntries);
            if (field === 'mode' && value) {
                setValidationErrors(prev => prev.filter(e => !(e.type === 'commute' && e.index === index && e.field === 'mode')));
            }
        } else {
            const entries = [...returnEntries];
            if (field === 'cost') {
                entries[index] = { ...entries[index], [field]: sanitizeCost(value) };
            } else {
                entries[index] = { ...entries[index], [field]: value };
            }
            setReturnEntries(entries);
            checkForChanges(commuteEntries, entries);
            if (field === 'mode' && value) {
                setValidationErrors(prev => prev.filter(e => !(e.type === 'return' && e.index === index && e.field === 'mode')));
            }
        }
    };

    const calculateTotal = (entries: TransportEntry[]) => {
        return entries.reduce((sum, entry) => sum + sanitizeCost(entry.cost), 0);
    };

    const renderEntryForm = (entry: TransportEntry, index: number, type: "commute" | "return") => (
        <div key={`${type}-${index}`} className="bg-gray-50 p-3 rounded-lg space-y-3 mb-3">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Trip {index + 1}</span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEntry(type, index)}
                    className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    disabled={isSaving}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                    <Label className="text-xs">Transit Type <span className="text-red-500">*</span></Label>
                    <Select
                        value={entry.mode}
                        onValueChange={(value) => updateEntry(type, index, "mode", value)}
                        disabled={isSaving}
                    >
                        <SelectTrigger className={`h-9 ${hasValidationError(type, index, 'mode') ? 'border-red-500 ring-1 ring-red-500' : ''}`}>
                            <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="jeepney">Jeepney</SelectItem>
                            <SelectItem value="bus">Bus</SelectItem>
                            <SelectItem value="tricycle">Tricycle</SelectItem>
                            <SelectItem value="mrt_lrt">MRT/LRT</SelectItem>
                            <SelectItem value="taxi_grab">Taxi/Grab</SelectItem>
                            <SelectItem value="motorcycle">Motorcycle</SelectItem>
                            <SelectItem value="walking">Walking</SelectItem>
                        </SelectContent>
                    </Select>
                    {hasValidationError(type, index, 'mode') && (
                        <span className="text-xs text-red-500">Please select a transit type</span>
                    )}
                </div>

                <div className="space-y-1">
                    <Label className="text-xs">Fare (₱)</Label>
                    <Input
                        type="number"
                        value={entry.cost || ''}
                        onChange={(e) => updateEntry(type, index, "cost", e.target.value)}
                        className="h-9"
                        placeholder="0.00"
                        disabled={isSaving}
                    />
                </div>
            </div>

            <div className="space-y-1">
                <Label className="text-xs">Notes (Optional)</Label>
                <Input
                    value={entry.notes}
                    onChange={(e) => updateEntry(type, index, "notes", e.target.value)}
                    className="h-9"
                    placeholder="e.g. From terminal to client"
                    disabled={isSaving}
                />
            </div>

            <div className="space-y-1">
                <Label className="text-xs">Receipt (Optional)</Label>
                <div className="flex items-center gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id={`receipt-${type}-${index}`}
                        disabled={isUTUploading || isSaving}
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                try {
                                    toast({
                                        title: "Uploading Receipt...",
                                        description: "Please wait.",
                                    });
                                    const uploadRes = await startUpload([file]);
                                    if (uploadRes && uploadRes[0]) {
                                        updateEntry(type, index, "receipt_url", uploadRes[0].ufsUrl);
                                        toast({
                                            title: "Upload Complete",
                                            description: "Receipt attached successfully.",
                                        });
                                    }
                                } catch (err) {
                                    console.error("Upload failed", err);
                                    toast({
                                        title: "Upload Error",
                                        description: "Failed to upload receipt.",
                                        variant: "destructive",
                                    });
                                }
                            }
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={isUTUploading || isSaving}
                        onClick={() => document.getElementById(`receipt-${type}-${index}`)?.click()}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        {entry.receipt_url ? "Change Receipt" : (isUTUploading ? "Uploading..." : "Upload Receipt")}
                    </Button>
                    {entry.receipt_url && (
                        <span className="text-xs text-green-600 flex items-center">
                            <Save className="h-3 w-3 mr-1" />
                            Attached
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    const defaultAccordion = ["arrived", "in_progress", "completed"].includes(booking.statusCode)
        ? ["return"]
        : ["commute"];

    const grandTotal = calculateTotal(commuteEntries) + calculateTotal(returnEntries);

    return (
        <div className="space-y-4">
            <Accordion
                type="multiple"
                defaultValue={defaultAccordion}
                className="w-full space-y-4"
            >
                <AccordionItem value="commute" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold text-teal">Commute to Client</span>
                            <span className="text-xs text-gray-500 font-normal">Heading to the client</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                            {commuteEntries.map((entry, index) => renderEntryForm(entry, index, "commute"))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addEntry("commute")}
                                className="w-full border-dashed"
                                disabled={isSaving}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add transportation entry
                            </Button>

                            <div className="flex justify-between items-center pt-2 font-medium">
                                <span>Total Fare:</span>
                                <span>₱{calculateTotal(commuteEntries).toFixed(2)}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="return" className="border rounded-lg px-4 bg-white">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold text-teal">Return Fare</span>
                            <span className="text-xs text-gray-500 font-normal">Returning home</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                        <div className="space-y-4">
                            {returnEntries.map((entry, index) => renderEntryForm(entry, index, "return"))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addEntry("return")}
                                className="w-full border-dashed"
                                disabled={isSaving}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add transportation entry
                            </Button>

                            <div className="flex justify-between items-center pt-2 font-medium">
                                <span>Total Fare:</span>
                                <span>₱{calculateTotal(returnEntries).toFixed(2)}</span>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Grand Total and Save Button */}
            <div className="bg-white border rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Grand Total:</span>
                    <span className="text-teal">₱{grandTotal.toFixed(2)}</span>
                </div>
                
                <Button
                    onClick={handleSave}
                    disabled={isSaving || (!hasUnsavedChanges && commuteEntries.length === 0 && returnEntries.length === 0)}
                    className="w-full bg-teal hover:bg-teal/90 text-white"
                    size="lg"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            {hasUnsavedChanges ? "Save Changes" : "Save Transportation"}
                        </>
                    )}
                </Button>

                {hasUnsavedChanges && (
                    <p className="text-xs text-amber-600 text-center">
                        You have unsaved changes
                    </p>
                )}
            </div>
        </div>
    );
}
