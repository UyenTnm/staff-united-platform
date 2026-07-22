import { supabase } from "@/lib/supabase";
import {
  Activity,
  ActivityType,
  CreateActivityInput,
} from "@/types/crm/activity";
import { Eye } from "lucide-react";

export async function getRecentActivities(limit = 10) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    console.error("Message:", error.message);
    console.error("Details:", error.details);
    console.error("Hint:", error.hint);
    console.error("Code:", error.code);
    return [];
  }

  return data as Activity[];
}

export async function createActivity({
  entityType,
  entityId,
  activityType,
  title,
  description,
  createdBy,
}: CreateActivityInput) {
  const { error } = await supabase.from("activity_logs").insert({
    entity_type: entityType,

    entity_id: entityId,

    activity_type: activityType,

    title,

    description,

    created_by: createdBy ?? null,
  });

  if (error) {
    console.error("Unable to create activity", error);

    throw error;
  }
}

export async function deleteActivity(id: string) {
  const { error } = await supabase.from("activity_logs").delete().eq("id", id);

  if (error) {
    console.error(error);

    throw error;
  }
}

export function getActivityIcon(type: ActivityType) {
  switch (type) {
    case "created":
      return "➕";

    case "updated":
      return "✏️";

    case "deleted":
      return "🗑️";

    case "sent":
      return "📤";

    case "viewed":
      return Eye;

    case "accepted":
      return "✅";

    case "converted":
      return "🤝";

    case "uploaded":
      return "📎";

    case "downloaded":
      return "⬇️";

    case "note":
      return "📝";

    default:
      return "📌";
  }
}

export function getActivityColor(type: ActivityType) {
  switch (type) {
    case "created":
      return "text-emerald-600";

    case "updated":
      return "text-blue-600";

    case "deleted":
      return "text-red-600";

    case "sent":
      return "text-purple-600";

    case "viewed":
      return "text-blue-600";

    case "accepted":
      return "text-green-600";

    case "converted":
      return "text-orange-600";

    case "uploaded":
      return "text-sky-600";

    case "downloaded":
      return "text-gray-600";

    case "note":
      return "text-yellow-600";

    default:
      return "text-slate-600";
  }
}

export function getActivityUrl(activity: Activity): string {
  switch (activity.entity_type) {
    case "lead":
      return `/crm/leads/${activity.entity_id}`;

    case "quote":
      return `/crm/quotes/${activity.entity_id}`;

    case "client":
      return `/crm/clients/${activity.entity_id}`;

    case "contract":
      return `/crm/contracts/${activity.entity_id}`;

    case "invoice":
      return `/crm/invoices/${activity.entity_id}`;

    case "payment":
      return `/crm/payments/${activity.entity_id}`;

    default:
      return "/crm/dashboard";
  }
}
