import type { ThemeMode } from "@/lib/types";

export const DEFAULT_THEME_MODE: ThemeMode = "light";

export function parseThemeMode(value: unknown): ThemeMode {
  return value === "dark" ? "dark" : "light";
}
