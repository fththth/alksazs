import { CATEGORIES, type BuildSelection } from "@/lib/types";

export const BUILD_STORAGE_KEY = "qazzaz-build";

export function readStoredBuild(): BuildSelection {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BUILD_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const selection: BuildSelection = {};
    for (const category of CATEGORIES) {
      const value = (parsed as Record<string, unknown>)[category];
      if (typeof value === "string" && value) selection[category] = value;
    }
    return selection;
  } catch {
    return {};
  }
}

export function writeStoredBuild(selection: BuildSelection) {
  window.localStorage.setItem(BUILD_STORAGE_KEY, JSON.stringify(selection));
}
