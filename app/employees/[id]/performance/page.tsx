"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// This route used to render hard-coded placeholder metrics (95%, 92%...)
// unrelated to the real Quality/Behavior/Kaizen scoring engine. The real,
// data-backed breakdown lives at /employees/[id]/summary — redirect there
// so no one lands on stale mock numbers.
export default function PerformancePageRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/employees/${params.id}/summary`);
  }, [params.id, router]);

  return null;
}
