"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecentQuotes } from "@/lib/crm/quotes";
import { Badge } from "@/components/ui/badge";

interface Quote {
  id: string;
  quote_number: string;
  company_name: string;
  title: string;
  amount: number;
  status: string;
}

function getStatusColor(status: string) {
  switch (status) {
    case "Draft":
      return "bg-gray-100 text-gray-700";

    case "Sent":
      return "bg-blue-100 text-blue-700";

    case "Viewed":
      return "bg-orange-100 text-orange-700";

    case "Accepted":
      return "bg-green-100 text-green-700";

    case "Rejected":
      return "bg-red-100 text-red-700";

    default:
      return "";
  }
}

export default function RecentQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    async function load() {
      setQuotes(await getRecentQuotes());
    }

    load();
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Quotes</h2>

        <Link
          href="/crm/quotes"
          className="text-sm font-medium text-emerald-600 hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="mt-5 space-y-4">
        {quotes.map((quote) => (
          <Link
            key={quote.id}
            href={`/crm/quotes/${quote.id}`}
            className="block rounded-xl border p-4 hover:border-emerald-500 hover:bg-emerald-50"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{quote.company_name}</p>

                <p className="text-sm text-slate-500">{quote.title}</p>
              </div>

              <Badge className={getStatusColor(quote.status)}>
                {quote.status}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{quote.quote_number}</span>

              <span>${quote.amount.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
