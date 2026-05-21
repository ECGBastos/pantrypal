import { Plus, Search } from "lucide-react";
import type { Category, KnownItem } from "@prisma/client";
import { CategorySelector } from "@/components/category-selector";
import { QuantityUnitInput } from "@/components/quantity-unit-input";

export function ItemInput({
  action,
  categories,
  knownItems,
  placeholder,
  defaultCategoryName = "Other",
  inventoryMode = false
}: {
  action: (formData: FormData) => Promise<void>;
  categories: Pick<Category, "id" | "name">[];
  knownItems: Pick<KnownItem, "id" | "name">[];
  placeholder: string;
  defaultCategoryName?: string;
  inventoryMode?: boolean;
}) {
  const inputId = inventoryMode ? "inventory-name" : "shopping-name";
  const listId = inventoryMode ? "inventory-known-items" : "shopping-known-items";

  return (
    <form action={action} className="space-y-3">
      <div className="input-shell flex items-center gap-3 px-4 py-2">
        <Search className="shrink-0 text-outline" size={24} aria-hidden="true" />
        <label htmlFor={inputId} className="sr-only">
          Item name
        </label>
        <input
          id={inputId}
          name="name"
          list={listId}
          className="form-input min-h-11 flex-1 text-base"
          placeholder={placeholder}
          autoComplete="off"
          required
        />
        <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary" type="submit" aria-label="Add item">
          <Plus size={24} aria-hidden="true" />
        </button>
      </div>

      <datalist id={listId}>
        {knownItems.map((item) => (
          <option key={item.id} value={item.name} />
        ))}
      </datalist>

      <details className="paper-card group p-3">
        <summary className="list-none cursor-pointer text-sm font-bold text-primary">
          Optional details
        </summary>
        <div className="mt-3 grid gap-3">
          <CategorySelector categories={categories} defaultCategoryName={defaultCategoryName} />
          <QuantityUnitInput quantityPlaceholder={inventoryMode ? "1" : "2"} unitPlaceholder={inventoryMode ? "box" : "pcs"} />
          {inventoryMode ? (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Location</span>
                <input name="location" className="form-input min-h-12 rounded-xl bg-surface-container-low px-3" placeholder="Fridge, pantry, bathroom" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Low stock threshold</span>
                <input name="lowStockThreshold" className="form-input min-h-12 rounded-xl bg-surface-container-low px-3" inputMode="decimal" placeholder="1" />
              </label>
            </>
          ) : null}
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Note</span>
            <input name="note" className="form-input min-h-12 rounded-xl bg-surface-container-low px-3" placeholder="Brand, sale note, or reminder" />
          </label>
        </div>
      </details>
    </form>
  );
}
