"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Mail,
  MapPin,
  Star,
  Calendar,
  BarChart3,
  ChevronRight,
  LogOut,
  Facebook,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { HousemaidTierCard } from "@/components/HousemaidTierCard";

export default function Profile() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Fetch housemaid tiers from DB
  const { data: tiersData } = useQuery({
    queryKey: ["housemaidTiers"],
    queryFn: async () => {
      const res = await fetch("/api/lookups/housemaid-tiers");
      if (!res.ok) throw new Error("Failed to fetch tiers");
      return res.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch Profile Data
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["housemaidProfile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    }
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call logout API
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Clear legacy localStorage items if any
      localStorage.clear();

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.clear();
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    { icon: Calendar, label: "Manage Availability", value: "", color: "text-teal", route: "/manage-availability" },
    { icon: BarChart3, label: "Performance Reports", value: "", color: "text-teal", route: "/performance-reports" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Fallback if error or no data
  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load profile.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Profile" onMenuClick={() => console.log("Menu clicked")} />

      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-yellow to-yellow-hover" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
            <AvatarImage src={profile.profilePhoto || ""} />
            <AvatarFallback className="text-2xl bg-teal text-white">
              {profile.name ? profile.name.substring(0, 2).toUpperCase() : "MA"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-20 px-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
          <div className="flex items-center justify-center gap-1 mt-2">
            <Star className="h-4 w-4 fill-yellow text-yellow" />
            <span className="font-semibold text-gray-900">{profile.rating}</span>
            <span className="text-gray-600 text-sm ml-1">({profile.completedJobs} jobs)</span>
          </div>
        </div>


        <HousemaidTierCard
          variant="compact"
          tiers={tiersData?.tiers}
          currentPoints={profile.asensoPointsBalance}
        />

        <Card className="p-4 space-y-4">
          <h2 className="font-semibold text-teal text-sm uppercase tracking-wide">Contact Information</h2>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.mobile || "No Mobile"}</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.email || "No Email"}</span>
            </div>

            {profile.facebookName && (
              <div className="flex items-center gap-3 text-sm">
                <Facebook className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{profile.facebookName}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-5 w-5 text-gray-400" />
              <span className="text-gray-700">{profile.location}</span>
            </div>
          </div>
        </Card>

        {/* Skills Section Removed as per request due to lack of test data */}

        <div className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                className="p-4 cursor-pointer"
                onClick={() => router.push(item.route)}
                data-testid={`card-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    <span className="font-medium text-gray-900">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Card>
            );
          })}
        </div>

        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
          disabled={isLoggingOut}
          data-testid="button-logout"
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}

