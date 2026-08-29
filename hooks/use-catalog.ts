"use client";

import { useCallback, useEffect, useState } from "react";
import type { Catalog } from "@/lib/types";

export function useCatalog() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/catalog", { cache: "no-store" });
      if (!response.ok) throw new Error("load failed");
      const data = (await response.json()) as Catalog;
      setCatalog(data);
      return data;
    } catch {
      setCatalog(null);
      setError("ما قدرنا نحمّل البيانات. جرّب مرة ثانية.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as Catalog;
      })
      .then((data) => {
        if (cancelled) return;
        setCatalog(data);
      })
      .catch(() => {
        if (cancelled) return;
        setError("ما قدرنا نحمّل البيانات. جرّب مرة ثانية.");
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { catalog, error, loading, reload, setCatalog };
}
