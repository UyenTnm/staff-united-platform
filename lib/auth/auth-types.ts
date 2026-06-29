export type UserRole = "Admin" | "HR" | "Manager" | "Employee";

export interface AuthEmployee {
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

  last_login: string | null;
}
