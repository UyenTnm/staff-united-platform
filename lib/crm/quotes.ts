// lib/quotes.ts

import { QuoteStatus } from "@/types/quote";
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

  currency_code: string;

  contact_email: string;

  contact_phone: string;

  sent_at?: string | null;

  viewed_at?: string | null;

  accepted_at?: string | null;

  valid_until?: string | null;
}

export type UpdateQuoteInput = Partial<
  Pick<
    Quote,
    | "title"
    | "amount"
    | "notes"
    | "status"
    | "sent_at"
    | "viewed_at"
    | "accepted_at"
    | "valid_until"
    | "contact_email"
    | "contact_phone"
    | "currency_code"
  >
>;

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

  version?: number;
  is_current?: boolean;

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

    version: data.version ?? 1,
    is_current: data.is_current ?? true,
    project_id: null,
    previous_quote_id: null,

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

export async function updateQuote(id: string, data: UpdateQuoteInput) {
  const { error } = await supabase.from("quotes").update(data).eq("id", id);

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

export async function duplicateQuote(quoteId: string) {
  // Lấy quote hiện tại
  const { data: currentQuote, error: fetchError } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", quoteId)
    .single();

  if (fetchError || !currentQuote) {
    throw fetchError ?? new Error("Quote not found");
  }

  // Đánh dấu quote cũ không còn là current
  const { error: updateError } = await supabase
    .from("quotes")
    .update({
      is_current: false,
    })
    .eq("id", quoteId);

  if (updateError) {
    throw updateError;
  }

  // Tạo version mới
  const { data: newQuote, error: insertError } = await supabase
    .from("quotes")
    .insert({
      quote_number: generateQuoteNumber(),

      lead_id: currentQuote.lead_id,

      company_name: currentQuote.company_name,
      contact_name: currentQuote.contact_name,
      department: currentQuote.department,

      title: currentQuote.title,
      amount: currentQuote.amount,
      notes: currentQuote.notes,
      status: "Draft",

      version: (currentQuote.version ?? 1) + 1,
      is_current: true,
      previous_quote_id: currentQuote.id,
      project_id: currentQuote.project_id,
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newQuote;
}

export async function getRecentQuotes(limit = 5) {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getQuoteStats() {
  const { count: draft } = await supabase
    .from("quotes")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("status", "Draft");

  const { count: sent } = await supabase
    .from("quotes")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("status", "Sent");

  return {
    draft: draft ?? 0,
    sent: sent ?? 0,
  };
}

export async function getQuoteCount() {
  const { count } = await supabase.from("quotes").select("*", {
    head: true,
    count: "exact",
  });

  return count ?? 0;
}
