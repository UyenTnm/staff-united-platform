import { getCurrentSession } from "./auth-service";

export async function getSession() {
  return await getCurrentSession();
}

export async function isAuthenticated() {
  const session = await getCurrentSession();

  return !!session;
}
