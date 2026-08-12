"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalQrCard } from "@/components/proposal-qr-card";
import { ProposalPdfUpload } from "@/components/proposal-pdf-upload";
import { QuoteItemsEditor } from "@/components/quote-items-editor";
import { CustomerMarketSelector } from "@/components/customer-market-selector";
import { MarkPaidCard } from "@/components/mark-paid-card";

import { Quote, getQuote } from "@/lib/crm/quotes";

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-slate-100 text-slate-700 border border-slate-200";
    case "Sent":
      return "bg-blue-100 text-blue-700 border border-blue-200";
    case "Viewed":
      return "bg-amber-100 text-amber-700 border border-amber-200";
    case "Accepted":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200";
    case "Paid":
      return "bg-emerald-100 text-emerald-800 border border-emerald-300";
    case "Rejected":
      return "bg-red-100 text-red-700 border border-red-200";
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200";
  }
}

export default function QuoteDetailPage() {
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
        <div className="p-6 text-sm text-slate-500">Loading quote...</div>
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
          <Link href="/crm/quotes" className="flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Link>
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {quote.quote_number}
              </h1>
              <Badge className={getStatusColor(quote.status)}>
                {quote.status}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">{quote.company_name}</p>
          </div>

          <Button asChild variant="outline">
            <Link href={`/crm/quotes/${quote.id}/edit`}>Edit Quote</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Client Information
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Company</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {quote.company_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contact</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {quote.contact_name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {quote.department || "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Quote Overview
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Title</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {quote.title || "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Amount</dt>
                <dd className="text-lg font-bold text-slate-900 dark:text-white">
                  ${Number(quote.amount ?? 0).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {new Date(quote.created_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Mark as Paid — chỉ hiện khi khách đã Accept, chờ xác nhận tiền */}
        <MarkPaidCard
          quoteId={quote.id}
          proposalStatus={quote.proposal_status}
          onMarked={loadQuote}
        />

        {/* Customer Market — chọn VN (VietQR) hay Quốc tế (Wire USD) */}
        <CustomerMarketSelector
          quoteId={quote.id}
          currentMarket={quote.customer_market}
          onUpdated={loadQuote}
        />

        {/* Service Options */}
        <QuoteItemsEditor quoteId={quote.id} />

        {/* Proposal PDF upload */}
        <ProposalPdfUpload
          quoteId={quote.id}
          currentPdfUrl={quote.proposal_pdf_url}
          onUploaded={loadQuote}
        />

        {/* QR / link */}
        <ProposalQrCard
          quoteId={quote.id}
          publicToken={quote.public_token}
          proposalStatus={quote.proposal_status}
          onSent={loadQuote}
        />

        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Notes
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {quote.notes || "No notes"}
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
