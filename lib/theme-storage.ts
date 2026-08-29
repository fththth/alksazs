import type { ThemeMode } from "@/lib/types";

export const THEME_STORAGE_KEY = "qazzaz-theme-mode";

export function readCachedThemeMode(): ThemeMode | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw !== "dark" && raw !== "light") return null;
    return raw;
  } catch {
    return null;
  }
}

export function writeCachedThemeMode(mode: ThemeMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // ignore quota / private mode
  }
}

export function themeModeScript() {
  return `(function(){try{var m=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});var r=document.documentElement;if(m==="dark")r.classList.add("dark");else if(m==="light")r.classList.remove("dark");}catch(e){}})();`;
}
