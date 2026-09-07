"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { getOrCreateCurrentReview } from "@/lib/performance/review";
import { RoleGuard } from "@/components/auth/role-guard";

function NewReviewPageContent() {
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

export default function NewReviewPage() {
  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <NewReviewPageContent />
    </RoleGuard>
  );
}
