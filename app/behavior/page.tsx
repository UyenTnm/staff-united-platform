"use client";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import {
  BehaviorWithEmployee,
  getBehaviorIssuesByStatus,
} from "@/lib/employees/behavior";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

export default function BehaviorManagementPage() {
  const router = useRouter();

  const { employee } = useAuth();

  const [waitingEmployee, setWaitingEmployee] = useState<
    BehaviorWithEmployee[]
  >([]);

  const [returnedToHR, setReturnedToHR] = useState<BehaviorWithEmployee[]>([]);

  const [resolvedByHR, setResolvedByHR] = useState<BehaviorWithEmployee[]>([]);

  const [waitingManager, setWaitingManager] = useState<BehaviorWithEmployee[]>(
    [],
  );

  const [approved, setApproved] = useState<BehaviorWithEmployee[]>([]);

  const [locked, setLocked] = useState<BehaviorWithEmployee[]>([]);

  useEffect(() => {
    if (employee?.user_role === "Manager") {
      router.replace("/behavior/manager");
    }
  }, [employee, router]);

  useEffect(() => {
    async function loadData() {
      const [
        waitingEmployeeData,
        returnedToHRData,
        resolvedByHRData,
        waitingManagerData,
        approvedData,
        lockedData,
      ] = await Promise.all([
        getBehaviorIssuesByStatus("Waiting Employee"),
        getBehaviorIssuesByStatus("Returned to HR"),
        getBehaviorIssuesByStatus("Resolved by HR"),
        getBehaviorIssuesByStatus("Waiting Manager"),
        getBehaviorIssuesByStatus("Approved"),
        getBehaviorIssuesByStatus("Locked"),
      ]);

      setWaitingEmployee(waitingEmployeeData);
      setReturnedToHR(returnedToHRData);
      setResolvedByHR(resolvedByHRData);
      setWaitingManager(waitingManagerData);
      setApproved(approvedData);
      setLocked(lockedData);
    }

    loadData();
  }, []);

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

        {/* <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4"> */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Employee</p>

            <h2 className="text-4xl font-bold mt-3">
              {waitingEmployee.length}
            </h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Returned to HR</p>

            <h2 className="text-4xl font-bold mt-3">{returnedToHR.length}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Resolved by HR</p>

            <h2 className="text-4xl font-bold mt-3">{resolvedByHR.length}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Waiting Manager</p>

            <h2 className="text-4xl font-bold mt-3">{waitingManager.length}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Approved</p>

            <h2 className="text-4xl font-bold mt-3">{approved.length}</h2>
          </Card>

          <Card className="p-6">
            <p className="text-sm text-slate-500">Locked</p>

            <h2 className="text-4xl font-bold mt-3">{locked.length}</h2>
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
              <Link href="/behavior/history">View History</Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
