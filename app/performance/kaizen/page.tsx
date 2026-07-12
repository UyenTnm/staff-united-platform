"use client";

import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";

import { getEmployeeKaizens, type KaizenRecord } from "@/lib/employees/kaizen";
import { KaizenCard } from "@/components/employees/kaizen/KaizenCard";

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

  // function getStatusBadge(status: string) {
  //   switch (status) {
  //     case "Draft":
  //       return <Badge variant="secondary">Draft</Badge>;

  //     case "Submitted":
  //       return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>;

  //     case "Under Review":
  //       return (
  //         <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>
  //       );

  //     case "Approved":
  //       return <Badge className="bg-green-100 text-green-700">Approved</Badge>;

  //     case "Implemented":
  //       return (
  //         <Badge className="bg-purple-100 text-purple-700">Implemented</Badge>
  //       );

  //     case "Rewarded":
  //       return (
  //         <Badge className="bg-emerald-100 text-emerald-700">Rewarded</Badge>
  //       );

  //     default:
  //       return <Badge>{status}</Badge>;
  //   }
  // }

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
              <KaizenCard
                key={kaizen.id}
                kaizen={kaizen}
                action={
                  kaizen.status === "Draft" ? (
                    <Button asChild>
                      <Link href={`/performance/kaizen/${kaizen.id}/edit`}>
                        Continue Editing
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild variant="outline">
                      <Link href={`/performance/kaizen/${kaizen.id}`}>
                        View
                      </Link>
                    </Button>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
