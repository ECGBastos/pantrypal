export function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function titleCase(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function parseOptionalFloat(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const number = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

export function quantityLabel(quantity?: string | number | null, unit?: string | null) {
  if (quantity === null || quantity === undefined || quantity === "") {
    return unit || "desconhecido";
  }

  return [quantity, unit].filter(Boolean).join(" ");
}

export function locationLabel(location?: string | null) {
  return location?.trim() || "Casa";
}

export function shortRelativeDate(date: Date | string | null) {
  if (!date) {
    return "";
  }

  const then = typeof date === "string" ? new Date(date) : date;
  const days = Math.round((Date.now() - then.getTime()) / 86_400_000);

  if (days <= 0) {
    return "Hoje";
  }

  if (days === 1) {
    return "Ontem";
  }

  return `Há ${days} dias`;
}
