"use client";

import { Menu, Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  showNotifications?: boolean;
  showBack?: boolean;
  onBackClick?: () => void;
  rightAction?: ReactNode;
  titleLeftAligned?: boolean;
}

export function Header({ onMenuClick, title, showNotifications = true, showBack = false, onBackClick, rightAction, titleLeftAligned = false }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3 flex-1">
          {showBack ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={onBackClick}
              data-testid="button-back"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </Button>
          ) : (
            /* Hamburger menu button - temporarily hidden
            <Button
              size="icon"
              variant="ghost"
              onClick={onMenuClick}
              data-testid="button-menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </Button>
            */
            null
          )}

          {title && titleLeftAligned ? (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          ) : null}
        </div>

        {title && !titleLeftAligned ? (
          <h1 className="text-lg font-semibold text-gray-900 absolute left-1/2 -translate-x-1/2">{title}</h1>
        ) : !title ? (
          <div className="flex flex-col items-center absolute left-1/2 -translate-x-1/2">
            <div className="text-lg font-bold">
              <span className="text-yellow">GET</span>
              <span className="text-teal">KLEAN</span>
            </div>
            <p className="text-[9px] text-gray-500 tracking-widest">THE CLEANING EXPERTS</p>
          </div>
        ) : null}

        <div className="flex items-center">
          {rightAction ? rightAction : showNotifications ? (
            <Button
              size="icon"
              variant="ghost"
              data-testid="button-notifications"
            >
              <Bell className="h-6 w-6 text-gray-700" />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
