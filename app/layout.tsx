import type { Metadata, Viewport } from "next";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "GetKlean Housemaid Dashboard",
  description: "Manage your work schedules, bookings, and earnings",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-zinc-100 dark:bg-zinc-900 flex justify-center min-h-screen">
        <main className="w-full max-w-[430px] min-h-[100dvh] bg-background shadow-2xl relative overflow-x-hidden flex flex-col">
          <Providers>
            {children}
          </Providers>
        </main>
      </body>
    </html>
  );
}
