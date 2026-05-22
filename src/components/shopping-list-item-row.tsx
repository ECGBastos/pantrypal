"use client";

import { useState } from "react";
import { Check, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Category, ShoppingItem } from "@prisma/client";
import { deleteShoppingItem, toggleShoppingItem, updateShoppingItem } from "@/app/actions/shopping";
import { quantityLabel, shortRelativeDate } from "@/lib/format";

type ShoppingRowItem = Pick<ShoppingItem, "id" | "name" | "categoryId" | "quantity" | "unit" | "note" | "isBought" | "boughtAt">;
type ShoppingRowCategory = Pick<Category, "id" | "name">;

export function ShoppingListItemRow({ item, categories }: { item: ShoppingRowItem; categories: ShoppingRowCategory[] }) {
  const [isEditing, setIsEditing] = useState(false);
  const editFormId = `edit-shopping-item-${item.id}`;

  return (
    <div className={`shopping-item-shell ${item.isBought ? "is-bought" : ""}`}>
      <div className={`shopping-item-row row-press transition ${isEditing ? "is-editing" : ""}`}>
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

        <button
          className="shopping-edit-toggle"
          type="button"
          aria-expanded={isEditing}
          aria-controls={editFormId}
          aria-label={`Editar ${item.name}`}
          onClick={() => setIsEditing((current) => !current)}
        >
          <Pencil size={18} aria-hidden="true" />
        </button>
      </div>

      {isEditing ? (
        <div className="shopping-edit-panel">
          <form
            id={editFormId}
            action={async (formData) => {
              setIsEditing(false);
              await updateShoppingItem(formData);
            }}
            className="shopping-edit-form"
          >
            <input type="hidden" name="id" value={item.id} />

            <label className="block">
              <span className="shopping-edit-label">Artigo</span>
              <input name="name" className="form-input shopping-edit-input" defaultValue={item.name} required />
            </label>

            <label className="block">
              <span className="shopping-edit-label">Categoria</span>
              <select name="categoryId" className="form-select shopping-edit-select" defaultValue={item.categoryId}>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="shopping-edit-label">Qtd.</span>
                <input name="quantity" className="form-input shopping-edit-input" defaultValue={item.quantity ?? ""} placeholder="2" />
              </label>
              <label className="block">
                <span className="shopping-edit-label">Unidade</span>
                <input name="unit" className="form-input shopping-edit-input" defaultValue={item.unit ?? ""} placeholder="un." />
              </label>
            </div>

            <label className="block">
              <span className="shopping-edit-label">Nota</span>
              <input name="note" className="form-input shopping-edit-input" defaultValue={item.note ?? ""} placeholder="Marca ou nota" />
            </label>
          </form>

          <div className="shopping-edit-actions">
            <form
              action={async (formData) => {
                setIsEditing(false);
                await deleteShoppingItem(formData);
              }}
            >
              <input type="hidden" name="id" value={item.id} />
              <button className="shopping-edit-delete" type="submit" aria-label={`Apagar ${item.name}`}>
                <Trash2 size={17} aria-hidden="true" />
                Apagar
              </button>
            </form>

            <button className="shopping-edit-cancel" type="button" onClick={() => setIsEditing(false)}>
              Cancelar
            </button>
            <button className="shopping-edit-save" type="submit" form={editFormId}>
              Guardar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
