// lib/crm/quotes.ts

import { supabase } from "../supabase";
import { syncLeadStatusFromQuote, updateLeadStatus } from "./lead";

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "paid"
  | "rejected";

export type CustomerMarket = "vietnam" | "international";

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

  public_token: string;
  proposal_status: ProposalStatus;
  sent_at: string | null;
  viewed_at: string | null;
  accepted_at: string | null;
  paid_at: string | null;
  accepted_by_name: string | null;
  client_notes: string | null;

  proposal_pdf_url: string | null;
  client_logo_url: string | null;

  customer_market: CustomerMarket | null;
  currency: string | null;
  currency_code: string | null;
}

interface NewQuoteItemInput {
  service_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  is_optional: boolean;
  sort_order: number;
}

export async function createQuote(data: {
  lead_id: string;
  company_name: string;
  contact_name: string;
  department: string;
  title: string;
  notes: string;
  customer_market: CustomerMarket;
  items: NewQuoteItemInput[];
}) {
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  const { data: created, error } = await supabase
    .from("quotes")
    .insert({
      quote_number: `Q-${Date.now()}`,
      lead_id: data.lead_id,
      company_name: data.company_name,
      contact_name: data.contact_name,
      department: data.department,
      title: data.title,
      notes: data.notes,
      amount: totalAmount,
      customer_market: data.customer_market,
      status: "Draft",
      proposal_status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  if (data.items.length > 0) {
    const itemsToInsert = data.items.map((item, index) => ({
      quote_id: created.id,
      service_name: item.service_name,
      description: item.description || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      is_optional: item.is_optional,
      sort_order: item.sort_order ?? index,
    }));

    const { error: itemsError } = await supabase
      .from("quote_items")
      .insert(itemsToInsert);

    if (itemsError) {
      console.error("Failed to insert quote items:", itemsError);
    }
  }

  return created as Quote;
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
  data: { title: string; amount: number; notes: string; status: string },
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

  return updated;
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

export async function updateCustomerMarket(
  quoteId: string,
  market: CustomerMarket,
) {
  const { error } = await supabase
    .from("quotes")
    .update({ customer_market: market })
    .eq("id", quoteId);

  if (error) {
    console.error(error);
    throw error;
  }
}

// ============================================================
// MỚI — upload logo công ty khách, dùng cho trang bìa template
// proposal thống nhất (thay thế việc upload PDF tự thiết kế).
// ============================================================
export async function uploadClientLogo(
  quoteId: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${quoteId}/logo-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("proposals")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Upload logo error:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposals")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ client_logo_url: publicUrl })
    .eq("id", quoteId);

  if (updateError) {
    console.error("Save logo url error:", {
      message: updateError.message,
      code: updateError.code,
      details: updateError.details,
      hint: updateError.hint,
    });
    throw updateError;
  }

  return publicUrl;
}

function statusLabelFromProposalStatus(proposalStatus: string): string {
  switch (proposalStatus) {
    case "draft":
      return "Draft";
    case "sent":
      return "Sent";
    case "viewed":
      return "Viewed";
    case "accepted":
      return "Accepted";
    case "paid":
      return "Paid";
    case "rejected":
      return "Rejected";
    default:
      return "Draft";
  }
}

async function syncStatusesFromProposal(
  quoteId: string,
  leadId: string,
  proposalStatus: string,
  leadSyncKey: string,
) {
  const { error: statusError } = await supabase
    .from("quotes")
    .update({ status: statusLabelFromProposalStatus(proposalStatus) })
    .eq("id", quoteId);

  if (statusError) {
    console.error("Failed to sync quote.status:", statusError);
  }

  try {
    const newLeadStatus = await syncLeadStatusFromQuote(leadSyncKey);
    await updateLeadStatus(leadId, newLeadStatus);
  } catch (err) {
    console.error("Failed to sync lead status:", err);
  }
}

export async function markQuoteAsSent(id: string) {
  const { data: quote, error: fetchError } = await supabase
    .from("quotes")
    .select("lead_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(fetchError);
    throw fetchError;
  }

  const { error } = await supabase
    .from("quotes")
    .update({ proposal_status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  await syncStatusesFromProposal(id, quote.lead_id, "sent", "Sent");
}

export async function getQuoteByToken(token: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Quote;
}

export async function markQuoteAsViewed(token: string) {
  const quote = await getQuoteByToken(token);
  if (!quote) return;

  if (quote.proposal_status === "draft" || quote.proposal_status === "sent") {
    await supabase
      .from("quotes")
      .update({
        proposal_status: "viewed",
        viewed_at: new Date().toISOString(),
      })
      .eq("public_token", token);

    await syncStatusesFromProposal(quote.id, quote.lead_id, "viewed", "Viewed");
  }
}

export async function acceptQuoteByToken(
  token: string,
  acceptedByName: string,
  clientNotes?: string,
  finalAmount?: number,
) {
  const quote = await getQuoteByToken(token);
  if (!quote) {
    throw new Error("Quote not found for token");
  }

  const updatePayload: Record<string, unknown> = {
    proposal_status: "accepted",
    accepted_at: new Date().toISOString(),
    accepted_by_name: acceptedByName,
    client_notes: clientNotes || null,
  };

  // QUAN TRỌNG — ghi đè amount bằng đúng số tiền thật khách đã chọn
  // (mandatory + optional đã tick), KHÔNG giữ số tổng ước tính lúc
  // tạo quote (vốn giả định chọn hết optional). Nếu không có
  // finalAmount truyền vào (proposal cũ, không có items), giữ nguyên
  // amount cũ.
  if (typeof finalAmount === "number") {
    updatePayload.amount = finalAmount;
  }

  const { error } = await supabase
    .from("quotes")
    .update(updatePayload)
    .eq("public_token", token);

  if (error) {
    console.error(error);
    throw error;
  }

  await syncStatusesFromProposal(
    quote.id,
    quote.lead_id,
    "accepted",
    "Accepted",
  );
}

export async function markQuoteAsPaid(id: string) {
  const { data: quote, error: fetchError } = await supabase
    .from("quotes")
    .select("lead_id")
    .eq("id", id)
    .single();

  if (fetchError) {
    console.error(fetchError);
    throw fetchError;
  }

  const { error } = await supabase
    .from("quotes")
    .update({ proposal_status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  await syncStatusesFromProposal(id, quote.lead_id, "paid", "Paid");
}

export function getProposalUrl(publicToken: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${baseUrl}/proposal/${publicToken}`;
}

export async function uploadProposalPdf(
  quoteId: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${quoteId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("proposals")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Upload PDF error:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposals")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ proposal_pdf_url: publicUrl })
    .eq("id", quoteId);

  if (updateError) {
    console.error("Save PDF url error:", updateError);
    throw updateError;
  }

  return publicUrl;
}
