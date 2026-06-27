"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Employee, getEmployee } from "@/lib/employees/employees";
import {
  calculateEmployeePerformance,
  PerformanceSummary,
} from "@/lib/employees/performance";
import { PerformanceStatus } from "@/components/employees/performance-status";
import { QuickActions } from "@/components/employees/quick-actions";

export default function EmployeeDetailPage() {
  const params = useParams();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [performance, setPerformance] = useState<PerformanceSummary | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmployee() {
      const data = await getEmployee(params.id as string);
      const perf = await calculateEmployeePerformance(params.id as string);

      setPerformance(perf);

      setEmployee(data);

      setLoading(false);
    }

    loadEmployee();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading employee...</div>
      </AppLayout>
    );
  }

  if (!employee) {
    return (
      <AppLayout>
        <div>Employee not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button asChild variant="outline">
          <Link href="/employees">← Back to Employees</Link>
        </Button>
      </div>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{employee.full_name}</h1>

            <p className="text-slate-500 mt-2">{employee.role}</p>
          </div>

          <Badge>{employee.status}</Badge>
        </div>

        <PerformanceStatus
          reviewMonth="July 2026"
          status="Draft"
          updatedAt={new Date(employee.created_at).toLocaleDateString()}
          reviewedBy="Martha"
        />

        {/* Overview */}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-5">Overview</h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-500">Full Name</p>

              <p className="font-medium">{employee.full_name}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Email</p>

              <p className="font-medium">{employee.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Employee Number</p>

              <p className="font-medium">{employee.employee_number}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Department</p>

              <p className="font-medium">{employee.department}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Position</p>

              <p className="font-medium">{employee.role}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Manager</p>

              <p className="font-medium">-</p>
            </div>
          </div>
        </Card>

        {/* Performance */}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-5">Current Performance</h2>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-5">Performance Summary</h2>

            {performance && (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Quality</span>

                  <strong>{performance.quality} / 5</strong>
                </div>

                <div className="flex justify-between">
                  <span>Behavior</span>

                  <strong>{performance.behavior} / 5</strong>
                </div>

                <div className="flex justify-between">
                  <span>Kaizen</span>

                  <strong>{performance.kaizen} / 5</strong>
                </div>

                <hr />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total Performance</span>

                  <span>{performance.total} / 15</span>
                </div>
              </div>
            )}
          </Card>
        </Card>

        <QuickActions employeeId={employee.id} />
      </div>
    </AppLayout>
  );
}
