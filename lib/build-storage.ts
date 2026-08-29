import { CATEGORIES, type BuildSelection, type Product } from "@/lib/types";
import {
  getSelectionIds,
  isMultiSelectCategory,
  normalizeStoredSelection,
} from "@/lib/build-selection-utils";

export const BUILD_STORAGE_KEY = "qazzaz-build";

export function readStoredBuild(): BuildSelection {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
    if (!raw) return {};
    return normalizeStoredSelection(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function sanitizeSelection(products: Product[], selection: BuildSelection): BuildSelection {
  const next: BuildSelection = {};

  for (const category of CATEGORIES) {
    const ids = getSelectionIds(selection, category);
    const valid = ids.filter((id) =>
      products.some((item) => item.id === id && item.category === category)
    );

    if (valid.length === 0) continue;

    if (isMultiSelectCategory(category)) {
      next[category] = valid;
    } else {
      next[category] = valid[0];
    }
  }

  return next;
}

export function writeStoredBuild(selection: BuildSelection) {
  window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(selection));
}
