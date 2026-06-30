"use client";

import { AppLayout } from "@/components/app-layout";
import { useAuth } from "@/components/auth/auth-provider";
import { RoleGuard } from "@/components/auth/role-guard";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import Link from "next/link";
// import { useEffect } from "react";

export default function EmployeesPage() {
  const { employee } = useAuth();
  // useEffect(() => {
  //   async function test() {
  //     const session = await getSession();

  //     console.log(session);
  //   }

  //   test();
  // }, []);

  return (
    <RoleGuard allow={["Admin", "HR", "Manager"]}>
      <AppLayout>
        <div className="w-full">
          <div className="mb-8 flex items-start justify-between">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Employees
            </h1>

            {["Admin", "HR"].includes(employee?.user_role ?? "") && (
              <Button asChild>
                <Link href="/employees/new">+ Add Employee</Link>
              </Button>
            )}
          </div>

          <EmployeesTable />
        </div>
      </AppLayout>
    </RoleGuard>
  );
}
