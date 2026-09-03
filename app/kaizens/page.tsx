"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  getPendingKaizens,
  getKaizensByStatus,
  type KaizenWithEmployee,
} from "@/lib/employees/kaizen";
import { getCurrentEmployee } from "@/lib/auth";
import { KaizenCard } from "@/components/employees/kaizen/KaizenCard";

type Tab = "pending" | "verification" | "approved" | "rewarded";

const VALID_TABS: Tab[] = ["pending", "verification", "approved", "rewarded"];

const TABS: { key: Tab; label: string; fromParam: string }[] = [
  { key: "pending", label: "Pending", fromParam: "pending" },
  {
    key: "verification",
    label: "Waiting Verification",
    fromParam: "verification",
  },
  { key: "approved", label: "Approved", fromParam: "approved" },
  { key: "rewarded", label: "Rewarded", fromParam: "reward" },
];

function KaizenManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>(
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "pending",
  );

  const [loading, setLoading] = useState(true);

  const [pending, setPending] = useState<KaizenWithEmployee[]>([]);
  const [verification, setVerification] = useState<KaizenWithEmployee[]>([]);
  const [approved, setApproved] = useState<KaizenWithEmployee[]>([]);
  const [rewarded, setRewarded] = useState<KaizenWithEmployee[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const employee = await getCurrentEmployee();

        if (!employee) {
          router.push("/login");
          return;
        }

        if (!["Admin", "HR", "Manager"].includes(employee.user_role)) {
          router.push("/403");
          return;
        }

        const [pendingData, verificationData, approvedData, rewardedData] =
          await Promise.all([
            getPendingKaizens(),
            getKaizensByStatus("Waiting Verification"),
            getKaizensByStatus("Approved"),
            getKaizensByStatus("Rewarded"),
          ]);

        setPending(pendingData as KaizenWithEmployee[]);
        setVerification(verificationData as KaizenWithEmployee[]);
        setApproved(approvedData as KaizenWithEmployee[]);
        setRewarded(rewardedData as KaizenWithEmployee[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const countFor: Record<Tab, number> = {
    pending: pending.length,
    verification: verification.length,
    approved: approved.length,
    rewarded: rewarded.length,
  };

  const listFor: Record<Tab, KaizenWithEmployee[]> = {
    pending,
    verification,
    approved,
    rewarded,
  };

  const emptyTextFor: Record<Tab, string> = {
    pending: "No pending improvements found.",
    verification: "No Kaizens are waiting for verification.",
    approved: "No approved Kaizens found.",
    rewarded: "No rewarded Kaizens found.",
  };

  const activeFromParam = TABS.find((t) => t.key === tab)!.fromParam;
  const actionLabel = tab === "rewarded" ? "View" : "Open";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kaizen Management</h1>

        <p className="text-slate-500 mt-2">
          Review, verify and reward employee improvement submissions.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3">
        {TABS.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? "default" : "outline"}
            onClick={() => setTab(t.key)}
          >
            {t.label} ({countFor[t.key]})
          </Button>
        ))}
      </div>

      {loading ? (
        <Card className="p-8 text-center text-slate-500">Loading...</Card>
      ) : listFor[tab].length === 0 ? (
        <Card className="p-10 text-center text-slate-500">
          {emptyTextFor[tab]}
        </Card>
      ) : (
        <div className="space-y-4">
          {listFor[tab].map((kaizen) => (
            <KaizenCard
              key={kaizen.id}
              kaizen={kaizen}
              action={
                <Button asChild>
                  <Link
                    href={`/employees/${kaizen.employees.id}/kaizen/${kaizen.id}/edit?from=${activeFromParam}`}
                  >
                    {actionLabel}
                  </Link>
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function KaizenManagementPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <Card className="p-8 text-center text-slate-500">Loading...</Card>
        }
      >
        <KaizenManagementContent />
      </Suspense>
    </AppLayout>
  );
}
