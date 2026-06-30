"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  const { employee } = useAuth();

  let backUrl = "/login";
  let backText = "Back";

  switch (employee?.user_role) {
    case "Employee":
      backUrl = "/performance";
      backText = "Back to My Performance";
      break;

    case "HR":
      backUrl = "/employees";
      backText = "Back to Employees";
      break;

    case "Manager":
      backUrl = "/reviews/pending";
      backText = "Back to Pending Reviews";
      break;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />

        <h1 className="mt-6 text-3xl font-bold">Access Denied</h1>

        <p className="mt-3 text-slate-500">
          You do not have permission to access this page.
        </p>

        <Button asChild className="mt-8">
          <Link href={backUrl}>{backText}</Link>
        </Button>
      </div>
    </div>
  );
}
