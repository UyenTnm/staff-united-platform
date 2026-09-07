"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Employee, getEmployee } from "@/lib/employees/employees";
import {
  calculateReviewScores,
  type ReviewScores,
} from "@/lib/performance/engine";
import { ScoreBar } from "@/components/performance/score-bar";
import { QuickActions } from "@/components/employees/quick-actions";

import {
  getCurrentReview,
  getEmployeeReviews,
  PerformanceReview,
} from "@/lib/performance/review";
import { RoleGuard } from "@/components/auth/role-guard";

function EmployeeDetailPageContent() {
  const params = useParams();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [performance, setPerformance] = useState<ReviewScores | null>(null);
  const [currentReview, setCurrentReview] = useState<PerformanceReview | null>(
    null,
  );
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployee() {
      const [data, perf, review, history] = await Promise.all([
        getEmployee(params.id as string),
        calculateReviewScores(params.id as string),
        getCurrentReview(params.id as string),
        getEmployeeReviews(params.id as string),
      ]);

      setPerformance(perf);
      setCurrentReview(review);

      setEmployee(data);
      setReviews(history);

      setLoading(false);
    }

    loadEmployee();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading employee...</div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div>Employee not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/employees">← Back to Employees</Link>
        </Button>
      </div>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{employee.full_name}</h1>

            <p className="text-slate-500 mt-2">{employee.role}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/employees/${employee.id}/edit`}>Edit Employee</Link>
            </Button>
            <Badge
              className={
                employee.status === "Active"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-200"
              }
            >
              {employee.status}
            </Badge>
          </div>
        </div>

        {/* Overview */}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-5">Overview</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>

              <p className="font-medium">{employee.full_name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>

              <p className="font-medium">{employee.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Employee Number</p>

              <p className="font-medium">{employee.employee_number}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Department</p>

              <p className="font-medium">{employee.department}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Position</p>

              <p className="font-medium">{employee.role}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Manager</p>

              <p className="font-medium">-</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Open Current Review</p>

              <h2 className="text-3xl font-bold mt-2">
                {currentReview
                  ? new Date(currentReview.review_month).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "No Review"}
              </h2>

              <p className="text-slate-500 mt-2">
                {currentReview
                  ? currentReview.status
                  : "No review has been created for this month."}
              </p>
            </div>

            <Button asChild>
              <Link
                href={
                  currentReview
                    ? `/employees/${employee.id}/reviews/${currentReview.id}`
                    : `/employees/${employee.id}/reviews/new`
                }
              >
                {currentReview
                  ? `Open ${new Date(
                      currentReview.review_month,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                    })} Review`
                  : `Start ${new Date().toLocaleDateString("en-US", {
                      month: "long",
                    })} Review`}
              </Link>
            </Button>
          </div>

          {currentReview && performance && (
            <div className="mt-6 pt-6 border-t space-y-4">
              <ScoreBar
                label="Total Monthly Bonus"
                score={performance.total}
                max={15}
                size="lg"
                helper={`Quality ${performance.quality}/5 · Behavior ${performance.behavior}/5 · Kaizen ${performance.kaizen}/5`}
              />

              <Button asChild variant="outline" size="sm">
                <Link href={`/employees/${employee.id}/summary`}>
                  View Full Breakdown
                </Link>
              </Button>
            </div>
          )}
        </Card>

        <QuickActions employeeId={employee.id} />

        <Card className="p-6">
          <h2 className="text-xl font-semibold">Review History</h2>

          <div className="mt-5 flex items-center justify-between">
            <div className="space-y-2">
              <p>
                <strong>Total Reviews:</strong> {reviews.length}
              </p>

              <p>
                <strong>Latest Review:</strong>{" "}
                {reviews.length > 0
                  ? new Date(reviews[0].review_month).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      },
                    )
                  : "-"}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {reviews.length > 0 ? reviews[0].status : "-"}
              </p>
            </div>

            <Button asChild>
              <Link href={`/employees/${employee.id}/reviews`}>
                View All Reviews
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function EmployeeDetailPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <EmployeeDetailPageContent />
    </RoleGuard>
  );
}
