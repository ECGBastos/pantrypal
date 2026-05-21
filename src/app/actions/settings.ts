"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { USER_COOKIE } from "@/lib/constants";
import { getCurrentContext } from "@/lib/app-context";
import { prisma } from "@/lib/prisma";

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function formBoolean(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

export async function switchUser(formData: FormData) {
  const userId = formString(formData, "userId");
  const { users } = await getCurrentContext();

  if (!users.some((user) => user.id === userId)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, userId, {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  });

  revalidatePath("/settings");
  revalidatePath("/shopping");
  revalidatePath("/inventory");
}

export async function updateNotificationPreference(formData: FormData) {
  const { household, currentUser } = await getCurrentContext();
  await prisma.notificationPreference.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: currentUser.id
      }
    },
    create: {
      householdId: household.id,
      userId: currentUser.id,
      enabled: formBoolean(formData, "enabled"),
      lowStockRemindersEnabled: formBoolean(formData, "lowStockRemindersEnabled"),
      weeklyShoppingReminderEnabled: formBoolean(formData, "weeklyShoppingReminderEnabled"),
      uncheckedItemsReminderEnabled: formBoolean(formData, "uncheckedItemsReminderEnabled"),
      reminderDay: formString(formData, "reminderDay") || "Sábado",
      reminderTime: formString(formData, "reminderTime") || "10:00"
    },
    update: {
      enabled: formBoolean(formData, "enabled"),
      lowStockRemindersEnabled: formBoolean(formData, "lowStockRemindersEnabled"),
      weeklyShoppingReminderEnabled: formBoolean(formData, "weeklyShoppingReminderEnabled"),
      uncheckedItemsReminderEnabled: formBoolean(formData, "uncheckedItemsReminderEnabled"),
      reminderDay: formString(formData, "reminderDay") || "Sábado",
      reminderTime: formString(formData, "reminderTime") || "10:00"
    }
  });

  revalidatePath("/settings");
}
