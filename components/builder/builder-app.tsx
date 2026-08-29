"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  RefreshCcw,
  Search,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand-mark";
import { BuildSummary } from "@/components/builder/build-summary";
import { CategoryTabs } from "@/components/builder/category-tabs";
import { ProductPickerCard } from "@/components/builder/product-picker-card";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  categoryHasSelection,
  filledCategoryCount,
  getProductsForCategory,
  getSelectionIds,
  isMultiSelectCategory,
  isProductSelected,
  removeCategorySelection,
  removeProductFromSelection,
  setCategoryIds,
} from "@/lib/build-selection-utils";
import {
  buildIssues,
  buildTotal,
  estimatePsuWattage,
  getSelectedProducts,
  incompatibilityReason,
} from "@/lib/compatibility";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { useBuildSelection } from "@/hooks/use-build-selection";
import { useCatalog } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

const EMPTY_PRODUCTS: Product[] = [];

export function BuilderApp() {
  const { catalog, error, loading, reload } = useCatalog();
  const [category, setCategory] = useState<Category>("cpu");
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const { selection, setSelection } = useBuildSelection(products);
  const selected = useMemo(
    () => getSelectedProducts(products, selection),
    [products, selection]
  );
  const total = buildTotal(selected);
  const issues = buildIssues(products, selection);
  const psu = estimatePsuWattage(selected);
  const selectedCount = filledCategoryCount(selected, CATEGORY_ORDER);
  const categoryProducts = getProductsForCategory(selected, category);
  const isMulti = isMultiSelectCategory(category);

  const visible = products.filter((item) => {
    if (item.category !== category) return false;
    if (!item.available) return false;
    const hay = `${item.brand} ${item.name} ${item.description}`.toLowerCase();
    return hay.includes(query.trim().toLowerCase());
  });

  function pick(product: Product) {
    if (product.stock <= 0) return;

    if (isMultiSelectCategory(product.category)) {
      const ids = getSelectionIds(selection, product.category);
      if (ids.includes(product.id)) {
        setSelection(removeProductFromSelection(selection, product.category, product.id));
        return;
      }
      if (incompatibilityReason(product, selected)) return;
      setSelection(setCategoryIds(selection, product.category, [...ids, product.id]));
      return;
    }

    if (selection[product.category] === product.id) {
      clearPart(product.category);
      return;
    }

    if (incompatibilityReason(product, selected)) return;

    const next = { ...selection, [product.category]: product.id };
    setSelection(next);

    const nextSelected = getSelectedProducts(products, next);
    const idx = CATEGORY_ORDER.indexOf(product.category);
    for (let i = idx + 1; i < CATEGORY_ORDER.length; i++) {
      const key = CATEGORY_ORDER[i];
      if (!categoryHasSelection(nextSelected, key)) {
        setCategory(key);
        setQuery("");
        break;
      }
    }
  }

  function goToCategory(key: Category) {
    setCategory(key);
    setQuery("");
    setSheetOpen(false);
    window.requestAnimationFrame(() => {
      document.getElementById("builder-picker")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function clearPart(key: Category) {
    setSelection(removeCategorySelection(selection, key));
  }

  function removeProduct(key: Category, productId: string) {
    setSelection(removeProductFromSelection(selection, key, productId));
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

  if (!catalog) {
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
    <div className="page-shell pb-28 lg:pb-6">
      {/* Mobile hero — compact */}
      <section className="surface-card overflow-hidden sm:hidden">
        <div className="flex items-center gap-3 p-4">
          <BrandMark className="size-12 shrink-0" size={96} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-primary">القزاز لخدمات الحاسبات</p>
            <h1 className="mt-0.5 font-heading text-lg font-bold leading-tight text-foreground">
              جهّز حاسبك بـ 8 خطوات
            </h1>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              اختر القطع والسعر يطلع مباشرة — تقدر تغيّر أي قطعة بأي وقت.
            </p>
          </div>
        </div>
      </section>

      {/* Desktop hero */}
      <section className="surface-card hidden overflow-hidden sm:block">
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
              اختَر المعالج، المذربورد، الرامات، كرت الشاشة، التخزين، الكولر، مزود الطاقة،
              والكيس. نراجع التوافق ونحسبلك السعر الإجمالي قبل لا تطلب.
            </p>
            {error ? (
              <div className="flex max-w-xl flex-wrap items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertTriangle className="size-4 shrink-0" />
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={() => void reload()}>
                  إعادة المحاولة
                </Button>
              </div>
            ) : null}
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

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="surface-card min-w-0 overflow-hidden p-3 sm:p-5" id="builder-picker">
          <div className="sticky top-14 z-20 -mx-3 border-b border-border bg-card/95 px-3 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
            <CategoryTabs
              category={category}
              selected={selected}
              onSelect={goToCategory}
            />
          </div>

          <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-0 sm:border-t sm:border-border sm:pt-5">
            <div className="flex items-center gap-2 text-foreground">
              <CategoryIcon className="size-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-semibold sm:text-xl">{meta.label}</h2>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground sm:hidden">
                  {meta.hint}
                </p>
              </div>
            </div>
            <p className="hidden max-w-xl text-sm leading-7 text-muted-foreground sm:block">
              {meta.hint}
            </p>
            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث بالموديل أو الشركة"
                className="h-11 bg-background pr-8 sm:h-10"
              />
            </div>
          </div>

          {categoryProducts.length > 0 ? (
            <div className="mt-3 space-y-2 sm:mt-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-primary">
                  {isMulti ? `المختار (${categoryProducts.length})` : "المختار"}
                </p>
                <Button variant="ghost" size="sm" className="shrink-0" onClick={() => clearPart(category)}>
                  {isMulti ? "مسح الكل" : "إلغاء"}
                </Button>
              </div>
              {isMulti ? (
                <ul className="space-y-1.5">
                  {categoryProducts.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm"
                    >
                      <span className="min-w-0 flex-1 font-semibold break-words">
                        {item.brand} {item.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="shrink-0"
                        onClick={() => removeProduct(category, item.id)}
                      >
                        إزالة
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm">
                  <span className="font-semibold break-words">
                    {categoryProducts[0]!.brand} {categoryProducts[0]!.name}
                  </span>
                </div>
              )}
              {isMulti ? (
                <p className="text-xs text-muted-foreground">
                  اضغط أي بطاقة لإضافة قطعة أخرى أو إزالتها.
                </p>
              ) : null}
            </div>
          ) : null}

          {visible.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground sm:mt-6 sm:py-14">
              ماكو قطع بهالتصنيف حالياً
              {query ? " مطابقة للبحث" : ""}. تقدر تضيف من لوحة التحكم.
            </div>
          ) : (
            <ul className="mt-4 grid gap-2 sm:gap-3">
              {visible.map((product) => {
                const chosen = isProductSelected(selection, product.category, product.id);
                const reason = incompatibilityReason(product, selected);
                const incompatible = Boolean(reason);
                const out = product.stock <= 0;

                return (
                  <ProductPickerCard
                    key={product.id}
                    product={product}
                    chosen={chosen}
                    incompatible={incompatible}
                    out={out}
                    reason={reason}
                    onPick={() => pick(product)}
                  />
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
              onRemoveProduct={removeProduct}
              onReset={resetBuild}
              onEditCategory={goToCategory}
            />
          </div>
        </aside>
      </div>

      <div
        className={cn(
          "mobile-safe-bottom fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-card/95 shadow-[0_-8px_24px_rgb(15_36_48_/8%)] backdrop-blur-md lg:hidden"
        )}
      >
        <div className="mx-auto max-w-7xl px-3 pt-2">
          {!sheetOpen ? (
            <div className="mb-2 flex items-center gap-1">
              {CATEGORY_ORDER.map((key) => (
                <span
                  key={key}
                  className={cn(
                    "h-1 flex-1 rounded-full",
                    categoryHasSelection(selected, key) ? "status-dot-done" : "bg-muted"
                  )}
                />
              ))}
            </div>
          ) : null}
          <div className="flex items-center gap-3 pb-1">
            <div className="min-w-0 shrink-0">
              <p className="text-[11px] text-muted-foreground">
                {sheetOpen ? "ملخص التجميعة" : `${selectedCount} من ${CATEGORY_ORDER.length} قطع`}
              </p>
              <p className="font-heading text-xl font-bold text-primary" dir="ltr">
                {formatPrice(total)}
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              variant={sheetOpen ? "outline" : "default"}
              className="relative z-10 h-11 flex-1 touch-manipulation text-base"
              onClick={() => setSheetOpen((open) => !open)}
            >
              {sheetOpen ? "إغلاق" : "عرض المواصفات"}
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex h-[min(82dvh,680px)] flex-col rounded-t-2xl border-t p-0 pb-24 lg:hidden"
        >
          <div className="shrink-0 border-b border-border px-4 pb-3 pt-2">
            <div
              className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/25"
              aria-hidden
            />
            <SheetHeader className="gap-1 p-0 text-center">
              <SheetTitle className="font-heading text-lg">مواصفات التجميعة</SheetTitle>
              <p className="text-xs text-muted-foreground">
                اضغط «تعديل» على أي قطعة للرجوع وتغييرها
              </p>
            </SheetHeader>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2">
            <BuildSummary
              embedded
              selected={selected}
              total={total}
              issues={issues}
              psu={psu}
              selectedCount={selectedCount}
              whatsapp={catalog.settings.whatsapp}
              onClearPart={clearPart}
              onRemoveProduct={removeProduct}
              onReset={resetBuild}
              onEditCategory={goToCategory}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
