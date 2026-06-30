"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getWaitingManagerReviews,
  type ManagerReview,
} from "@/lib/performance/review";

export default function PendingReviewsPage() {
  // const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [reviews, setReviews] = useState<ManagerReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getWaitingManagerReviews();

      setReviews(data);

      setLoading(false);
    }

    load();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Performance Reviews</h1>

          <p className="text-slate-500 mt-2">
            Reviews waiting for manager approval.
          </p>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && reviews.length === 0 && (
          <Card className="p-6">
            <p>No reviews waiting for approval.</p>
          </Card>
        )}

        {reviews.map((review) => (
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
                {new Date(review.review_month).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <p className="text-sm mt-2">Status: {review.status}</p>
            </div>

            <Button asChild>
              <Link
                href={`/employees/${review.employee_id}/reviews/${review.id}`}
              >
                Review
              </Link>
            </Button>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}
