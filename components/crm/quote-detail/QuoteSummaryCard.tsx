import { Quote } from "@/lib/crm/quotes";

interface Props {
  quote: Quote;
}

export default function QuoteSummaryCard({ quote }: Props) {
  return (
    <div className="border rounded-xl p-6">
      <h2 className="font-semibold mb-4">Summary</h2>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Quote Amount</span>

          <strong>${quote.amount.toLocaleString()} AUD</strong>
        </div>

        <div className="flex justify-between">
          <span>Status</span>

          <strong>{quote.status}</strong>
        </div>

        <div className="flex justify-between">
          <span>Version</span>

          <strong>{quote.version ?? 1}</strong>
        </div>
      </div>
    </div>
  );
}
