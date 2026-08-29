"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Catalog, Product, ShopSettings } from "@/lib/types";

type CatalogContextValue = {
  catalog: Catalog | null;
  error: string | null;
  loading: boolean;
  reload: () => Promise<Catalog | null>;
  setCatalog: (catalog: Catalog) => void;
  upsertProductLocal: (product: Product) => void;
  removeProductLocal: (id: string) => void;
  updateSettingsLocal: (settings: ShopSettings) => void;
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

async function fetchCatalog() {
  const response = await fetch("/api/catalog");
  if (!response.ok) throw new Error("load failed");
  return (await response.json()) as Catalog;
}

export function CatalogProvider({
  initialCatalog,
  children,
}: {
  initialCatalog: Catalog;
  children: ReactNode;
}) {
  const [catalog, setCatalogState] = useState<Catalog>(initialCatalog);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await fetchCatalog();
      setCatalogState(data);
      return data;
    } catch {
      setError("ما قدرنا نحمّل البيانات. جرّب مرة ثانية.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const setCatalog = useCallback((next: Catalog) => {
    setError(null);
    setCatalogState(next);
  }, []);

  const upsertProductLocal = useCallback((product: Product) => {
    setCatalogState((current) => {
      const index = current.products.findIndex((item) => item.id === product.id);
      if (index >= 0) {
        const products = [...current.products];
        products[index] = product;
        return { ...current, products };
      }
      return { ...current, products: [product, ...current.products] };
    });
  }, []);

  const removeProductLocal = useCallback((id: string) => {
    setCatalogState((current) => ({
      ...current,
      products: current.products.filter((item) => item.id !== id),
    }));
  }, []);

  const updateSettingsLocal = useCallback((settings: ShopSettings) => {
    setCatalogState((current) => ({ ...current, settings }));
  }, []);

  const value = useMemo(
    () => ({
      catalog,
      error,
      loading,
      reload,
      setCatalog,
      upsertProductLocal,
      removeProductLocal,
      updateSettingsLocal,
    }),
    [
      catalog,
      error,
      loading,
      reload,
      setCatalog,
      upsertProductLocal,
      removeProductLocal,
      updateSettingsLocal,
    ]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error("useCatalog must be used within CatalogProvider");
  }
  return context;
}
