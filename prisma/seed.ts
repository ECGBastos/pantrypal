import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  "Produce",
  "Meat & Fish",
  "Dairy",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Cleaning",
  "Personal care",
  "Other"
];

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const household = await prisma.household.upsert({
    where: { name: "Our Pantry" },
    create: { name: "Our Pantry" },
    update: {}
  });

  const [you, partner] = await Promise.all(
    ["You", "Partner"].map((name) =>
      prisma.user.upsert({
        where: { householdId_name: { householdId: household.id, name } },
        create: { householdId: household.id, name },
        update: {}
      })
    )
  );

  const categories = new Map<string, string>();
  for (const [index, name] of defaultCategories.entries()) {
    const category = await prisma.category.upsert({
      where: { householdId_name: { householdId: household.id, name } },
      create: {
        householdId: household.id,
        name,
        sortOrder: index
      },
      update: { sortOrder: index }
    });
    categories.set(name, category.id);
  }

  for (const user of [you, partner]) {
    await prisma.notificationPreference.upsert({
      where: { householdId_userId: { householdId: household.id, userId: user.id } },
      create: {
        householdId: household.id,
        userId: user.id,
        enabled: false,
        lowStockRemindersEnabled: true,
        weeklyShoppingReminderEnabled: false,
        uncheckedItemsReminderEnabled: false
      },
      update: {}
    });
  }

  const knownItems = [
    ["Avocados", "Produce", "pcs", 8, 2],
    ["Organic Spinach", "Produce", "bag", 6, 2],
    ["Oat Milk", "Dairy", "cartons", 12, 4],
    ["Basmati Rice", "Pantry", "kg", 4, 2],
    ["Black Beans", "Pantry", "cans", 5, 2],
    ["Dish Soap", "Cleaning", "bottle", 3, 1],
    ["Espresso Roast", "Drinks", "bag", 7, 1],
    ["Greek Yogurt", "Dairy", "tub", 6, 2],
    ["Sourdough Loaf", "Bakery", "loaf", 5, 2]
  ] as const;

  for (const [name, categoryName, unit, shoppingCount, inventoryCount] of knownItems) {
    await prisma.knownItem.upsert({
      where: {
        householdId_normalizedName: {
          householdId: household.id,
          normalizedName: normalizeName(name)
        }
      },
      create: {
        householdId: household.id,
        name,
        normalizedName: normalizeName(name),
        defaultCategoryId: categories.get(categoryName),
        defaultUnit: unit,
        timesAddedToShoppingList: shoppingCount,
        timesAddedToInventory: inventoryCount,
        lastUsedAt: new Date()
      },
      update: {
        defaultCategoryId: categories.get(categoryName),
        defaultUnit: unit
      }
    });
  }

  const activeShopping = [
    { name: "Avocados", category: "Produce", quantity: "3", unit: "pcs", note: "Pick the ripe ones" },
    { name: "Organic Spinach", category: "Produce", quantity: "1", unit: "bag", note: "Large bag for smoothies" },
    { name: "Oat Milk", category: "Dairy", quantity: "2", unit: "cartons", note: "Extra creamy version" },
    { name: "Basmati Rice", category: "Pantry", quantity: "1", unit: "kg", note: "" },
    { name: "Black Beans", category: "Pantry", quantity: "3", unit: "cans", note: "" }
  ];

  for (const item of activeShopping) {
    const existing = await prisma.shoppingItem.findFirst({
      where: {
        householdId: household.id,
        normalizedName: normalizeName(item.name),
        isBought: false
      }
    });

    if (!existing) {
      await prisma.shoppingItem.create({
        data: {
          householdId: household.id,
          name: item.name,
          normalizedName: normalizeName(item.name),
          categoryId: categories.get(item.category) ?? categories.get("Other")!,
          quantity: item.quantity,
          unit: item.unit,
          note: item.note || null,
          createdByUserId: you.id
        }
      });
    }
  }

  const recentlyBought = [
    { name: "Greek Yogurt", category: "Dairy", quantity: "1", unit: "tub" },
    { name: "Whole Wheat Bread", category: "Bakery", quantity: "1", unit: "loaf" }
  ];

  for (const item of recentlyBought) {
    const existing = await prisma.shoppingItem.findFirst({
      where: {
        householdId: household.id,
        normalizedName: normalizeName(item.name),
        isBought: true
      }
    });

    if (!existing) {
      await prisma.shoppingItem.create({
        data: {
          householdId: household.id,
          name: item.name,
          normalizedName: normalizeName(item.name),
          categoryId: categories.get(item.category) ?? categories.get("Other")!,
          quantity: item.quantity,
          unit: item.unit,
          isBought: true,
          boughtAt: new Date(),
          createdByUserId: partner.id
        }
      });
    }
  }

  const inventoryItems = [
    {
      name: "Whole Milk",
      category: "Dairy",
      quantity: 1,
      unit: "gal",
      location: "Fridge",
      lowStockThreshold: 1,
      isRunningLow: true,
      note: "Use before weekend"
    },
    {
      name: "Organic Strawberries",
      category: "Produce",
      quantity: 2,
      unit: "boxes",
      location: "Fridge",
      lowStockThreshold: 1,
      isRunningLow: false,
      note: "Good for smoothies"
    },
    {
      name: "Sourdough Loaf",
      category: "Bakery",
      quantity: 1,
      unit: "loaf",
      location: "Pantry",
      lowStockThreshold: 1,
      isRunningLow: false,
      note: "Freshly baked"
    },
    {
      name: "Steel Cut Oats",
      category: "Pantry",
      quantity: 0.2,
      unit: "kg",
      location: "Pantry",
      lowStockThreshold: 0.5,
      isRunningLow: true,
      note: "Breakfast staple"
    },
    {
      name: "Dish Soap",
      category: "Cleaning",
      quantity: 0.3,
      unit: "bottle",
      location: "Sink",
      lowStockThreshold: 0.5,
      isRunningLow: true,
      note: null
    }
  ];

  for (const item of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: {
        householdId_normalizedName_location: {
          householdId: household.id,
          normalizedName: normalizeName(item.name),
          location: item.location
        }
      },
      create: {
        householdId: household.id,
        name: item.name,
        normalizedName: normalizeName(item.name),
        categoryId: categories.get(item.category) ?? categories.get("Other")!,
        quantity: item.quantity,
        unit: item.unit,
        location: item.location,
        lowStockThreshold: item.lowStockThreshold,
        isRunningLow: item.isRunningLow,
        note: item.note
      },
      update: {
        lowStockThreshold: item.lowStockThreshold,
        isRunningLow: item.isRunningLow
      }
    });
  }

  await prisma.activityLog.create({
    data: {
      householdId: household.id,
      userId: you.id,
      action: "seeded_demo_data",
      entityType: "system",
      metadata: JSON.stringify({ source: "prisma/seed.ts" })
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
