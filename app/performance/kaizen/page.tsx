"use client";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";

import { getEmployeeKaizens, type KaizenRecord } from "@/lib/employees/kaizen";

export default function MyKaizensPage() {
  const { employee } = useAuth();

  const [kaizens, setKaizens] = useState<KaizenRecord[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!employee) return;

      const data = await getEmployeeKaizens(employee.id);

      setKaizens(data);

      setLoading(false);
    }

    load();
  }, [employee]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Kaizens</h1>

            <p className="text-slate-500 mt-2">
              Submit improvement ideas and track their approval status.
            </p>
          </div>

          <Button asChild>
            <Link href="/performance/kaizen/new">+ Submit Kaizen</Link>
          </Button>
        </div>

        {/* Empty State */}

        {kaizens.length === 0 ? (
          <Card className="p-10 text-center">
            <h2 className="text-xl font-semibold">No Kaizens Submitted</h2>

            <p className="text-slate-500 mt-3">
              You have not submitted any improvement ideas yet.
            </p>

            <Button asChild className="mt-6">
              <Link href="/performance/kaizen/new">
                Submit Your First Kaizen
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {kaizens.map((kaizen) => (
              <Card key={kaizen.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{kaizen.title}</h2>

                    <p className="text-slate-500 mt-2">{kaizen.category}</p>

                    <p className="mt-4">{kaizen.description}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{kaizen.status}</p>

                    <p className="text-sm text-slate-500 mt-2">
                      {kaizen.review_month}
                    </p>
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
