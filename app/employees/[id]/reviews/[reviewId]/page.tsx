"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getReview,
  PerformanceReview,
  updateReviewStatus,
} from "@/lib/performance/review";
import { ReviewCard } from "@/components/employees/performance/review-card";
import {
  calculateEmployeePerformance,
  type PerformanceSummary,
} from "@/lib/employees/performance";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function ReviewDetailPage() {
  const params = useParams();
  const { employee } = useAuth();

  const [review, setReview] = useState<PerformanceReview | null>(null);

  const [performance, setPerformance] = useState<PerformanceSummary | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReview() {
      const data = await getReview(params.reviewId as string);

      if (!data) {
        setLoading(false);
        return;
      }

      setReview(data);

      const perf = await calculateEmployeePerformance(data.employee_id);

      setPerformance(perf);

      setLoading(false);
    }

    loadReview();
  }, [params.reviewId]);

  async function handleSendToEmployee() {
    if (!review) return;

    try {
      await updateReviewStatus(review.id, "WaitingEmployee");

      setReview({
        ...review,
        status: "WaitingEmployee",
      });

      toast.success("Review sent to employee successfully.");
    } catch (err) {
      console.error(err);

      toast.error("Unable to send review.");
    }
  }

  async function handleApproveReview() {
    if (!review) return;

    try {
      await updateReviewStatus(review.id, "Approved");

      setReview({
        ...review,
        status: "Approved",
      });

      toast.success("Review approved successfully.");
    } catch (err) {
      console.error(err);

      toast.error("Unable to approve review.");
    }
  }

  function formatReviewStatus(status: string) {
    switch (status) {
      case "WaitingEmployee":
        return "Waiting Employee";

      case "EmployeeAppealed":
        return "Employee Appealed";

      case "WaitingManager":
        return "Waiting Manager";

      default:
        return status;
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading Review...</div>
      </AppLayout>
    );
  }

  if (!review) {
    return (
      <AppLayout>
        <div>Review not found.</div>
      </AppLayout>
    );
  }
  const isAdmin = employee?.user_role === "Admin";
  const isHR = employee?.user_role === "HR";
  const isManager = employee?.user_role === "Manager";
  const isEmployee = employee?.user_role === "Employee";

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href={`/employees/${params.id}`}>← Back to Reviews</Link>
        </Button>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">
                {new Date(review.review_month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}{" "}
                Review
              </h1>

              <p className="text-slate-500 mt-2">Performance Review</p>
              {performance && (
                <div className="mt-6">
                  <p className="text-sm text-slate-500">Current Performance</p>

                  <h2 className="text-5xl font-bold mt-2">
                    {performance.total} / 15
                  </h2>
                </div>
              )}
            </div>

            <div className="text-right">
              <Badge>{formatReviewStatus(review.status)}</Badge>

              {performance && (
                <p className="text-sm text-slate-500 mt-3">
                  Quality {performance.quality}/5
                  <br />
                  Behavior {performance.behavior}/5
                  <br />
                  Kaizen {performance.kaizen}/5
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-5">Review Information</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Review Month</p>

              <p className="font-medium">
                {new Date(review.review_month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Status</p>

              <p className="font-medium">{formatReviewStatus(review.status)}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Created</p>

              <p className="font-medium">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Last Updated</p>

              <p className="font-medium">
                {new Date(review.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-5">
          <ReviewCard
            title="Quality"
            score={performance?.quality ?? 5}
            maxScore={5}
            count={performance?.qualityIssues ?? 0}
            countLabel="Issue"
            href={`/employees/${params.id}/quality?reviewId=${review.id}`}
            color="text-red-600"
          />

          <ReviewCard
            title="Behavior"
            score={performance?.behavior ?? 5}
            maxScore={5}
            count={performance?.behaviorIssues ?? 0}
            countLabel="Issue"
            href={`/employees/${params.id}/behavior?reviewId=${review.id}`}
            color="text-amber-600"
          />

          <ReviewCard
            title="Kaizen"
            score={performance?.kaizen ?? 0}
            maxScore={5}
            count={performance?.kaizenRecords ?? 0}
            countLabel="Kaizen"
            href={`/employees/${params.id}/kaizen?reviewId=${review.id}`}
            color="text-emerald-600"
          />

          <Card className="p-6 md:col-span-3">
            <h2 className="text-xl font-semibold mb-6">Review Actions</h2>

            <div className="flex gap-3">
              <div className="flex gap-3 flex-wrap">
                {/* HR */}
                {(isAdmin || isHR) && review.status === "Draft" && (
                  <Button onClick={handleSendToEmployee}>
                    Send to Employee
                  </Button>
                )}

                {/* Manager */}
                {isManager && review.status === "WaitingManager" && (
                  <>
                    <Button onClick={handleApproveReview}>
                      Approve Review
                    </Button>

                    <Button variant="outline">Return to HR</Button>
                  </>
                )}

                {/* Employee */}
                {isEmployee && review.status === "WaitingEmployee" && (
                  <>
                    <Button>Accept Review</Button>

                    <Button variant="outline">Appeal</Button>
                  </>
                )}

                {/* Back */}
                <Button asChild variant="outline">
                  <Link href={`/employees/${params.id}`}>Back</Link>
                </Button>
              </div>
            </div>

            <p className="text-sm text-slate-500 mt-4">
              {review.status === "Draft" &&
                "This review is still being prepared."}

              {review.status === "WaitingEmployee" &&
                "Review has been sent to the employee."}

              {review.status === "EmployeeAppealed" &&
                "Employee has submitted an appeal."}

              {review.status === "WaitingManager" &&
                "Waiting for manager approval."}

              {review.status === "Approved" && "Review has been approved."}

              {review.status === "Locked" && "This review has been locked."}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
