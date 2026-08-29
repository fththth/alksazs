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
import type { Category, Product, ShopSettings } from "@/lib/types";
import { ProductForm, emptyProduct } from "@/components/dashboard/product-form";
import { useCatalog } from "@/hooks/use-catalog";

const EMPTY_PRODUCTS: Product[] = [];
const DEFAULT_SETTINGS: ShopSettings = { whatsapp: "", shopNote: "" };

export function DashboardApp() {
  const { catalog, error, loading, reload } = useCatalog();
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
      toast.success(isNew ? "انضافت القطعة" : "تم حفظ التعديل");
      setEditor(null);
      await reload();
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
      toast.success("انمسحت القطعة من المخزون");
      setDeleteId(null);
      await reload();
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
      toast.success("انحفظت إعدادات المحل");
      setDraftSettings(null);
      await reload();
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
      toast.success("رجعنا الكتالوج الأساسي");
      setRestoreOpen(false);
      setDraftSettings(null);
      await reload();
    } catch {
      toast.error("فشل استرجاع الكتالوج.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-amber-300" />
        <p>نجهّز لوحة التحكم...</p>
      </div>
    );
  }

  if (error || !catalog) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <AlertTriangle className="size-10 text-amber-300" />
        <p className="text-lg text-amber-50">{error}</p>
        <Button onClick={() => void reload()}>
          <RefreshCcw />
          إعادة المحاولة
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs tracking-[0.2em] text-amber-200/60">لوحة التحكم</p>
          <h1 className="mt-1 font-heading text-3xl font-bold text-amber-50">
            مخزون القزاز
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-7 text-zinc-400">
            أضف القطع، عدّل الأسعار، وحدد المتوفر. الزبون يشوف التحديث على صفحة التجميعة مباشرة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setRestoreOpen(true)}>
            <RefreshCcw />
            استرجاع الكتالوج
          </Button>
          <Button
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

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/3 p-5">
        <h2 className="font-heading text-lg font-semibold text-amber-50">إعدادات المحل</h2>
        <p className="mt-1 text-sm text-zinc-400">
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
          <Button onClick={() => void saveSettings()} disabled={saving}>
            حفظ الإعدادات
          </Button>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-[#12151e]/80 p-4 sm:p-5">
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
            <Search className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-zinc-500" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="بحث في المخزون"
              className="h-10 bg-white/4 pr-8"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/12 px-6 py-16 text-center text-zinc-400">
            ماكو نتائج. جرّب تصنيف ثاني أو أضف قطعة جديدة.
          </div>
        ) : (
          <div className="mt-4">
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
                      <p className="font-medium text-amber-50">
                        {product.brand} {product.name}
                      </p>
                      <p className="max-w-md truncate text-xs text-zinc-500">
                        {product.description}
                      </p>
                    </TableCell>
                    <TableCell>{CATEGORY_META[product.category].label}</TableCell>
                    <TableCell dir="ltr">{formatPrice(product.price)}</TableCell>
                    <TableCell>{formatStock(product.stock)}</TableCell>
                    <TableCell>
                      {product.available && product.stock > 0 ? (
                        <Badge className="bg-emerald-400/15 text-emerald-200">معروض</Badge>
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
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
      <div className="flex items-center gap-2 text-sm text-zinc-400">
        <Icon className="size-4 text-amber-300" />
        {label}
      </div>
      <p
        className="mt-2 font-heading text-2xl font-bold text-amber-50"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{hint}</p>
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
      className={
        active
          ? "shrink-0 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-1.5 text-sm text-amber-50"
          : "shrink-0 rounded-full border border-white/8 bg-white/3 px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/6"
      }
    >
      {label}
    </button>
  );
}
