"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { useCatalog } from "@/components/catalog-provider";
import { DEFAULT_THEME_MODE, parseThemeMode } from "@/lib/theme";

export function ShopThemeProvider({ children }: { children: React.ReactNode }) {
  const { catalog } = useCatalog();
  const themeMode = parseThemeMode(catalog?.settings.themeMode ?? DEFAULT_THEME_MODE);

  return (
    <ThemeProvider
      attribute="class"
      forcedTheme={themeMode}
      enableSystem={false}
      disableTransitionOnChange
      storageKey={undefined}
    >
      {children}
      <Toaster position="top-center" dir="rtl" />
    </ThemeProvider>
  );
}
