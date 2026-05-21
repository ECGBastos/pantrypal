"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity";
import { getCurrentContext, getCategoryIdByName } from "@/lib/app-context";
import { touchKnownItem } from "@/lib/catalog";
import { normalizeName } from "@/lib/format";
import { prisma } from "@/lib/prisma";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function resolveCategoryId(householdId: string, formData: FormData) {
  const categoryId = formString(formData, "categoryId");
  if (categoryId) {
    return categoryId;
  }

  const fallback = await getCategoryIdByName(householdId, "Outro");
  if (!fallback) {
    throw new Error("Não há categoria de fallback disponível.");
  }

  return fallback;
}

function purchasedQuantity(quantity: string | null) {
  if (!quantity) {
    return 1;
  }

  const match = quantity.replace(",", ".").match(/\d+(?:\.\d+)?/);
  if (!match) {
    return 1;
  }

  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function addBoughtItemToInventory(item: {
  householdId: string;
  name: string;
  normalizedName: string;
  categoryId: string;
  quantity: string | null;
  unit: string | null;
}) {
  const quantity = purchasedQuantity(item.quantity);
  const existingItems = await prisma.inventoryItem.findMany({
    where: {
      householdId: item.householdId,
      normalizedName: item.normalizedName
    },
    orderBy: [{ location: "asc" }, { updatedAt: "desc" }]
  });
  const existing = existingItems.find((inventoryItem) => inventoryItem.location === "") ?? existingItems[0];

  if (!existing) {
    await prisma.inventoryItem.create({
      data: {
        householdId: item.householdId,
        name: item.name,
        normalizedName: item.normalizedName,
        categoryId: item.categoryId,
        quantity,
        unit: item.unit,
        location: "",
        isRunningLow: false
      }
    });
    return;
  }

  const nextQuantity = Number(((existing.quantity ?? 0) + quantity).toFixed(2));
  await prisma.inventoryItem.update({
    where: { id: existing.id },
    data: {
      name: item.name,
      categoryId: item.categoryId,
      quantity: nextQuantity,
      unit: item.unit ?? existing.unit,
      isRunningLow: existing.lowStockThreshold !== null ? nextQuantity <= existing.lowStockThreshold : false
    }
  });
}

export async function addShoppingItem(formData: FormData) {
  const name = formString(formData, "name");
  if (!name) {
    return;
  }

  const quantity = formString(formData, "quantity") || null;
  const unit = formString(formData, "unit") || null;
  const note = formString(formData, "note") || null;
  const { household, currentUser } = await getCurrentContext();
  const categoryId = await resolveCategoryId(household.id, formData);
  const normalizedName = normalizeName(name);

  const existing = await prisma.shoppingItem.findFirst({
    where: {
      householdId: household.id,
      normalizedName,
      isBought: false
    }
  });

  if (existing) {
    await prisma.shoppingItem.update({
      where: { id: existing.id },
      data: {
        name,
        categoryId,
        quantity: quantity ?? existing.quantity,
        unit: unit ?? existing.unit,
        note: note ?? existing.note
      }
    });

    await logActivity({
      householdId: household.id,
      userId: currentUser.id,
      action: "merged_duplicate_shopping_item",
      entityType: "shopping_item",
      entityId: existing.id,
      metadata: { name }
    });
  } else {
    const item = await prisma.shoppingItem.create({
      data: {
        householdId: household.id,
        name,
        normalizedName,
        categoryId,
        quantity,
        unit,
        note,
        createdByUserId: currentUser.id
      }
    });

    await logActivity({
      householdId: household.id,
      userId: currentUser.id,
      action: "created_shopping_item",
      entityType: "shopping_item",
      entityId: item.id,
      metadata: { name }
    });
  }

  await touchKnownItem({
    householdId: household.id,
    name,
    categoryId,
    unit,
    source: "shopping"
  });

  revalidatePath("/shopping");
  revalidatePath("/ideas");
}

export async function addKnownItemToShopping(formData: FormData) {
  const knownItemId = formString(formData, "knownItemId");
  if (!knownItemId) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  const knownItem = await prisma.knownItem.findFirst({
    where: { id: knownItemId, householdId: household.id }
  });

  if (!knownItem) {
    return;
  }

  const fallbackCategoryId = await getCategoryIdByName(household.id, "Outro");
  const categoryId = knownItem.defaultCategoryId ?? fallbackCategoryId;

  if (!categoryId) {
    return;
  }

  const existing = await prisma.shoppingItem.findFirst({
    where: {
      householdId: household.id,
      normalizedName: knownItem.normalizedName,
      isBought: false
    }
  });

  if (!existing) {
    await prisma.shoppingItem.create({
      data: {
        householdId: household.id,
        name: knownItem.name,
        normalizedName: knownItem.normalizedName,
        categoryId,
        unit: knownItem.defaultUnit,
        createdByUserId: currentUser.id
      }
    });
  }

  await touchKnownItem({
    householdId: household.id,
    name: knownItem.name,
    categoryId,
    unit: knownItem.defaultUnit,
    source: "shopping"
  });

  revalidatePath("/shopping");
  revalidatePath("/ideas");
}

export async function toggleShoppingItem(formData: FormData) {
  const id = formString(formData, "id");
  if (!id) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  const item = await prisma.shoppingItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  const nextBought = !item.isBought;
  await prisma.shoppingItem.update({
    where: { id },
    data: {
      isBought: nextBought,
      boughtAt: nextBought ? new Date() : null
    }
  });

  if (nextBought) {
    await addBoughtItemToInventory({
      householdId: household.id,
      name: item.name,
      normalizedName: item.normalizedName,
      categoryId: item.categoryId,
      quantity: item.quantity,
      unit: item.unit
    });

    await touchKnownItem({
      householdId: household.id,
      name: item.name,
      categoryId: item.categoryId,
      unit: item.unit,
      source: "shopping"
    });
  }

  await logActivity({
    householdId: household.id,
    userId: currentUser.id,
    action: nextBought ? "marked_shopping_item_bought" : "unmarked_shopping_item_bought",
    entityType: "shopping_item",
    entityId: item.id,
    metadata: { name: item.name }
  });

  revalidatePath("/shopping");
  revalidatePath("/inventory");
  revalidatePath("/ideas");
}

export async function deleteShoppingItem(formData: FormData) {
  const id = formString(formData, "id");
  if (!id) {
    return;
  }

  const { household, currentUser } = await getCurrentContext();
  const item = await prisma.shoppingItem.findFirst({
    where: { id, householdId: household.id }
  });

  if (!item) {
    return;
  }

  await prisma.shoppingItem.delete({ where: { id } });
  await logActivity({
    householdId: household.id,
    userId: currentUser.id,
    action: "deleted_shopping_item",
    entityType: "shopping_item",
    entityId: item.id,
    metadata: { name: item.name }
  });

  revalidatePath("/shopping");
  revalidatePath("/ideas");
}

export async function clearBoughtShoppingItems() {
  const { household } = await getCurrentContext();
  await prisma.shoppingItem.deleteMany({
    where: {
      householdId: household.id,
      isBought: true
    }
  });

  revalidatePath("/shopping");
}
