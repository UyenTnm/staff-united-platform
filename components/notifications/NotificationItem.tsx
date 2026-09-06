"use client";

import type { Notification } from "@/lib/notifications";

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
}

export function NotificationItem({
  notification,
  onClick,
}: NotificationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b hover:bg-slate-50 transition ${
        !notification.is_read ? "bg-blue-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {!notification.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
        )}

        <div className="flex-1 cursor-pointer">
          <p className="font-medium text-sm">{notification.title}</p>

          <p className="text-xs text-slate-500 mt-1">{notification.message}</p>

          <p className="text-[11px] text-slate-400 mt-2">
            {new Date(notification.created_at).toLocaleString()}
          </p>
        </div>
      </div>
    </button>
  );
}
