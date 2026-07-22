export type ActivityEntity =
  | "lead"
  | "client"
  | "quote"
  | "contract"
  | "invoice"
  | "payment";

export type ActivityType =
  | "created"
  | "updated"
  | "deleted"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "converted"
  | "uploaded"
  | "downloaded"
  | "note";

export interface Activity {
  id: string;

  entity_type: ActivityEntity;

  entity_id: string;

  activity_type: ActivityType;

  title: string;

  description: string | null;

  created_by: string | null;

  created_at: string;
}

export interface CreateActivityInput {
  entityType: ActivityEntity;

  entityId: string;

  activityType: ActivityType;

  title: string;

  description?: string;

  createdBy?: string;
}
