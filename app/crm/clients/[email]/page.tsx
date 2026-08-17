"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getClientHistory, ClientHistory } from "@/lib/crm/clients";
import { formatCurrency } from "@/lib/format-currency";

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  Viewed: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Paid: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-700",
};

export default function ClientHistoryPage() {
  const params = useParams();
  const email = decodeURIComponent(params.email as string);

  const [history, setHistory] = useState<ClientHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getClientHistory(email);
      setHistory(data);
      setLoading(false);
    }
    load();
  }, [email]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 text-sm text-slate-500">Loading history...</div>
      </AppLayout>
    );
  }

  if (!history) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Button asChild variant="ghost" size="sm" className="-ml-2">
            <Link href="/crm/quotes" className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" />
              Back to Quotes
            </Link>
          </Button>
          <div className="p-6 text-sm text-slate-500">
            No quotes found for {email}.
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href="/crm/quotes" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Link>
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
            <Building2 className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {history.companyName}
            </h1>
            <p className="text-sm text-slate-500">{history.email}</p>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Deals
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {history.totalQuotes}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Paid (VND)
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(history.totalPaidVND, true)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Paid (USD)
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(history.totalPaidUSD, false)}
            </p>
          </div>
        </div>

        {/* Danh sách toàn bộ Quote của khách này */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-100 p-4 dark:border-slate-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              All Deals ({history.totalQuotes})
            </h2>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.quotes.map((q) => (
              <Link
                key={q.id}
                href={`/crm/quotes/${q.id}`}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {q.title || q.quote_number}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {q.quote_number} —{" "}
                    {new Date(q.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(
                      Number(q.amount),
                      q.customer_market === "vietnam",
                    )}
                  </span>
                  <Badge
                    className={
                      STATUS_COLOR[q.status] || "bg-slate-100 text-slate-700"
                    }
                  >
                    {q.status}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}