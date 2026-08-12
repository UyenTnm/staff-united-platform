"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { VietQRPayment } from "@/components/vietqr-payment";
import { WireTransferUSD } from "@/components/wire-transfer-usd";
import { ResendProposalLink } from "@/components/resend-proposal-link";

import {
  Quote,
  getQuoteByToken,
  markQuoteAsViewed,
  acceptQuoteByToken,
} from "@/lib/crm/quotes";
import { QuoteItem, getQuoteItems, getItemTotal } from "@/lib/crm/quote-items";
import { toast } from "sonner";

export default function PublicProposalPage() {
  const params = useParams();
  const token = params.token as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [accepting, setAccepting] = useState(false);
  const [name, setName] = useState("");

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
      setSelectedIds(
        new Set(quoteItems.filter((i) => i.is_optional).map((i) => i.id)),
      );

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

  const mandatoryItems = items.filter((i) => !i.is_optional);
  const optionalItems = items.filter((i) => i.is_optional);

  const mandatoryTotal = mandatoryItems.reduce(
    (sum, i) => sum + getItemTotal(i),
    0,
  );
  const selectedOptionalTotal = optionalItems
    .filter((i) => selectedIds.has(i.id))
    .reduce((sum, i) => sum + getItemTotal(i), 0);

  const finalAmount =
    items.length > 0
      ? mandatoryTotal + selectedOptionalTotal
      : quote?.amount || 0;

  // Quyết định thị trường: "vietnam" → VietQR (VND). Mọi giá trị khác
  // ("international" hoặc null/chưa set) → Wire Transfer USD, vì hiện
  // tại dữ liệu cũ đa số đang null, an toàn hơn khi mặc định về USD.
  const isVietnamMarket = quote?.customer_market === "vietnam";

  async function handleAccept() {
    if (!name.trim()) {
      toast.warning("Please enter your name to confirm.");
      return;
    }

    setAccepting(true);
    try {
      const selectedTitles = optionalItems
        .filter((i) => selectedIds.has(i.id))
        .map((i) => i.service_name)
        .join(", ");

      await acceptQuoteByToken(
        token,
        name.trim(),
        selectedTitles ? `Selected: ${selectedTitles}` : undefined,
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
    quote.proposal_status === "accepted" || quote.proposal_status === "paid";
  const isPaid = quote.proposal_status === "paid";
  const currencySymbol = isVietnamMarket ? "₫" : "$";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
            STAFF United
          </p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">
            {quote.title}
          </h1>
          <p className="mt-1 text-slate-500">
            Prepared for {quote.contact_name} — {quote.company_name}
          </p>
        </div>

        {items.length > 0 ? (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-6">
            {mandatoryItems.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold text-slate-900">
                  Included in this proposal
                </h2>
                <div className="space-y-2">
                  {mandatoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between rounded-lg border border-slate-200 p-4"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {item.service_name}
                        </p>
                        {item.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-slate-700">
                        {currencySymbol}
                        {getItemTotal(item).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {optionalItems.length > 0 && (
              <div>
                <h2 className="mb-3 font-semibold text-slate-900">
                  Select additional services
                </h2>
                <div className="space-y-3">
                  {optionalItems.map((item) => (
                    <label
                      key={item.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                        selectedIds.has(item.id)
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-slate-200"
                      } ${isAccepted ? "pointer-events-none opacity-70" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(item.id)}
                        onChange={() => toggleItem(item.id)}
                        disabled={isAccepted}
                        className="mt-1 h-4 w-4 rounded accent-emerald-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900">
                            {item.service_name}
                          </p>
                          <p className="font-semibold text-emerald-700">
                            {currencySymbol}
                            {getItemTotal(item).toLocaleString()}
                          </p>
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <span className="font-medium text-slate-700">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {currencySymbol}
                {finalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-3">
            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">Quote Number</span>
              <span className="font-medium">{quote.quote_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount</span>
              <span className="text-2xl font-bold">
                {currencySymbol}
                {quote.amount.toLocaleString()}
              </span>
            </div>
            {quote.notes && (
              <p className="whitespace-pre-wrap pt-2 text-sm text-slate-600">
                {quote.notes}
              </p>
            )}
          </div>
        )}

        {isAccepted && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="font-medium text-emerald-800">
              {isPaid
                ? "✓ Payment received — thank you!"
                : `✓ Accepted by ${quote.accepted_by_name}`}
            </p>
          </div>
        )}

        {!isAccepted && (
          <div className="rounded-xl bg-white p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-slate-900">
              Accept this proposal
            </h2>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-slate-200 p-3"
            />

            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full"
            >
              {accepting
                ? "Processing..."
                : `Accept & Pay ${currencySymbol}${finalAmount.toLocaleString()}`}
            </Button>
          </div>
        )}

        {/* Payment — chọn đúng phương thức theo thị trường khách hàng */}
        {isAccepted && !isPaid && (
          <>
            {isVietnamMarket ? (
              <VietQRPayment
                amount={finalAmount}
                addInfo={`${quote.quote_number} ${quote.company_name}`}
              />
            ) : (
              <WireTransferUSD
                amount={finalAmount}
                addInfo={`${quote.quote_number} ${quote.company_name}`}
              />
            )}
          </>
        )}

        <div className="pt-2 text-center">
          <ResendProposalLink token={token} />
        </div>
      </div>
    </div>
  );
}
