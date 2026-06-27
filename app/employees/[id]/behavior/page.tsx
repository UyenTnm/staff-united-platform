"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  calculateBehaviorScore,
  getBehaviorIssues,
  BehaviorIssue,
} from "@/lib/employees/behavior";
import { useEffect, useState } from "react";
import { EmployeeHeader } from "@/components/employees/employee-header";
import { getEmployee, Employee } from "@/lib/employees/employees";

export default function BehaviorPage() {
  // const summary = calculateBehaviorScore(getBehaviorIssues);
  const [issues, setIssues] = useState<BehaviorIssue[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const summary = calculateBehaviorScore(issues);

  const params = useParams();

  useEffect(() => {
    async function loadData() {
      const [issueData, employeeData] = await Promise.all([
        getBehaviorIssues(params.id as string),
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
            backHref={`/employees/${employee.id}`}
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

            <h2 className="text-3xl font-bold text-emerald-600 mt-2">
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
                      <p className="font-semibold">{issue.issue_type}</p>

                      <p className="text-sm text-slate-500 mt-1">
                        {new Date(issue.issue_date).toLocaleDateString()}
                      </p>

                      <p className="text-sm mt-3">{issue.description}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-red-600 font-bold">
                        -{issue.deduction}%
                      </p>

                      <p className="text-xs text-slate-500 mt-2">
                        {issue.evaluator_id ?? "-"}
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
