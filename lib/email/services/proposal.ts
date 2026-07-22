import { resend } from "../resend";
import { proposalEmailTemplate } from "../templates/proposal-email";

interface SendProposalEmailInput {
  email: string;
  contactName: string;
  companyName: string;
  proposalUrl: string;
}

export async function sendProposalEmail({
  email,
  contactName,
  companyName,
  proposalUrl,
}: SendProposalEmailInput) {
  return resend.emails.send({
    from: "STAFF United <no-reply@staffunitedgroup.com>",

    to: email,

    subject: `Your Proposal for ${companyName}`,

    html: proposalEmailTemplate({
      contactName,
      companyName,
      proposalUrl,
    }),
  });
}
