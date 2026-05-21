import { cookies } from "next/headers";
import { DEFAULT_CATEGORIES, USER_COOKIE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function ensureHouseholdSetup() {
  const household = await prisma.household.upsert({
    where: { name: "Casa" },
    create: { name: "Casa" },
    update: {}
  });

  const users = await Promise.all(
    ["Tu", "Parceira"].map((name) =>
      prisma.user.upsert({
        where: { householdId_name: { householdId: household.id, name } },
        create: { householdId: household.id, name },
        update: {}
      })
    )
  );

  for (const [sortOrder, name] of DEFAULT_CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { householdId_name: { householdId: household.id, name } },
      create: { householdId: household.id, name, sortOrder },
      update: { sortOrder }
    });
  }

  for (const user of users) {
    await prisma.notificationPreference.upsert({
      where: { householdId_userId: { householdId: household.id, userId: user.id } },
      create: {
        householdId: household.id,
        userId: user.id,
        enabled: false,
        reminderDay: "Sábado"
      },
      update: {}
    });
  }

  return { household, users };
}

export async function getCurrentContext() {
  const { household, users } = await ensureHouseholdSetup();
  const cookieStore = await cookies();
  const requestedUserId = cookieStore.get(USER_COOKIE)?.value;
  const currentUser = users.find((user) => user.id === requestedUserId) ?? users[0];

  return {
    household,
    users,
    currentUser
  };
}

export async function getCategories(householdId: string) {
  return prisma.category.findMany({
    where: { householdId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }]
  });
}

export async function getCategoryIdByName(householdId: string, name: string) {
  const category = await prisma.category.findUnique({
    where: { householdId_name: { householdId, name } }
  });

  if (category) {
    return category.id;
  }

  const fallback = await prisma.category.findUnique({
    where: { householdId_name: { householdId, name: "Outro" } }
  });

  return fallback?.id;
}
