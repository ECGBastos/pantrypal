import type { InventoryItem, KnownItem } from "@prisma/client";
import { normalizeName } from "@/lib/format";

export type Suggestion = {
  id: string;
  name: string;
  reason: string;
  categoryId?: string | null;
  unit?: string | null;
  source: "frequent" | "running-low" | "recent";
};

export function buildSuggestions(input: {
  knownItems: Pick<KnownItem, "id" | "name" | "defaultCategoryId" | "defaultUnit" | "timesAddedToShoppingList" | "lastUsedAt">[];
  runningLowItems: Pick<InventoryItem, "id" | "name" | "categoryId" | "unit" | "quantity" | "lowStockThreshold">[];
  activeShoppingNames: string[];
}) {
  const activeNames = new Set(input.activeShoppingNames.map(normalizeName));
  const suggestions = new Map<string, Suggestion>();

  for (const item of input.runningLowItems) {
    if (activeNames.has(normalizeName(item.name))) {
      continue;
    }

    suggestions.set(`running-low:${item.id}`, {
      id: item.id,
      name: item.name,
      reason:
        item.quantity !== null && item.lowStockThreshold !== null
          ? `Está em ${item.quantity}, limite ${item.lowStockThreshold}`
          : "Marcado como stock baixo",
      categoryId: item.categoryId,
      unit: item.unit,
      source: "running-low"
    });
  }

  for (const item of input.knownItems) {
    if (activeNames.has(normalizeName(item.name))) {
      continue;
    }

    const key = `frequent:${item.id}`;
    suggestions.set(key, {
      id: item.id,
      name: item.name,
      reason:
        item.timesAddedToShoppingList > 0
          ? `Comprado ${item.timesAddedToShoppingList} vezes`
          : "Usado recentemente",
      categoryId: item.defaultCategoryId,
      unit: item.defaultUnit,
      source: "frequent"
    });
  }

  return Array.from(suggestions.values()).slice(0, 12);
}
