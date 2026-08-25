"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { AppLayout } from "@/components/app-layout";
// import { ProposalWizard } from "@/components/proposal-wizard";

import { Quote, getQuote } from "@/lib/crm/quotes";
import { QuoteItem, getQuoteItems } from "@/lib/crm/quote-items";
import ProposalWizard from "@/components/proposal-v2/wizard/ProposalWizard";

// Trang riêng — "Create Proposal with STAFF United Template".
// Chỉ còn nhiệm vụ load dữ liệu quote/items rồi giao hết cho
// ProposalWizard (cover → list → page-form → review).
export default function QuoteTemplatePage() {
  const params = useParams();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const quoteId = params.id as string;
    const [quoteData, itemsData] = await Promise.all([
      getQuote(quoteId),
      getQuoteItems(quoteId),
    ]);
    setQuote(quoteData);
    setItems(itemsData);
    setLoading(false);
  }

  useEffect(() => {
    loadAll();
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
      <ProposalWizard quote={quote} items={items} />
    </AppLayout>
  );
}
