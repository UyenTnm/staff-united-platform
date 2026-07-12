"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  getKaizen,
  startExecution,
  requestVerification,
  type KaizenRecord,
} from "@/lib/employees/kaizen";

import { KaizenTimeline } from "@/components/employees/kaizen/kaizen-timeline";

import { toast } from "sonner";

export default function MyKaizenPage() {
  const params = useParams();
  const router = useRouter();

  const [kaizen, setKaizen] = useState<KaizenRecord | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getKaizen(params.kaizenId as string);

        setKaizen(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [params.kaizenId]);

  async function handleStartExecution() {
    if (!kaizen) return;

    try {
      await startExecution(kaizen.id);

      toast.success("Execution started.");

      setKaizen({
        ...kaizen,
        status: "In Progress",
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to start execution.");
    }
  }

  async function handleRequestVerification() {
    if (!kaizen) return;

    try {
      await requestVerification(kaizen.id);

      toast.success("Verification requested.");

      setKaizen({
        ...kaizen,
        status: "Waiting Verification",
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to request verification.");
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div>Loading...</div>
      </AppLayout>
    );
  }

  if (!kaizen) {
    return (
      <AppLayout>
        <div>Kaizen not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{kaizen.title}</h1>

            <p className="text-slate-500 mt-2">Execution Workspace</p>
          </div>

          <Button asChild variant="outline">
            <Link href="/performance/kaizen">Back</Link>
          </Button>
        </div>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Workflow</h2>

          <KaizenTimeline status={kaizen.status} />
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="font-semibold text-lg">Employee Submission</h2>

          <div>
            <label className="text-sm font-medium">Description</label>

            <p className="mt-2 text-slate-700 whitespace-pre-wrap">
              {kaizen.description}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium">Category</label>

            <p className="mt-2">{kaizen.category}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Business Benefit</label>

            <p className="mt-2 whitespace-pre-wrap">
              {kaizen.business_benefit}
            </p>
          </div>
        </Card>

        <Card className="p-6 space-y-5">
          <h2 className="font-semibold text-lg">Manager Review</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium">Impact</label>

              <p className="mt-2">{kaizen.impact}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Performance Points</label>

              <p className="mt-2">+{kaizen.performance_points}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Review Notes</label>

            <p className="mt-2 whitespace-pre-wrap">
              {kaizen.review_note || "-"}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-5">Execution</h2>

          <p className="mb-6">
            Current Status :<strong className="ml-2">{kaizen.status}</strong>
          </p>

          {/* Approved */}
          {kaizen.status === "Approved" && (
            <Button onClick={handleStartExecution}>🚀 Start Execution</Button>
          )}

          {/* In Progress */}
          {kaizen.status === "In Progress" && (
            <Button onClick={handleRequestVerification}>
              Request Verification
            </Button>
          )}

          {/* Waiting Verification */}
          {kaizen.status === "Waiting Verification" && (
            <Button disabled>Waiting for Manager Verification</Button>
          )}

          {/* Verified */}
          {kaizen.status === "Verified" && <Button disabled>Verified</Button>}

          {/* Rewarded */}
          {kaizen.status === "Rewarded" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-6 space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-green-700">
                  🎉 Congratulations!
                </h3>

                <p className="text-slate-600 mt-2">
                  Your Kaizen has been successfully implemented and rewarded.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <p className="text-sm text-slate-500">Performance Points</p>

                  <p className="text-3xl font-bold text-green-700">
                    +{kaizen.performance_points}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Impact Level</p>

                  <p className="font-semibold">{kaizen.impact}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-slate-600">
                  Thank you for contributing to continuous improvement at STAFF
                  United.
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
