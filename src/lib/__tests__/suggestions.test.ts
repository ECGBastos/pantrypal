import assert from "node:assert/strict";
import test from "node:test";
import { buildSuggestions } from "@/lib/suggestions";

test("buildSuggestions excludes items already on the active shopping list", () => {
  const suggestions = buildSuggestions({
    activeShoppingNames: ["Oat Milk"],
    runningLowItems: [
      {
        id: "inventory-1",
        name: "Oat Milk",
        categoryId: "dairy",
        unit: "cartons",
        quantity: 1,
        lowStockThreshold: 2
      }
    ],
    knownItems: [
      {
        id: "known-1",
        name: "Coffee",
        defaultCategoryId: "drinks",
        defaultUnit: "bag",
        timesAddedToShoppingList: 7,
        lastUsedAt: new Date()
      }
    ]
  });

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0]?.name, "Coffee");
});
