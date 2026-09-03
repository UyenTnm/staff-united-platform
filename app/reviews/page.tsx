"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { generateMonthlyReviews } from "@/lib/performance/monthly-review";

import { toast } from "sonner";
import {
  getMonthlyDashboard,
  MonthlyDashboard,
} from "@/lib/performance/dashboard";
import {
  createMonthlyReviewCycle,
  getReviewCycles,
  getUpcomingReviewMonths,
  ReviewCycle,
} from "@/lib/performance/cycle";
import {
  getPendingPerformanceReviews,
  type ManagerReview,
} from "@/lib/performance/review";
import { useRouter, useSearchParams } from "next/navigation";

type Tab = "cycles" | "pending";

const VALID_TABS: Tab[] = ["cycles", "pending"];

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

function MonthlyReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "cycles",
  );
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<MonthlyDashboard | null>(null);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [upcomingMonths, setUpcomingMonths] = useState<string[]>([]);
  const [pendingReviews, setPendingReviews] = useState<ManagerReview[]>([]);

  const completedMonths = cycles
    .filter((c) => c.completed)
    .map((c) => c.reviewMonth.substring(0, 7));

  useEffect(() => {
    async function loadDashboard() {
      const data = await getMonthlyDashboard();

      setDashboard(data);

      const reviewCycles = await getReviewCycles();
      setCycles(reviewCycles);

      setUpcomingMonths(getUpcomingReviewMonths());

      const pending = await getPendingPerformanceReviews();
      setPendingReviews(pending);
    }

    loadDashboard();
  }, []);

  async function handleGenerate() {
    try {
      setLoading(true);

      const result = await generateMonthlyReviews();

      toast.success(
        `${result.created} reviews created • ${result.skipped} already existed`,
      );

      const data = await getMonthlyDashboard();

      setDashboard(data);

      const reviewCycles = await getReviewCycles();
      setCycles(reviewCycles);

      setUpcomingMonths(getUpcomingReviewMonths());
    } catch (error) {
      console.error(error);

      toast.error("Unable to create monthly reviews.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCycle(reviewMonth: string, cycle?: ReviewCycle) {
    if (!cycle) {
      setLoading(true);

      try {
        const result = await createMonthlyReviewCycle(reviewMonth);

        toast.success(
          `${result.created} reviews created • ${result.skipped} already existed`,
        );

        const dashboard = await getMonthlyDashboard();
        setDashboard(dashboard);

        const reviewCycles = await getReviewCycles();
        setCycles(reviewCycles);
      } finally {
        setLoading(false);
      }

      return;
    }

    if (cycle.completed) {
      router.push(`/reviews/${reviewMonth}`);
      return;
    }

    router.push(`/reviews/${reviewMonth}`);
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monthly Review Management</h1>

            <p className="text-slate-500 mt-2">Manage company review cycles.</p>
          </div>

          {/* Reserved for future bulk actions */}
          {/* <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Start New Review Cycle"}
          </Button> */}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={tab === "cycles" ? "default" : "outline"}
            onClick={() => setTab("cycles")}
          >
            Review Cycles
          </Button>

          <Button
            variant={tab === "pending" ? "default" : "outline"}
            onClick={() => setTab("pending")}
          >
            Pending Approval ({pendingReviews.length})
          </Button>
        </div>

        {tab === "pending" ? (
          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <Card className="p-10 text-center text-slate-500">
                No reviews waiting on anyone right now.
              </Card>
            ) : (
              pendingReviews.map((review) => (
                <Card
                  key={review.id}
                  className="p-6 flex items-center justify-between"
                >
                  <div>
                    <h2 className="text-xl font-semibold">
                      {review.employees?.full_name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {review.employees?.department}
                    </p>

                    <p className="text-sm text-slate-500 mt-3">
                      {new Date(review.review_month).toLocaleDateString(
                        "en-US",
                        { month: "long", year: "numeric" },
                      )}
                    </p>

                    <p className="text-sm mt-2">
                      Waiting on:{" "}
                      <span className="font-medium">
                        {review.status === "WaitingManager"
                          ? "Manager"
                          : "Employee"}
                      </span>{" "}
                      ({formatReviewStatus(review.status)})
                    </p>
                  </div>

                  <Button asChild>
                    <Link
                      href={`/employees/${review.employee_id}/reviews/${review.id}`}
                    >
                      Review
                    </Link>
                  </Button>
                </Card>
              ))
            )}
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-4 gap-5">
              <Card className="p-5">
                <p className="text-sm text-slate-500">Current Cycle</p>

                <h2 className="text-3xl font-bold mt-3">
                  {dashboard
                    ? new Date(dashboard.currentCycle).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        },
                      )
                    : "-"}
                </h2>
              </Card>

              <Card className="p-5">
                <p className="text-sm text-slate-500">Employees</p>

                <h2 className="text-3xl font-bold mt-3">
                  {dashboard?.totalEmployees ?? "-"}
                </h2>
              </Card>

              <Card className="p-5">
                <p className="text-sm text-slate-500">Reviews</p>

                <h2 className="text-3xl font-bold mt-3">
                  {dashboard?.totalReviews ?? "-"}
                </h2>
              </Card>

              <Card className="p-5">
                <p className="text-sm text-slate-500">Completion</p>

                <h2 className="text-3xl font-bold mt-3">
                  {dashboard ? `${dashboard.progress}%` : "-"}
                </h2>
              </Card>
            </div>

            <Card className="p-6">
              <h2 className="text-xl font-semibold">
                Employee Performance List
              </h2>

              <div className="space-y-4 mt-6">
                {upcomingMonths.map((month) => {
                  const index = upcomingMonths.indexOf(month);

                  const previousMonth =
                    index > 0
                      ? upcomingMonths[index - 1].substring(0, 7)
                      : null;

                  const canCreate =
                    index === 0
                      ? true
                      : completedMonths.includes(previousMonth!);
                  const existing = cycles.find(
                    (c) =>
                      c.reviewMonth.substring(0, 7) === month.substring(0, 7),
                  );

                  return (
                    <div
                      key={month}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div>
                        <h3 className="font-semibold">
                          {new Date(month).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {existing
                            ? `${existing.reviews} / ${existing.totalEmployees} Reviews`
                            : "No review cycle yet"}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        disabled={!existing && !canCreate}
                        onClick={() => handleCycle(month, existing)}
                        className="cursor-pointer"
                      >
                        {!existing
                          ? canCreate
                            ? "Create"
                            : "Locked"
                          : existing.completed
                            ? "Open"
                            : "Continue"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}

export default function MonthlyReviewsPage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="p-6 text-slate-500">Loading...</div>
        </AppLayout>
      }
    >
      <MonthlyReviewsContent />
    </Suspense>
  );
}
