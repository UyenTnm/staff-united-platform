"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// import { getPendingKaizens } from "@/lib/employees/kaizen";
import {
  getKaizensByStatus,
  type KaizenWithEmployee,
} from "@/lib/employees/kaizen";
import { getCurrentEmployee } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { KaizenCard } from "@/components/employees/kaizen/KaizenCard";

// type PendingKaizen = {
//   id: string;
//   title: string;
//   description: string | null;
//   category: string | null;
//   impact: string;
//   status: string;
//   performance_points: number;

//   created_at: string;

//   employees: {
//     id: string;
//     full_name: string;
//     department: string;
//   };
// };

export default function RewardedKaizensPage() {
  const [kaizens, setKaizens] = useState<KaizenWithEmployee[]>([]);
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
        setKaizens(data as KaizenWithEmployee[]);
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
            Successfully rewarded employee improvements.
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
              <KaizenCard
                key={kaizen.id}
                kaizen={kaizen}
                action={
                  <Button asChild>
                    <Link
                      href={`/employees/${kaizen.employees.id}/kaizen/${kaizen.id}/edit?from=rewarded`}
                    >
                      View
                    </Link>
                  </Button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
