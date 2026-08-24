"use client";

import ProposalRenderer from "@/components/proposal-v2/ProposalRenderer";

export default function ProposalV2Preview() {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <ProposalRenderer
        currentStep={2}
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
        scope={{
          projectTitle: "Strategic Growth Proposal",
          services: [],
          packageName: "Strategic Partnership Package",
          totalPrice: "40,500,000",
          originalPrice: "45,000,000",
          discount: "10",
          finalPrice: "40,500,000",
          currency: "VND",
          clientLogo: "",
          scopeImage: "",
          scopeImagePositionX: 0,
          scopeImagePositionY: 0,
          scopeImageScale: 1,
          paymentTerms: [],
        }}
        pricing={{
          packageTitle: "Business Process Optimisation",

          strategicObjective:
            "Optimise internal workflows and improve operational efficiency through automation.\nReduce manual tasks, increase visibility across departments, and create a scalable business process for long-term growth.",

          deliverables: [
            "Workflow audit & process mapping",
            "Automation opportunity analysis",
            "SOP optimisation",
            "Task management structure",
            "Internal reporting dashboard",
            "Team implementation support",
          ],

          timeline: "4–8 Weeks",
          price: "18,000,000",
          currency: "VND",
          clientLogo: "",
        }}
        partnership={{
          packageName: "STRATEGIC PARTNERSHIP PACKAGE",

          individualPackages: [
            {
              title: "Business Process Optimisation",
              price: "8,000,000",
            },
            {
              title: "Marketing Execution Support",
              price: "12,000,000",
            },
            {
              title: "Customer Success Improvement",
              price: "10,000,000",
            },
            {
              title: "Website & CRM Enhancement",
              price: "15,000,000",
            },
          ],

          totalPrice: "45,000,000",

          finalPrice: "40,500,000",

          savePrice: "4,500,000",

          discount: "10",

          currency: "VND",

          paymentTerms: [
            "50% deposit required to initiate the project.",
            "50% final payment due upon completion.",
            "Additional work outside agreed scope quoted separately.",
          ],

          clientLogo: null,
        }}
        nextSteps={{
          preparedBy: "STAFF United",

          email: "website@staffunitedgroup.com",

          nextSteps: [
            "Review and confirm the proposed scope.",
            "Approve the final package and timeline.",
            "Sign the Service Agreement.",
            "Project kickoff and onboarding session.",
          ],

          closingMessage:
            "We look forward to supporting your business in strengthening its brand visibility, professional market presence, and business development across physical and digital channels.",

          clientLogo: null,
        }}
      />
    </div>
  );
}
