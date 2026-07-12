import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "system"
  | "employee"
  | "review"
  | "kaizen"
  | "quality"
  | "behavior";

export interface Notification {
  id: string;
  employee_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export async function createNotification(
  employeeId: string,
  title: string,
  message: string,
  type: NotificationType = "system",
  actionUrl?: string,
) {
  const { data, error } = await supabase
    .from("notifications")
    .insert({
      employee_id: employeeId,
      title,
      message,
      type,
      action_url: actionUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Notification Error:", error);
    throw error;
  }

  return data;
}

export async function getNotifications(employeeId: string) {
  // console.log("Loading notifications for:", employeeId);

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Notification Error:", error);
    throw error;
  }

  return data as Notification[];
}

export async function getUnreadCount(employeeId: string) {
  // console.log("Loading unread count for:", employeeId);

  const { count, error } = await supabase
    .from("notifications")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("employee_id", employeeId)
    .eq("is_read", false);

  if (error) {
    console.error("Notification Error:", error);
    throw error;
  }

  return count ?? 0;
}

export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("id", notificationId);

  if (error) {
    console.error("Notification Error:", error);
    throw error;
  }
}

export async function markAllAsRead(employeeId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({
      is_read: true,
    })
    .eq("employee_id", employeeId)
    .eq("is_read", false);

  if (error) {
    console.error("Notification Error:", error);
    throw error;
  }
}

export function getKaizenActionUrl(
  employeeId: string,
  kaizenId: string,
  from?: string,
) {
  return `/employees/${employeeId}/kaizen/${kaizenId}/edit${
    from ? `?from=${from}` : ""
  }`;
}

export function getPerformanceActionUrl(employeeId: string) {
  return `/employees/${employeeId}/performance`;
}

export function getMyKaizenActionUrl(employeeId: string) {
  return `/employees/${employeeId}/kaizen`;
}
