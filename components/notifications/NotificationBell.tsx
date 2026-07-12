"use client";

import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { getUnreadCount } from "@/lib/notifications";
import { NotificationDropdown } from "./NotificationDropdown";

interface NotificationBellProps {
  employeeId: string;
}

export function NotificationBell({ employeeId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount(employeeId);
      setUnreadCount(count);
    } catch (error) {
      console.error(error);
    }
  }, [employeeId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUnreadCount();
    }, 0);

    const interval = setInterval(loadUnreadCount, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [loadUnreadCount]);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-lg p-2 hover:bg-slate-100 transition"
      >
        <Bell className="w-5 h-5 text-slate-600" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          employeeId={employeeId}
          onRefresh={loadUnreadCount}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
