// lib/crm/clients.ts
//
// Lịch sử khách hàng theo EMAIL — vì hệ thống CRM hiện tại nhận diện
// khách qua contact_email/billing_email trên từng Quote, chưa có 1
// bảng "Client" chính thức riêng.

import { supabase } from "../supabase";
import { Quote } from "./quotes";

export interface ClientHistory {
  email: string;
  companyName: string;
  quotes: Quote[];
  totalQuotes: number;
  totalPaidVND: number;
  totalPaidUSD: number;
}

export async function getClientHistory(
  email: string,
): Promise<ClientHistory | null> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .or(`contact_email.eq.${email},billing_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getClientHistory error:", error);
    return null;
  }

  const quotes = (data as Quote[]) || [];

  if (quotes.length === 0) return null;

  const totalPaidVND = quotes
    .filter((q) => q.status === "Paid" && q.customer_market === "vietnam")
    .reduce((sum, q) => sum + Number(q.amount), 0);

  const totalPaidUSD = quotes
    .filter((q) => q.status === "Paid" && q.customer_market !== "vietnam")
    .reduce((sum, q) => sum + Number(q.amount), 0);

  return {
    email,
    companyName: quotes[0].company_name,
    quotes,
    totalQuotes: quotes.length,
    totalPaidVND,
    totalPaidUSD,
  };
}