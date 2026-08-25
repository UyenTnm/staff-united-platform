"use client";

import ProposalWizard from "@/components/proposal-v2/wizard/ProposalWizard";
import { Quote } from "@/lib/crm/quotes";
import { QuoteItem } from "@/lib/crm/quote-items";

const mockQuote = {
  id: "test-quote",
  company_name: "PL Cafe",
  contact_name: "Test Contact",
  contact_email: "test@example.com",
  title: "Strategic Growth Proposal",
  amount: 45000000,
  currency: "VND",
  client_logo_url: "",
  cover_image_url: "",
  created_at: "2026-08-22T00:00:00.000Z",
} as Quote;

const mockItems = [
  {
    id: "item-1",
    quote_id: "test-quote",
    service_name: "Business Process Optimisation",
    description: "Workflow improvement & automation",
    quantity: 1,
    unit_price: 8000000,
    currency_code: "VND",
    is_optional: false,
    sort_order: 0,
  },
  {
    id: "item-2",
    quote_id: "test-quote",
    service_name: "Marketing Execution Support",
    description: "Campaign planning & execution",
    quantity: 1,
    unit_price: 12000000,
    currency_code: "VND",
    is_optional: false,
    sort_order: 1,
  },
] as QuoteItem[];

export default function Page() {
  return <ProposalWizard quote={mockQuote} items={mockItems} />;
}
