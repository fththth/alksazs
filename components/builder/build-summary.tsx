"use client";

import { useState } from "react";
import { Copy, MessageCircle, Printer, RotateCcw, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  buildSpecsPlainText,
  copyBuildSpecs,
  printBuildSpecs,
  productFullName,
  productSpecEntries,
} from "@/lib/build-specs";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import type { CompatIssue } from "@/lib/compatibility";

function ClearIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      aria-label="إزالة القطعة"
    >
      <X className="size-3.5" />
    </button>
  );
}

type Props = {
  selected: Partial<Record<Category, Product>>;
  total: number;
  issues: CompatIssue[];
  psu: number | null;
  selectedCount: number;
  whatsapp: string;
  onClearPart: (category: Category) => void;
  onReset: () => void;
};

function buildWhatsappText(selected: Partial<Record<Category, Product>>, total: number) {
  return buildSpecsPlainText({ selected, total, psu: null, issues: [] });
}

export function BuildSummary({
  selected,
  total,
  issues,
  psu,
  selectedCount,
  whatsapp,
  onClearPart,
  onReset,
}: Props) {
  const [copying, setCopying] = useState(false);
  const empty = selectedCount === 0;
  const waNumber = whatsapp.replace(/[^\d]/g, "");
  const exportInput = { selected, total, psu, issues };

  async function handleCopy() {
    if (empty) return;
    setCopying(true);
    try {
      await copyBuildSpecs(exportInput);
      toast.success("اننسخت المواصفات الكاملة");
    } catch {
      toast.error("ما قدرنا ننسخ المواصفات. جرّب مرة ثانية.");
    } finally {
      setCopying(false);
    }
  }

  function handlePrint() {
    if (empty) return;
    const opened = printBuildSpecs(exportInput);
    if (!opened) {
      toast.error("الطباعة محظورة. اسمح بالنوافذ المنبثقة وجرب مرة ثانية.");
    }
  }

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary">ملخص التجميعة</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            مواصفات الجهاز
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={empty}>
          <RotateCcw />
          مسح
        </Button>
      </div>

      {!empty ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => void handleCopy()} disabled={copying}>
            <Copy />
            نسخ المواصفات
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer />
            طباعة
          </Button>
        </div>
      ) : null}

      <ul className="mt-4 space-y-3">
        {CATEGORY_ORDER.map((key) => {
          const item = selected[key];
          const meta = CATEGORY_META[key];
          const Icon = meta.icon;
          const specs = item ? productSpecEntries(item) : [];

          return (
            <li
              key={key}
              className="rounded-xl border border-border bg-muted/20 px-3 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <Icon className="size-3.5" />
                    {meta.label}
                  </p>
                  {item ? (
                    <>
                      <p className="mt-1 text-sm font-semibold leading-6 text-foreground break-words">
                        {productFullName(item)}
                      </p>
                      {item.description ? (
                        <p className="mt-1 text-xs leading-6 text-muted-foreground">
                          {item.description}
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-1 text-sm text-muted-foreground">ما انختار بعد</p>
                  )}
                </div>
                {item ? (
                  <div className="flex shrink-0 items-start gap-1">
                    <span className="text-sm font-bold text-primary" dir="ltr">
                      {formatPrice(item.price)}
                    </span>
                    <ClearIconButton onClick={() => onClearPart(key)} />
                  </div>
                ) : null}
              </div>

              {item && specs.length > 0 ? (
                <dl className="mt-3 grid grid-cols-2 gap-2">
                  {specs.map((spec) => (
                    <div
                      key={`${key}-${spec.label}`}
                      className="rounded-lg bg-background px-2.5 py-1.5 text-xs"
                    >
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="mt-0.5 font-medium text-foreground">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          );
        })}
      </ul>

      {issues.length > 0 ? (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive">
          <p className="font-medium">تنبيه توافق</p>
          <ul className="mt-1 space-y-1 opacity-90">
            {issues.map((issue) => (
              <li key={issue.id}>• {issue.message}</li>
            ))}
          </ul>
        </div>
      ) : selectedCount > 1 ? (
        <p className="mt-4 text-sm text-emerald-700">القطع المختارة متوافقة لحد الآن.</p>
      ) : null}

      {psu ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Zap className="size-4 text-primary" />
          يفضّل مزود طاقة حوالي {psu} واط
        </p>
      ) : null}

      {empty ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-sm leading-7 text-muted-foreground">
          ابدأ بالمعالج، وبعدها المذربود. المواصفات الكاملة تظهر هنا مع إمكانية النسخ والطباعة.
        </p>
      ) : null}

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-muted-foreground">السعر الإجمالي</span>
          <span className="font-heading text-2xl font-bold text-primary" dir="ltr">
            {formatPrice(total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {selectedCount} من ٧ قطع — الأسعار بـ IQD
        </p>
      </div>

      {waNumber ? (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
            buildWhatsappText(selected, total)
          )}`}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <MessageCircle className="size-4" />
          اطلب التجميعة واتساب
        </a>
      ) : (
        <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
          رقم الواتساب يُضاف من لوحة التحكم حتى يقدر الزبون يطلب التجميعة.
        </p>
      )}
    </div>
  );
}
