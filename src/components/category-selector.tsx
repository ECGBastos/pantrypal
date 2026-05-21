import type { Category } from "@prisma/client";

export function CategorySelector({
  categories,
  name = "categoryId",
  defaultCategoryName = "Other"
}: {
  categories: Pick<Category, "id" | "name">[];
  name?: string;
  defaultCategoryName?: string;
}) {
  const defaultCategory = categories.find((category) => category.name === defaultCategoryName) ?? categories[0];

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-outline">Category</span>
      <select name={name} defaultValue={defaultCategory?.id} className="form-select">
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
    </label>
  );
}
