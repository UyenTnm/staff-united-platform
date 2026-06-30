import { getCurrentEmployee } from "./auth-service";

export async function requireManager() {
  const employee = await getCurrentEmployee();

  if (!employee) {
    throw new Error("Authentication required.");
  }

  if (!["Admin", "HR", "Manager"].includes(employee.user_role)) {
    throw new Error("Access denied.");
  }

  return employee;
}
