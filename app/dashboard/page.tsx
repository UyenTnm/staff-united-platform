"use client";

import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { MetricCards } from "@/components/metric-cards";
import { UsersTable } from "@/components/users-table";
import { SystemsTable } from "@/components/systems-table";
import { AssetInventory } from "@/components/AssetInventory/page";
import { ActivityLogs } from "@/components/activity-logs";

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <Header />

      <main className="pt-20 px-4 md:px-6 pb-12 transition-all duration-300">
        <div className="w-full">
          {/* Page Header */}
          <div className="mb-8 w-full">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              STAFF United Platform
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage employees, assets, clients, and business operations from
              one platform.
            </p>
          </div>

          {/* Metric Cards */}
          <div className="mb-8 w-full">
            <MetricCards />
          </div>

          {/* Users and Systems Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <UsersTable />
            <SystemsTable />
          </div>

          {/* Asset Inventory and Activity Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <AssetInventory />
            <ActivityLogs />
          </div>
        </div>
      </main>
    </div>
  );
}
