"use client";

import { AppLayout } from "@/components/app-layout";
import { EmployeesTable } from "@/components/employees/employees-table";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { useEffect } from "react";

export default function EmployeesPage() {
  useEffect(() => {
    async function test() {
      const session = await getSession();

      console.log(session);
    }

    test();
  }, []);

  return (
    <AppLayout>
      <div className="w-full">
        <div className="mb-8 flex items-start justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Employees
          </h1>

          {/* <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage staff members and access permissions.
          </p> */}

          <Button asChild>
            <Link href="/employees/new">+ Add Employee</Link>
          </Button>
        </div>

        <EmployeesTable />
      </div>
    </AppLayout>
  );
}
