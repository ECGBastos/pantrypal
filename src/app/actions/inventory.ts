"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { logActivity } from "@/lib/activity";
import { getCurrentContext, getCategoryIdByName } from "@/lib/app-context";
import { touchKnownItem } from "@/lib/catalog";
import { normalizeName, parseOptionalFloat } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function resolveCategoryId(householdId: string, categoryId: string | null | undefined, categoryName?: string | null) {
  if (categoryId) {
    return categoryId;
  }

  if (categoryName) {
    const named = await getCategoryIdByName(householdId, categoryName);
    if (named) {
      return named;
    }
  }

  const fallback = await getCategoryIdByName(householdId, "Outro");
  if (!fallback) {
    throw new Error("Não há categoria de fallback disponível.");
  }

  return fallback;
}

function computeRunningLow(quantity: number | null, threshold: number | null, explicit?: boolean) {
  if (typeof explicit === "boolean") {
    return explicit;
  }

  return quantity !== null && threshold !== null ? quantity <= threshold : false;
}

export async function addInventoryItem(formData: FormData) {
  const name = formString(formData, "name");
  if (!name) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  const categoryId = await resolveCategoryId(household.id, formString(formData, "categoryId"));
  const quantity = parseOptionalFloat(formData.get("quantity"));
  const unit = formString(formData, "unit") || null;
  const location = formString(formData, "location");
  const lowStockThreshold = parseOptionalFloat(formData.get("lowStockThreshold"));
  const note = formString(formData, "note") || null;
  const normalizedName = normalizeName(name);
  const isRunningLow = computeRunningLow(quantity, lowStockThreshold);

  const existing = await prisma.inventoryItem.findUnique({
    where: {
      householdId_normalizedName_location: {
        householdId: household.id,
        normalizedName,
        location
      }
    }
  });

  if (existing) {
    const nextQuantity =
      quantity !== null && existing.quantity !== null ? existing.quantity + quantity : quantity ?? existing.quantity;
    await prisma.inventoryItem.update({
      where: { id: existing.id },
      data: {
        name,
        categoryId,
        quantity: nextQuantity,
        unit: unit ?? existing.unit,
        location,
        lowStockThreshold: lowStockThreshold ?? existing.lowStockThreshold,
        isRunningLow: computeRunningLow(nextQuantity, lowStockThreshold ?? existing.lowStockThreshold),
        note: note ?? existing.note
      }
    });
  } else {
    await prisma.inventoryItem.create({
      data: {
        householdId: household.id,
        name,
        normalizedName,
        categoryId,
        quantity,
        unit,
        location,
        lowStockThreshold,
        isRunningLow,
        note
      }
    });
  }

  await touchKnownItem({
    householdId: household.id,
    name,
    categoryId,
    unit,
    source: "inventory"
  });

  await logActivity({
    householdId: household.id,
    userId: currentUser.id,
    action: "saved_inventory_item",
    entityType: "inventory_item",
    metadata: { name, location }
  });

  revalidatePath("/inventory");
  revalidatePath("/ideas");
}

export async function adjustInventoryQuantity(formData: FormData) {
  const id = formString(formData, "id");
  const delta = parseOptionalFloat(formData.get("delta"));
  if (!id || delta === null) {
    return;
  }

  const { household } = await getCurrentContext();
  const item = await prisma.inventoryItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  const current = item.quantity ?? 0;
  const quantity = Math.max(0, Number((current + delta).toFixed(2)));
  await prisma.inventoryItem.update({
    where: { id },
    data: {
      quantity,
      isRunningLow: computeRunningLow(quantity, item.lowStockThreshold, undefined)
    }
  });

  revalidatePath("/inventory");
  revalidatePath("/ideas");
}

export async function toggleRunningLow(formData: FormData) {
  const id = formString(formData, "id");
  if (!id) {
    return;
  }

  const { household } = await getCurrentContext();
  const item = await prisma.inventoryItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  await prisma.inventoryItem.update({
    where: { id },
    data: { isRunningLow: !item.isRunningLow }
  });

  revalidatePath("/inventory");
  revalidatePath("/ideas");
}

export async function addInventoryItemToShopping(formData: FormData) {
  const id = formString(formData, "id");
  if (!id) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  const item = await prisma.inventoryItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  const existing = await prisma.shoppingItem.findFirst({
    where: {
      householdId: household.id,
      normalizedName: item.normalizedName,
      isBought: false
    }
  });

  if (!existing) {
    await prisma.shoppingItem.create({
      data: {
        householdId: household.id,
        name: item.name,
        normalizedName: item.normalizedName,
        categoryId: item.categoryId,
        unit: item.unit,
        createdByUserId: currentUser.id,
        note: item.isRunningLow ? "Adicionado a partir de stock baixo" : null
      }
    });
  }

  await touchKnownItem({
    householdId: household.id,
    name: item.name,
    categoryId: item.categoryId,
    unit: item.unit,
    source: "shopping"
  });

  revalidatePath("/shopping");
  revalidatePath("/inventory");
  revalidatePath("/ideas");
}

const detectedItemSchema = z.object({
  selected: z.boolean().default(true),
  name: z.string().trim().min(1),
  category: z.string().trim().min(1).default("Outro"),
  quantity: z.number().nullable().optional(),
  unit: z.string().trim().nullable().optional(),
  location: z.string().trim().nullable().optional(),
  note: z.string().trim().nullable().optional()
});

const detectedItemsSchema = z.array(detectedItemSchema).max(24);

export async function saveDetectedInventoryItems(formData: FormData) {
  const rawItems = formString(formData, "items");
  if (!rawItems) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  let json: unknown;
  try {
    json = JSON.parse(rawItems);
  } catch {
    return;
  }

  const parsed = detectedItemsSchema.safeParse(json);
  if (!parsed.success) {
    return;
  }

  // Photo privacy guardrail: only confirmed text fields are saved here. No image,
  // object URL, base64 string, EXIF metadata, or upload path is accepted or persisted.
  for (const item of parsed.data.filter((entry) => entry.selected)) {
    const categoryId = await resolveCategoryId(household.id, null, item.category);
    const normalizedName = normalizeName(item.name);
    const location = item.location ?? "";

    const existing = await prisma.inventoryItem.findUnique({
      where: {
        householdId_normalizedName_location: {
          householdId: household.id,
          normalizedName,
          location
        }
      }
    });

    if (existing) {
      const quantity =
        item.quantity !== null && item.quantity !== undefined && existing.quantity !== null
          ? existing.quantity + item.quantity
          : item.quantity ?? existing.quantity;

      await prisma.inventoryItem.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          categoryId,
          quantity,
          unit: item.unit || existing.unit,
          location,
          note: item.note || existing.note,
          isRunningLow: computeRunningLow(quantity, existing.lowStockThreshold)
        }
      });
    } else {
      await prisma.inventoryItem.create({
        data: {
          householdId: household.id,
          name: item.name,
          normalizedName,
          categoryId,
          quantity: item.quantity ?? null,
          unit: item.unit || null,
          location,
          note: item.note || null,
          isRunningLow: false
        }
      });
    }

    await touchKnownItem({
      householdId: household.id,
      name: item.name,
      categoryId,
      unit: item.unit,
      source: "inventory"
    });
  }

  await logActivity({
    householdId: household.id,
    userId: currentUser.id,
    action: "saved_photo_inventory_suggestions",
    entityType: "inventory_item",
    metadata: { count: parsed.data.filter((entry) => entry.selected).length }
  });

  revalidatePath("/inventory");
  revalidatePath("/ideas");
  redirect("/inventory?saved=photo");
}

export async function deleteInventoryItem(formData: FormData) {
  const id = formString(formData, "id");
  if (!id) {
    return;
  }

  const { household } = await getCurrentContext();
  const item = await prisma.inventoryItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  await prisma.inventoryItem.delete({ where: { id } });
  revalidatePath("/inventory");
  revalidatePath("/ideas");
}
