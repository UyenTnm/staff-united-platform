import crypto from "crypto";

import { supabase } from "@/lib/supabase";
import { createAuditLog } from "./audit";
import { createActivity } from "./activity";

export async function generatePublicQuoteLink(
  quoteId: string,
  expiresAt?: string,
) {
  const token = crypto.randomBytes(32).toString("hex");

  // Chỉ cho phép 1 link active
  await supabase
    .from("quote_public_links")
    .update({
      is_active: false,
    })
    .eq("quote_id", quoteId);

  const { data, error } = await supabase
    .from("quote_public_links")
    .insert({
      quote_id: quoteId,
      token,
      expires_at: expiresAt ?? null,
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    token,

    url: `${process.env.NEXT_PUBLIC_APP_URL}/q/${token}`,

    record: data,
  };
}

export async function getPublicQuote(token: string) {
  const { data, error } = await supabase
    .from("quote_public_links")
    .select(
      `
      *,
      quote:quotes(*)
      `,
    )
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error) {
    return null;
  }

  return data;
}

export async function markQuoteViewed(token: string) {
  const { data } = await supabase
    .from("quote_public_links")
    .select("*")
    .eq("token", token)
    .single();

  if (!data) return;

  // Chỉ ghi lần đầu
  if (data.viewed_at) {
    return;
  }

  const now = new Date().toISOString();

  await supabase
    .from("quote_public_links")
    .update({
      viewed_at: now,
    })
    .eq("token", token);

  await supabase
    .from("quotes")
    .update({
      status: "Viewed",
      viewed_at: now,
    })
    .eq("id", data.quote_id);

  // Activity
  await createActivity({
    entityType: "quote",
    entityId: data.quote_id,
    activityType: "viewed",
    title: "Quote Viewed",
    description: "Client opened proposal",
  });

  // Audit
  await createAuditLog({
    entityType: "quote",
    entityId: data.quote_id,
    action: "update",
    changes: [
      {
        field: "status",
        oldValue: "Sent",
        newValue: "Viewed",
      },
    ],
  });
}

export async function validatePublicQuote(token: string) {
  const { data, error } = await supabase
    .from("quote_public_links")
    .select(
      `
      *,
      quote:quotes(*)
      `,
    )
    .eq("token", token)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return {
      valid: false,
      reason: "invalid",
    };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return {
      valid: false,
      reason: "expired",
    };
  }

  return {
    valid: true,
    record: data,
  };
}
