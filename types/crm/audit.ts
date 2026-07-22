export type AuditEntity =
  | "lead"
  | "client"
  | "quote"
  | "contract"
  | "invoice"
  | "payment";

export type AuditAction = "create" | "update" | "delete" | "convert" | "send";

export interface AuditLog {
  id: string;

  entity_type: AuditEntity;

  entity_id: string;

  action: AuditAction;

  field_name: string;

  old_value: string | null;

  new_value: string | null;

  changed_by: string | null;

  created_at: string;
}

export interface AuditChange {
  field: string;

  oldValue: unknown;

  newValue: unknown;
}

export interface CreateAuditInput {
  entityType: AuditEntity;

  entityId: string;

  action: AuditAction;

  changedBy?: string;

  changes: AuditChange[];
}
