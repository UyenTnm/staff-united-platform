"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getCurrentEmployee } from "@/lib/auth";

import {
  getBehaviorIssuesByStatus,
  type BehaviorWithEmployee,
} from "@/lib/employees/behavior";
import { BehaviorCard } from "@/components/employees/behavior/BehaviorCard";

export default function PendingBehaviorPage() {
  const router = useRouter();

  const [issues, setIssues] = useState<BehaviorWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const employee = await getCurrentEmployee();

        if (!employee) {
          router.push("/login");
          return;
        }

        if (!["Admin", "HR", "Manager"].includes(employee.user_role)) {
          router.push("/403");
          return;
        }

        const data = await getBehaviorIssuesByStatus("Waiting Employee");

        setIssues(data);
      } catch (error) {
        console.error("Behavior Error:", error);

        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error(JSON.stringify(error, null, 2));
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Behavior Issues</h1>

          <p className="text-slate-500 mt-2">
            Behavior issues waiting for employee or manager action.
          </p>
        </div>

        {issues.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No pending behavior issues.
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <BehaviorCard
                key={issue.id}
                issue={issue}
                action={
                  <Button asChild>
                    <Link
                      href={`/employees/${issue.employee_id}/behavior/edit/${issue.id}`}
                    >
                      Open
                    </Link>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
