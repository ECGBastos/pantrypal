import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  "Fruta e legumes",
  "Carne e peixe",
  "Laticínios",
  "Padaria",
  "Despensa",
  "Congelados",
  "Bebidas",
  "Limpeza",
  "Higiene pessoal",
  "Outro"
];

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const household = await prisma.household.upsert({
    where: { name: "Casa" },
    create: { name: "Casa" },
    update: {}
  });

  const [you, partner] = await Promise.all(
    ["Tu", "Parceira"].map((name) =>
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
        uncheckedItemsReminderEnabled: false,
        reminderDay: "Sábado"
      },
      update: {}
    });
  }

  const knownItems = [
    ["Abacates", "Fruta e legumes", "un.", 8, 2],
    ["Espinafres biológicos", "Fruta e legumes", "saco", 6, 2],
    ["Bebida de aveia", "Bebidas", "emb.", 12, 4],
    ["Arroz basmati", "Despensa", "kg", 4, 2],
    ["Feijão preto", "Despensa", "latas", 5, 2],
    ["Detergente da loiça", "Limpeza", "frasco", 3, 1],
    ["Café espresso", "Bebidas", "pacote", 7, 1],
    ["Iogurte grego", "Laticínios", "emb.", 6, 2],
    ["Pão de massa mãe", "Padaria", "un.", 5, 2]
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
    { name: "Abacates", category: "Fruta e legumes", quantity: "3", unit: "un.", note: "Escolher os maduros" },
    { name: "Espinafres biológicos", category: "Fruta e legumes", quantity: "1", unit: "saco", note: "Saco grande para batidos" },
    { name: "Bebida de aveia", category: "Bebidas", quantity: "2", unit: "emb.", note: "Versão cremosa" },
    { name: "Arroz basmati", category: "Despensa", quantity: "1", unit: "kg", note: "" },
    { name: "Feijão preto", category: "Despensa", quantity: "3", unit: "latas", note: "" }
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
          categoryId: categories.get(item.category) ?? categories.get("Outro")!,
          quantity: item.quantity,
          unit: item.unit,
          note: item.note || null,
          createdByUserId: you.id
        }
      });
    }
  }

  const recentlyBought = [
    { name: "Iogurte grego", category: "Laticínios", quantity: "1", unit: "emb." },
    { name: "Pão integral", category: "Padaria", quantity: "1", unit: "un." }
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
          categoryId: categories.get(item.category) ?? categories.get("Outro")!,
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
      name: "Leite",
      category: "Laticínios",
      quantity: 1,
      unit: "L",
      location: "Frigorífico",
      lowStockThreshold: 1,
      isRunningLow: true,
      note: "Usar antes do fim de semana"
    },
    {
      name: "Morangos",
      category: "Fruta e legumes",
      quantity: 2,
      unit: "cx.",
      location: "Frigorífico",
      lowStockThreshold: 1,
      isRunningLow: false,
      note: "Bons para batidos"
    },
    {
      name: "Pão de massa mãe",
      category: "Padaria",
      quantity: 1,
      unit: "un.",
      location: "Despensa",
      lowStockThreshold: 1,
      isRunningLow: false,
      note: "Comprado fresco"
    },
    {
      name: "Flocos de aveia",
      category: "Despensa",
      quantity: 0.2,
      unit: "kg",
      location: "Despensa",
      lowStockThreshold: 0.5,
      isRunningLow: true,
      note: "Para pequeno-almoço"
    },
    {
      name: "Detergente da loiça",
      category: "Limpeza",
      quantity: 0.3,
      unit: "frasco",
      location: "Lava-loiça",
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
        categoryId: categories.get(item.category) ?? categories.get("Outro")!,
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
