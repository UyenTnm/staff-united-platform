"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProposalQrCard } from "@/components/proposal-qr-card";
import { ProposalPdfUpload } from "@/components/proposal-pdf-upload";
import { QuoteItemsEditor } from "@/components/quote-items-editor";
import { CustomerMarketSelector } from "@/components/customer-market-selector";
import { AdminPaymentCard } from "@/components/admin-payment-card";
import { ClientInfoEditor } from "@/components/client-info-editor";
import { BillingInfoEditor } from "@/components/billing-info-editor-staff";
import { SelectionHistory } from "@/components/selection-history";
import { UnlockSelectionCard } from "@/components/unlock-selection-card";
import { InvitePortalCard } from "@/components/invite-portal-card";
import { DocumentsManager } from "@/components/documents-manager";
import { MilestonesManager } from "@/components/milestones-manager";

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

type TabId =
  | "overview"
  | "services"
  | "proposal"
  | "payment"
  | "progress"
  | "billing";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "services", label: "Services" },
  { id: "proposal", label: "Proposal" },
  { id: "payment", label: "Payment" },
  { id: "progress", label: "Progress" },
  { id: "billing", label: "Billing & Portal" },
];

// Tính trạng thái từng bước trong workflow — "done" (✓ xong),
// "current" (đang ở bước này), "upcoming" (chưa tới) — dựa theo
// proposal_status thật của quote, giúp sale nhìn 1 phát biết đang ở
// đâu trong quy trình, không cần đoán.
function getStepStatus(
  tabId: TabId,
  quote: Quote,
): "done" | "current" | "upcoming" {
  const status = quote.proposal_status;
  const hasServices = Number(quote.amount) > 0;
  const isSentOrLater = status !== "draft";
  const isAcceptedOrLater =
    status === "accepted" || status === "deposit_paid" || status === "paid";
  const isPaid = status === "paid";

  switch (tabId) {
    case "overview":
      return "done"; // Luôn coi là xong — thông tin cơ bản có sẵn từ đầu
    case "services":
      if (hasServices && isSentOrLater) return "done";
      return hasServices ? "current" : "upcoming";
    case "proposal":
      if (isAcceptedOrLater) return "done";
      if (isSentOrLater) return "current";
      return "upcoming";
    case "payment":
      if (isPaid) return "done";
      if (isAcceptedOrLater) return "current";
      return "upcoming";
    case "progress":
      if (isPaid) return "done";
      if (status === "deposit_paid") return "current";
      return "upcoming";
    case "billing":
      if (isPaid) return "current";
      return "upcoming";
    default:
      return "upcoming";
  }
}

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab hiện tại lấy từ URL (?tab=payment) — cho phép link trực tiếp
  // từ Notification nhảy thẳng đúng tab, không cần bấm dò thủ công.
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  const activeTab: TabId =
    tabFromUrl && TABS.some((t) => t.id === tabFromUrl)
      ? tabFromUrl
      : "overview";

  function setActiveTab(tab: TabId) {
    router.push(`/crm/quotes/${params.id}?tab=${tab}`, { scroll: false });
  }

  async function loadQuote() {
    const data = await getQuote(params.id as string);
    setQuote(data);
    setLoading(false);
  }

  useEffect(() => {
    loadQuote();
    // Tải lại MỖI KHI URL đổi (kể cả chỉ đổi ?tab=, không đổi ID) —
    // tránh hiện dữ liệu cũ khi bấm thông báo dẫn tới đúng quote
    // đang mở sẵn (VD: quote vừa được khách thanh toán, nhưng trang
    // đang mở lại đang giữ dữ liệu cũ trong bộ nhớ, chưa tự cập nhật).
  }, [params.id, searchParams.get("tab")]);

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

  const currencySymbol = quote.customer_market === "vietnam" ? "₫" : "$";

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

        {/* Progress workflow — nhìn 1 phát biết đang ở bước nào,
            bước nào đã xong (✓), bước nào chưa tới. */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center">
            {TABS.map((tab, index) => {
              const stepStatus = getStepStatus(tab.id, quote);
              const isLast = index === TABS.length - 1;

              return (
                <div key={tab.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="flex cursor-pointer flex-col items-center gap-1.5"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition ${
                        stepStatus === "done"
                          ? "bg-emerald-600 text-white"
                          : stepStatus === "current"
                            ? "border-2 border-emerald-600 bg-white text-emerald-600"
                            : "border-2 border-slate-200 bg-white text-slate-400"
                      } ${activeTab === tab.id ? "ring-2 ring-emerald-200 ring-offset-2" : ""}`}
                    >
                      {stepStatus === "done" ? "✓" : index + 1}
                    </div>
                    <span
                      className={`whitespace-nowrap text-xs font-medium ${
                        stepStatus === "upcoming"
                          ? "text-slate-400"
                          : "text-slate-700"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </button>

                  {!isLast && (
                    <div
                      className={`mx-2 h-0.5 flex-1 ${
                        stepStatus === "done"
                          ? "bg-emerald-600"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Thanh Tab — mỗi tab có ID riêng trên URL (?tab=...), cho
            phép Notification link thẳng tới đúng tab cần xem. */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 cursor-pointer border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============ TAB: OVERVIEW ============ */}
        {activeTab === "overview" && (
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
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Quote Overview
                </h2>
                {(quote.contact_email || quote.billing_email) && (
                  <Link
                    href={`/crm/clients/${encodeURIComponent(
                      quote.billing_email || quote.contact_email || "",
                    )}`}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    View Client History →
                  </Link>
                )}
              </div>
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
                    {currencySymbol}
                    {Number(quote.amount ?? 0).toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Payment Terms</dt>
                  <dd className="font-medium text-slate-900 dark:text-white">
                    {quote.payment_type === "deposit"
                      ? "50% Deposit + 50%"
                      : "Full (100%)"}
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

            <div className="lg:col-span-2">
              <CustomerMarketSelector
                quoteId={quote.id}
                currentMarket={quote.customer_market}
                proposalStatus={quote.proposal_status}
                onUpdated={loadQuote}
              />
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Notes
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {quote.notes || "No notes"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============ TAB: SERVICES ============ */}
        {activeTab === "services" && (
          <QuoteItemsEditor
            quoteId={quote.id}
            customerMarket={quote.customer_market}
            proposalStatus={quote.proposal_status}
          />
        )}

        {/* ============ TAB: PROPOSAL ============ */}
        {activeTab === "proposal" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Create Proposal
              </h2>
              <p className="mb-4 text-sm text-slate-500">
                Choose how you want to build this proposal for the client.
              </p>

              <div className="space-y-4">
                <ProposalPdfUpload
                  quoteId={quote.id}
                  currentPdfUrl={quote.proposal_pdf_url}
                  proposalStatus={quote.proposal_status}
                  onUploaded={loadQuote}
                />

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
                      <Link
                        href={`/crm/quotes/${quote.id}/template`}
                        target="_blank"
                      >
                        Create with Template →
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <ProposalQrCard
              quoteId={quote.id}
              publicToken={quote.public_token}
              proposalStatus={quote.proposal_status}
              onSent={loadQuote}
            />

            <SelectionHistory
              quoteId={quote.id}
              currencySymbol={currencySymbol}
            />
          </div>
        )}

        {/* ============ TAB: PAYMENT ============ */}
        {activeTab === "payment" && (
          <div className="space-y-6">
            <AdminPaymentCard
              quoteId={quote.id}
              proposalStatus={quote.proposal_status}
              paymentType={quote.payment_type}
              finalPaymentUnlocked={quote.final_payment_unlocked}
              onChanged={loadQuote}
            />

            <UnlockSelectionCard
              quoteId={quote.id}
              proposalStatus={quote.proposal_status}
              selectionUnlocked={quote.selection_unlocked}
              onChanged={loadQuote}
            />
          </div>
        )}

        {/* ============ TAB: PROGRESS ============ */}
        {activeTab === "progress" && <MilestonesManager quoteId={quote.id} />}

        {/* ============ TAB: BILLING & PORTAL ============ */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <BillingInfoEditor
              quoteId={quote.id}
              proposalStatus={quote.proposal_status}
              existing={{
                billing_company_name: quote.billing_company_name,
                billing_address: quote.billing_address,
                billing_tax_code: quote.billing_tax_code,
                billing_email: quote.billing_email,
                billing_contact_person: quote.billing_contact_person,
                billing_cc_email: quote.billing_cc_email,
              }}
              updatedByClient={quote.billing_updated_by === "client"}
              billingUpdatedAt={quote.billing_updated_at}
              onSaved={loadQuote}
            />

            <InvitePortalCard
              proposalStatus={quote.proposal_status}
              clientEmail={quote.billing_email || quote.contact_email}
            />

            <DocumentsManager quoteId={quote.id} />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
