"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  getReview,
  PerformanceReview,
  updateReviewStatus,
  updateHrNotes,
  updateManagerNotes,
  updateEmployeeComment,
  employeeAcceptReview,
  lockReview,
} from "@/lib/performance/review";
import { ReviewCard } from "@/components/employees/performance/review-card";
import { calculateReviewScores } from "@/lib/performance/engine";
import type { ReviewScores } from "@/lib/performance/engine";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";

export default function ReviewDetailPage() {
  const params = useParams();
  const { employee } = useAuth();

  const [review, setReview] = useState<PerformanceReview | null>(null);

  const [performance, setPerformance] = useState<ReviewScores | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReview() {
      const data = await getReview(params.reviewId as string);

      if (!data) {
        setLoading(false);
        return;
      }

      setReview(data);

      const perf = await calculateReviewScores(
        data.employee_id,
        data.review_month,
      );

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

      const perf = await calculateReviewScores(
        review.employee_id,
        review.review_month,
      );

      setPerformance(perf);

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

  async function handleAcceptReview() {
    if (!review) return;

    try {
      await employeeAcceptReview(review.id);

      setReview({ ...review, status: "WaitingManager" });

      toast.success("Review accepted — sent to your manager.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to accept review.");
    }
  }

  async function handleAppeal() {
    if (!review) return;

    if (!review.employee_comment?.trim()) {
      toast.warning("Please write a comment explaining your appeal first.");
      return;
    }

    try {
      await updateEmployeeComment(review.id, review.employee_comment);
      await updateReviewStatus(review.id, "EmployeeAppealed");

      setReview({ ...review, status: "EmployeeAppealed" });

      toast.success("Appeal submitted — HR will review your comment.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to submit appeal.");
    }
  }

  async function handleReturnToHR() {
    if (!review) return;

    try {
      await updateReviewStatus(review.id, "Draft");

      setReview({ ...review, status: "Draft" });

      toast.success("Review returned to HR for revision.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to return review to HR.");
    }
  }

  async function handleLockReview() {
    if (!review) return;

    try {
      await lockReview(review.id);

      setReview({ ...review, status: "Locked" });

      toast.success("Review locked — final for this month.");
    } catch (err) {
      console.error(err);
      toast.error("Unable to lock review.");
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

  if (isEmployee && employee?.id !== review.employee_id) {
    return (
      <AppLayout>
        <div className="p-10 text-center text-slate-500">
          You don't have permission to view this review.
        </div>
      </AppLayout>
    );
  }

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
            href={`/employees/${params.id}/quality?reviewId=${review.id}&reviewMonth=${review.review_month}`}
            color="text-red-600"
          />

          <ReviewCard
            title="Behavior"
            score={performance?.behavior ?? 5}
            maxScore={5}
            count={performance?.behaviorIssues ?? 0}
            countLabel="Issue"
            href={`/employees/${params.id}/behavior?reviewId=${review.id}&reviewMonth=${review.review_month}`}
            color="text-amber-600"
          />

          <ReviewCard
            title="Kaizen"
            score={performance?.kaizen ?? 0}
            maxScore={5}
            count={performance?.rewardedKaizens ?? 0}
            countLabel="Kaizen"
            href={`/employees/${params.id}/kaizen?reviewId=${review.id}&reviewMonth=${review.review_month}`}
            color="text-brand-600"
          />

          <Card className="p-6 md:col-span-3">
            <h2 className="text-xl font-semibold mb-6">
              Monthly Performance Summary
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Quality</h3>

                <div className="space-y-2 text-sm">
                  <p>
                    Waiting Employee :
                    {performance?.qualitySummary.waitingEmployee}
                  </p>

                  <p>
                    Returned to HR :{performance?.qualitySummary.returnedToHR}
                  </p>

                  <p>
                    Waiting Manager :
                    {performance?.qualitySummary.waitingManager}
                  </p>

                  <p>Approved :{performance?.qualitySummary.approved}</p>

                  <p>Locked :{performance?.qualitySummary.locked}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Behavior</h3>

                <div className="space-y-2 text-sm">
                  <p>
                    Waiting Employee :
                    {performance?.behaviorSummary.waitingEmployee}
                  </p>

                  <p>
                    Returned to HR :{performance?.behaviorSummary.returnedToHR}
                  </p>

                  <p>
                    Waiting Manager :
                    {performance?.behaviorSummary.waitingManager}
                  </p>

                  <p>Approved :{performance?.behaviorSummary.approved}</p>

                  <p>Locked :{performance?.behaviorSummary.locked}</p>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3">Kaizen</h3>

                <div className="space-y-2 text-sm">
                  <p>Draft : {performance?.kaizenSummary.draft}</p>

                  <p>Submitted : {performance?.kaizenSummary.submitted}</p>

                  <p>Approved : {performance?.kaizenSummary.approved}</p>

                  <p>In Progress : {performance?.kaizenSummary.inProgress}</p>

                  <p>Rewarded : {performance?.kaizenSummary.rewarded}</p>
                </div>
              </Card>
            </div>
          </Card>

          <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-3">
            <h2 className="text-xl font-semibold mb-6">Review Notes</h2>

            {(isAdmin || isHR) && review.employee_comment && (
              <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
                <p className="text-sm font-semibold text-amber-800 mb-1">
                  Employee's appeal comment
                </p>
                <p className="text-sm text-amber-900 whitespace-pre-wrap">
                  {review.employee_comment}
                </p>
              </div>
            )}

            {(isAdmin || isHR) && (
              <div>
                <label className="block mb-2 text-sm font-semibold text-slate-700">
                  HR Notes
                </label>

                <Textarea
                  rows={4}
                  value={review.hr_notes ?? ""}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      hr_notes: e.target.value,
                    })
                  }
                />

                <div className="mt-4">
                  <Button
                    onClick={async () => {
                      await updateHrNotes(review.id, review.hr_notes ?? "");
                      toast.success("HR notes saved.");
                    }}
                  >
                    Save HR Notes
                  </Button>
                </div>
              </div>
            )}
            {/* Employee */}
            {isEmployee && (
              <div className="space-y-3">
                <label className="font-medium">Employee Comment</label>

                <Textarea
                  rows={5}
                  value={review.employee_comment ?? ""}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      employee_comment: e.target.value,
                    })
                  }
                />

                <Button
                  variant="outline"
                  onClick={async () => {
                    await updateEmployeeComment(
                      review.id,
                      review.employee_comment ?? "",
                    );

                    toast.success("Comment saved.");
                  }}
                >
                  Save Comment
                </Button>
              </div>
            )}
            {/* Manager */}
            {isManager && (
              <div className="space-y-3">
                <label className="font-medium">Manager Notes</label>

                <Textarea
                  rows={5}
                  value={review.manager_notes ?? ""}
                  onChange={(e) =>
                    setReview({
                      ...review,
                      manager_notes: e.target.value,
                    })
                  }
                />

                <Button
                  variant="secondary"
                  onClick={async () => {
                    await updateManagerNotes(
                      review.id,
                      review.manager_notes ?? "",
                    );

                    toast.success("Manager notes saved.");
                  }}
                >
                  Save Manager Notes
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm md:col-span-3">
            <h2 className="text-xl font-semibold mb-6">Review Actions</h2>

            <div className="flex gap-3">
              <div className="flex gap-3 flex-wrap">
                {/* HR */}
                {(isAdmin || isHR) &&
                  (review.status === "Draft" ||
                    review.status === "EmployeeAppealed") && (
                    <Button onClick={handleSendToEmployee}>
                      {review.status === "EmployeeAppealed"
                        ? "Re-send to Employee"
                        : "Send to Employee"}
                    </Button>
                  )}

                {(isAdmin || isHR) && review.status === "Approved" && (
                  <Button onClick={handleLockReview}>
                    Lock Review (Final)
                  </Button>
                )}

                {/* Manager */}
                {isManager && review.status === "WaitingManager" && (
                  <>
                    <Button onClick={handleApproveReview}>
                      Approve Review
                    </Button>

                    <Button variant="outline" onClick={handleReturnToHR}>
                      Return to HR
                    </Button>
                  </>
                )}

                {/* Employee */}
                {isEmployee && review.status === "WaitingEmployee" && (
                  <>
                    <Button onClick={handleAcceptReview}>Accept Review</Button>

                    <Button variant="outline" onClick={handleAppeal}>
                      Appeal
                    </Button>
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
                "Review has been sent to the employee — waiting for them to accept or appeal."}

              {review.status === "EmployeeAppealed" &&
                "Employee has submitted an appeal (see their comment below). HR should review it and re-send once addressed."}

              {review.status === "WaitingManager" &&
                "Waiting for manager approval."}

              {review.status === "Approved" &&
                "Review has been approved. HR can lock it once nothing else needs to change."}

              {review.status === "Locked" &&
                "This review is locked — final for this month."}
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
