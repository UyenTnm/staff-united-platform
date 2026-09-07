"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { calculateReviewScores } from "@/lib/performance/engine";
import { RoleGuard } from "@/components/auth/role-guard";

interface MonthlyEmployeeReview {
  id: string;

  employee_id: string;

  review_month: string;

  status: string;

  quality?: number;

  behavior?: number;

  kaizen?: number;

  total?: number;

  employees: {
    id: string;

    full_name: string;

    department: string;

    role: string;
  };
}

function MonthlyReviewDetailPageContent() {
  const params = useParams();

  const reviewMonth = params.reviewMonth as string;

  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<MonthlyEmployeeReview[]>([]);

  const totalEmployees = reviews.length;

  const completedReviews = reviews.filter(
    (r) => r.status === "Approved" || r.status === "Locked",
  ).length;

  const pendingReviews = totalEmployees - completedReviews;

  const completion =
    totalEmployees === 0
      ? 0
      : Math.round((completedReviews / totalEmployees) * 100);

  useEffect(() => {
    async function loadData() {
      const { data, error } = await supabase
        .from("performance_reviews")
        .select(
          `
          *,
          employees(
            id,
            full_name,
            department,
            role
          )
        `,
        )
        .eq("review_month", reviewMonth)
        .order("created_at");

      if (error) {
        console.error(error);
      } else {
        const reviewsWithScores = await Promise.all(
          (data as MonthlyEmployeeReview[]).map(async (review) => {
            const scores = await calculateReviewScores(
              review.employee_id,
              review.review_month,
            );

            return {
              ...review,

              quality: scores.quality,

              behavior: scores.behavior,

              kaizen: scores.kaizen,

              total: scores.total,
            };
          }),
        );

        setReviews(reviewsWithScores);
      }

      setLoading(false);
    }

    loadData();
  }, [reviewMonth]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/reviews">← Back to Monthly Reviews</Link>
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold">Monthly Review</h1>

          <p className="text-slate-500 mt-2">
            {new Date(reviewMonth).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="grid md:grid-cols-4 gap-5 mt-6">
            <Card className="p-5">
              <p className="text-sm text-slate-500">Employees</p>

              <h2 className="text-3xl font-bold mt-3">{totalEmployees}</h2>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-slate-500">Completed</p>

              <h2 className="text-3xl font-bold mt-3">{completedReviews}</h2>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-slate-500">Pending</p>

              <h2 className="text-3xl font-bold mt-3">{pendingReviews}</h2>
            </Card>

            <Card className="p-5">
              <p className="text-sm text-slate-500">Progress</p>

              <h2 className="text-3xl font-bold mt-3">{completion}%</h2>
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3">Employee</th>

                <th className="text-left">Quality</th>

                <th className="text-left">Behavior</th>
                <th className="text-right">Kaizen</th>
                <th className="text-right">Total</th>

                <th className="text-left">Status</th>
                <th className="text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {reviews.map((review) => (
                <tr key={review.id} className="border-b">
                  <td className="py-4">{review.employees.full_name}</td>

                  <td>{review.quality}/5</td>

                  <td>{review.behavior}/5</td>

                  <td>{review.kaizen}/5</td>

                  <td className="font-semibold">{review.total}/15</td>

                  <td>
                    <Badge
                      variant={
                        review.status === "Approved" ? "default" : "secondary"
                      }
                    >
                      {review.status}
                    </Badge>
                  </td>

                  <td className="text-right">
                    <Button asChild variant="outline">
                      <Link
                        href={`/employees/${review.employee_id}/reviews/${review.id}`}
                      >
                        Review
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </AppLayout>
  );
}

export default function MonthlyReviewDetailPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <MonthlyReviewDetailPageContent />
    </RoleGuard>
  );
}
