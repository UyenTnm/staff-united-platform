"use client";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BehaviorManagementPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold">Behavior Management</h1>

          <p className="text-slate-500 mt-2">
            Manage employee behavior issues and disciplinary records.
          </p>
        </div>

        {/* Dashboard */}

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Employee</p>

            <h2 className="text-4xl font-bold mt-3">0</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Manager</p>

            <h2 className="text-4xl font-bold mt-3">0</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Approved</p>

            <h2 className="text-4xl font-bold mt-3">0</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Locked</p>

            <h2 className="text-4xl font-bold mt-3">0</h2>
          </Card>
        </div>

        {/* Quick Actions */}

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <Button asChild>
              <Link href="/behavior/pending">Open Pending Issues</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/behavior/resolved">View History</Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
