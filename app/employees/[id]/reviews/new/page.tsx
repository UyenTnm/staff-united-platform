"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getOrCreateCurrentReview } from "@/lib/performance/review";

export default function NewReviewPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function createReview() {
      try {
        const review = await getOrCreateCurrentReview(params.id as string);

        router.replace(`/employees/${params.id}/reviews/${review.id}`);
      } catch (err) {
        console.error("Create Review Error:", err);

        alert(JSON.stringify(err, null, 2));
      }
    }

    createReview();
  }, [params.id, router]);

  return (
    <div className="flex h-screen items-center justify-center text-slate-500">
      Creating current review...
    </div>
  );
}
