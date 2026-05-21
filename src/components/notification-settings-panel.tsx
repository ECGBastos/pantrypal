"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import type { NotificationPreference } from "@prisma/client";

type Preference = Pick<
  NotificationPreference,
  | "enabled"
  | "lowStockRemindersEnabled"
  | "weeklyShoppingReminderEnabled"
  | "uncheckedItemsReminderEnabled"
  | "reminderDay"
  | "reminderTime"
>;

export function NotificationSettingsPanel({
  preference,
  action
}: {
  preference: Preference;
  action: (formData: FormData) => Promise<void>;
}) {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [enabled, setEnabled] = useState(preference.enabled);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
  }, []);

  async function requestPermission() {
    if (!("Notification" in window)) {
      setPermission("unsupported");
      return;
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);

    if (nextPermission === "granted" && "serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready.catch(() => null);
      registration?.showNotification("PantryPal notifications are ready", {
        body: "Reminders are optional and can be turned off anytime.",
        icon: "/icons/pantrypal-icon.svg"
      });
    }
  }

  return (
    <section className="paper-card space-y-4 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed text-primary">
          {enabled ? <Bell size={24} aria-hidden="true" /> : <BellOff size={24} aria-hidden="true" />}
        </div>
        <div>
          <h2 className="text-xl font-bold text-on-surface">Notifications</h2>
          <p className="mt-1 text-sm leading-6 text-outline">
            Optional reminders for low stock and unfinished shopping. On iPhone, web push requires the installed Home Screen app on iOS/iPadOS 16.4+.
          </p>
        </div>
      </div>

      <button type="button" className="secondary-button w-full" onClick={requestPermission}>
        {permission === "granted" ? "Notification permission granted" : "Enable device permission"}
      </button>

      <form action={action} className="space-y-4">
        <Toggle label="Use PantryPal reminders" name="enabled" defaultChecked={preference.enabled} onChange={setEnabled} />
        <Toggle label="Low-stock reminders" name="lowStockRemindersEnabled" defaultChecked={preference.lowStockRemindersEnabled} />
        <Toggle label="Weekly shopping reminder" name="weeklyShoppingReminderEnabled" defaultChecked={preference.weeklyShoppingReminderEnabled} />
        <Toggle label="Unchecked list reminder" name="uncheckedItemsReminderEnabled" defaultChecked={preference.uncheckedItemsReminderEnabled} />

        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Day</span>
            <select name="reminderDay" defaultValue={preference.reminderDay} className="form-select">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Time</span>
            <input name="reminderTime" type="time" defaultValue={preference.reminderTime} className="form-input min-h-12 rounded-xl bg-surface-container-low px-3" />
          </label>
        </div>

        <button className="primary-button w-full" type="submit">
          Save notification settings
        </button>
      </form>

      <p className="text-xs leading-5 text-outline">
        Full push delivery is scaffolded but intentionally not required for the MVP. The app stores preferences now and can add VAPID/web-push delivery later.
      </p>
    </section>
  );
}

function Toggle({
  label,
  name,
  defaultChecked,
  onChange
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl bg-surface-container-low px-3">
      <span className="text-sm font-semibold text-on-surface">{label}</span>
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-6 w-11 rounded-full border-outline-variant text-primary focus:ring-primary"
        onChange={(event) => onChange?.(event.currentTarget.checked)}
      />
    </label>
  );
}
