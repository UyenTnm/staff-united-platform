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
  const res = await fetch("/api/proposal/sync-lead-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId: id, status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("updateLeadStatus error:", err);
    throw new Error("Failed to update lead status");
  }
}

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
      return "Awaiting Payment";

    case "deposit_paid":
      return "In Progress";

    case "Paid":
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
      created_by: createdByEmployeeId,
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
