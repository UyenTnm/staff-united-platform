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
    console.error(error);
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
      return "Won";

    case "Rejected":
      return "Lost";

    case "Expired":
      return "Expired";

    default:
      return "New";
  }
}
