"use client";

import { AppLayout } from "@/components/app-layout";
import { MetricCards } from "@/components/metric-cards";
import { UsersTable } from "@/components/users-table";
import { SystemsTable } from "@/components/systems-table";
import { AssetInventory } from "@/components/AssetInventory/page";
import { ActivityLogs } from "@/components/activity-logs";

export default function Page() {
  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          STAFF United Platform
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Manage employees, assets, clients, and business operations from one
          platform.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="mb-8">
        <MetricCards />
      </div>

      {/* Users and Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <UsersTable />
        <SystemsTable />
      </div>

      {/* Assets and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AssetInventory />
        <ActivityLogs />
      </div>
    </div>
  );
}
