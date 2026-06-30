"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "./auth-provider";
import type { UserRole } from "@/lib/auth";

interface Props {
  allow: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allow, children }: Props) {
  const router = useRouter();

  const { employee, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!employee) return;

    if (!allow.includes(employee.user_role)) {
      router.replace("/403");
    }
  }, [employee, loading, allow, router]);

  if (loading) return <div>Loading...</div>;

  if (!employee) return null;

  if (!allow.includes(employee.user_role)) {
    return null;
  }

  return <>{children}</>;
}
