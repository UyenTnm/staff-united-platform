import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { QuotesTable } from "@/components/crm/quotes-table";
import { StatCard } from "@/components/crm/stat-card";
import { getQuotes } from "@/lib/crm/quotes";

// Bắt buộc — trang này đọc data trực tiếp từ Supabase, không được
// cache tĩnh lúc build, phải luôn fetch mới mỗi lần người dùng vào.
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
  const quotes = await getQuotes();

  // Tách riêng tổng theo từng loại tiền tệ — KHÔNG cộng chung VNĐ và
  // USD vào 1 con số (2 đơn vị khác nhau, cộng chung sẽ sai hoàn toàn).
  const totalVND = quotes
    .filter((q) => q.customer_market === "vietnam")
    .reduce((sum, q) => sum + Number(q.amount ?? 0), 0);

  const totalUSD = quotes
    .filter((q) => q.customer_market !== "vietnam") // international hoặc chưa set
    .reduce((sum, q) => sum + Number(q.amount ?? 0), 0);

  const draft = quotes.filter((q) => q.status === "Draft").length;
  const outForReview = quotes.filter(
    (q) => q.status === "Sent" || q.status === "Viewed",
  ).length;
  const accepted = quotes.filter(
    (q) => q.status === "Accepted" || q.status === "Paid",
  ).length;

  return (
    <AppLayout>
      <div className="min-h-screen bg-white dark:bg-slate-950">
        <main className="pt-20 px-4 md:px-6 pb-12">
          <div className="w-full">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Quotes
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Manage client quotations and proposals.
                </p>
              </div>

              <Button asChild variant="outline">
                <Link href="/crm">Go to Leads to create a quote</Link>
              </Button>
            </div>

            {/* Hàng 1 — tổng tiền, tách riêng VNĐ / USD (2 cột) */}
            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <StatCard
                label="Total VND 🇻🇳"
                value={`₫${totalVND.toLocaleString()}`}
                accent="emerald"
              />
              <StatCard
                label="Total USD 🌍"
                value={`$${totalUSD.toLocaleString()}`}
                accent="emerald"
              />
            </div>

            {/* Hàng 2 — số lượng theo trạng thái (3 cột) */}
            <div className="mb-6 grid grid-cols-3 gap-4 sm:grid-cols-3">
              <StatCard label="Draft" value={draft} accent="slate" />
              <StatCard
                label="Out for Review"
                value={outForReview}
                accent="amber"
              />
              <StatCard label="Accepted" value={accepted} accent="emerald" />
            </div>

            <QuotesTable />
          </div>
        </main>
      </div>
    </AppLayout>
  );
}
