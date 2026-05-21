export function QuantityUnitInput({
  quantityName = "quantity",
  unitName = "unit",
  quantityPlaceholder = "2",
  unitPlaceholder = "un."
}: {
  quantityName?: string;
  unitName?: string;
  quantityPlaceholder?: string;
  unitPlaceholder?: string;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Qtd.</span>
        <input
          name={quantityName}
          className="form-input min-h-12 rounded-xl bg-surface-container-low px-3"
          placeholder={quantityPlaceholder}
          inputMode="decimal"
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Unidade</span>
        <input
          name={unitName}
          className="form-input min-h-12 rounded-xl bg-surface-container-low px-3"
          placeholder={unitPlaceholder}
        />
      </label>
    </div>
  );
}
