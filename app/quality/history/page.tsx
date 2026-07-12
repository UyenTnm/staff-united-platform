"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getCurrentEmployee } from "@/lib/auth";
import { useRouter } from "next/navigation";

import {
  getResolvedQualityIssues,
  type QualityWithEmployee,
} from "@/lib/employees/quality";
import { IssueStatusBadge } from "@/components/issues/IssueStatusBadge";

export default function QualityHistoryPage() {
  const [issues, setIssues] = useState<QualityWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

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

        const data = await getResolvedQualityIssues();

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
          <h1 className="text-3xl font-bold">Quality History</h1>

          <p className="text-slate-500 mt-2">
            Approved and locked quality issues.
          </p>
        </div>

        {issues.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No quality history found.
          </Card>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-lg">
                      {issue.issue_type}
                    </h2>

                    <p className="text-slate-500 mt-1">
                      {issue.employees.full_name}
                    </p>

                    <p className="text-sm text-slate-500 mt-2">
                      {issue.description}
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="font-bold text-red-600">
                      -{issue.deduction} pt
                    </p>

                    <IssueStatusBadge status={issue.status} />

                    <Button asChild variant="outline" size="sm">
                      <Link href={`/quality/review/${issue.id}`}>Open</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
