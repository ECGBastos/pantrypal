import Link from "next/link";
import type { Metadata } from "next";
import { Barcode, Box, Search } from "lucide-react";
import { addInventoryItem } from "@/app/actions/inventory";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/empty-state";
import { InventoryItemRow } from "@/components/inventory-item-row";
import { ItemInput } from "@/components/item-input";
import { getCategories, getCurrentContext } from "@/lib/app-context";
import { locationLabel } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Casa"
};

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const { household, currentUser } = await getCurrentContext();
  const [categories, inventoryItems, knownItems] = await Promise.all([
    getCategories(household.id),
    prisma.inventoryItem.findMany({
      where: { householdId: household.id },
      include: { category: true },
      orderBy: [{ location: "asc" }, { name: "asc" }]
    }),
    prisma.knownItem.findMany({
      where: { householdId: household.id },
      orderBy: [{ timesAddedToInventory: "desc" }, { lastUsedAt: "desc" }],
      take: 10
    })
  ]);

  const locations = Array.from(new Set(inventoryItems.map((item) => locationLabel(item.location))));
  const grouped = locations.map((location) => ({
    location,
    items: inventoryItems.filter((item) => locationLabel(item.location) === location)
  }));

  return (
    <AppShell userName={currentUser.name}>
      <section className="space-y-3">
        <div className="input-shell flex items-center gap-3 px-4 py-2">
          <Search className="shrink-0 text-outline" size={24} aria-hidden="true" />
          <input className="form-input min-h-11 text-base" placeholder="Procurar em casa..." aria-label="Procurar em casa" />
        </div>
        <ItemInput
          action={addInventoryItem}
          categories={categories}
          knownItems={knownItems}
          placeholder="Adicionar stock..."
          defaultCategoryName="Despensa"
          inventoryMode
        />
      </section>

      {inventoryItems.length === 0 ? (
        <EmptyState
          icon={Box}
          title="Começa simples"
          body="Adiciona só o que ajuda a evitar esquecimentos ou idas extra às compras."
          action={
            <Link href="/inventory/scan" className="primary-button px-5">
              <Barcode size={20} aria-hidden="true" />
              Fotografar stock
            </Link>
          }
        />
      ) : (
        grouped.map((group) => (
          <section key={group.location} className="space-y-3">
            <div className="section-heading">
              <h2>{group.location}</h2>
              <span className="chip chip-neutral">{group.items.length} {group.items.length === 1 ? "artigo" : "artigos"}</span>
            </div>
            <div className="space-y-3">
              {group.items.map((item) => (
                <InventoryItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}

      <Link
        href="/inventory/scan"
        className="primary-button fixed bottom-32 right-6 z-40 rounded-full px-5 md:right-[calc(50%-350px)]"
      >
        <Barcode size={22} aria-hidden="true" />
        Fotografar stock
      </Link>
    </AppShell>
  );
}
