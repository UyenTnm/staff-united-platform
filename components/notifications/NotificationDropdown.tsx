"use client";

import { useEffect, useState } from "react";

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
  Notification,
} from "@/lib/notifications";

import { NotificationItem } from "./NotificationItem";
import { useRouter } from "next/navigation";

interface NotificationDropdownProps {
  employeeId: string;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export function NotificationDropdown({
  employeeId,
  onRefresh,
  onClose,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  async function loadNotifications() {
    try {
      const data = await getNotifications(employeeId);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, [employeeId]);

  return (
    <div className="absolute right-0 mt-2 w-96 rounded-xl border bg-white shadow-xl z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="font-semibold">Notifications</h3>

        <button
          className="text-xs text-blue-600 hover:underline"
          onClick={async () => {
            await markAllAsRead(employeeId);
            await loadNotifications();
          }}
        >
          Mark all as read
        </button>
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-sm text-slate-500">Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            No notifications.
          </p>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onClick={async () => {
                if (!notification.is_read) {
                  await markAsRead(notification.id);
                }

                await loadNotifications();
                await onRefresh();

                if (notification.action_url) {
                  onClose();
                  router.push(notification.action_url);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
