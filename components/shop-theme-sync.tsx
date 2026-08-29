"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { useCatalog } from "@/components/catalog-provider";
import { DEFAULT_THEME_MODE } from "@/lib/theme";

export function ShopThemeSync() {
  const { catalog } = useCatalog();
  const { setTheme } = useTheme();
  const mode = catalog?.settings.themeMode ?? DEFAULT_THEME_MODE;

  useEffect(() => {
    setTheme(mode);
  }, [mode, setTheme]);

  return null;
}
