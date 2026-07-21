import { Quote } from "@/lib/crm/quotes";

interface Props {
  quote: Quote;
}

export default function QuoteNotes({ quote }: Props) {
  return (
    <div className="border rounded-xl p-6">
      <h2 className="font-semibold mb-4">Notes</h2>

      <p className="text-slate-600 dark:text-slate-400">
        {quote.notes || "No notes"}
      </p>
    </div>
  );
}
