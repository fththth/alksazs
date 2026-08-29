"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  readStoredBuild,
  sanitizeSelection,
  writeStoredBuild,
} from "@/lib/build-storage";
import type { BuildSelection, Product } from "@/lib/types";

const BUILD_EVENT = "qazzaz-build-change";

function subscribeBuild(callback: () => void) {
  window.addEventListener(BUILD_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(BUILD_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getBuildSnapshot() {
  return JSON.stringify(readStoredBuild());
}

function getBuildServerSnapshot() {
  return "{}";
}

function notifyBuildChange() {
  window.dispatchEvent(new Event(BUILD_EVENT));
}

export function useBuildSelection(products: Product[]) {
  const storedRaw = useSyncExternalStore(
    subscribeBuild,
    getBuildSnapshot,
    getBuildServerSnapshot
  );

  const stored = useMemo(() => {
    try {
      return JSON.parse(storedRaw) as BuildSelection;
    } catch {
      return {};
    }
  }, [storedRaw]);

  const selection = useMemo(
    () => sanitizeSelection(products, stored),
    [products, stored]
  );

  useEffect(() => {
    if (products.length === 0) return;
    const raw = readStoredBuild();
    const sanitized = sanitizeSelection(products, raw);
    if (JSON.stringify(raw) !== JSON.stringify(sanitized)) {
      writeStoredBuild(sanitized);
      notifyBuildChange();
    }
  }, [products, storedRaw]);

  const setSelection = useCallback(
    (updater: BuildSelection | ((current: BuildSelection) => BuildSelection)) => {
      const current = sanitizeSelection(products, readStoredBuild());
      const next = typeof updater === "function" ? updater(current) : updater;
      writeStoredBuild(sanitizeSelection(products, next));
      notifyBuildChange();
    },
    [products]
  );

  return { selection, setSelection };
}
