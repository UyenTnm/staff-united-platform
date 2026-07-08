"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getCurrentEmployee } from "@/lib/auth";

import {
  getQualityIssuesByStatus,
  type QualityWithEmployee,
} from "@/lib/employees/quality";

export default function PendingQualityPage() {
  const router = useRouter();

  const [issues, setIssues] = useState<QualityWithEmployee[]>([]);
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

        const data = await getQualityIssuesByStatus("Waiting Manager");

        setIssues(data);
      } catch (error) {
        console.error(error);
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
          <h1 className="text-3xl font-bold">Pending Quality Issues</h1>

          <p className="text-slate-500 mt-2">
            Review quality issues waiting to be resolved.
          </p>
        </div>

        {issues.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No pending quality issues.
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card
                key={issue.id}
                className="p-5 flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">{issue.issue_type}</h2>

                  <p className="text-slate-500">
                    {issue.employees.full_name}
                    {" • "}
                    {issue.employees.department}
                  </p>

                  <p className="mt-2 text-sm">{issue.description}</p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-red-600">-{issue.deduction}</p>

                  <Button asChild size="sm" className="mt-3">
                    <Link
                      href={`/employees/${issue.employee_id}/quality/edit/${issue.id}`}
                    >
                      Open
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
