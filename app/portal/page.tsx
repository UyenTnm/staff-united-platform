"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PortalLayout } from "@/components/portal-layout";

interface PortalQuote {
  id: string;
  quote_number: string;
  title: string;
  amount: number;
  status: string;
  proposal_status: string;
  customer_market: string | null;
  public_token: string;
  created_at: string;
  paid_at: string | null;
}

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  Viewed: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  "Deposit Paid": "bg-purple-100 text-purple-700",
  Paid: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-700",
};

// Hiện đúng nhãn theo proposal_status (đáng tin cậy hơn status, vì
// status từng bị lệch ở các bản ghi cũ) — đảm bảo khách luôn thấy
// đúng trạng thái thật, kể cả với quote cũ tạo trước khi sửa lỗi.
function getDisplayStatus(quote: PortalQuote): string {
  switch (quote.proposal_status) {
    case "deposit_paid":
      return "Deposit Paid — In Progress";
    case "paid":
      return "Fully Paid";
    case "accepted":
      return "Accepted";
    case "viewed":
      return "Viewed";
    case "sent":
      return "Sent";
    case "rejected":
      return "Rejected";
    default:
      return quote.status;
  }
}

export default function PortalDashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<PortalQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/portal/login");
        return;
      }

      setUserEmail(session.user.email || "");

      const { data, error } = await supabase
        .from("quotes")
        .select(
          "id, quote_number, title, amount, status, proposal_status, customer_market, public_token, created_at, paid_at",
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setQuotes(data as PortalQuote[]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleDownloadReceipt(quoteId: string) {
    setDownloadingId(quoteId);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const res = await fetch(`/api/portal/receipt?quoteId=${quoteId}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) throw new Error("Failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Receipt.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <PortalLayout userEmail={userEmail}>
        <p className="text-sm text-slate-500">Loading...</p>
      </PortalLayout>
    );
  }

  const paidCount = quotes.filter((q) => q.status === "Paid").length;
  const totalVND = quotes
    .filter((q) => q.status === "Paid" && q.customer_market === "vietnam")
    .reduce((sum, q) => sum + Number(q.amount), 0);
  const totalUSD = quotes
    .filter((q) => q.status === "Paid" && q.customer_market !== "vietnam")
    .reduce((sum, q) => sum + Number(q.amount), 0);

  return (
    <PortalLayout userEmail={userEmail}>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-slate-900">
          Transaction History
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          All your proposals and payments with STAFF United.
        </p>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Completed Deals
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {paidCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Paid (VND)
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              ₫{totalVND.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Paid (USD)
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              ${totalUSD.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Transaction list */}
        <div className="mt-8">
          {quotes.length === 0 ? (
            <div className="rounded-xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              No proposals found for your account yet.
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => {
                const currencySymbol =
                  quote.customer_market === "vietnam" ? "₫" : "$";
                return (
                  <div
                    key={quote.id}
                    className="rounded-xl bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {quote.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {quote.quote_number} —{" "}
                          {new Date(quote.created_at).toLocaleDateString()}
                          {quote.paid_at &&
                            ` · Paid ${new Date(quote.paid_at).toLocaleDateString()}`}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                          STATUS_COLOR[getDisplayStatus(quote)] ||
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {getDisplayStatus(quote)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-lg font-bold text-slate-900">
                        {currencySymbol}
                        {Number(quote.amount).toLocaleString()}
                      </p>

                      <div className="flex gap-2">
                        {quote.status === "Paid" && (
                          <button
                            onClick={() => handleDownloadReceipt(quote.id)}
                            disabled={downloadingId === quote.id}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloadingId === quote.id ? "..." : "Receipt"}
                          </button>
                        )}
                        <Link
                          href={`/proposal/${quote.public_token}`}
                          target="_blank"
                          className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
