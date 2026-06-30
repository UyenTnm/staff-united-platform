"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEmployeeKaizens, KaizenRecord } from "@/lib/employees/kaizen";
import { useEffect, useState } from "react";
import { EmployeeHeader } from "@/components/employees/employee-header";
import { getEmployee, Employee } from "@/lib/employees/employees";

export default function QualityPage() {
  // const summary = calculateQualityScore(getQualityIssues);
  const [kaizens, setKaizens] = useState<KaizenRecord[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const params = useParams();
  const searchParams = useSearchParams();

  const reviewId = searchParams.get("reviewId");

  useEffect(() => {
    async function loadData() {
      const [kaizenData, employeeData] = await Promise.all([
        getEmployeeKaizens(params.id as string),
        getEmployee(params.id as string),
      ]);

      setKaizens(kaizenData);
      setEmployee(employeeData);
    }

    loadData();
  }, [params.id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {employee && (
          <EmployeeHeader
            employee={employee}
            title="Kaizen"
            backHref={
              reviewId
                ? `/employees/${employee.id}/reviews/${reviewId}`
                : `/employees/${employee.id}`
            }
          />
        )}

        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Continuous Improvements</h2>

            <Button asChild>
              <Link href={`/employees/${params.id}/kaizen/new`}>
                Submit Improvement
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {kaizens.length === 0 ? (
              <div className="border rounded-lg p-8 text-center text-slate-500">
                No Kaizen submissions yet.
              </div>
            ) : (
              kaizens.map((kaizen) => (
                <Card key={kaizen.id} className="p-5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{kaizen.title}</h3>

                      <div className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">
                        {kaizen.status}
                      </div>

                      <p className="text-sm text-slate-500">
                        {kaizen.category} • {kaizen.impact}
                      </p>

                      <p className="text-sm">{kaizen.description}</p>

                      <p className="text-xs text-slate-400">
                        {new Date(kaizen.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right space-y-3">
                      {/* <p className="font-bold text-emerald-600 text-lg">
                        +{kaizen.performance_points}
                      </p> */}
                      <p className="font-bold text-emerald-600 text-lg">
                        {kaizen.performance_points > 0
                          ? `+${kaizen.performance_points}`
                          : "--"}
                      </p>

                      <Button asChild size="sm" variant="outline">
                        <Link
                          href={`/employees/${params.id}/kaizen/${kaizen.id}/edit`}
                        >
                          View
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
