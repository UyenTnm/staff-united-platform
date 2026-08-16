"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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
}

const STATUS_COLOR: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-700",
  Sent: "bg-blue-100 text-blue-700",
  Viewed: "bg-amber-100 text-amber-700",
  Accepted: "bg-emerald-100 text-emerald-700",
  Paid: "bg-emerald-100 text-emerald-800",
  Rejected: "bg-red-100 text-red-700",
};

export default function PortalDashboardPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<PortalQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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

      // RLS đã tự lọc đúng quote của khách này (xem migration 009)
      const { data, error } = await supabase
        .from("quotes")
        .select(
          "id, quote_number, title, amount, status, proposal_status, customer_market, public_token, created_at",
        )
        .order("created_at", { ascending: false });

      if (!error && data) {
        setQuotes(data as PortalQuote[]);
      }

      setLoading(false);
    }

    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/portal/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
              STAFF United
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Your Transaction History
            </h1>
            <p className="mt-1 text-sm text-slate-500">{userEmail}</p>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>

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
                <Link
                  key={quote.id}
                  href={`/proposal/${quote.public_token}`}
                  className="block rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {quote.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {quote.quote_number} —{" "}
                        {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                        STATUS_COLOR[quote.status] ||
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                  <p className="mt-3 text-lg font-bold text-slate-900">
                    {currencySymbol}
                    {Number(quote.amount).toLocaleString()}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
