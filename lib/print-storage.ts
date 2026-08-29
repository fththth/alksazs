import type { CompatIssue } from "@/lib/compatibility";
import type { Category, Product } from "@/lib/types";

export type PrintBuildPayload = {
  selected: Partial<Record<Category, Product>>;
  total: number;
  psu: number | null;
  issues: CompatIssue[];
};

const PRINT_KEY = "qazzaz-print-build";

export function savePrintBuild(payload: PrintBuildPayload) {
  sessionStorage.setItem(PRINT_KEY, JSON.stringify(payload));
}

export function loadPrintBuild(): PrintBuildPayload | null {
  const raw = sessionStorage.getItem(PRINT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PrintBuildPayload;
  } catch {
    return null;
  }
}

export function clearPrintBuild() {
  sessionStorage.removeItem(PRINT_KEY);
}
