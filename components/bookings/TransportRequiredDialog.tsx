import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bus, MapPin } from "lucide-react";

type TransportDialogVariant = "commute_to_client" | "return_fare";

interface TransportRequiredDialogProps {
    isOpen: boolean;
    onClose: () => void;
    variant: TransportDialogVariant;
    onGoToTransportTab: () => void;
}

const DIALOG_CONTENT: Record<TransportDialogVariant, {
    title: string;
    description: string;
    icon: typeof Bus;
    iconBgColor: string;
    iconColor: string;
}> = {
    commute_to_client: {
        title: "Enter Transportation to Client",
        description: "You must enter your commute transportation details before marking arrival.",
        icon: MapPin,
        iconBgColor: "bg-blue-100",
        iconColor: "text-blue-600",
    },
    return_fare: {
        title: "Enter Return Transportation",
        description: "Please enter your return transportation fare before completing the booking.",
        icon: Bus,
        iconBgColor: "bg-amber-100",
        iconColor: "text-amber-600",
    },
};

export function TransportRequiredDialog({
    isOpen,
    onClose,
    variant,
    onGoToTransportTab,
}: TransportRequiredDialogProps) {
    const content = DIALOG_CONTENT[variant];
    const IconComponent = content.icon;

    const handleGoToTransport = () => {
        onClose();
        onGoToTransportTab();
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => { /* Blocking: prevent closing via overlay */ }}>
            <DialogContent
                className="max-w-sm mx-auto"
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="text-center">
                    <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${content.iconBgColor}`}>
                        <IconComponent className={`h-6 w-6 ${content.iconColor}`} />
                    </div>
                    <DialogTitle className="text-lg font-bold text-gray-900">
                        {content.title}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                        {content.description}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
                    <Button
                        onClick={handleGoToTransport}
                        className="w-full bg-teal hover:bg-teal-hover text-white h-11 text-sm font-semibold"
                    >
                        Go to Transport Tab
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="w-full text-gray-500 hover:text-gray-700 text-xs h-9"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
