"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getOrCreateCurrentReview } from "@/lib/perfomance/review";

export default function NewReviewPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    async function createReview() {
      try {
        const review = await getOrCreateCurrentReview(params.id as string);

        router.replace(`/employees/${params.id}/reviews/${review.id}`);
      } catch (err) {
        console.error(err);
        alert("Unable to create review.");
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
