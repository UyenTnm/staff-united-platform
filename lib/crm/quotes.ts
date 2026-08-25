import { supabase } from "../supabase";
import { syncLeadStatusFromQuote, updateLeadStatus } from "./lead";

export type ProposalStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "deposit_paid"
  | "paid"
  | "rejected";

export type PaymentType = "full" | "deposit";

export type CustomerMarket = "vietnam" | "international";

export interface Quote {
  id: string;
  quote_number: string;
  lead_id: string;
  created_by: string | null;
  company_name: string;
  contact_name: string;
  department: string;
  contact_email: string | null;
  contact_phone: string | null;
  title: string;
  amount: number;
  notes: string;
  status: string;
  created_at: string;

  template_version: "legacy" | "v2";

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
  cover_image_url: string | null;
  font_heading: string | null;
  font_body: string | null;
  uploadCoverImage: string | null;
  updateProposalFonts: string | null;

  customer_market: CustomerMarket | null;
  currency: string | null;
  currency_code: string | null;

  // Thông tin xuất hóa đơn — dùng để kế toán nhập tay vào MISA
  // meInvoice, không cần tích hợp API.
  billing_company_name: string | null;
  billing_address: string | null;
  billing_tax_code: string | null;
  billing_email: string | null;
  billing_cc_email: string | null;
  billing_contact_person: string | null;
  billing_updated_by: string | null;
  billing_updated_at: string | null;

  selection_unlocked: boolean;

  // Thanh toán 50/50 (Deposit + Final) — sale chọn lúc tạo quote
  payment_type: PaymentType;
  deposit_paid_at: string | null;
  final_payment_unlocked: boolean;
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
  contact_email?: string | null;
  contact_phone?: string | null;
  title: string;
  notes: string;
  customer_market: CustomerMarket;

  currency: "VND" | "USD";
  currency_code: "VND" | "USD";

  payment_type?: PaymentType;
  items: NewQuoteItemInput[];

  template_version?: "legacy" | "v2";
}) {
  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  // Ghi lại đúng nhân viên đang đăng nhập tạo quote này — dùng để
  // gửi thông báo đúng người khi khách xác nhận Billing Info sau này.
  // LƯU Ý: employees.id KHÁC auth.users.id — phải tra đúng qua cột
  // auth_user_id, không được lưu thẳng auth.users.id vào created_by.
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let createdByEmployeeId: string | null = null;
  if (currentUser?.id) {
    const { data: employeeRow } = await supabase
      .from("employees")
      .select("id")
      .eq("auth_user_id", currentUser.id)
      .single();
    createdByEmployeeId = employeeRow?.id ?? null;
  }

  const { data: created, error } = await supabase
    .from("quotes")
    .insert({
      quote_number: `Q-${Date.now()}`,
      lead_id: data.lead_id,
      company_name: data.company_name,
      contact_name: data.contact_name,
      department: data.department,
      contact_email: data.contact_email ?? null,
      contact_phone: data.contact_phone ?? null,
      title: data.title,
      notes: data.notes,
      amount: totalAmount,
      customer_market: data.customer_market,
      currency: data.currency,
      currency_code: data.currency_code,
      payment_type: data.payment_type ?? "full",
      created_by: createdByEmployeeId,
      status: "Draft",
      proposal_status: "draft",
      template_version: data.template_version ?? "legacy",
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

// MỚI — sửa thông tin khách hàng gốc (Company/Contact/Department/
// Email/Phone) ngay trên quote — dùng khi sale nhập sai hoặc khách
// cung cấp lại thông tin đúng, trước hoặc sau khi gửi proposal.
export async function updateClientInfo(
  quoteId: string,
  data: {
    company_name: string;
    contact_name: string;
    department?: string;
    contact_email?: string;
    contact_phone?: string;
  },
) {
  const { error } = await supabase
    .from("quotes")
    .update(data)
    .eq("id", quoteId);

  if (error) {
    console.error("updateClientInfo error:", {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    throw error;
  }
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
export async function updateBillingInfo(
  quoteId: string,
  data: {
    billing_company_name?: string;
    billing_address?: string;
    billing_tax_code?: string;
    billing_email?: string;
    billing_cc_email?: string;
    billing_contact_person?: string;
  },
  updatedBy: "staff" | "client" = "staff",
) {
  const { error } = await supabase
    .from("quotes")
    .update({
      ...data,
      billing_updated_by: updatedBy,
      billing_updated_at: new Date().toISOString(),
    })
    .eq("id", quoteId);

  if (error) {
    console.error("updateBillingInfo error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }
}

// Sale bấm "đã xem" để tắt cảnh báo billing do khách tự sửa
export async function markBillingReviewed(quoteId: string) {
  const { error } = await supabase
    .from("quotes")
    .update({ billing_updated_by: "staff" })
    .eq("id", quoteId);

  if (error) {
    console.error(error);
    throw error;
  }
}

// Sale mở khóa tạm thời cho khách sửa lại lựa chọn dịch vụ
export async function unlockSelectionForClient(quoteId: string) {
  const { error } = await supabase
    .from("quotes")
    .update({ selection_unlocked: true })
    .eq("id", quoteId);

  if (error) {
    console.error(error);
    throw error;
  }
}

// Sale tự khóa lại (hoặc hệ thống tự khóa sau khi khách đã sửa xong)
export async function lockSelectionFromClient(quoteId: string) {
  const { error } = await supabase
    .from("quotes")
    .update({ selection_unlocked: false })
    .eq("id", quoteId);

  if (error) {
    console.error(error);
    throw error;
  }
}

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

export async function uploadCoverImage(
  quoteId: string,
  file: File,
): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${quoteId}/cover-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("proposals")
    .upload(filePath, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    console.error("Upload cover image error:", uploadError);
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposals")
    .getPublicUrl(filePath);

  const publicUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("quotes")
    .update({ cover_image_url: publicUrl })
    .eq("id", quoteId);

  if (updateError) {
    console.error("Save cover image url error:", updateError);
    throw updateError;
  }

  return publicUrl;
}

export async function updateProposalFonts(
  quoteId: string,
  data: { font_heading: string; font_body: string },
) {
  const { error } = await supabase
    .from("quotes")
    .update(data)
    .eq("id", quoteId);

  if (error) {
    console.error("updateProposalFonts error:", error);
    throw error;
  }
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
  try {
    const res = await fetch(`/api/proposal/${token}`);
    if (!res.ok) return null;
    const json = await res.json();
    return json.quote as Quote;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function markQuoteAsViewed(token: string) {
  try {
    await fetch("/api/proposal/mark-viewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error(error);
  }

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

  const res = await fetch("/api/proposal/accept", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, acceptedByName, clientNotes, finalAmount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to accept proposal");
  }

  // Chỉ sync lead status, quotes.status đã được cập nhật trong route accept ở trên
  try {
    const newLeadStatus = await syncLeadStatusFromQuote("Accepted");
    await updateLeadStatus(quote.lead_id, newLeadStatus);
  } catch (err) {
    console.error("Failed to sync lead status:", err);
  }

  // await syncStatusesFromProposal(
  //   quote.id,
  //   quote.lead_id,
  //   "accepted",
  //   "Accepted",
  // );
}

// MỚI — khách đổi lại lựa chọn dịch vụ SAU KHI đã Accept lần đầu
// (nhưng CHƯA thanh toán). Khác acceptQuoteByToken (chỉ dùng cho lần
// Accept đầu), hàm này không đổi accepted_at/accepted_by_name, chỉ
// cập nhật amount + client_notes theo lựa chọn mới nhất. Việc ghi log
// (quote_selection_log) do phía gọi hàm tự xử lý riêng.
export async function updateAcceptedSelection(
  quoteId: string,
  selectedTitles: string,
  finalAmount: number,
) {
  const res = await fetch("/api/proposal/update-selection", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quoteId, selectedTitles, finalAmount }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("updateAcceptedSelection error:", err);
    throw new Error("Failed to update selection");
  }
}

// Xác nhận đã nhận tiền — dùng cho CẢ 2 luồng:
// - payment_type = "full": xác nhận toàn bộ 100%, chuyển thẳng Paid.
// - payment_type = "deposit": dùng để xác nhận ĐỢT CUỐI (50% còn lại),
//   sau khi đã confirmDepositReceived() cho đợt đầu.
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

// MỚI — xác nhận đã nhận ĐỢT CỌC (50% đầu), chỉ dùng khi
// payment_type = "deposit". Sau bước này, lead chuyển "In Progress"
// (đang triển khai) — CHƯA tính là Won.
export async function confirmDepositReceived(id: string) {
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
    .update({
      proposal_status: "deposit_paid",
      deposit_paid_at: new Date().toISOString(),
      // Cập nhật luôn cột status (dùng hiển thị badge ở Admin +
      // Portal) — trước đây chỉ sửa proposal_status, để status bị
      // "kẹt" ở giá trị cũ (VD: vẫn hiện "Draft"), gây hiểu lầm.
      status: "Deposit Paid",
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  await syncStatusesFromProposal(
    id,
    quote.lead_id,
    "deposit_paid",
    "In Progress",
  );
}

// MỚI — sale bấm sau khi đã giao việc xong, mở khóa cho khách thấy
// và thanh toán đợt cuối (50% còn lại).
export async function unlockFinalPayment(id: string) {
  const { error } = await supabase
    .from("quotes")
    .update({ final_payment_unlocked: true })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
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

export async function setQuoteTemplateVersion(
  quoteId: string,
  version: "legacy" | "v2",
) {
  const { error } = await supabase
    .from("quotes")
    .update({ template_version: version })
    .eq("id", quoteId);

  if (error) {
    console.error("setQuoteTemplateVersion error:", error);
    throw error;
  }
}
