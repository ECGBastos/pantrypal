import { Check, RotateCcw, Trash2 } from "lucide-react";
import type { ShoppingItem } from "@prisma/client";
import { deleteShoppingItem, toggleShoppingItem } from "@/app/actions/shopping";
import { quantityLabel, shortRelativeDate } from "@/lib/format";

type ShoppingRowItem = Pick<ShoppingItem, "id" | "name" | "quantity" | "unit" | "note" | "isBought" | "boughtAt">;

export function ShoppingListItemRow({ item, compact = false }: { item: ShoppingRowItem; compact?: boolean }) {
  return (
    <div className={`row-press paper-card flex items-center gap-4 p-4 transition ${item.isBought ? "opacity-60" : ""} ${compact ? "min-h-24" : "min-h-[84px]"}`}>
      <form action={toggleShoppingItem}>
        <input type="hidden" name="id" value={item.id} />
        <button
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition ${
            item.isBought ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-outline"
          }`}
          type="submit"
          aria-label={item.isBought ? `Unmark ${item.name}` : `Mark ${item.name} as bought`}
        >
          {item.isBought ? <RotateCcw size={18} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <div className={compact ? "space-y-2" : "flex items-start justify-between gap-3"}>
          <h3 className={`text-lg font-semibold leading-6 text-on-surface ${item.isBought ? "line-through" : ""}`}>{item.name}</h3>
          {item.quantity || item.unit ? (
            <span className="chip chip-neutral shrink-0">{quantityLabel(item.quantity, item.unit)}</span>
          ) : null}
        </div>
        {item.note ? <p className="mt-1 line-clamp-2 text-sm leading-5 text-outline">{item.note}</p> : null}
        {item.isBought ? <p className="mt-1 text-xs font-semibold text-outline">{shortRelativeDate(item.boughtAt)}</p> : null}
      </div>

      <form action={deleteShoppingItem}>
        <input type="hidden" name="id" value={item.id} />
        <button className="icon-button h-10 w-10 text-outline" type="submit" aria-label={`Delete ${item.name}`}>
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
