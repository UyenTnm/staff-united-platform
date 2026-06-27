"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Employee } from "@/lib/employees/employees";

interface Props {
  employee: Employee;
  title: string;
  backHref: string;
}

export function EmployeeHeader({ employee, title, backHref }: Props) {
  return (
    <div className="space-y-5">
      <Button asChild variant="outline">
        <Link href={backHref}>← Back</Link>
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{employee.full_name}</h1>

          <p className="text-slate-500 mt-2">{employee.role}</p>

          <p className="text-sm text-slate-400 mt-1">
            {employee.employee_number} • {employee.department}
          </p>
        </div>

        <div className="text-right">
          <Badge>{employee.status}</Badge>

          <p className="text-xs text-slate-500 mt-3">{title}</p>
        </div>
      </div>
    </div>
  );
}
