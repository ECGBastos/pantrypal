import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/format";

export async function touchKnownItem(input: {
  householdId: string;
  name: string;
  categoryId?: string | null;
  unit?: string | null;
  source: "shopping" | "inventory";
}) {
  const normalizedName = normalizeName(input.name);
  const now = new Date();

  const existing = await prisma.knownItem.findUnique({
    where: {
      householdId_normalizedName: {
        householdId: input.householdId,
        normalizedName
      }
    }
  });

  if (existing) {
    return prisma.knownItem.update({
      where: { id: existing.id },
      data: {
        name: input.name.trim(),
        defaultCategoryId: input.categoryId ?? existing.defaultCategoryId,
        defaultUnit: input.unit || existing.defaultUnit,
        timesAddedToShoppingList:
          input.source === "shopping" ? { increment: 1 } : undefined,
        timesAddedToInventory:
          input.source === "inventory" ? { increment: 1 } : undefined,
        lastUsedAt: now
      }
    });
  }

  return prisma.knownItem.create({
    data: {
      householdId: input.householdId,
      name: input.name.trim(),
      normalizedName,
      defaultCategoryId: input.categoryId ?? null,
      defaultUnit: input.unit || null,
      timesAddedToShoppingList: input.source === "shopping" ? 1 : 0,
      timesAddedToInventory: input.source === "inventory" ? 1 : 0,
      lastUsedAt: now
    }
  });
}
