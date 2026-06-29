"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentSession } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const session = await getCurrentSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkSession();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
