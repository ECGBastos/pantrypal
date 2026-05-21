import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import { Home, LockKeyhole, Smartphone, ShieldCheck } from "lucide-react";
import { switchUser, updateNotificationPreference } from "@/app/actions/settings";
import { AppShell } from "@/components/app-shell";
import { NotificationSettingsPanel } from "@/components/notification-settings-panel";
import { APP_VERSION } from "@/lib/constants";
import { getCurrentContext } from "@/lib/app-context";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Settings"
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { household, users, currentUser } = await getCurrentContext();
  const preference = await prisma.notificationPreference.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: currentUser.id
      }
    },
    create: {
      householdId: household.id,
      userId: currentUser.id
    },
    update: {}
  });

  return (
    <AppShell userName={currentUser.name}>
      <section>
        <h2 className="text-2xl font-bold text-on-surface">Settings</h2>
        <p className="mt-1 text-base leading-7 text-on-surface-variant">Household, privacy, and optional reminders.</p>
      </section>

      <section className="paper-card space-y-4 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
            <Home size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-on-surface">{household.name}</h2>
            <p className="mt-1 text-sm leading-6 text-outline">MVP uses a simple household context with a user switcher. The database is ready for real auth later.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {users.map((user) => (
            <form key={user.id} action={switchUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button className={`secondary-button w-full ${user.id === currentUser.id ? "border-primary bg-primary-fixed" : ""}`} type="submit">
                {user.name}
              </button>
            </form>
          ))}
        </div>
      </section>

      <NotificationSettingsPanel preference={preference} action={updateNotificationPreference} />

      <section className="paper-card space-y-4 p-4">
        <InfoRow
          icon={ShieldCheck}
          title="Photo privacy"
          body="Photos are never stored in the database, Docker volume, uploads folders, backups, or app history. Only confirmed inventory text is saved."
        />
        <InfoRow
          icon={Smartphone}
          title="Home Screen PWA"
          body="Open PantryPal in Safari, use Share, then Add to Home Screen. The installed app gets the best iPhone notification support."
        />
        <InfoRow
          icon={LockKeyhole}
          title="Private hosting"
          body="For remote access, use HTTPS through your own secure reverse proxy or a VPN. Keep DATABASE_URL and future secrets in environment variables."
        />
      </section>

      <section className="rounded-2xl bg-surface-container-low p-4 text-sm leading-6 text-outline">
        <p className="font-bold text-on-surface">PantryPal {APP_VERSION}</p>
        <p>Self-hosted Next.js standalone app with SQLite persistence. No Vercel, Firebase, Supabase, upload volume, or permanent photo storage.</p>
      </section>
    </AppShell>
  );
}

function InfoRow({
  icon: Icon,
  title,
  body
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
        <Icon size={22} aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-bold text-on-surface">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-outline">{body}</p>
      </div>
    </div>
  );
}
