import { supabase } from "../supabase";

export type KaizenImpact =
  | "Small"
  | "Medium"
  | "Major"
  | "Innovation"
  | "Outstanding Innovation";

export type KaizenStatus =
  | "Draft"
  | "Submitted"
  | "Under Review"
  | "Approved"
  | "Implemented"
  | "Rewarded";

export interface KaizenRecord {
  id: string;

  review_id: string | null;

  employee_id: string;

  title: string;

  description: string | null;

  category: string | null;

  impact: KaizenImpact;

  business_benefit: string | null;

  performance_points: number;

  status: KaizenStatus;

  approved_by: string | null;

  implemented_date: string | null;

  review_note: string | null;

  review_month: string;

  created_at: string;

  updated_at: string;
}

export async function getEmployeeKaizens(employeeId: string) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data as KaizenRecord[];
}

export async function getKaizen(id: string) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as KaizenRecord;
}

export async function createKaizen(
  kaizen: Omit<KaizenRecord, "id" | "created_at" | "updated_at">,
) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .insert(kaizen)
    .select();

  console.log("Insert Data:", data);
  console.log("Insert Error:", error);

  if (error) {
    alert(JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

export async function updateKaizen(id: string, values: Partial<KaizenRecord>) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteKaizen(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export function calculateKaizenScore(kaizens: KaizenRecord[]) {
  const totalPoints = kaizens.reduce(
    (sum, item) => sum + item.performance_points,
    0,
  );

  return {
    totalPoints,
    totalRecords: kaizens.length,
  };
}

export async function getKaizensByReview(reviewId: string) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select("*")
    .eq("review_id", reviewId)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data as KaizenRecord[];
}

export async function getPendingKaizens() {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select(
      `
      *,
      employees(
        id,
        full_name,
        department
      )
    `,
    )
    .in("status", ["Submitted", "Under Review"])
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

export async function approveKaizen(
  id: string,
  managerId: string,
  impact: KaizenImpact,
  points: number,
) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Approved",
      approved_by: managerId,
      impact,
      performance_points: points,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function getKaizensByStatus(status: KaizenStatus) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select(
      `
      *,
      employees(
        id,
        full_name,
        department
      )
    `,
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
}

export async function markKaizenImplemented(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Implemented",
      implemented_date: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function markKaizenRewarded(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Rewarded",
    })
    .eq("id", id);

  if (error) throw error;
}

export async function markKaizenUnderReview(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Under Review",
    })
    .eq("id", id);

  if (error) throw error;
}

export interface KaizenWithEmployee extends KaizenRecord {
  employees: {
    id: string;
    full_name: string;
    department: string;
  };
}
