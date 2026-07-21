import { Quote } from "@/lib/crm/quotes";
import QuoteActions from "./QuoteActions";
import QuoteStatusBadge from "./QuoteStatusBadge";
// import QuoteActions from "./QuoteActions";
// import QuoteStatusBadge from "./QuoteStatusBadge";

interface Props {
  quote: Quote;
}

export default function QuoteHeader({ quote }: Props) {
  return (
    <div className="border rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div>
          <p className="text-sm text-slate-500">{quote.quote_number}</p>

          <h1 className="text-3xl font-bold mt-1">{quote.title}</h1>

          <p className="text-slate-500 mt-2">{quote.company_name}</p>

          <div className="flex flex-wrap gap-3 mt-5">
            <QuoteStatusBadge status={quote.status} />

            <span className="px-3 py-1 rounded-full bg-slate-100 text-sm">
              Version {quote.version ?? 1}
            </span>
          </div>
        </div>

        <QuoteActions quoteId={quote.id} />
      </div>
    </div>
  );
}
