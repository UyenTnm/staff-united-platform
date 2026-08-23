"use client";

import ProposalRenderer from "@/components/proposal-v2/ProposalRenderer";

export default function ProposalV2Preview() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <ProposalRenderer
        cover={{
          proposalTitle: "Strategic Growth Proposal",

          proposalDetails: [
            "Business Process Optimisation",
            "Marketing Execution Support",
            "Customer Success Improvement",
            "Website & CRM Enhancement",
            "Long-term Growth Partnership",
          ],

          preparedFor: "PL Cafe",
          preparedBy: "STAFF United",
          date: "22 August 2026",

          staffLogo: null,
          clientLogo: null,
          coverImage: null,
        }}
      />
    </div>
  );
}
