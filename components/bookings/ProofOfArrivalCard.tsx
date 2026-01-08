import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, MapPin, Camera, X, Loader2, CheckCircle2, Clock } from "lucide-react";
import { Booking } from "@/lib/database";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useUploadThing } from "@/lib/uploadthing";

interface ProofOfArrivalCardProps {
    booking: Booking;
    onUploadSuccess?: () => void;
}

export function ProofOfArrivalCard({ booking, onUploadSuccess }: ProofOfArrivalCardProps) {
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Check if already submitted
    const proofOfArrivalSubmitted = !!booking.proofOfArrivalImg;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const { startUpload, isUploading: isUTUploading } = useUploadThing("proofOfArrival");

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Upload to UploadThing
            const uploadRes = await startUpload([file]);
            if (!uploadRes || !uploadRes[0]) {
                throw new Error("Upload to storage failed");
            }
            const imageUrl = uploadRes[0].ufsUrl;

            // 2. Get location if possible
            let metadata = "";
            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject);
                    });
                    metadata = JSON.stringify({
                        timestamp: new Date().toISOString(),
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                } catch (err) {
                    console.error("Error getting location", err);
                    metadata = JSON.stringify({
                        timestamp: new Date().toISOString(),
                        error: "Location access denied or failed"
                    });
                }
            } else {
                metadata = JSON.stringify({
                    timestamp: new Date().toISOString(),
                    error: "Geolocation not supported"
                });
            }

            // 3. Save to Backend
            const response = await fetch(`/api/bookings/${booking.bookingCode}/proof-of-arrival`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    imageUrl: imageUrl,
                    metadata: metadata
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save proof of arrival");
            }

            toast({
                title: "Success",
                description: "Proof of arrival uploaded successfully.",
            });

            if (onUploadSuccess) {
                onUploadSuccess();
            }
        } catch (error) {
            console.error("Error uploading proof:", error);
            toast({
                title: "Error",
                description: "Failed to upload proof of arrival.",
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const isReadOnly = ["arrived", "in_progress", "completed"].includes(booking.statusCode);

    if (booking.statusCode !== "on_the_way" && !isReadOnly) {
        return null;
    }

    if (isReadOnly && !booking.proofOfArrivalImg) {
        return null;
    }

    return (
        <Card className="p-4 space-y-4 border-teal/20 bg-teal/5">
            <div className="flex items-center gap-2 text-teal font-medium">
                <MapPin className="h-5 w-5" />
                <span>Proof of Arrival</span>
            </div>

            {isReadOnly || proofOfArrivalSubmitted ? (
                <div className="space-y-3">
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Arrival Confirmed</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proof of arrival submitted.
                        </AlertDescription>
                    </Alert>

                    {booking.proofOfArrivalData && (() => {
                        try {
                            const data = JSON.parse(booking.proofOfArrivalData);
                            return (
                                <div className="text-sm text-gray-600 space-y-1 bg-white p-3 rounded border">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(data.timestamp).toLocaleString()}</span>
                                    </div>
                                    {data.latitude && data.longitude && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3" />
                                            <a
                                                href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-teal hover:underline"
                                            >
                                                View Location ({data.latitude.toFixed(5)}, {data.longitude.toFixed(5)})
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        } catch (e) {
                            return null;
                        }
                    })()}

                    {booking.proofOfArrivalImg && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                            <img
                                src={booking.proofOfArrivalImg}
                                alt="Proof of Arrival"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <p className="text-sm text-gray-600">
                        📸 Capture or upload a photo at the client's location. The photo will include timestamp and location data.
                    </p>

                    <div className="space-y-3">
                        {previewUrl ? (
                            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="object-cover w-full h-full"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                                    onClick={() => {
                                        setFile(null);
                                        setPreviewUrl(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-center">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="proof-of-arrival-input"
                                />
                                <Button
                                    variant="outline"
                                    className="w-full h-32 border-dashed flex flex-col gap-2"
                                    onClick={() => document.getElementById("proof-of-arrival-input")?.click()}
                                >
                                    <Camera className="h-8 w-8 text-gray-400" />
                                    <span className="text-gray-500">Tap to capture photo</span>
                                </Button>
                            </div>
                        )}

                        <Button
                            className="w-full bg-teal hover:bg-teal-hover text-white"
                            disabled={!file || isUploading}
                            onClick={handleUpload}
                        >
                            {isUploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Proof of Arrival
                                </>
                            )}
                        </Button>
                    </div>
                </>
            )}
        </Card>
    );
}
