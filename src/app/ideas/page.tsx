import type { Metadata } from "next";
import { AlertTriangle, Lightbulb, Plus, Sparkles } from "lucide-react";
import { addKnownItemToShopping } from "@/app/actions/shopping";
import { addInventoryItemToShopping } from "@/app/actions/inventory";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { getCurrentContext } from "@/lib/app-context";
import { buildSuggestions } from "@/lib/suggestions";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Ideas"
};

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const { household, currentUser } = await getCurrentContext();
  const [runningLowItems, knownItems, activeShoppingItems, recentActivity] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { householdId: household.id, isRunningLow: true },
      orderBy: [{ updatedAt: "desc" }],
      take: 8
    }),
    prisma.knownItem.findMany({
      where: { householdId: household.id },
      orderBy: [{ timesAddedToShoppingList: "desc" }, { lastUsedAt: "desc" }],
      take: 8
    }),
    prisma.shoppingItem.findMany({
      where: { householdId: household.id, isBought: false },
      select: { name: true }
    }),
    prisma.activityLog.findMany({
      where: { householdId: household.id },
      orderBy: { createdAt: "desc" },
      take: 5
    })
  ]);

  const suggestions = buildSuggestions({
    knownItems,
    runningLowItems,
    activeShoppingNames: activeShoppingItems.map((item) => item.name)
  });

  return (
    <AppShell userName={currentUser.name}>
      <section>
        <h2 className="text-2xl font-bold text-on-surface">Smart Suggestions</h2>
        <p className="mt-1 text-base leading-7 text-on-surface-variant">Based on your household habits</p>
      </section>

      {suggestions.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="Suggestions will learn your rhythm"
          body="Mark items bought and flag inventory as running low to build useful local suggestions."
        />
      ) : (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-on-surface">Suggested Additions</h3>
            <span className="chip chip-neutral">{suggestions.length} ideas</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {suggestions.map((suggestion) => (
              <article key={`${suggestion.source}-${suggestion.id}`} className={`paper-card p-4 ${suggestion.source === "running-low" ? "border-l-4 border-secondary" : ""}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${suggestion.source === "running-low" ? "bg-secondary-fixed text-secondary" : "bg-primary-fixed text-primary"}`}>
                    {suggestion.source === "running-low" ? <AlertTriangle size={26} aria-hidden="true" /> : <Sparkles size={26} aria-hidden="true" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg font-bold text-on-surface">{suggestion.name}</h4>
                    <p className="mt-1 text-sm leading-5 text-outline">{suggestion.reason}</p>
                  </div>
                  <form action={suggestion.source === "running-low" ? addInventoryItemToShopping : addKnownItemToShopping}>
                    <input type="hidden" name={suggestion.source === "running-low" ? "id" : "knownItemId"} value={suggestion.id} />
                    <button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container" type="submit" aria-label={`Add ${suggestion.name}`}>
                      <Plus size={22} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-on-surface">Recently Added</h3>
          <span className="text-sm font-semibold text-outline">Local history</span>
        </div>
        <div className="paper-card divide-y divide-outline-variant/40 overflow-hidden">
          {recentActivity.length === 0 ? (
            <p className="p-4 text-sm text-outline">Activity will appear after you use the list.</p>
          ) : (
            recentActivity.map((activity) => (
              <div key={activity.id} className="p-4">
                <p className="text-sm font-bold text-on-surface">{activity.action.replaceAll("_", " ")}</p>
                <p className="mt-1 text-xs text-outline">{activity.createdAt.toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-2xl bg-primary-fixed p-5 text-center">
        <Sparkles className="mx-auto mb-2 text-primary" size={34} aria-hidden="true" />
        <p className="text-base italic leading-7 text-on-surface-variant">A well-stocked pantry is the heart of a peaceful home.</p>
      </section>
    </AppShell>
  );
}
