import { supabase } from "@/lib/supabase";

export interface Employee {
  id: string;
  employee_number: string;
  full_name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  created_at: string;
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
