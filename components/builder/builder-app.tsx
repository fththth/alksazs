"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand-mark";
import { BuildSummary } from "@/components/builder/build-summary";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  buildIssues,
  buildTotal,
  estimatePsuWattage,
  getSelectedProducts,
  incompatibilityReason,
} from "@/lib/compatibility";
import { formatPrice, formatStock } from "@/lib/format";
import type { BuildSelection, Category, Product } from "@/lib/types";
import { useCatalog } from "@/hooks/use-catalog";
import { readStoredBuild, writeStoredBuild } from "@/lib/build-storage";
import { cn } from "@/lib/utils";

const EMPTY_PRODUCTS: Product[] = [];

export function BuilderApp() {
  const { catalog, error, loading, reload } = useCatalog();
  const [category, setCategory] = useState<Category>("cpu");
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<BuildSelection>(readStoredBuild);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    writeStoredBuild(selection);
  }, [selection]);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const selected = useMemo(
    () => getSelectedProducts(products, selection),
    [products, selection]
  );
  const total = buildTotal(selected);
  const issues = buildIssues(products, selection);
  const psu = estimatePsuWattage(selected);
  const selectedCount = Object.values(selected).filter(Boolean).length;

  const visible = products.filter((item) => {
    if (item.category !== category) return false;
    if (!item.available) return false;
    const hay = `${item.brand} ${item.name} ${item.description}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  function pick(product: Product) {
    if (product.stock <= 0) return;
    if (incompatibilityReason(product, selected)) return;
    setSelection((current) => ({ ...current, [product.category]: product.id }));
  }

  function clearPart(key: Category) {
    setSelection((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function resetBuild() {
    setSelection({});
  }

  if (loading && !catalog) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>قاعدين نجهّز القطع...</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <AlertTriangle className="size-10 text-primary" />
        <p className="text-lg text-foreground">{error ?? "صار خطأ غير متوقع."}</p>
        <Button onClick={() => void reload()}>
          <RefreshCcw />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  const meta = CATEGORY_META[category];
  const CategoryIcon = meta.icon;

  return (
    <div className="page-shell">
      <section className="surface-card overflow-hidden">
        <div className="grid md:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <BrandMark className="size-14" size={112} />
              <div>
                <p className="text-sm font-semibold text-primary">القزاز لخدمات الحاسبات</p>
                <p className="text-xs text-muted-foreground">تجميعة احترافية بأسعار واضحة</p>
              </div>
            </div>
            <h1 className="max-w-xl font-heading text-2xl font-bold leading-tight text-foreground sm:text-3xl">
              جهّز حاسبك قطعة قطعة، والسعر يطلع لك مباشرة.
            </h1>
            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              اختَر المعالج، المذربود، الرامات، كرت الشاشة، التخزين، الكولر، والكيس.
              نراجع التوافق ونحسبلك السعر الإجمالي قبل لا تطلب.
            </p>
            {catalog.settings.shopNote ? (
              <p className="max-w-xl rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {catalog.settings.shopNote}
              </p>
            ) : null}
          </div>
          <div className="relative hidden min-h-[220px] md:block">
            <Image
              src="/brand/splash.jpg"
              alt=""
              fill
              sizes="300px"
              quality={80}
              className="object-cover object-[center_20%]"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-card/20" />
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card min-w-0 p-4 sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORY_ORDER.map((key) => {
              const item = CATEGORY_META[key];
              const Icon = item.icon;
              const chosen = selected[key];
              const active = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setCategory(key);
                    setQuery("");
                  }}
                  className={cn("chip flex items-center gap-2", active ? "chip-active" : "chip-idle")}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {chosen ? <span className="size-1.5 rounded-full bg-emerald-500" /> : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-foreground">
                <CategoryIcon className="size-5 text-primary" />
                <h2 className="font-heading text-xl font-semibold">{meta.label}</h2>
              </div>
              <p className="mt-1 max-w-xl text-sm leading-7 text-muted-foreground">
                {meta.hint}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالموديل أو الشركة"
                className="h-10 bg-background pr-8"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/40 px-6 py-14 text-center text-muted-foreground">
              ماكو قطع بهالتصنيف حالياً
              {query ? " مطابقة للبحث" : ""}. تقدر تضيف من لوحة التحكم.
            </div>
          ) : (
            <ul className="mt-6 grid gap-3">
              {visible.map((product) => {
                const chosen = selection[product.category] === product.id;
                const reason = incompatibilityReason(product, selected);
                const incompatible = Boolean(reason);
                const out = product.stock <= 0;
                const blocked = out || incompatible;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => pick(product)}
                      aria-disabled={blocked}
                      className={cn(
                        "relative flex w-full flex-col gap-3 overflow-hidden rounded-xl border p-4 text-right transition sm:flex-row sm:items-center sm:justify-between",
                        chosen && !incompatible
                          ? "border-primary/40 bg-primary/5 shadow-sm"
                          : incompatible
                            ? "cursor-not-allowed border-destructive bg-destructive/10"
                            : "border-border bg-background hover:border-primary/25 hover:bg-muted/30",
                        out && !incompatible && "opacity-50"
                      )}
                    >
                      {incompatible ? (
                        <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive px-3 py-2 text-sm font-semibold text-white sm:absolute sm:inset-x-4 sm:top-4 sm:w-auto">
                          <AlertTriangle className="size-4 shrink-0" />
                          غير متوافق
                        </div>
                      ) : null}
                      <div className={cn("min-w-0 w-full", incompatible && "mt-10 sm:mt-12")}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={cn(
                              "font-heading text-base font-semibold",
                              incompatible ? "text-destructive" : "text-foreground"
                            )}
                          >
                            {product.brand} {product.name}
                          </p>
                          {chosen && !incompatible ? (
                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              <Check />
                              مختار
                            </Badge>
                          ) : null}
                          {out ? <Badge variant="outline">نفد</Badge> : null}
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-sm leading-7",
                            incompatible ? "text-destructive/80" : "text-muted-foreground"
                          )}
                        >
                          {product.description}
                        </p>
                        <div
                          className={cn(
                            "mt-2 flex flex-wrap gap-2 text-xs",
                            incompatible ? "text-destructive/70" : "text-muted-foreground"
                          )}
                        >
                          {product.specs.socket ? <span>سوكت {product.specs.socket}</span> : null}
                          {product.specs.ramType ? <span>{product.specs.ramType}</span> : null}
                          {product.specs.formFactor ? <span>{product.specs.formFactor}</span> : null}
                          {product.specs.capacity ? <span>{product.specs.capacity}</span> : null}
                          {product.specs.speed ? <span>{product.specs.speed}</span> : null}
                          <span>{formatStock(product.stock)}</span>
                        </div>
                        {reason ? (
                          <p className="mt-2 text-xs font-medium text-destructive">{reason}</p>
                        ) : null}
                      </div>
                      <p
                        className={cn(
                          "shrink-0 font-heading text-lg font-bold",
                          incompatible ? "text-destructive/70" : "text-primary"
                        )}
                        dir="ltr"
                      >
                        {formatPrice(product.price)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <BuildSummary
              selected={selected}
              total={total}
              issues={issues}
              psu={psu}
              selectedCount={selectedCount}
              whatsapp={catalog.settings.whatsapp}
              onClearPart={clearPart}
              onReset={resetBuild}
            />
          </div>
        </aside>
      </div>

      <div className="h-24 lg:hidden" />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">{selectedCount} من {CATEGORY_ORDER.length} قطع</p>
            <p className="font-heading text-xl font-bold text-primary" dir="ltr">
              {formatPrice(total)}
            </p>
          </div>
          <Button size="lg" onClick={() => setSheetOpen(true)}>
            عرض التجميعة
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full bg-card sm:max-w-md">
          <SheetHeader className="px-4 pt-4">
            <SheetTitle>تجميعتك</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <BuildSummary
              selected={selected}
              total={total}
              issues={issues}
              psu={psu}
              selectedCount={selectedCount}
              whatsapp={catalog.settings.whatsapp}
              onClearPart={clearPart}
              onReset={resetBuild}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
