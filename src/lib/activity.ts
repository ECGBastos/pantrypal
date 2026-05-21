import { prisma } from "@/lib/prisma";

export async function logActivity(input: {
  householdId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await prisma.activityLog.create({
    data: {
      householdId: input.householdId,
      userId: input.userId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null
    }
  });
}
