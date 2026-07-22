import { supabase } from "@/lib/supabase";

import { AuditLog, CreateAuditInput } from "@/types/crm/audit";

export async function getAuditHistory(entityType: string, entityId: string) {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(error);

    return [];
  }

  return data as AuditLog[];
}

export async function createAuditLog({
  entityType,
  entityId,
  action,
  changedBy,
  changes,
}: CreateAuditInput) {
  if (!changes.length) return;

  const rows = changes.map((change) => ({
    entity_type: entityType,

    entity_id: entityId,

    action,

    field_name: change.field,

    old_value: change.oldValue === undefined ? null : String(change.oldValue),

    new_value: change.newValue === undefined ? null : String(change.newValue),

    changed_by: changedBy ?? null,
  }));

  const { error } = await supabase.from("audit_logs").insert(rows);

  if (error) {
    console.error(error);

    throw error;
  }
}

export function detectChanges<T extends Record<string, unknown>>(
  original: T,
  updated: Partial<T>,
) {
  const changes = [];

  for (const key of Object.keys(updated)) {
    const oldValue = original[key];
    const newValue = updated[key];

    const oldString = JSON.stringify(oldValue);
    const newString = JSON.stringify(newValue);

    if (oldString !== newString) {
      changes.push({
        field: key,
        oldValue,
        newValue,
      });
    }
  }

  return changes;
}
