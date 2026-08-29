"use client";

import { MessageCircle, RotateCcw, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
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
  const lines = ["مرحبا، أريد تجميعة من القزاز لخدمات الحاسبات:", ""];
  for (const key of CATEGORY_ORDER) {
    const item = selected[key];
    const label = CATEGORY_META[key].label;
    lines.push(
      item
        ? `• ${label}: ${item.brand} ${item.name} — ${formatPrice(item.price)}`
        : `• ${label}: لم يُختر`
    );
  }
  lines.push("", `السعر الإجمالي: ${formatPrice(total)}`);
  return lines.join("\n");
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
  const empty = selectedCount === 0;
  const waNumber = whatsapp.replace(/[^\d]/g, "");

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-primary">ملخص التجميعة</p>
          <h3 className="mt-1 font-heading text-lg font-semibold text-foreground">
            جهازك قيد التجهيز
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={empty}>
          <RotateCcw />
          مسح
        </Button>
      </div>

      <ul className="mt-4 space-y-2">
        {CATEGORY_ORDER.map((key) => {
          const item = selected[key];
          const meta = CATEGORY_META[key];
          const Icon = meta.icon;
          return (
            <li
              key={key}
              className="flex items-start justify-between gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="size-3.5" />
                  {meta.label}
                </p>
                {item ? (
                  <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                    {item.brand} {item.name}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-muted-foreground">ما انختار بعد</p>
                )}
              </div>
              {item ? (
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm font-medium text-primary" dir="ltr">
                    {formatPrice(item.price)}
                  </span>
                  <ClearIconButton onClick={() => onClearPart(key)} />
                </div>
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
          ابدأ بالمعالج، وبعدها المذربود. السعر الإجمالي يظهر هنا كل ما تضيف قطعة.
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
