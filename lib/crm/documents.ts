// lib/crm/documents.ts

import { supabase } from "../supabase";

export type DocumentCategory = "contract" | "deliverable" | "invoice" | "other";

export interface QuoteDocument {
  id: string;
  quote_id: string;
  file_name: string;
  file_url: string;
  category: DocumentCategory;
  uploaded_at: string;
}

export async function getDocuments(quoteId: string): Promise<QuoteDocument[]> {
  const { data, error } = await supabase
    .from("quote_documents")
    .select("*")
    .eq("quote_id", quoteId)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data as QuoteDocument[];
}

export async function uploadDocument(
  quoteId: string,
  file: File,
  category: DocumentCategory,
) {
  const filePath = `${quoteId}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from("quote-documents")
    .upload(filePath, file);

  if (uploadError) {
    console.error(uploadError);
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("quote-documents").getPublicUrl(filePath);

  const { error: insertError } = await supabase.from("quote_documents").insert({
    quote_id: quoteId,
    file_name: file.name,
    file_url: publicUrl,
    category,
  });

  if (insertError) {
    console.error(insertError);
    throw insertError;
  }
}

export async function deleteDocument(id: string) {
  const { error } = await supabase
    .from("quote_documents")
    .delete()
    .eq("id", id);
  if (error) {
    console.error(error);
    throw error;
  }
}

// Portal — lấy TẤT CẢ document của khách, gộp theo mọi Quote của họ
export async function getClientDocuments(email: string) {
  const { data, error } = await supabase
    .from("quote_documents")
    .select(
      "id, file_name, file_url, category, uploaded_at, quote_id, quotes!inner(quote_number, title, contact_email, billing_email)",
    )
    .or(`contact_email.eq.${email},billing_email.eq.${email}`, {
      foreignTable: "quotes",
    })
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}
