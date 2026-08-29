"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { BuildSummary } from "@/components/builder/build-summary";
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

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-amber-300" />
        <p>قاعدين نجهّز القطع...</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <AlertTriangle className="size-10 text-amber-300" />
        <p className="text-lg text-amber-50">{error ?? "صار خطأ غير متوقع."}</p>
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
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <section className="relative overflow-hidden rounded-3xl border border-amber-200/10 bg-[linear-gradient(135deg,rgba(212,160,23,0.14),rgba(12,14,22,0.4)_42%,rgba(56,89,160,0.12))] px-5 py-8 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-10 top-0 size-56 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-8 bottom-0 size-48 rounded-full bg-sky-500/10 blur-3xl" />
        <p className="text-sm font-medium tracking-[0.2em] text-amber-200/70">
          القزاز للحاسبات
        </p>
        <h1 className="mt-3 max-w-2xl font-heading text-3xl font-bold leading-tight text-amber-50 sm:text-5xl">
          جهّز حاسبك قطعة قطعة، والسعر يطلع لك مباشرة.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-8 text-zinc-300">
          اختَر المعالج، المذربود، الرامات، كرت الشاشة، التخزين، الكولر، والكيس.
          نراجع التوافق ونحسبلك السعر الإجمالي قبل لا تطلب.
        </p>
        {catalog.settings.shopNote ? (
          <p className="mt-5 max-w-xl text-sm text-amber-100/70">
            {catalog.settings.shopNote}
          </p>
        ) : null}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                    active
                      ? "border-amber-300/40 bg-amber-300/15 text-amber-50"
                      : "border-white/8 bg-white/3 text-zinc-300 hover:border-white/16 hover:bg-white/6"
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                  {chosen ? (
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-100">
                <CategoryIcon className="size-5" />
                <h2 className="font-heading text-2xl font-semibold">{meta.label}</h2>
              </div>
              <p className="mt-1 max-w-xl text-sm leading-7 text-zinc-400">
                {meta.hint}
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالموديل أو الشركة"
                className="h-10 bg-white/4 pr-8"
              />
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-white/12 bg-white/3 px-6 py-16 text-center text-zinc-400">
              ماكو قطع بهالتصنيف حالياً
              {query ? " مطابقة للبحث" : ""}. تقدر تضيف من لوحة التحكم.
            </div>
          ) : (
            <ul className="mt-6 grid gap-3">
              {visible.map((product) => {
                const chosen = selection[product.category] === product.id;
                const reason = incompatibilityReason(product, selected);
                const out = product.stock <= 0;
                return (
                  <li key={product.id}>
                    <button
                      type="button"
                      disabled={out}
                      onClick={() => pick(product)}
                      className={cn(
                        "flex w-full flex-col gap-3 rounded-2xl border p-4 text-right transition sm:flex-row sm:items-center sm:justify-between",
                        chosen
                          ? "border-amber-300/50 bg-amber-300/10"
                          : "border-white/8 bg-white/3 hover:border-amber-200/25 hover:bg-white/6",
                        out && "opacity-50"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-heading text-base font-semibold text-amber-50">
                            {product.brand} {product.name}
                          </p>
                          {chosen ? (
                            <Badge className="bg-emerald-400/20 text-emerald-200">
                              <Check />
                              مختار
                            </Badge>
                          ) : null}
                          {reason ? (
                            <Badge variant="destructive">
                              <AlertTriangle />
                              تعارض
                            </Badge>
                          ) : null}
                          {out ? <Badge variant="outline">نفد</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm leading-7 text-zinc-400">
                          {product.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-500">
                          {product.specs.socket ? (
                            <span>سوكت {product.specs.socket}</span>
                          ) : null}
                          {product.specs.ramType ? (
                            <span>{product.specs.ramType}</span>
                          ) : null}
                          {product.specs.formFactor ? (
                            <span>{product.specs.formFactor}</span>
                          ) : null}
                          {product.specs.capacity ? (
                            <span>{product.specs.capacity}</span>
                          ) : null}
                          {product.specs.speed ? <span>{product.specs.speed}</span> : null}
                          <span>{formatStock(product.stock)}</span>
                        </div>
                        {reason ? (
                          <p className="mt-2 text-xs text-rose-300">{reason}</p>
                        ) : null}
                      </div>
                      <p
                        className="shrink-0 font-heading text-xl font-bold text-amber-200"
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

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#0b0d14]/90 p-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs text-zinc-400">
              {selectedCount} من ٧ قطع
            </p>
            <p className="font-heading text-xl font-bold text-amber-200" dir="ltr">
              {formatPrice(total)}
            </p>
          </div>
          <Button size="lg" onClick={() => setSheetOpen(true)}>
            عرض التجميعة
          </Button>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-full bg-[#12141c] sm:max-w-md">
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
