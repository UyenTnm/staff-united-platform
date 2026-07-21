"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { Quote, getQuote } from "@/lib/crm/quotes";
import ClientInformation from "@/components/crm/quote-detail/ClientInformation";
import QuoteOverview from "@/components/crm/quote-detail/QuoteOverview";
import QuoteNotes from "@/components/crm/quote-detail/QuoteNotes";
import ContractCard from "@/components/crm/quote-detail/ContractCard";
import InvoiceCard from "@/components/crm/quote-detail/InvoiceCard";
import PaymentCard from "@/components/crm/quote-detail/PaymentCard";
import QuoteHeader from "@/components/crm/quote-detail/QuoteHeader";
import QuoteSummaryCard from "@/components/crm/quote-detail/QuoteSummaryCard";

export default function QuoteDetailPage() {
  const params = useParams();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuote() {
      const data = await getQuote(params.id as string);

      setQuote(data);

      setLoading(false);
    }

    loadQuote();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div>Loading Quote...</div>
      </AppLayout>
    );
  }

  if (!quote) {
    return (
      <AppLayout>
        <div>Quote not found.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="outline">
          <Link href="/crm/quotes">← Back to Quotes</Link>
        </Button>

        <div>
          <QuoteHeader quote={quote} />

          <div className="xl:col-span-3 space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ClientInformation quote={quote} />

              <QuoteOverview quote={quote} />
            </div>

            <QuoteNotes quote={quote} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ContractCard />

              <InvoiceCard />

              <PaymentCard />
            </div>
          </div>

          <div className="space-y-6">
            <QuoteSummaryCard quote={quote} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
