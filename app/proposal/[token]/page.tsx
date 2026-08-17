"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { VietQRPayment } from "@/components/vietqr-payment";
import { WireTransferUSD } from "@/components/wire-transfer-usd";
import { ResendProposalLink } from "@/components/resend-proposal-link";
import { BillingInfoForm } from "@/components/billing-info-form";
import { ProposalTemplateFlipbook } from "@/components/proposal-template-flipbook";
import { ProposalFlipbook } from "@/components/proposal-flipbook";
// import { formatCurrency } from "@/lib/format-currency";

import {
  Quote,
  getQuoteByToken,
  markQuoteAsViewed,
  acceptQuoteByToken,
  updateAcceptedSelection,
} from "@/lib/crm/quotes";
import { logSelectionChange } from "@/lib/crm/quote-selection-log";
import { QuoteItem, getQuoteItems, getItemTotal } from "@/lib/crm/quote-items";
import { QuotePage, getQuotePages } from "@/lib/crm/quote-pages";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format-currency";

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [customPages, setCustomPages] = useState<QuotePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [accepting, setAccepting] = useState(false);
  const [updatingSelection, setUpdatingSelection] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getQuoteByToken(token);

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setQuote(data);

      const quoteItems = await getQuoteItems(data.id);
      setItems(quoteItems);

      const pages = await getQuotePages(data.id);
      setCustomPages(pages);
      // Tick sẵn TẤT CẢ dịch vụ mặc định (không chỉ optional) — khách
      // tự bỏ bớt cái không muốn, dễ upsale hơn.
      setSelectedIds(new Set(quoteItems.map((i) => i.id)));

      setLoading(false);
      markQuoteAsViewed(token);
    }

    if (token) load();
  }, [token]);

  function toggleItem(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  // Không phân biệt mandatory/optional với khách — mọi dịch vụ đều
  // là 1 danh sách chọn tự do, tổng tiền = tổng các dịch vụ đã tick.
  const selectedTotal = items
    .filter((i) => selectedIds.has(i.id))
    .reduce((sum, i) => sum + getItemTotal(i), 0);

  const finalAmount = items.length > 0 ? selectedTotal : quote?.amount || 0;

  const isVietnamMarket = quote?.customer_market === "vietnam";
  const currencySymbol = isVietnamMarket ? "₫" : "$";

  // Thanh toán 50/50 — tính đúng số tiền từng đợt. Đợt cuối = tổng -
  // đợt đầu (tránh lỗi làm tròn khi tổng là số lẻ).
  const isDeposit = quote?.payment_type === "deposit";
  const depositAmount = Math.round(finalAmount / 2);
  const finalPaymentAmount = finalAmount - depositAmount;

  async function handleAccept() {
    if (!quote) return;

    setAccepting(true);
    try {
      const selectedTitles = items
        .filter((i) => selectedIds.has(i.id))
        .map((i) => i.service_name)
        .join(", ");

      await acceptQuoteByToken(
        token,
        // Dùng luôn tên khách đã có sẵn trong quote (nhân viên điền
        // lúc tạo lead/quote) — không bắt khách gõ lại tên, tránh
        // trường hợp gõ tên khác gây nhầm lẫn.
        quote.contact_name,
        selectedTitles ? `Selected: ${selectedTitles}` : undefined,
        finalAmount,
      );
      toast.success("Proposal accepted!");

      const updated = await getQuoteByToken(token);
      setQuote(updated);
    } catch (err) {
      console.error(err);
      toast.error(
        "Something went wrong. Please try again or contact us directly.",
      );
    } finally {
      setAccepting(false);
    }
  }

  async function handleUpdateSelection() {
    if (!quote) return;

    setUpdatingSelection(true);
    try {
      const selectedTitles = items
        .filter((i) => selectedIds.has(i.id))
        .map((i) => i.service_name)
        .join(", ");

      await updateAcceptedSelection(quote.id, selectedTitles, finalAmount);

      // Ghi log thay đổi — dùng để admin sau này phân tích hành vi
      await logSelectionChange({
        quote_id: quote.id,
        selected_items: selectedTitles || "(none selected)",
        total_amount: finalAmount,
      });

      toast.success("Your selection has been updated.");

      const updated = await getQuoteByToken(token);
      setQuote(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update selection. Please try again.");
    } finally {
      setUpdatingSelection(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (notFound || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold">Proposal not found</h1>
          <p className="text-slate-500 mt-2">
            This link is invalid or has expired. Please contact us for
            assistance.
          </p>
        </div>
      </div>
    );
  }

  const isAccepted =
    quote.proposal_status === "accepted" ||
    quote.proposal_status === "deposit_paid" ||
    quote.proposal_status === "paid";
  const isDepositPaid = quote.proposal_status === "deposit_paid";
  const isPaid = quote.proposal_status === "paid";
  // Khóa checkbox khi: đã Paid, đã Deposit Paid, HOẶC đã Accepted mà
  // sale CHƯA mở khóa
  const isSelectionLocked =
    isPaid ||
    isDepositPaid ||
    (quote.proposal_status === "accepted" && !quote.selection_unlocked);

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Template Flipbook — trang bìa (logo khách) + trang dịch vụ,
            tự sinh theo template thống nhất, không cần upload PDF. */}
        {quote.proposal_pdf_url ? (
          // Ưu tiên PDF (Canva) nếu đã upload — bản chính đang dùng
          <ProposalFlipbook pdfUrl={quote.proposal_pdf_url} />
        ) : (
          // Dự phòng: chưa có PDF thì tự sinh template (đang phát
          // triển thêm, tạm chưa hoàn thiện layout)
          <ProposalTemplateFlipbook
            companyName={quote.company_name}
            contactName={quote.contact_name}
            proposalTitle={quote.title}
            clientLogoUrl={quote.client_logo_url}
            mandatoryItems={items.filter((i) => !i.is_optional)}
            currencySymbol={currencySymbol}
            customPages={customPages}
          />
        )}

        {/* Services — TẤT CẢ dịch vụ trong 1 danh sách chọn tự do,
            không phân biệt mandatory/optional với khách. Khách tick/bỏ
            tick tùy ý, chỉ trả tiền cho đúng những gì đã chọn. */}
        {items.length > 0 && (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-3">
            <h2 className="mb-1 font-semibold text-slate-900">Services</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <label
                  key={item.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                    selectedIds.has(item.id)
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-slate-200"
                  } ${isSelectionLocked ? "pointer-events-none opacity-70" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    disabled={isSelectionLocked}
                    className="mt-1 h-4 w-4 rounded accent-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900">
                        {item.service_name}
                      </p>
                      <p className="font-semibold text-emerald-700">
                        {formatCurrency(getItemTotal(item), isVietnamMarket)}
                      </p>
                    </div>
                    {item.description && (
                      <details
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <summary className="cursor-pointer text-xs font-medium text-slate-500">
                          View included services
                        </summary>
                        <p className="mt-1 whitespace-pre-line text-sm text-slate-500">
                          {item.description}
                        </p>
                      </details>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {isAccepted && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <p className="text-center font-medium text-emerald-800">
              {isPaid
                ? "✓ Fully Paid — thank you!"
                : isDepositPaid
                  ? "✓ Deposit Received — Project In Progress"
                  : `✓ Accepted by ${quote.accepted_by_name}`}
            </p>

            {/* Bảng chi tiết — luôn hiện rõ tổng tiền + đã trả bao
                nhiêu + còn lại bao nhiêu, kèm danh sách dịch vụ đã
                chọn, để khách không phải đoán. */}

            {items.length > 0 && (isDepositPaid || isPaid) && (
              <div className="mt-4 border-t border-emerald-200 pt-4">
                <p className="mb-2 text-xs font-medium uppercase text-emerald-700">
                  Services Included
                </p>
                <ul className="space-y-1 text-sm text-emerald-900">
                  {items
                    .filter((i) => selectedIds.has(i.id))
                    .map((i) => (
                      <li key={i.id} className="flex justify-between">
                        <span>{i.service_name}</span>
                        <span>
                          {formatCurrency(getItemTotal(i), isVietnamMarket)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {isDeposit && (isDepositPaid || isPaid) && (
              <div className="mt-4 space-y-1 border-t border-emerald-200 pt-4 text-sm">
                <div className="flex justify-between text-emerald-900">
                  <span>Total Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(finalAmount, isVietnamMarket)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Deposit (50%)</span>
                  <span className="font-medium">
                    ✓ Paid — {formatCurrency(depositAmount, isVietnamMarket)}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Final Payment (50%)</span>
                  <span className="font-medium">
                    {isPaid
                      ? `✓ Paid — ${formatCurrency(finalPaymentAmount, isVietnamMarket)}`
                      : `Pending — ${formatCurrency(finalPaymentAmount, isVietnamMarket)}`}
                  </span>
                </div>
              </div>
            )}

            {!isPaid && !isDepositPaid && !quote.selection_unlocked && (
              <p className="mt-2 text-center text-sm text-emerald-700">
                Need to change your selection? Please contact us and we&apos;ll
                re-open it for you.
              </p>
            )}

            {isDepositPaid && !quote.final_payment_unlocked && (
              <p className="mt-4 rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-800">
                We&apos;re working on your project. You&apos;ll be notified here
                once it&apos;s ready for final payment.
              </p>
            )}
          </div>
        )}

        {/* Đã Accept nhưng CHƯA Paid — khách vẫn đổi được lựa chọn,
            bấm nút này để lưu lại thay đổi (khác nút Accept ban đầu). */}
        {isAccepted && !isPaid && quote.selection_unlocked && (
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="mb-3 text-sm text-slate-500">
              Changed your mind? You can still adjust your selection above
              before completing payment.
            </p>
            <Button
              onClick={handleUpdateSelection}
              disabled={updatingSelection}
              variant="outline"
              className="w-full cursor-pointer"
            >
              {updatingSelection
                ? "Saving..."
                : `Update Selection — ${formatCurrency(finalAmount, isVietnamMarket)}`}
            </Button>
          </div>
        )}

        {!isAccepted && (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">
              Accept this proposal
            </h2>

            {/* Bảng tóm tắt điều khoản thanh toán — hiện RÕ trước khi
                khách bấm Accept, tránh hiểu nhầm. */}
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <div className="flex justify-between font-medium text-slate-900">
                <span>Total Amount</span>
                <span>{formatCurrency(finalAmount, isVietnamMarket)}</span>
              </div>
              <div className="mt-2 flex justify-between text-slate-500">
                <span>Payment Terms</span>
                <span className="font-medium text-slate-700">
                  {isDeposit
                    ? "50% Deposit + 50% on Completion"
                    : "Full payment (100%)"}
                </span>
              </div>
              {isDeposit && (
                <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Deposit (50%) — due now</span>
                    <span>
                      {formatCurrency(depositAmount, isVietnamMarket)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Final Payment (50%) — due on completion</span>
                    <span>
                      {formatCurrency(finalPaymentAmount, isVietnamMarket)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full cursor-pointer"
            >
              {accepting
                ? "Processing..."
                : isDeposit
                  ? `Accept & Pay Deposit ${formatCurrency(depositAmount, isVietnamMarket)}`
                  : `Accept & Pay ${formatCurrency(finalAmount, isVietnamMarket)}`}
            </Button>
          </div>
        )}

        {/* QR/Wire — chỉ hiện ĐÚNG lúc cần thanh toán:
            - payment_type=full: sau Accept, chưa Paid
            - payment_type=deposit, đợt 1: sau Accept, chưa deposit_paid
            - payment_type=deposit, đợt 2: đã deposit_paid + đã unlock,
              chưa Paid */}
        {(() => {
          const showFullPayment = !isDeposit && isAccepted && !isPaid;
          const showDepositPayment =
            isDeposit && quote.proposal_status === "accepted" && !isDepositPaid;
          const showFinalPayment =
            isDeposit &&
            isDepositPaid &&
            quote.final_payment_unlocked &&
            !isPaid;

          const amountToShow = showDepositPayment
            ? depositAmount
            : showFinalPayment
              ? finalPaymentAmount
              : finalAmount;

          const paymentLabel = showDepositPayment
            ? `Deposit Payment (50% of ${formatCurrency(finalAmount, isVietnamMarket)})`
            : showFinalPayment
              ? `Final Payment (50% of ${formatCurrency(finalAmount, isVietnamMarket)})`
              : null;

          if (!showFullPayment && !showDepositPayment && !showFinalPayment) {
            return null;
          }

          return (
            <>
              {paymentLabel && (
                <p className="text-center text-sm font-medium text-slate-600">
                  {paymentLabel}
                </p>
              )}
              {isVietnamMarket ? (
                <VietQRPayment
                  amount={amountToShow}
                  addInfo={`${quote.quote_number} ${quote.company_name}`}
                />
              ) : (
                <WireTransferUSD
                  amount={amountToShow}
                  addInfo={`${quote.quote_number} ${quote.company_name}`}
                />
              )}
            </>
          );
        })()}

        {isAccepted && !isPaid && (
          <BillingInfoForm
            quoteId={quote.id}
            quoteNumber={quote.quote_number}
            existing={{
              billing_company_name: quote.billing_company_name,
              billing_address: quote.billing_address,
              billing_tax_code: quote.billing_tax_code,
              billing_email: quote.billing_email,
              billing_contact_person: quote.billing_contact_person,
              billing_cc_email: quote.billing_cc_email,
            }}
          />
        )}

        <div className="pt-2 text-center">
          <ResendProposalLink token={token} />
        </div>
      </div>
    </div>
  );
}
