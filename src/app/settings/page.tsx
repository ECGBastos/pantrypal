import type { Metadata } from "next";
import { updateNotificationPreference } from "@/app/actions/settings";
import { AppShell } from "@/components/app-shell";
import { NotificationSettingsPanel } from "@/components/notification-settings-panel";
import { getCurrentContext } from "@/lib/app-context";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Definições"
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { household, currentUser } = await getCurrentContext();
  const preference = await prisma.notificationPreference.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: currentUser.id
      }
    },
    create: {
      householdId: household.id,
      userId: currentUser.id,
      reminderDay: "Sábado"
    },
    update: {}
  });

  return (
    <AppShell userName={currentUser.name}>
      <NotificationSettingsPanel preference={preference} action={updateNotificationPreference} />
    </AppShell>
  );
}
