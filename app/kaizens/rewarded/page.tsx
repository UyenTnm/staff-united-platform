"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// import { getPendingKaizens } from "@/lib/employees/kaizen";
import { getKaizensByStatus } from "@/lib/employees/kaizen";
import { getCurrentEmployee } from "@/lib/auth";
import { useRouter } from "next/navigation";

type PendingKaizen = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  impact: string;
  status: string;
  performance_points: number;

  created_at: string;

  employees: {
    id: string;
    full_name: string;
    department: string;
  };
};

export default function RewardedKaizensPage() {
  const [kaizens, setKaizens] = useState<PendingKaizen[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        // Lấy nhân viên hiện tại
        const employee = await getCurrentEmployee();

        if (!employee) {
          router.push("/login");
          return;
        }

        // Chỉ Manager / HR / Admin được vào
        if (!["Admin", "HR", "Manager"].includes(employee.user_role)) {
          router.push("/403");
          return;
        }

        const data = await getKaizensByStatus("Rewarded");
        setKaizens(data as PendingKaizen[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6">Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}

        <div>
          <h1 className="text-3xl font-bold">Rewarded Kaizens</h1>

          <p className="text-slate-500 mt-2">
            View rewarded Kaizens and performance rewards.
          </p>
        </div>

        {/* Empty */}

        {kaizens.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No rewarded Kaizens found.
          </Card>
        ) : (
          <div className="space-y-4">
            {kaizens.map((kaizen) => (
              <Card key={kaizen.id} className="p-5">
                <div className="flex items-start justify-between gap-6">
                  {/* Left */}

                  <div className="space-y-2 flex-1">
                    <h2 className="text-lg font-semibold">{kaizen.title}</h2>

                    <p className="text-sm text-slate-500">
                      {kaizen.employees.full_name} •{" "}
                      {kaizen.employees.department}
                    </p>

                    {kaizen.category && (
                      <p className="text-sm">
                        <span className="font-medium">Category:</span>{" "}
                        {kaizen.category}
                      </p>
                    )}

                    {kaizen.description && (
                      <p className="text-sm text-slate-700">
                        {kaizen.description}
                      </p>
                    )}

                    {/* <p className="text-xs text-slate-400">
                      Submitted{" "}
                      {new Date(kaizen.created_at).toLocaleDateString()}
                    </p> */}
                    <p className="text-xs text-slate-400">
                      Created {new Date(kaizen.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Right */}

                  <div className="flex flex-col items-end gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        +{kaizen.performance_points}
                      </p>

                      <p className="text-xs text-slate-500">
                        Performance Points
                      </p>
                    </div>

                    <Button asChild>
                      <Link
                        href={`/employees/${kaizen.employees.id}/kaizen/${kaizen.id}/edit`}
                      >
                        Open
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
