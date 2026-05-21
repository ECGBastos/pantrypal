import { AlertTriangle, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import type { InventoryItem } from "@prisma/client";
import { addInventoryItemToShopping, adjustInventoryQuantity, deleteInventoryItem, toggleRunningLow } from "@/app/actions/inventory";
import { locationLabel, quantityLabel } from "@/lib/format";

type InventoryRowItem = Pick<
  InventoryItem,
  "id" | "name" | "quantity" | "unit" | "location" | "isRunningLow" | "lowStockThreshold" | "note"
>;

export function InventoryItemRow({ item }: { item: InventoryRowItem }) {
  return (
    <article className="paper-card row-press flex min-h-[104px] items-center gap-3 p-4 transition">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${item.isRunningLow ? "bg-secondary-fixed text-secondary" : "bg-surface-container-low text-primary"}`}>
        {item.isRunningLow ? <AlertTriangle size={28} aria-hidden="true" /> : <span className="text-2xl font-bold">{item.name.charAt(0).toUpperCase()}</span>}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-lg font-semibold leading-6 text-on-surface">{item.name}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-outline">{quantityLabel(item.quantity, item.unit)}</span>
          <span className="text-sm text-outline">· {locationLabel(item.location)}</span>
          {item.isRunningLow ? <span className="chip chip-low">Running Low</span> : null}
        </div>
        {item.note ? <p className="mt-1 line-clamp-1 text-sm text-outline">{item.note}</p> : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-full bg-surface-container-low p-1">
          <QuantityButton id={item.id} delta="-1" label={`Decrease ${item.name}`}>
            <Minus size={18} aria-hidden="true" />
          </QuantityButton>
          <span className="w-8 text-center text-lg font-bold">{item.quantity ?? "?"}</span>
          <QuantityButton id={item.id} delta="1" label={`Increase ${item.name}`}>
            <Plus size={18} aria-hidden="true" />
          </QuantityButton>
        </div>
        <div className="flex gap-1">
          <form action={toggleRunningLow}>
            <input type="hidden" name="id" value={item.id} />
            <button className="icon-button h-10 w-10 text-secondary" type="submit" aria-label={`Toggle running low for ${item.name}`}>
              <AlertTriangle size={17} aria-hidden="true" />
            </button>
          </form>
          <form action={addInventoryItemToShopping}>
            <input type="hidden" name="id" value={item.id} />
            <button className="icon-button h-10 w-10 text-primary" type="submit" aria-label={`Add ${item.name} to shopping`}>
              <ShoppingCart size={17} aria-hidden="true" />
            </button>
          </form>
          <form action={deleteInventoryItem}>
            <input type="hidden" name="id" value={item.id} />
            <button className="icon-button h-10 w-10 text-outline" type="submit" aria-label={`Delete ${item.name}`}>
              <Trash2 size={17} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}

function QuantityButton({ id, delta, label, children }: { id: string; delta: string; label: string; children: React.ReactNode }) {
  return (
    <form action={adjustInventoryQuantity}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="delta" value={delta} />
      <button className="flex h-10 w-10 items-center justify-center rounded-full text-secondary transition hover:bg-white" type="submit" aria-label={label}>
        {children}
      </button>
    </form>
  );
}
