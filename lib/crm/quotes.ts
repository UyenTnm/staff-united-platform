// lib/quotes.ts

import { QuoteStatus } from "@/type/quote";
import { supabase } from "../supabase";

export interface Quote {
  id: string;

  quote_number: string;

  // Tạm thời giữ lead_id để không phá code cũ
  lead_id: string;

  // Sẽ dùng trong CRM V2
  project_id?: string | null;
  version?: number;
  is_current?: boolean;

  company_name: string;
  contact_name: string;

  department: string;

  title: string;

  amount: number;

  notes: string;

  status: QuoteStatus;

  created_at: string;
}

function generateQuoteNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);

  return `SU-Q-${year}-${random}`;
}

export function canCreateNewVersion(status: Quote["status"]) {
  return ["Sent", "Viewed", "Rejected", "Expired"].includes(status);
}

export async function createQuote(data: {
  lead_id: string;

  version: 1;
  is_current: true;

  company_name: string;
  contact_name: string;
  department: string;

  title: string;
  amount: number;
  notes: string;
}) {
  const { error } = await supabase.from("quotes").insert({
    quote_number: generateQuoteNumber(),
    lead_id: data.lead_id,

    company_name: data.company_name,
    contact_name: data.contact_name,
    department: data.department,

    title: data.title,
    amount: data.amount,
    notes: data.notes,

    status: "Draft",
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function getQuotes() {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

export async function getQuote(id: string) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function updateQuote(
  id: string,
  data: {
    title: string;
    amount: number;
    notes: string;
    status: string;
  },
) {
  const { data: updated, error } = await supabase
    .from("quotes")
    .update({
      title: data.title,
      amount: data.amount,
      notes: data.notes,
      status: data.status,
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function getQuoteByLeadId(leadId: string) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export function getQuoteStatusColor(status: Quote["status"]) {
  switch (status) {
    case "Draft":
      return "gray";

    case "Sent":
      return "blue";

    case "Viewed":
      return "orange";

    case "Accepted":
      return "green";

    case "Rejected":
      return "red";

    case "Expired":
      return "zinc";

    default:
      return "gray";
  }
}
