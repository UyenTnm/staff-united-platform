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
// import { formatDate } from "@/lib/utils";
import type { KaizenRecord } from "@/lib/employees/kaizen";
import { KaizenCard } from "@/components/employees/kaizen/KaizenCard";

type ImplementedKaizen = KaizenRecord & {
  employees: {
    id: string;
    full_name: string;
    department: string;
  };
};

export default function ImplementedKaizensPage() {
  const [kaizens, setKaizens] = useState<ImplementedKaizen[]>([]);
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

        const data = await getKaizensByStatus("Waiting Verification");
        setKaizens(data as ImplementedKaizen[]);
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
          <h1 className="text-3xl font-bold">Waiting Verification</h1>

          <p className="text-slate-500 mt-2">
            Employee improvements waiting for verification.
          </p>
        </div>

        {/* Empty */}

        {kaizens.length === 0 ? (
          <Card className="p-10 text-center text-slate-500">
            No Kaizens are waiting for verification.
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
                      href={`/employees/${kaizen.employees.id}/kaizen/${kaizen.id}/edit?from=verification`}
                    >
                      Open
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
