import { supabase } from "../supabase";
import { getReviewMonth } from "./bonus";

export type KaizenImpact =
  | "Small"
  | "Medium"
  | "Major"
  | "Innovation"
  | "Outstanding Innovation";

export type KaizenStatus =
  | "Draft"
  | "Submitted"
  | "Approved"
  | "In Progress"
  | "Waiting Verification"
  | "Verified"
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
  approved_at: string | null;
  verified_by: string | null;
  verified_at: string | null;
  rewarded_by: string | null;
  rewarded_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  implemented_date: string | null;
  review_note: string | null;

  // Free-text progress update the owner posts while the Kaizen is "In
  // Progress" — lets HR/Manager see where execution stands before a
  // verification request comes in, without needing a separate log table.
  progress_notes: string | null;
  progress_updated_at: string | null;

  review_month: string;
  created_at: string;
  updated_at: string;
  reviewer?: KaizenUser | null;
  approver?: KaizenUser | null;
  verifier?: KaizenUser | null;
  rewarder?: KaizenUser | null;
}

export interface KaizenUser {
  id: string;
  full_name: string;
}

export interface CreateKaizenInput {
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
}

export async function getEmployeeKaizens(
  employeeId: string,
  reviewMonth?: string,
) {
  let query = supabase
    .from("employee_kaizens")
    .select("*")
    .eq("employee_id", employeeId);

  if (reviewMonth) {
    query = query.eq("review_month", reviewMonth);
  }

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (error) throw error;

  return data as KaizenRecord[];
}

export async function getKaizen(id: string) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select(
      `
  *,
  reviewer:employees!employee_kaizens_reviewed_by_fkey(
    id,
    full_name
  ),
  approver:employees!employee_kaizens_approved_by_fkey(
    id,
    full_name
  ),
  verifier:employees!employee_kaizens_verified_by_fkey(
    id,
    full_name
  ),
  rewarder:employees!employee_kaizens_rewarded_by_fkey(
    id,
    full_name
  )
`,
    )
    .eq("id", id)
    .single();

  if (error) throw error;

  return data as KaizenRecord;
}

export async function createKaizen(kaizen: CreateKaizenInput) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .insert(kaizen)
    .select()
    .single();

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
      employees!employee_kaizens_employee_id_fkey(
    id,
    full_name,
    department
  )
    `,
    )
    .eq("status", "Submitted")
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
  reviewNote: string,
) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Approved",
      approved_by: managerId,
      approved_at: new Date().toISOString(),
      impact,
      performance_points: points,
      review_note: reviewNote,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select();

  if (error) {
    console.error("Supabase approve error:", JSON.stringify(error, null, 2));
    throw error;
  }

  return data;
}

export async function getKaizensByStatus(status: KaizenStatus) {
  const { data, error } = await supabase
    .from("employee_kaizens")
    .select(
      `
      *,
      employees!employee_kaizens_employee_id_fkey(
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

export async function startExecution(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "In Progress",
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

export async function requestVerification(id: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Waiting Verification",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Lets the owner post a progress update while a Kaizen is "In Progress" —
 * does NOT change status. HR/Manager can then see how far along execution
 * is before a verification request comes in.
 */
export async function updateKaizenProgress(id: string, notes: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      progress_notes: notes,
      progress_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function verifyKaizen(id: string, managerId: string) {
  const { error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Verified",
      verified_by: managerId,
      verified_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw error;
}

export async function rewardKaizen(id: string, managerId: string) {
  // The bonus % is credited to whichever month the kaizen is actually
  // finished and applied (i.e. the month it becomes "Rewarded"), not the
  // month it was originally submitted — a kaizen submitted in January but
  // only completed in March should add to March's score, not January's.
  const rewardedAt = new Date();

  const { data, error } = await supabase
    .from("employee_kaizens")
    .update({
      status: "Rewarded",
      rewarded_by: managerId,
      rewarded_at: rewardedAt.toISOString(),
      review_month: getReviewMonth(rewardedAt),
      updated_at: rewardedAt.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function getEmployeeKaizensForDashboard() {
  const { data, error } = await supabase.from("employee_kaizens").select("*");

  if (error) throw error;

  return data as KaizenRecord[];
}

export async function getKaizenStatistics() {
  const kaizens = await getEmployeeKaizensForDashboard();

  return {
    draft: kaizens.filter((k) => k.status === "Draft").length,

    pending: kaizens.filter((k) => k.status === "Submitted").length,

    approved: kaizens.filter((k) => k.status === "Approved").length,

    rewarded: kaizens.filter((k) => k.status === "Rewarded").length,
  };
}
