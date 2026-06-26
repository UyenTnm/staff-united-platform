// lib/quotes.ts

import { supabase } from "./supabase";

export interface Quote {
  id: string;

  quote_number: string;

  lead_id: string;

  company_name: string;

  contact_name: string;

  department: string;

  title: string;

  amount: number;

  notes: string;

  status: string;

  created_at: string;
}

export async function createQuote(data: {
  lead_id: string;

  company_name: string;
  contact_name: string;
  department: string;

  title: string;
  amount: number;
  notes: string;
}) {
  const { error } = await supabase.from("quotes").insert({
    quote_number: `Q-${Date.now()}`,
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
