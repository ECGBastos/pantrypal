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
  const [weeklyEnabled, setWeeklyEnabled] = useState(preference.weeklyShoppingReminderEnabled);
  const reminderDay = translateReminderDay(preference.reminderDay);

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
      registration?.showNotification("As notificações do PantryPal estão prontas", {
        body: "Podes desligar os lembretes a qualquer momento.",
        icon: "/icons/pantrypal-192.png"
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
          <h2 className="text-xl font-bold text-on-surface">Notificações</h2>
        </div>
      </div>

      <button type="button" className="secondary-button w-full" onClick={requestPermission}>
        {permission === "granted" ? "Permissão de notificações ativa" : "Ativar permissão no dispositivo"}
      </button>

      <form action={action} className="space-y-4">
        <Toggle label="Usar lembretes do PantryPal" name="enabled" defaultChecked={preference.enabled} onChange={setEnabled} />
        <Toggle label="Lembretes de stock baixo" name="lowStockRemindersEnabled" defaultChecked={preference.lowStockRemindersEnabled} />
        <Toggle label="Lembrete semanal de compras" name="weeklyShoppingReminderEnabled" defaultChecked={preference.weeklyShoppingReminderEnabled} onChange={setWeeklyEnabled} />
        <Toggle label="Lembrete de lista por terminar" name="uncheckedItemsReminderEnabled" defaultChecked={preference.uncheckedItemsReminderEnabled} />

        {weeklyEnabled ? (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-on-surface">Horário do lembrete semanal</h3>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Dia</span>
                <select name="reminderDay" defaultValue={reminderDay} className="form-select">
                  {["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"].map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Hora</span>
                <input name="reminderTime" type="time" defaultValue={preference.reminderTime} className="form-input min-h-12 rounded-xl bg-surface-container-low px-3" />
              </label>
            </div>
          </div>
        ) : (
          <>
            <input type="hidden" name="reminderDay" value={reminderDay} />
            <input type="hidden" name="reminderTime" value={preference.reminderTime} />
          </>
        )}

        <button className="primary-button w-full" type="submit">
          Guardar notificações
        </button>
      </form>
    </section>
  );
}

function translateReminderDay(day: string) {
  const days: Record<string, string> = {
    Monday: "Segunda",
    Tuesday: "Terça",
    Wednesday: "Quarta",
    Thursday: "Quinta",
    Friday: "Sexta",
    Saturday: "Sábado",
    Sunday: "Domingo"
  };

  return days[day] ?? day;
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
