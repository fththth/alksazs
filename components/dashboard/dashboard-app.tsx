"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { formatPrice, formatStock } from "@/lib/format";
import type { Catalog, Category, Product, ShopSettings } from "@/lib/types";
import { ProductForm, emptyProduct } from "@/components/dashboard/product-form";
import { useCatalog } from "@/hooks/use-catalog";
import { cn } from "@/lib/utils";

const EMPTY_PRODUCTS: Product[] = [];
const DEFAULT_SETTINGS: ShopSettings = { whatsapp: "", shopNote: "" };

export function DashboardApp() {
  const {
    catalog,
    error,
    loading,
    reload,
    setCatalog,
    upsertProductLocal,
    removeProductLocal,
    updateSettingsLocal,
  } = useCatalog();
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [editor, setEditor] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [draftSettings, setDraftSettings] = useState<ShopSettings | null>(null);

  const products = catalog?.products ?? EMPTY_PRODUCTS;
  const settings = draftSettings ?? catalog?.settings ?? DEFAULT_SETTINGS;

  const visible = useMemo(() => {
    return products.filter((item) => {
      if (filter !== "all" && item.category !== filter) return false;
      const hay = `${item.brand} ${item.name} ${item.description}`.toLowerCase();
      return hay.includes(query.trim().toLowerCase());
    });
  }, [filter, products, query]);

  const stats = useMemo(() => {
    const available = products.filter((item) => item.available && item.stock > 0);
    const value = products.reduce((sum, item) => sum + item.price * item.stock, 0);
    const low = products.filter((item) => item.stock <= 2).length;
    return { count: products.length, available: available.length, value, low };
  }, [products]);

  async function saveProduct(product: Product) {
    setSaving(true);
    try {
      const response = await fetch(
        isNew ? "/api/catalog" : `/api/catalog/${product.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isNew ? { product } : product),
        }
      );
      if (!response.ok) throw new Error("save failed");
      const saved = (await response.json()) as Product;
      toast.success(isNew ? "انضافت القطعة" : "تم حفظ التعديل");
      setEditor(null);
      upsertProductLocal(saved);
    } catch {
      toast.error("ما انحفظت القطعة. جرّب مرة ثانية.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/catalog/${deleteId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete failed");
      const id = deleteId;
      toast.success("انمسحت القطعة من المخزون");
      setDeleteId(null);
      removeProductLocal(id);
    } catch {
      toast.error("ما قدرنا نمسح القطعة.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const response = await fetch("/api/catalog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error("settings failed");
      const saved = (await response.json()) as ShopSettings;
      toast.success("انحفظت إعدادات المحل");
      setDraftSettings(null);
      updateSettingsLocal(saved);
    } catch {
      toast.error("ما انحفظت الإعدادات.");
    } finally {
      setSaving(false);
    }
  }

  async function restore() {
    setSaving(true);
    try {
      const response = await fetch("/api/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!response.ok) throw new Error("restore failed");
      const restored = (await response.json()) as Catalog;
      toast.success("رجعنا الكتالوج الأساسي");
      setRestoreOpen(false);
      setDraftSettings(null);
      setCatalog(restored);
    } catch {
      toast.error("فشل استرجاع الكتالوج.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !catalog) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p>نجهّز لوحة التحكم...</p>
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

  return (
    <div className="page-shell">
      {error ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="size-4 shrink-0" />
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => void reload()}>
            إعادة المحاولة
          </Button>
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium text-primary">لوحة التحكم</p>
          <h1 className="mt-1 font-heading text-xl font-bold text-foreground sm:text-3xl">
            مخزون القزاز
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-muted-foreground">
            أضف القطع، عدّل الأسعار، وحدد المتوفر. الزبون يشوف التحديث على صفحة التجميعة مباشرة.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          <Button variant="outline" className="min-h-10 sm:min-h-8" onClick={() => setRestoreOpen(true)}>
            <RefreshCcw />
            <span className="hidden sm:inline">استرجاع الكتالوج</span>
            <span className="sm:hidden">استرجاع</span>
          </Button>
          <Button
            className="min-h-10 sm:min-h-8"
            onClick={() => {
              setIsNew(true);
              setEditor(emptyProduct("cpu"));
            }}
          >
            <Plus />
            قطعة جديدة
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={Package}
          label="القطع بالمخزون"
          value={String(stats.count)}
          hint={`${stats.available} متاحة للبيع`}
        />
        <StatCard
          icon={Wallet}
          label="قيمة المخزون"
          value={formatPrice(stats.value)}
          hint="سعر × الكمية"
          ltr
        />
        <StatCard
          icon={AlertTriangle}
          label="قرب تخلص"
          value={String(stats.low)}
          hint="قطعتان أو أقل"
        />
      </div>

      <section className="surface-card mt-6 p-5">
        <h2 className="font-heading text-lg font-semibold text-foreground">إعدادات المحل</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          رقم الواتساب يظهر زر الطلب للزبون. اكتب الرقم مع مفتاح الدولة بدون +.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)_auto] md:items-end">
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">واتساب</Label>
            <Input
              id="whatsapp"
              dir="ltr"
              placeholder="9647XXXXXXXX"
              value={settings.whatsapp}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...(current ?? settings),
                  whatsapp: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">ملاحظة تظهر للزبون</Label>
            <Input
              id="note"
              value={settings.shopNote}
              onChange={(event) =>
                setDraftSettings((current) => ({
                  ...(current ?? settings),
                  shopNote: event.target.value,
                }))
              }
            />
          </div>
          <Button onClick={() => void saveSettings()} disabled={saving} className="min-h-10 md:min-h-8">
            حفظ الإعدادات
          </Button>
        </div>
      </section>

      <section className="surface-card mt-6 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <FilterChip
              active={filter === "all"}
              onClick={() => setFilter("all")}
              label="الكل"
            />
            {CATEGORY_ORDER.map((key) => (
              <FilterChip
                key={key}
                active={filter === key}
                onClick={() => setFilter(key)}
                label={CATEGORY_META[key].label}
              />
            ))}
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث في المخزون"
              className="h-10 bg-background pr-8"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-muted-foreground">
            ماكو نتائج. جرّب تصنيف ثاني أو أضف قطعة جديدة.
          </div>
        ) : (
          <>
            <ul className="mt-4 space-y-3 md:hidden">
              {visible.map((product) => (
                <li
                  key={product.id}
                  className="rounded-xl border border-border bg-background p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium leading-snug text-foreground">
                        {product.brand} {product.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    </div>
                    {product.available && product.stock > 0 ? (
                      <Badge className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-700">
                        معروض
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        مخفي
                      </Badge>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted px-2 py-0.5">
                      {CATEGORY_META[product.category].label}
                    </span>
                    <span dir="ltr" className="font-semibold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <span>{formatStock(product.stock)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="min-h-10"
                      onClick={() => {
                        setIsNew(false);
                        setEditor(product);
                      }}
                    >
                      <Pencil />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      className="min-h-10 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(product.id)}
                    >
                      <Trash2 />
                      مسح
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 hidden md:block">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">القطعة</TableHead>
                  <TableHead className="text-right">التصنيف</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">المخزون</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right"> </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <p className="font-medium text-foreground">
                        {product.brand} {product.name}
                      </p>
                      <p className="max-w-md truncate text-xs text-muted-foreground">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>{CATEGORY_META[product.category].label}</TableCell>
                    <TableCell dir="ltr">{formatPrice(product.price)}</TableCell>
                    <TableCell>{formatStock(product.stock)}</TableCell>
                    <TableCell>
                      {product.available && product.stock > 0 ? (
                        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">معروض</Badge>
                      ) : (
                        <Badge variant="outline">مخفي</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            setIsNew(false);
                            setEditor(product);
                          }}
                        >
                          <Pencil />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </>
        )}
      </section>

      <Dialog open={Boolean(editor)} onOpenChange={(open) => !open && setEditor(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>{isNew ? "قطعة جديدة" : "تعديل قطعة"}</DialogTitle>
            <DialogDescription>
            السعر بـ IQD. الزبون يشوف القطعة إذا كانت متاحة وفيها مخزون.
            </DialogDescription>
          </DialogHeader>
          {editor ? (
            <ProductForm
              product={editor}
              onChange={setEditor}
              onSubmit={() => void saveProduct(editor)}
              saving={saving}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>مسح القطعة؟</DialogTitle>
            <DialogDescription>
              راح تختفي من صفحة التجميعة ومن المخزون. هذا الإجراء ما ينتراجع إلا باسترجاع الكتالوج.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              إلغاء
            </Button>
            <Button variant="destructive" onClick={() => void confirmDelete()} disabled={saving}>
              مسح
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>استرجاع الكتالوج الأساسي؟</DialogTitle>
            <DialogDescription>
              راح نرجع القطع التجريبية ونلغي تعديلاتك الحالية على المخزون.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={() => void restore()} disabled={saving}>
              استرجاع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  ltr,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  hint: string;
  ltr?: boolean;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-4 text-primary" />
        </span>
        {label}
      </div>
      <p
        className="mt-3 font-heading text-2xl font-bold text-foreground"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("chip", active ? "chip-active" : "chip-idle")}
    >
      {label}
    </button>
  );
}
