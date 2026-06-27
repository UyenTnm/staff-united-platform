"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PerformancePage() {
  const params = useParams();

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Monthly Performance Review</h1>

            <p className="text-slate-500 mt-2">July 2026</p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/employees/${params.id}`}>Back Profile</Link>
          </Button>
        </div>

        <Card className="p-6 space-y-6">
          <PerformanceItem title="Task Completion" score="95%" />

          <PerformanceItem title="Work Quality" score="92%" />

          <PerformanceItem title="Communication" score="90%" />

          <PerformanceItem title="Attendance" score="100%" />

          <PerformanceItem title="Initiative" score="88%" />
        </Card>
      </div>
    </AppLayout>
  );
}

function PerformanceItem({ title, score }: { title: string; score: string }) {
  return (
    <div className="flex justify-between border-b pb-4">
      <div>
        <p className="font-medium">{title}</p>
      </div>

      <div className="font-bold text-lg">{score}</div>
    </div>
  );
}
