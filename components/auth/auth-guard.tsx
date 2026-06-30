"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "./auth-provider";

interface Props {
  children: ReactNode;
}

export function AuthGuard({ children }: Props) {
  const router = useRouter();

  const { employee, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!employee) {
      router.replace("/login");
    }
  }, [employee, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!employee) {
    return null;
  }

  return <>{children}</>;
}
