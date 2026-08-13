"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { ClientLogoUpload } from "@/components/client-logo-upload";
import { QuotePagesEditor } from "@/components/quote-pages-editor";

import { Quote, getQuote } from "@/lib/crm/quotes";

// Trang riêng — "Create Proposal with STAFF United Template".
// Tách khỏi trang chi tiết quote chính để đỡ rối, vì luồng này cần
// điền nội dung/màu sắc theo mẫu thiết kế riêng (đang chờ team thiết
// kế mẫu proposal chuẩn trước khi hoàn thiện phần hiển thị).
export default function QuoteTemplatePage() {
  const params = useParams();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadQuote() {
    const data = await getQuote(params.id as string);
    setQuote(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuote();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 text-sm text-slate-500">Loading...</div>
      </AppLayout>
    );
  }

  if (!quote) {
    return (
      <AppLayout>
        <div className="p-6 text-sm text-slate-500">Quote not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link
            href={`/crm/quotes/${quote.id}`}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quote
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Proposal with STAFF United Template
          </h1>
          <p className="mt-1 text-slate-500">
            {quote.quote_number} — {quote.company_name}
          </p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          🚧 This template design is still being finalized by the design team.
          Content entered here will be used once the visual template is ready.
        </div>

        <ClientLogoUpload
          quoteId={quote.id}
          currentLogoUrl={quote.client_logo_url}
          onUploaded={loadQuote}
        />

        <QuotePagesEditor quoteId={quote.id} />
      </div>
    </AppLayout>
  );
}
