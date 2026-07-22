import { detectChanges, createAuditLog } from "@/lib/crm/audit";
import { createActivity } from "@/lib/crm/activity";
import {
  getClientById,
  updateClientById,
} from "./repositories/client.repository";

export async function updateClient(
  clientId: string,
  updatedData: Record<string, unknown>,
  userId?: string,
) {
  // 1. Load current client
  const original = await getClientById(clientId);

  // 2. Detect changed fields
  const changes = detectChanges(original, updatedData);

  // Không có thay đổi
  if (!changes.length) {
    return original;
  }

  // 3. Update client
  const data = await updateClientById(clientId, updatedData);

  // 4. Audit
  await createAuditLog({
    entityType: "client",
    entityId: clientId,
    action: "update",
    changedBy: userId,
    changes,
  });

  // 5. Activity
  await createActivity({
    entityType: "client",
    entityId: clientId,
    activityType: "updated",
    title: "Client Updated",
    description: `${changes.length} field(s) changed`,
    createdBy: userId,
  });

  return data;
}
