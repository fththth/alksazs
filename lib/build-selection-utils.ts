import type { BuildSelection, Category, Product } from "@/lib/types";

export const MULTI_SELECT_CATEGORIES = ["ram", "storage"] as const;
export type MultiSelectCategory = (typeof MULTI_SELECT_CATEGORIES)[number];

export type SelectedBuild = Partial<Record<Category, Product | Product[]>>;

export function isMultiSelectCategory(
  category: Category
): category is MultiSelectCategory {
  return MULTI_SELECT_CATEGORIES.includes(category as MultiSelectCategory);
}

export function getSelectionIds(
  selection: BuildSelection,
  category: Category
): string[] {
  const value = selection[category];
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return typeof value === "string" ? [value] : [];
}

export function isProductSelected(
  selection: BuildSelection,
  category: Category,
  productId: string
) {
  return getSelectionIds(selection, category).includes(productId);
}

export function categoryHasSelection(
  selected: SelectedBuild,
  category: Category
) {
  const value = selected[category];
  if (!value) return false;
  return Array.isArray(value) ? value.length > 0 : true;
}

export function getProductsForCategory(
  selected: SelectedBuild,
  category: Category
): Product[] {
  const value = selected[category];
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function formatCategorySelection(selected: SelectedBuild, category: Category) {
  return getProductsForCategory(selected, category)
    .map((item) => `${item.brand} ${item.name}`.trim())
    .join(" + ");
}

export function filledCategoryCount(selected: SelectedBuild, order: Category[]) {
  return order.filter((key) => categoryHasSelection(selected, key)).length;
}

export function setCategoryIds(
  selection: BuildSelection,
  category: Category,
  ids: string[]
): BuildSelection {
  const next = { ...selection };
  if (ids.length === 0) {
    delete next[category];
  } else if (isMultiSelectCategory(category)) {
    next[category] = ids;
  } else {
    next[category] = ids[0];
  }
  return next;
}

export function removeCategorySelection(selection: BuildSelection, category: Category) {
  const next = { ...selection };
  delete next[category];
  return next;
}

export function removeProductFromSelection(
  selection: BuildSelection,
  category: Category,
  productId: string
): BuildSelection {
  const ids = getSelectionIds(selection, category).filter((id) => id !== productId);
  return setCategoryIds(selection, category, ids);
}

export function normalizeStoredSelection(raw: unknown): BuildSelection {
  if (!raw || typeof raw !== "object") return {};
  const selection: BuildSelection = {};
  const record = raw as Record<string, unknown>;

  for (const [key, value] of Object.entries(record)) {
    const category = key as Category;
    if (isMultiSelectCategory(category)) {
      if (typeof value === "string" && value) {
        selection[category] = [value];
      } else if (Array.isArray(value)) {
        selection[category] = value.filter((item): item is string => typeof item === "string");
      }
      continue;
    }
    if (typeof value === "string" && value) {
      selection[category] = value;
    }
  }

  return selection;
}
