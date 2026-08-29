"use client";

import { useState } from "react";
import { CheckCircle2, Copy, MessageCircle, Printer, RotateCcw, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  buildSummaryPlainText,
  copyBuildSpecs,
  isBuildComplete,
  isBuildReady,
  printBuildSpecs,
  productFullName,
} from "@/lib/build-specs";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import type { CompatIssue } from "@/lib/compatibility";

const TOTAL_PARTS = CATEGORY_ORDER.length;

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

function PartsList({
  selected,
  onClearPart,
  allowClear,
}: {
  selected: Partial<Record<Category, Product>>;
  onClearPart?: (category: Category) => void;
  allowClear: boolean;
}) {
  return (
    <ul className="space-y-2">
      {CATEGORY_ORDER.map((key) => {
        const item = selected[key];
        const meta = CATEGORY_META[key];
        const Icon = meta.icon;

        return (
          <li
            key={key}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2.5"
          >
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                <Icon className="size-3.5 shrink-0" />
                {meta.label}
              </p>
              {item ? (
                <p className="mt-0.5 text-sm font-semibold leading-6 text-foreground break-words">
                  {productFullName(item)}
                </p>
              ) : (
                <p className="mt-0.5 text-sm text-muted-foreground">ما انختار بعد</p>
              )}
            </div>
            {allowClear && item && onClearPart ? (
              <ClearIconButton onClick={() => onClearPart(key)} />
            ) : null}
          </li>
        );
      })}
    </ul>
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
  const isComplete = isBuildComplete(selected);
  const isReady = isBuildReady(selected, issues);
  const waNumber = whatsapp.replace(/[^\d]/g, "");
  const exportInput = { selected, total, psu, issues };

  async function handleCopy() {
    if (!isComplete) {
      toast.error("أكمل اختيار كل القطع قبل النسخ");
      return;
    }
    if (!isReady) {
      toast.error("صلّح مشاكل التوافق أو المخزون قبل النسخ");
      return;
    }
    setCopying(true);
    try {
      await copyBuildSpecs(exportInput);
      toast.success("اننسخت المواصفات");
    } catch {
      toast.error("ما قدرنا ننسخ المواصفات. جرّب مرة ثانية.");
    } finally {
      setCopying(false);
    }
  }

  function handlePrint() {
    if (!isComplete) {
      toast.error("أكمل اختيار كل القطع قبل الطباعة");
      return;
    }
    if (!isReady) {
      toast.error("صلّح مشاكل التوافق أو المخزون قبل الطباعة");
      return;
    }
    const opened = printBuildSpecs(exportInput);
    if (opened) {
      toast.success("جاري فتح نافذة الطباعة…");
    } else {
      toast.error("تعذّر فتح الطباعة. جرّب مرة ثانية.");
    }
  }

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary">ملخص التجميعة</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            {isComplete ? "التجميعة جاهزة" : "مواصفات الجهاز"}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={empty}>
          <RotateCcw />
          مسح
        </Button>
      </div>

      {isComplete ? (
        <>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
            <CheckCircle2 className="size-5 shrink-0 text-primary" />
            <p className="text-sm text-primary">
              {isReady
                ? "اكتملت كل القطع — جاهزة للنسخ والطباعة"
                : "اكتملت كل القطع — راجع التنبيهات قبل النسخ أو الطباعة"}
            </p>
          </div>

          <div className="mt-4">
            <PartsList selected={selected} allowClear={false} />
          </div>

          <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-5 text-center">
            <p className="text-sm text-muted-foreground">السعر الإجمالي</p>
            <p className="mt-1 font-heading text-4xl font-bold text-primary" dir="ltr">
              {formatPrice(total)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">الأسعار بـ IQD — بدون أسعار فردية</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleCopy()}
              disabled={copying || !isReady}
            >
              <Copy />
              نسخ
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} disabled={!isReady}>
              <Printer />
              طباعة
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mt-4">
            <PartsList selected={selected} onClearPart={onClearPart} allowClear />
          </div>

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

          {psu && !selected.psu ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="size-4 text-primary" />
              يفضّل مزود طاقة حوالي {psu} واط على الأقل
            </p>
          ) : null}

          {empty ? (
            <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-3 py-3 text-sm leading-7 text-muted-foreground">
              ابدأ بالمعالج، وبعدها المذربورد. لما تكمل كل القطع ({TOTAL_PARTS}) تظهر الأسماء
              الكاملة مع السعر الإجمالي وتقدر تنسخ أو تطبع.
            </p>
          ) : (
            <>
              <div className="mt-5 border-t border-border pt-4">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-muted-foreground">السعر الإجمالي</span>
                  <span className="font-heading text-2xl font-bold text-primary" dir="ltr">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedCount} من {TOTAL_PARTS} — أكمل الباقي للنسخ والطباعة
                </p>
              </div>

              <p className="mt-3 rounded-lg bg-muted/40 px-3 py-2.5 text-xs leading-6 text-muted-foreground">
                النسخ والطباعة يتفعلون بعد اختيار جميع القطع ({TOTAL_PARTS}/{TOTAL_PARTS}).
              </p>
            </>
          )}
        </>
      )}

      {isComplete && issues.length > 0 ? (
        <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive">
          <p className="font-medium">تنبيه توافق</p>
          <ul className="mt-1 space-y-1 opacity-90">
            {issues.map((issue) => (
              <li key={issue.id}>• {issue.message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {waNumber ? (
        <a
          href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
            buildSummaryPlainText({ selected, total, psu, issues })
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
