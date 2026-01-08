"use client";

import { Home, Calendar, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PesoIcon } from "@/components/icons/PesoIcon";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Bookings", path: "/bookings" },
  { icon: PesoIcon, label: "Earnings", path: "/earnings" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <button
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-full transition-all ${
                  isActive 
                    ? "bg-yellow text-gray-900" 
                    : "text-gray-500"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-6 w-6" />
                {isActive && (
                  <span className="text-[11px] font-medium">{item.label}</span>
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
