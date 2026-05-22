import type { Metadata } from "next";
import { ChevronDown, Leaf, PackageCheck, ShoppingBasket } from "lucide-react";
import { addShoppingItem, clearBoughtShoppingItems } from "@/app/actions/shopping";
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

      {activeByCategory.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="A lista está limpa"
          body="Adiciona o que reparares enquanto cozinhas, vês os armários ou preparas as compras."
        />
      ) : (
        <div className="space-y-7">
          {activeByCategory.map((group) => (
            <section key={group.category.id} className="shopping-category">
              <div className="shopping-category-heading">
                <div className="flex items-center gap-3">
                  <span className="text-primary">
                    <CategoryIcon categoryName={group.category.name} />
                  </span>
                  <h2>{group.category.name}</h2>
                </div>
                <span>{group.items.length} {group.items.length === 1 ? "artigo" : "artigos"}</span>
              </div>

              <div className="shopping-row-group">
                {group.items.map((item) => (
                  <ShoppingListItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="pt-2">
        <details className="group border-t border-outline-variant/80 pt-3">
          <summary className="flex list-none cursor-pointer items-center justify-between py-3">
            <div className="flex items-center gap-2 text-outline">
              <ChevronDown className="transition group-open:rotate-180" size={22} aria-hidden="true" />
              <h2 className="text-xl font-semibold">Comprado recentemente</h2>
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
              <div className="shopping-row-group">
                {boughtItems.map((item) => (
                  <ShoppingListItemRow key={item.id} item={item} />
                ))}
              </div>
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
