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
import { ClientLogoUpload } from "@/components/client-logo-upload";
import { QuotePagesEditor } from "@/components/quote-pages-editor";
import { ClientInfoEditor } from "@/components/client-info-editor";
import { BillingInfoEditor } from "@/components/billing-info-editor-staff";
import { SelectionHistory } from "@/components/selection-history";
import { UnlockSelectionCard } from "@/components/unlock-selection-card";

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

            {/* Hiện rõ khách đã chọn đúng dịch vụ nào — dữ liệu lưu
                sẵn trong client_notes lúc Accept, trước đây chưa hiện
                ra cho nhân viên xem. */}
            {quote.client_notes && (
              <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                📋 {quote.client_notes}
              </p>
            )}
          </div>

          {quote.status === "Paid" ? (
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
              Edit locked (Paid)
            </div>
          ) : (
            <Button asChild variant="outline">
              <Link href={`/crm/quotes/${quote.id}/edit`}>Edit Quote</Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ClientInfoEditor
            quoteId={quote.id}
            proposalStatus={quote.proposal_status}
            existing={{
              company_name: quote.company_name,
              contact_name: quote.contact_name,
              department: quote.department,
              contact_email: quote.contact_email,
              contact_phone: quote.contact_phone,
            }}
            onSaved={loadQuote}
          />

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
                  {quote.customer_market === "vietnam" ? "₫" : "$"}
                  {Number(quote.amount ?? 0).toLocaleString()}
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

        {/* Billing Info — sale/kế toán tự sửa được, khóa khi Paid */}
        <BillingInfoEditor
          quoteId={quote.id}
          proposalStatus={quote.proposal_status}
          existing={{
            billing_company_name: quote.billing_company_name,
            billing_address: quote.billing_address,
            billing_tax_code: quote.billing_tax_code,
            billing_email: quote.billing_email,
            billing_contact_person: quote.billing_contact_person,
          }}
          updatedByClient={quote.billing_updated_by === "client"}
          billingUpdatedAt={quote.billing_updated_at}
          onSaved={loadQuote}
        />

        {/* Sale mở/khóa quyền khách tự sửa lại lựa chọn dịch vụ */}
        <UnlockSelectionCard
          quoteId={quote.id}
          proposalStatus={quote.proposal_status}
          selectionUnlocked={quote.selection_unlocked}
          onChanged={loadQuote}
        />

        {/* Lịch sử khách đổi ý chọn dịch vụ — dùng phân tích hành vi */}
        <SelectionHistory
          quoteId={quote.id}
          currencySymbol={quote.customer_market === "vietnam" ? "₫" : "$"}
        />

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
          proposalStatus={quote.proposal_status}
          onUpdated={loadQuote}
        />

        {/* Service Options */}
        <QuoteItemsEditor
          quoteId={quote.id}
          customerMarket={quote.customer_market}
          proposalStatus={quote.proposal_status}
        />

        {/* Create Proposal — 2 lựa chọn rõ ràng, tách biệt hoàn toàn */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Create Proposal
          </h2>
          <p className="mb-4 text-sm text-slate-500">
            Choose how you want to build this proposal for the client.
          </p>

          <div className="space-y-4">
            {/* Option A — Upload PDF */}
            <ProposalPdfUpload
              quoteId={quote.id}
              currentPdfUrl={quote.proposal_pdf_url}
              proposalStatus={quote.proposal_status}
              onUploaded={loadQuote}
            />

            {/* Option B — trang riêng, dùng template STAFF United */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-6 dark:border-slate-800">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Option B — Use STAFF United Template
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  No design skills needed — just fill in the client logo and
                  content, we handle the layout.
                </p>
              </div>
              {quote.proposal_status === "accepted" ||
              quote.proposal_status === "paid" ? (
                <span className="flex-shrink-0 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-400">
                  🔒 Locked
                </span>
              ) : (
                <Button asChild variant="outline">
                  <Link href={`/crm/quotes/${quote.id}/template`}>
                    Create with Template →
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

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
