import { Quote } from "@/lib/crm/quotes";

interface Props {
  quote: Quote;
}

export default function QuoteOverview({ quote }: Props) {
  return (
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
          <strong>Amount:</strong> ${quote.amount.toLocaleString()} AUD
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
  );
}
