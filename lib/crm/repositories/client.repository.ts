import { supabase } from "@/lib/supabase";

export async function getClientById(id: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data;
}

export async function updateClientById(
  id: string,
  values: Record<string, unknown>,
) {
  const { data, error } = await supabase
    .from("clients")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function createClient(values: Record<string, unknown>) {
  const { data, error } = await supabase
    .from("clients")
    .insert(values)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) throw error;
}
