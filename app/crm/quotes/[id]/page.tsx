"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";

import { Quote, getQuote } from "@/lib/quotes";

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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{quote.quote_number}</h1>

              <p className="text-slate-500 mt-2">{quote.company_name}</p>
            </div>

            <Button asChild variant="outline">
              <Link href={`/crm/quotes/${quote.id}/edit`}>Edit Quote</Link>
            </Button>
          </div>

          <div className="space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Client Information */}

              <div className="border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Client Information</h2>

                <div className="space-y-3">
                  <p>
                    <strong>Company:</strong> {quote.company_name}
                  </p>

                  <p>
                    <strong>Contact:</strong> {quote.contact_name}
                  </p>

                  <p>
                    <strong>Department:</strong> {quote.department}
                  </p>
                </div>
              </div>

              {/* Quote Overview */}

              <div className="border rounded-xl p-6">
                <h2 className="font-semibold mb-4">Quote Overview</h2>

                <div className="space-y-3">
                  <p>
                    <strong>Quote #:</strong> {quote.quote_number}
                  </p>

                  <p>
                    <strong>Title:</strong> {quote.title}
                  </p>

                  <p>
                    <strong>Amount:</strong> ${quote.amount.toLocaleString()}{" "}
                    AUD
                  </p>

                  <p>
                    <strong>Status:</strong> {quote.status}
                  </p>

                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(quote.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="border rounded-xl p-6 mt-10">
              <h2 className="font-semibold mb-4">Notes</h2>

              <p className="text-slate-600 dark:text-slate-400">
                {quote.notes || "No notes"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
