"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Category } from "@prisma/client";

export type ReviewInventoryItem = {
  id: string;
  selected: boolean;
  name: string;
  category: string;
  confidence: number;
  quantity: number | null;
  unit: string;
  location: string;
  note: string;
  matchedExistingInventoryItemId?: string | null;
};

export function DetectedItemReview({
  items,
  categories,
  onChange
}: {
  items: ReviewInventoryItem[];
  categories: Pick<Category, "id" | "name">[];
  onChange: (items: ReviewInventoryItem[]) => void;
}) {
  function updateItem(id: string, patch: Partial<ReviewInventoryItem>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addManualItem() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        selected: true,
        name: "",
        category: "Other",
        confidence: 0,
        quantity: 1,
        unit: "",
        location: "",
        note: ""
      }
    ]);
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article key={item.id} className="paper-card p-4">
          <div className="flex items-start gap-3">
            <label className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={item.selected}
                className="h-6 w-6 rounded border-outline-variant text-primary focus:ring-primary"
                onChange={(event) => updateItem(item.id, { selected: event.currentTarget.checked })}
                aria-label={`Select ${item.name || "item"}`}
              />
            </label>
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex gap-2">
                <input
                  value={item.name}
                  onChange={(event) => updateItem(item.id, { name: event.currentTarget.value })}
                  className="form-input min-h-12 rounded-xl bg-surface-container-low px-3 font-semibold"
                  placeholder="Item name"
                />
                <span className="chip chip-neutral h-fit shrink-0">
                  {item.confidence > 0 ? `${Math.round(item.confidence * 100)}%` : "Manual"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Category</span>
                  <select
                    value={item.category}
                    onChange={(event) => updateItem(item.id, { category: event.currentTarget.value })}
                    className="form-select"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Location</span>
                  <input
                    value={item.location}
                    onChange={(event) => updateItem(item.id, { location: event.currentTarget.value })}
                    className="form-input min-h-12 rounded-xl bg-surface-container-low px-3"
                    placeholder="Fridge"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Quantity</span>
                  <input
                    value={item.quantity ?? ""}
                    inputMode="decimal"
                    onChange={(event) => {
                      const value = event.currentTarget.value.trim();
                      updateItem(item.id, { quantity: value ? Number(value) : null });
                    }}
                    className="form-input min-h-12 rounded-xl bg-surface-container-low px-3"
                    placeholder="unknown"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Unit</span>
                  <input
                    value={item.unit}
                    onChange={(event) => updateItem(item.id, { unit: event.currentTarget.value })}
                    className="form-input min-h-12 rounded-xl bg-surface-container-low px-3"
                    placeholder="pcs"
                  />
                </label>
              </div>

              {item.matchedExistingInventoryItemId ? (
                <p className="text-sm font-semibold text-primary">Matches something already in inventory, so saving will update it.</p>
              ) : null}
            </div>

            <button className="icon-button h-10 w-10 text-outline" type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name || "item"}`}>
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}

      <button type="button" className="secondary-button w-full border-dashed" onClick={addManualItem}>
        <Plus size={20} aria-hidden="true" />
        Add missing item
      </button>
    </div>
  );
}
