"use client";

import { Quote } from "@/lib/crm/quotes";
import { QuoteItem } from "@/lib/crm/quote-items";

interface CoverPageProps {
  quote: Quote;
  items: QuoteItem[];
}

export function CoverPage({ quote, items }: CoverPageProps) {
  const clientName = quote.company_name || "Client Name";

  const projectTitle = quote.title || "Strategic Partnership Proposal";
  const contactName = quote.contact_name || "";

  return (
    <div className="aspect-[1/1.414] w-full bg-[#082A54] text-white relative overflow-hidden">
      {/* Background curve */}
      <div className="absolute -right-32 top-28 h-[520px] w-[520px] rounded-full bg-white/95" />
      <div className="absolute -right-24 top-20 h-[520px] w-[520px] rounded-full border border-white/20" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-10">
        {/* Header */}
        <div>
          <p className="text-xs tracking-[0.25em] text-blue-200">
            STAFF UNITED
          </p>

          <div className="mt-16 space-y-4">
            <h1 className="text-4xl font-light leading-tight">
              {projectTitle}
            </h1>

            <div className="h-px w-24 bg-blue-300" />

            <div className="space-y-1 text-sm text-blue-100">
              {items.map((item) => (
                <p key={item.id}>{item.service_name}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-6">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blue-300">
              Prepared For
            </p>

            <h2 className="mt-1 text-2xl">{clientName}</h2>

            <p className="mt-1 text-sm text-blue-200">{contactName}</p>
          </div>

          <div className="flex justify-between text-xs text-blue-200">
            <div>
              <p>Prepared By</p>
              <p className="text-white">STAFF United</p>
            </div>

            <div className="text-right">
              <p>Date</p>
              <p className="text-white">
                {new Date().toLocaleDateString("en-AU")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
