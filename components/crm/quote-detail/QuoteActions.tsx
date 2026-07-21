import Link from "next/link";
import { Button } from "@/components/ui/button";

interface QuoteActionsProps {
  quoteId: string;
}

export default function QuoteActions({ quoteId }: QuoteActionsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="outline">
        <Link href={`/crm/quotes/${quoteId}/edit`}>Edit</Link>
      </Button>

      <Button>Send Quote</Button>

      <Button variant="secondary">Duplicate</Button>

      <Button variant="destructive">Archive</Button>
    </div>
  );
}
