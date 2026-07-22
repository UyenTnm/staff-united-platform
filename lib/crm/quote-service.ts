import { createActivity } from "@/lib/crm/activity";
import { createAuditLog } from "@/lib/crm/audit";
import { generatePublicQuoteLink } from "@/lib/crm/public-quote";
import { getQuote, updateQuote } from "@/lib/crm/quotes";
import { sendProposalEmail } from "@/lib/email/services/proposal";

interface SendQuoteInput {
  quoteId: string;
  userId?: string;
}

export async function sendQuote({ quoteId, userId }: SendQuoteInput) {
  const quote = await getQuote(quoteId);

  if (!quote) {
    throw new Error("Quote not found.");
  }

  if (quote.status !== "Draft") {
    throw new Error("Only draft quotes can be sent.");
  }

  if (!quote.contact_email) {
    throw new Error("Quote does not have a contact email.");
  }

  // 1. Generate secure proposal link
  const proposal = await generatePublicQuoteLink(quote.id);

  // 2. Update quote
  await updateQuote(quote.id, {
    status: "Sent",
    sent_at: new Date().toISOString(),
  });

  // 3. Activity
  await createActivity({
    entityType: "quote",
    entityId: quote.id,
    activityType: "sent",
    title: "Proposal Sent",
    description: "Proposal sent to client",
  });

  // 4. Audit
  await createAuditLog({
    entityType: "quote",
    entityId: quote.id,
    action: "update",
    changes: [
      {
        field: "status",
        oldValue: "Draft",
        newValue: "Sent",
      },
    ],
  });

  // 5. Email
  await sendProposalEmail({
    email: quote.contact_email,
    contactName: quote.contact_name,
    companyName: quote.company_name,
    proposalUrl: proposal.url,
  });

  return proposal;
}
