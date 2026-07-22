"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getRecentActivities,
  getActivityColor,
  getActivityIcon,
  getActivityUrl,
} from "@/lib/crm/activity";
import { Activity } from "@/types/crm/activity";

export default function RecentActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      try {
        const data = await getRecentActivities(10);
        setActivities(data);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        <div className="mt-6 space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-16 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        <div className="mt-8 text-center text-sm text-slate-500">
          No activities yet.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Activity</h2>

        <span className="text-xs text-slate-500">Latest 10</span>
      </div>

      <div className="mt-6 space-y-5">
        {activities.map((activity) => (
          <Link
            key={activity.id}
            // href={`/${activity.entity_type}s/${activity.entity_id}`}
            href={getActivityUrl(activity)}
            className="block rounded-xl border p-4 transition hover:border-emerald-500 hover:bg-emerald-50"
          >
            <div className="flex items-start gap-4">
              <div
                className={`text-2xl ${getActivityColor(
                  activity.activity_type,
                )}`}
              >
                {getActivityIcon(activity.activity_type)}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold">{activity.title}</h3>

                {activity.description && (
                  <p className="mt-1 text-sm text-slate-600">
                    {activity.description}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="capitalize">{activity.entity_type}</span>

                  <span>•</span>

                  <span>{new Date(activity.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
