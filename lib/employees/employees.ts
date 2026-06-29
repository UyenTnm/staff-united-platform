import { supabase } from "@/lib/supabase";
import type { UserRole } from "../auth";

export interface Employee {
  id: string;
  auth_user_id: string | null;
  employee_number: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  user_role: UserRole;
  manager_id: string | null;
  status: string;
  account_status: string;
  created_at: string;
  last_login: string | null;
}

export interface CreateEmployeeInput {
  employee_number: string;
  auth_user_id?: string | null;
  full_name: string;
  email: string;
  department: string;
  role: string;
  user_role: UserRole;
  manager_id: string | null;
  status: string;
  account_status: string;
  last_login?: string | null;
}

export async function getEmployees() {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Employee[];
}

export async function getEmployee(id: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", id)
    .single();

  console.log("Employee from Supabase:", data);
  console.log("Supabase Error:", error);

  if (error) {
    console.error(error);
    return null;
  }

  return data as Employee;
}

// export async function createEmployee(
//   employee: Omit<Employee, "id" | "created_at">,
// ) {
//   const { data, error } = await supabase
//     .from("employees")
//     .insert(employee)
//     .select()
//     .single();

//   if (error) throw error;

//   return data as Employee;
// }

export async function createEmployee(employee: CreateEmployeeInput) {
  const { data, error } = await supabase
    .from("employees")
    .insert(employee)
    .select()
    .single();

  if (error) throw error;

  return data as Employee;
}

export async function updateEmployee(id: string, values: Partial<Employee>) {
  const { error } = await supabase
    .from("employees")
    .update(values)
    .eq("id", id);

  if (error) throw error;
}

export async function updateEmployeeStatus(id: string, status: string) {
  return updateEmployee(id, {
    status,
  });
}

export async function getManagers() {
  const { data, error } = await supabase
    .from("employees")
    .select("id, full_name")
    .order("full_name");

  if (error) throw error;

  return data;
}

export async function generateEmployeeNumber() {
  const { count, error } = await supabase.from("employees").select("*", {
    count: "exact",
    head: true,
  });

  if (error) throw error;

  const next = (count ?? 0) + 1;

  return `EMP-${String(next).padStart(3, "0")}`;
}

export async function getEmployeeByAuthUserId(authUserId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", authUserId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as Employee;
}
