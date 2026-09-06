"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  calculateBehaviorScore,
  getBehaviorIssues,
  BehaviorIssue,
} from "@/lib/employees/behavior";
import { useEffect, useState } from "react";
import { EmployeeHeader } from "@/components/employees/employee-header";
import { getEmployee, Employee } from "@/lib/employees/employees";
import { RoleGuard } from "@/components/auth/role-guard";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "Waiting Employee":
    case "Returned to HR":
      return "bg-amber-100 text-amber-700";
    case "Waiting Manager":
      return "bg-blue-100 text-blue-700";
    case "Approved":
    case "Locked":
      return "bg-emerald-100 text-emerald-700";
    case "Resolved by HR":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function BehaviorPageContent() {
  // const summary = calculateBehaviorScore(getBehaviorIssues);
  const [issues, setIssues] = useState<BehaviorIssue[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const summary = calculateBehaviorScore(issues);

  const params = useParams();
  const searchParams = useSearchParams();

  const reviewId = searchParams.get("reviewId");
  const reviewMonth = searchParams.get("reviewMonth");

  useEffect(() => {
    async function loadData() {
      const [issueData, employeeData] = await Promise.all([
        getBehaviorIssues(params.id as string, reviewMonth ?? undefined),
        getEmployee(params.id as string),
      ]);

      setIssues(issueData);
      setEmployee(employeeData);
    }

    loadData();
  }, [params.id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {employee && (
          <EmployeeHeader
            employee={employee}
            title="Behavior Review"
            backHref={
              reviewId
                ? `/employees/${employee.id}/reviews/${reviewId}`
                : `/employees/${employee.id}`
            }
          />
        )}

        {/* Summary */}

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-5">
            <p className="text-sm text-slate-500">Starting Score</p>

            <h2 className="text-3xl font-bold mt-2">
              {summary.startingScore}%
            </h2>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500">Total Deductions</p>

            <h2 className="text-3xl font-bold text-red-600 mt-2">
              -{summary.totalDeduction}%
            </h2>
          </Card>

          <Card className="p-5">
            <p className="text-sm text-slate-500">Current Score</p>

            <h2 className="text-3xl font-bold text-brand-600 mt-2">
              {summary.currentScore}%
            </h2>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Issues</h2>

            <Button asChild>
              <Link href={`/employees/${params.id}/behavior/new`}>
                Add Issue
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {issues.length === 0 ? (
              <div className="border rounded-lg p-8 text-center text-slate-500">
                No behavior issues recorded.
              </div>
            ) : (
              issues.map((issue) => (
                <div key={issue.id} className="border rounded-lg p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold">{issue.issue_type}</p>

                        <Badge className={getStatusBadgeClass(issue.status)}>
                          {issue.status}
                        </Badge>
                      </div>

                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(issue.issue_date).toLocaleDateString()} •{" "}
                        {new Date(issue.review_month).toLocaleDateString(
                          "en-US",
                          { month: "long", year: "numeric" },
                        )}
                      </p>

                      <p className="text-sm mt-3">{issue.description}</p>

                      {issue.employee_comment && (
                        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                          <p className="text-xs font-semibold text-amber-800 mb-1">
                            Employee's response
                          </p>
                          <p className="text-sm text-amber-900 whitespace-pre-wrap">
                            {issue.employee_comment}
                          </p>
                        </div>
                      )}

                      {issue.hr_note && (
                        <div className="mt-3 rounded-lg bg-slate-50 border p-3">
                          <p className="text-xs font-semibold text-slate-600 mb-1">
                            HR note
                          </p>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {issue.hr_note}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-2 shrink-0 pl-4">
                      <p className="text-red-600 font-bold">
                        -{issue.deduction} pts
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function BehaviorPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager", "Employee"]}>
      <BehaviorPageContent />
    </RoleGuard>
  );
}
