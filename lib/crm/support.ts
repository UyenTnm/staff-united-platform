// lib/crm/support.ts
//
// Hệ thống Ticket hoàn chỉnh — mỗi cuộc trò chuyện (Session) có 1 mã
// ticket riêng (VD: TK-1786930001), có thể gắn với 1 Quote cụ thể
// (chọn 1 lần lúc bắt đầu chat) hoặc để trống (ticket chung). CẢ
// khách lẫn Sale đều có quyền đóng (End/Close) ticket.

import { supabase } from "../supabase";

export interface SupportSession {
  id: string;
  client_email: string;
  status: "open" | "closed";
  rating: number | null;
  closed_by: string | null;
  created_at: string;
  closed_at: string | null;
  ticket_number: string;
  quote_id: string | null;
  quotes?: { quote_number: string; title: string } | null;
}

export interface SupportMessage {
  id: string;
  client_email: string;
  session_id: string;
  sender_type: "client" | "staff";
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Lấy Session ĐANG MỞ của khách (nếu có)
export async function getOpenSession(
  clientEmail: string,
): Promise<SupportSession | null> {
  const { data, error } = await supabase
    .from("support_sessions")
    .select("*, quotes(quote_number, title)")
    .eq("client_email", clientEmail)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }
  return data as unknown as SupportSession | null;
}

// Tạo Session MỚI HOÀN TOÀN — sinh mã ticket riêng, gắn Quote nếu
// khách chọn (chỉ chọn 1 lần lúc bắt đầu, áp dụng cho cả cuộc chat).
export async function createSession(
  clientEmail: string,
  quoteId?: string | null,
): Promise<SupportSession> {
  const ticketNumber = `TK-${Date.now()}`;

  const { data, error } = await supabase
    .from("support_sessions")
    .insert({
      client_email: clientEmail,
      status: "open",
      ticket_number: ticketNumber,
      quote_id: quoteId || null,
    })
    .select("*, quotes(quote_number, title)")
    .single();

  if (error) {
    console.error(error);
    throw error;
  }
  return data as unknown as SupportSession;
}

export async function getMessagesForSession(
  sessionId: string,
): Promise<SupportMessage[]> {
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }
  return data as SupportMessage[];
}

export async function sendMessage(
  sessionId: string,
  clientEmail: string,
  senderType: "client" | "staff",
  senderName: string,
  message: string,
) {
  const { error } = await supabase.from("support_messages").insert({
    session_id: sessionId,
    client_email: clientEmail,
    sender_type: senderType,
    sender_name: senderName,
    message,
  });

  if (error) {
    console.error(error);
    throw error;
  }
}

// CẢ khách lẫn Sale đều được đóng ticket
export async function closeSession(
  sessionId: string,
  closedBy: "staff" | "client" | "auto" = "staff",
) {
  const { error } = await supabase
    .from("support_sessions")
    .update({
      status: "closed",
      closed_by: closedBy,
      closed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  if (error) {
    console.error(error);
    throw error;
  }
}

export async function submitRating(sessionId: string, rating: number) {
  const { error } = await supabase
    .from("support_sessions")
    .update({ rating })
    .eq("id", sessionId);

  if (error) {
    console.error(error);
    throw error;
  }
}

// Lịch sử TOÀN BỘ ticket (mở + đóng) của 1 khách
export async function getSessionHistory(
  clientEmail: string,
): Promise<SupportSession[]> {
  const { data, error } = await supabase
    .from("support_sessions")
    .select("*, quotes(quote_number, title)")
    .eq("client_email", clientEmail)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data as unknown as SupportSession[];
}

export async function markSessionReadByStaff(sessionId: string) {
  const { error } = await supabase
    .from("support_messages")
    .update({ is_read: true })
    .eq("session_id", sessionId)
    .eq("sender_type", "client")
    .eq("is_read", false);
  if (error) console.error(error);
}

export async function markSessionReadByClient(sessionId: string) {
  const { error } = await supabase
    .from("support_messages")
    .update({ is_read: true })
    .eq("session_id", sessionId)
    .eq("sender_type", "staff")
    .eq("is_read", false);
  if (error) console.error(error);
}

export async function getUnreadCountForClient(
  clientEmail: string,
): Promise<number> {
  const session = await getOpenSession(clientEmail);
  if (!session) return 0;

  const { count, error } = await supabase
    .from("support_messages")
    .select("*", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("sender_type", "staff")
    .eq("is_read", false);

  if (error) {
    console.error(error);
    return 0;
  }
  return count || 0;
}

export async function getOpenThreads() {
  const { data: sessions, error } = await supabase
    .from("support_sessions")
    .select("*, quotes(quote_number, title)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const results = [];
  for (const session of sessions as unknown as SupportSession[]) {
    const { data: lastMsg } = await supabase
      .from("support_messages")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { count: unreadCount } = await supabase
      .from("support_messages")
      .select("*", { count: "exact", head: true })
      .eq("session_id", session.id)
      .eq("sender_type", "client")
      .eq("is_read", false);

    results.push({
      session,
      clientEmail: session.client_email,
      lastMessage: lastMsg,
      unreadCount: unreadCount || 0,
    });
  }

  return results;
}

export async function getTotalUnreadForStaff(): Promise<number> {
  const { count, error } = await supabase
    .from("support_messages")
    .select("*, support_sessions!inner(status)", { count: "exact", head: true })
    .eq("sender_type", "client")
    .eq("is_read", false)
    .eq("support_sessions.status", "open");

  if (error) {
    console.error(error);
    return 0;
  }
  return count || 0;
}
