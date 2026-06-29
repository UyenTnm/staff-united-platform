import { getCurrentEmployee } from "./auth-service";

export async function loadCurrentEmployee() {
  try {
    return await getCurrentEmployee();
  } catch {
    return null;
  }
}
