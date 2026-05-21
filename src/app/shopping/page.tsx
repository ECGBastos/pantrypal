import type { Metadata } from "next";
import { ChevronDown, Leaf, PackageCheck, Plus, ShoppingBasket } from "lucide-react";
import { addKnownItemToShopping, addShoppingItem, clearBoughtShoppingItems } from "@/app/actions/shopping";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { ItemInput } from "@/components/item-input";
import { ShoppingListItemRow } from "@/components/shopping-list-item-row";
import { getCategories, getCurrentContext } from "@/lib/app-context";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Compras"
};

export const dynamic = "force-dynamic";

export default async function ShoppingPage() {
  const { household, currentUser } = await getCurrentContext();
  const [categories, activeItems, boughtItems, frequentItems] = await Promise.all([
    getCategories(household.id),
    prisma.shoppingItem.findMany({
      where: { householdId: household.id, isBought: false },
      include: { category: true },
      orderBy: [{ createdAt: "asc" }]
    }),
    prisma.shoppingItem.findMany({
      where: { householdId: household.id, isBought: true },
      include: { category: true },
      orderBy: [{ boughtAt: "desc" }, { updatedAt: "desc" }],
      take: 20
    }),
    prisma.knownItem.findMany({
      where: { householdId: household.id },
      orderBy: [{ timesAddedToShoppingList: "desc" }, { lastUsedAt: "desc" }],
      take: 8
    })
  ]);

  const activeByCategory = categories
    .map((category) => ({
      category,
      items: activeItems.filter((item) => item.categoryId === category.id)
    }))
    .filter((group) => group.items.length > 0);

  return (
    <AppShell userName={currentUser.name}>
      <ItemInput
        action={addShoppingItem}
        categories={categories}
        knownItems={frequentItems}
        placeholder="Adicionar à lista..."
        defaultCategoryName="Outro"
      />

      {frequentItems.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wide text-outline">Adicionar de novo</h2>
            <span className="text-xs font-semibold text-outline">Usados recentemente</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {frequentItems.map((item) => (
              <form key={item.id} action={addKnownItemToShopping}>
                <input type="hidden" name="knownItemId" value={item.id} />
                <button className="chip chip-neutral min-h-10 whitespace-nowrap" type="submit">
                  <Plus size={14} aria-hidden="true" />
                  {item.name}
                </button>
              </form>
            ))}
          </div>
        </section>
      ) : null}

      {activeByCategory.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="A lista está limpa"
          body="Adiciona o que reparares enquanto cozinhas, vês os armários ou preparas as compras."
        />
      ) : (
        activeByCategory.map((group) => (
          <section key={group.category.id} className="space-y-3">
            <div className="section-heading">
              <div className="flex items-center gap-3">
                <span className="text-primary">
                  <CategoryIcon categoryName={group.category.name} />
                </span>
                <h2>{group.category.name}</h2>
              </div>
              <span className="chip chip-neutral">{group.items.length} {group.items.length === 1 ? "artigo" : "artigos"}</span>
            </div>

            {["Despensa", "Pantry"].includes(group.category.name) && group.items.length > 1 ? (
              <div className="grid grid-cols-2 gap-3">
                {group.items.map((item) => (
                  <ShoppingListItemRow key={item.id} item={item} compact />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {group.items.map((item) => (
                  <ShoppingListItemRow key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        ))
      )}

      <section className="pt-2">
        <details className="group border-t border-outline-variant pt-3">
          <summary className="flex list-none cursor-pointer items-center justify-between py-3">
            <div className="flex items-center gap-2 text-outline">
              <ChevronDown className="transition group-open:rotate-180" size={22} aria-hidden="true" />
              <h2 className="text-lg font-bold">Comprado recentemente</h2>
            </div>
            <span className="text-sm font-semibold text-outline">{boughtItems.length} {boughtItems.length === 1 ? "artigo" : "artigos"}</span>
          </summary>

          {boughtItems.length > 0 ? (
            <div className="space-y-3 pt-2">
              <form action={clearBoughtShoppingItems}>
                <button className="secondary-button w-full" type="submit">
                  Limpar comprados
                </button>
              </form>
              {boughtItems.map((item) => (
                <ShoppingListItemRow key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="pb-4 text-sm text-outline">Os artigos marcados como comprados aparecem aqui.</p>
          )}
        </details>
      </section>
    </AppShell>
  );
}

function CategoryIcon({ categoryName }: { categoryName: string }) {
  if (["Fruta e legumes", "Produce"].includes(categoryName)) {
    return <Leaf size={27} aria-hidden="true" />;
  }

  return <PackageCheck size={27} aria-hidden="true" />;
}
