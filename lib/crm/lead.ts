import { supabase } from "@/lib/supabase";

export interface Lead {
  id: string;
  lead_number: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  department: string;
  source: string;
  status: string;
  priority: string;
  created_at: string;
}

export async function getLead(id: string) {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getLead error:", {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return null;
  }

  return data;
}

export async function updateLeadStatus(id: string, status: string) {
  const { error } = await supabase
    .from("leads")
    .update({
      status,
    })
    .eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }
}

// ĐÃ SỬA — tách riêng "đã Accept" (chờ thanh toán) và "đã Paid" (mới
// tính là Won). Trước đây cả 2 đều map thành "Won", khiến lead bị đánh
// dấu thắng deal ngay khi khách accept, dù chưa hề chuyển tiền.
export async function syncLeadStatusFromQuote(quoteStatus: string) {
  switch (quoteStatus) {
    case "Draft":
      return "Preparing Proposal";

    case "Sent":
      return "Proposal Sent";

    case "Viewed":
      return "Client Reviewing";

    case "Negotiating":
      return "Negotiation";

    case "Accepted":
      // Khách đã đồng ý báo giá, nhưng CHƯA chuyển tiền — không tính
      // là Won ở bước này.
      return "Awaiting Payment";

    case "Paid":
      // Chỉ khi thực sự nhận được tiền mới tính là thắng deal.
      return "Won";

    case "Rejected":
      return "Lost";

    case "Expired":
      return "Expired";

    default:
      return "New";
  }
}

export async function createLead(data: {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  department: string;
  source: string;
  priority: string;
}) {
  const { data: created, error } = await supabase
    .from("leads")
    .insert({
      lead_number: `L-${Date.now()}`,

      company_name: data.company_name,
      contact_name: data.contact_name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      source: data.source,
      priority: data.priority,

      status: "New",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return created as Lead;
}
