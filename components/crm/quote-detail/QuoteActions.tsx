"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { duplicateQuote } from "@/lib/crm/quotes";
import { sendQuote } from "@/lib/crm/quote-service";

interface QuoteActionsProps {
  quoteId: string;
}

export default function QuoteActions({ quoteId }: QuoteActionsProps) {
  const router = useRouter();

  async function handleDuplicate() {
    try {
      const newQuote = await duplicateQuote(quoteId);

      toast.success("New quote version created.");

      router.push(`/crm/quotes/${newQuote.id}`);
    } catch (error) {
      console.error(error);

      toast.error("Unable to duplicate quote.");
    }
  }

  async function handleSendQuote() {
    try {
      await sendQuote({
        quoteId,
      });

      toast.success("Proposal sent successfully.");

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Unable to send proposal.");
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild variant="outline">
        <Link href={`/crm/quotes/${quoteId}/edit`}>Edit</Link>
      </Button>

      <Button onClick={handleSendQuote}>Send Quote</Button>

      <Button variant="secondary" onClick={handleDuplicate}>
        Duplicate
      </Button>

      <Button variant="destructive">Archive</Button>
    </div>
  );
}
