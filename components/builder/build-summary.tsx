"use client";

import { useState, type MouseEvent } from "react";
import { CheckCircle2, ChevronLeft, Copy, MessageCircle, Printer, RotateCcw, X, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  categoryHasSelection,
  getProductsForCategory,
  isMultiSelectCategory,
  type SelectedBuild,
} from "@/lib/build-selection-utils";
import {
  buildSummaryPlainText,
  copyBuildSpecs,
  isBuildComplete,
  isBuildReady,
  printBuildSpecs,
  productFullName,
} from "@/lib/build-specs";
import { formatPrice } from "@/lib/format";
import type { Category } from "@/lib/types";
import type { CompatIssue } from "@/lib/compatibility";
import { cn } from "@/lib/utils";

const TOTAL_PARTS = CATEGORY_ORDER.length;

function ClearIconButton({ onClick }: { onClick: (event: MouseEvent) => void }) {
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
  onRemoveProduct,
  onEditCategory,
  allowClear,
  embedded = false,
}: {
  selected: SelectedBuild;
  onClearPart?: (category: Category) => void;
  onRemoveProduct?: (category: Category, productId: string) => void;
  onEditCategory?: (category: Category) => void;
  allowClear: boolean;
  embedded?: boolean;
}) {
  return (
    <ul className={cn("space-y-2", embedded && "space-y-1.5")}>
      {CATEGORY_ORDER.map((key) => {
        const items = getProductsForCategory(selected, key);
        const meta = CATEGORY_META[key];
        const Icon = meta.icon;
        const multi = isMultiSelectCategory(key);

        return (
          <li key={key}>
            <button
              type="button"
              onClick={() => onEditCategory?.(key)}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 text-right transition hover:border-primary/25 hover:bg-muted/40",
                embedded ? "min-h-[3.75rem] px-3 py-2.5 active:bg-muted/60" : "px-3 py-2.5"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-primary">
                  <Icon className="size-3.5 shrink-0" />
                  {meta.label}
                  {multi && items.length > 0 ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {items.length}
                    </span>
                  ) : null}
                </p>
                {items.length > 0 ? (
                  multi ? (
                    <ul className="mt-1.5 space-y-1">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-start justify-between gap-2 text-sm font-semibold leading-6 text-foreground"
                        >
                          <span className="min-w-0 break-words">{productFullName(item)}</span>
                          {allowClear && onRemoveProduct ? (
                            <ClearIconButton
                              onClick={(event) => {
                                event.stopPropagation();
                                onRemoveProduct(key, item.id);
                              }}
                            />
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-0.5 text-sm font-semibold leading-6 text-foreground break-words">
                      {productFullName(items[0]!)}
                    </p>
                  )
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">اضغط للاختيار</p>
                )}
              </div>
              {allowClear && items.length > 0 && onClearPart && !multi && !embedded ? (
                <ClearIconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    onClearPart(key);
                  }}
                />
              ) : allowClear && items.length > 0 && onClearPart && multi && !embedded ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClearPart(key);
                  }}
                  className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  مسح
                </button>
              ) : embedded ? (
                <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  تعديل
                  <ChevronLeft className="size-3.5" />
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">تغيير</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type Props = {
  selected: SelectedBuild;
  total: number;
  issues: CompatIssue[];
  psu: number | null;
  selectedCount: number;
  whatsapp: string;
  onClearPart: (category: Category) => void;
  onRemoveProduct: (category: Category, productId: string) => void;
  onReset: () => void;
  onEditCategory: (category: Category) => void;
  embedded?: boolean;
};

export function BuildSummary({
  selected,
  total,
  issues,
  psu,
  selectedCount,
  whatsapp,
  onClearPart,
  onRemoveProduct,
  onReset,
  onEditCategory,
  embedded = false,
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
    <div className={embedded ? "pb-1" : "surface-card p-5"}>
      {!embedded ? (
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
      ) : (
        <div className="mb-2 flex items-center justify-end">
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onReset} disabled={empty}>
            <RotateCcw />
            مسح الكل
          </Button>
        </div>
      )}

      {isComplete ? (
        <>
          {!embedded ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
              <CheckCircle2 className="size-5 shrink-0 text-primary" />
              <p className="text-sm text-primary">
                {isReady
                  ? "اكتملت كل القطع — جاهزة للنسخ والطباعة"
                  : "اكتملت كل القطع — راجع التنبيهات قبل النسخ أو الطباعة"}
              </p>
            </div>
          ) : isReady ? (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="size-3.5 shrink-0" />
              التجميعة جاهزة للنسخ والطباعة
            </p>
          ) : (
            <p className="mb-2 text-xs text-destructive">راجع التنبيهات قبل النسخ أو الطباعة</p>
          )}

          <div className={embedded ? "mt-0" : "mt-4"}>
            <PartsList
              selected={selected}
              allowClear
              embedded={embedded}
              onClearPart={onClearPart}
              onRemoveProduct={onRemoveProduct}
              onEditCategory={onEditCategory}
            />
          </div>

          {!embedded ? (
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-4 text-center sm:px-5 sm:py-5">
              <p className="text-sm text-muted-foreground">السعر الإجمالي</p>
              <p className="mt-1 font-heading text-3xl font-bold text-primary sm:text-4xl" dir="ltr">
                {formatPrice(total)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">الأسعار بـ IQD — بدون أسعار فردية</p>
            </div>
          ) : null}

          <div className={cn("grid grid-cols-2 gap-2 sm:flex sm:flex-wrap", embedded ? "mt-3" : "mt-4")}>
            <Button
              variant="outline"
              size="default"
              className="min-h-11 sm:min-h-8 sm:w-auto"
              onClick={() => void handleCopy()}
              disabled={copying || !isReady}
            >
              <Copy />
              نسخ
            </Button>
            <Button
              variant="outline"
              size="default"
              className="min-h-11 sm:min-h-8 sm:w-auto"
              onClick={handlePrint}
              disabled={!isReady}
            >
              <Printer />
              طباعة
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className={embedded ? "mt-3" : "mt-4"}>
            <PartsList
              selected={selected}
              onClearPart={onClearPart}
              onRemoveProduct={onRemoveProduct}
              onEditCategory={onEditCategory}
              allowClear
              embedded={embedded}
            />
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
            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">القطع المختارة متوافقة لحد الآن.</p>
          ) : null}

          {psu && !categoryHasSelection(selected, "psu") ? (
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
              {!embedded ? (
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
              ) : selectedCount > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {selectedCount} من {TOTAL_PARTS} — أكمل الباقي للنسخ والطباعة
                </p>
              ) : null}
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
          className={cn(
            "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 sm:h-10",
            embedded ? "mt-3" : "mt-4"
          )}
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
