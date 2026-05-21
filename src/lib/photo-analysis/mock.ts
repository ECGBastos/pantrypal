import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/format";
import type { AnalyzeInventoryPhotoInput, DetectedInventoryItem, PhotoAnalysisProvider } from "./types";

const demoItems = [
  {
    name: "Ovos biológicos",
    category: "Laticínios",
    confidence: 0.98,
    suggestedQuantity: 12,
    suggestedUnit: "un.",
    suggestedLocation: "Frigorífico"
  },
  {
    name: "Iogurte grego",
    category: "Laticínios",
    confidence: 0.85,
    suggestedQuantity: 2,
    suggestedUnit: "emb.",
    suggestedLocation: "Frigorífico"
  },
  {
    name: "Bebida de aveia",
    category: "Bebidas",
    confidence: 0.92,
    suggestedQuantity: 1,
    suggestedUnit: "emb.",
    suggestedLocation: "Despensa"
  }
] satisfies DetectedInventoryItem[];

export const mockPhotoAnalysisProvider: PhotoAnalysisProvider = {
  async analyzeInventoryPhoto(input: AnalyzeInventoryPhotoInput) {
    const existing = await prisma.inventoryItem.findMany({
      where: { householdId: input.householdId },
      select: {
        id: true,
        normalizedName: true
      }
    });

    const existingByName = new Map(existing.map((item) => [item.normalizedName, item.id]));

    return demoItems.map((item) => ({
      ...item,
      matchedExistingInventoryItemId: existingByName.get(normalizeName(item.name)) ?? null
    }));
  }
};
