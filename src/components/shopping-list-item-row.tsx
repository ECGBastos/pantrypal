import { Check, RotateCcw, Trash2 } from "lucide-react";
import type { ShoppingItem } from "@prisma/client";
import { deleteShoppingItem, toggleShoppingItem } from "@/app/actions/shopping";
import { quantityLabel, shortRelativeDate } from "@/lib/format";

type ShoppingRowItem = Pick<ShoppingItem, "id" | "name" | "quantity" | "unit" | "note" | "isBought" | "boughtAt">;

export function ShoppingListItemRow({ item }: { item: ShoppingRowItem }) {
  return (
    <div className={`shopping-item-row row-press transition ${item.isBought ? "is-bought" : ""}`}>
      <form action={toggleShoppingItem}>
        <input type="hidden" name="id" value={item.id} />
        <button
          className={`shopping-check transition ${
            item.isBought ? "border-primary bg-primary text-on-primary" : "border-outline text-transparent"
          }`}
          type="submit"
          aria-label={item.isBought ? `Desmarcar ${item.name}` : `Marcar ${item.name} como comprado`}
        >
          {item.isBought ? <RotateCcw size={18} aria-hidden="true" /> : <Check size={20} aria-hidden="true" />}
        </button>
      </form>

      <div className="min-w-0 flex-1">
        <div className="shopping-item-line">
          <h3 className={`shopping-item-name ${item.isBought ? "line-through" : ""}`}>{item.name}</h3>
          {item.quantity || item.unit ? (
            <span className="shopping-quantity">{quantityLabel(item.quantity, item.unit)}</span>
          ) : null}
        </div>
        {item.note ? <p className="mt-1 line-clamp-1 text-[15px] leading-5 text-outline-variant">{item.note}</p> : null}
        {item.isBought ? <p className="mt-1 text-xs font-semibold text-outline">{shortRelativeDate(item.boughtAt)}</p> : null}
      </div>

      <form action={deleteShoppingItem}>
        <input type="hidden" name="id" value={item.id} />
        <button className="shopping-delete" type="submit" aria-label={`Apagar ${item.name}`}>
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
