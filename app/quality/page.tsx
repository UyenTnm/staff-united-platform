"use client";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getQualityStatistics } from "@/lib/employees/quality";

export default function BehaviorManagementPage() {
  const [stats, setStats] = useState({
    waitingEmployee: 0,
    returnedToHR: 0,
    resolvedByHR: 0,
    waitingManager: 0,
    approved: 0,
    locked: 0,
  });

  useEffect(() => {
    async function loadData() {
      const statistics = await getQualityStatistics();

      setStats(statistics);
    }

    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold">Quality Management</h1>

          <p className="text-slate-500 mt-2">
            Manage employee quality issues, work quality and performance
            deductions.
          </p>
        </div>

        {/* Dashboard */}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Employee</p>

            <h2 className="text-4xl font-bold mt-3">{stats.waitingEmployee}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Returned to HR</p>

            <h2 className="text-4xl font-bold mt-3">{stats.returnedToHR}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Resolved by HR</p>

            <h2 className="text-4xl font-bold mt-3">{stats.resolvedByHR}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Manager</p>

            <h2 className="text-4xl font-bold mt-3">{stats.waitingManager}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Approved</p>

            <h2 className="text-4xl font-bold mt-3">{stats.approved}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Locked</p>

            <h2 className="text-4xl font-bold mt-3">{stats.locked}</h2>
          </Card>
        </div>

        {/* Quick Actions */}

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Button asChild>
              <Link href="/quality/pending">Open Pending Issues</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/quality/history">View History</Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
