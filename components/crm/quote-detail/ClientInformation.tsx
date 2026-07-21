import { Quote } from "@/lib/crm/quotes";

interface Props {
  quote: Quote;
}

export default function ClientInformation({ quote }: Props) {
  return (
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
  );
}
