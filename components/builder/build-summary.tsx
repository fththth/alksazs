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
      className="rounded-full p-1 text-zinc-500 hover:bg-white/8 hover:text-zinc-200"
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
  const lines = ["مرحبا، أريد تجميعة من القزاز للحاسبات:", ""];
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
    <div className="rounded-3xl border border-white/10 bg-[#12151e]/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.18em] text-amber-200/60">ملخص التجميعة</p>
          <h3 className="mt-1 font-heading text-xl font-semibold text-amber-50">
            جهازك قيد التجهيز
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} disabled={empty}>
          <RotateCcw />
          مسح
        </Button>
      </div>

      <ul className="mt-5 space-y-3">
        {CATEGORY_ORDER.map((key) => {
          const item = selected[key];
          const meta = CATEGORY_META[key];
          const Icon = meta.icon;
          return (
            <li
              key={key}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/6 bg-white/3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs text-zinc-400">
                  <Icon className="size-3.5" />
                  {meta.label}
                </p>
                {item ? (
                  <p className="mt-0.5 truncate text-sm text-amber-50">
                    {item.brand} {item.name}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-zinc-500">ما انختار بعد</p>
                )}
              </div>
              {item ? (
                <div className="flex shrink-0 items-center gap-1">
                  <span className="text-sm text-amber-200" dir="ltr">
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
        <div className="mt-4 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-3 text-sm text-rose-100">
          <p className="font-medium">تنبيه توافق</p>
          <ul className="mt-1 space-y-1 text-rose-100/80">
            {issues.map((issue) => (
              <li key={issue.id}>• {issue.message}</li>
            ))}
          </ul>
        </div>
      ) : selectedCount > 1 ? (
        <p className="mt-4 text-sm text-emerald-300">القطع المختارة متوافقة لحد الآن.</p>
      ) : null}

      {psu ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-zinc-400">
          <Zap className="size-4 text-amber-300" />
          يفضّل مزود طاقة حوالي {psu} واط
        </p>
      ) : null}

      {empty ? (
        <p className="mt-5 rounded-xl border border-dashed border-white/12 px-3 py-4 text-sm leading-7 text-zinc-400">
          ابدأ بالمعالج، وبعدها المذربود. السعر الإجمالي يظهر هنا كل ما تضيف قطعة.
        </p>
      ) : null}

      <div className="mt-5 border-t border-white/8 pt-4">
        <div className="flex items-end justify-between">
          <span className="text-sm text-zinc-400">السعر الإجمالي</span>
          <span className="font-heading text-3xl font-bold text-amber-200" dir="ltr">
            {formatPrice(total)}
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-500">
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
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-emerald-500/90 text-sm font-medium text-emerald-950 hover:bg-emerald-400"
        >
          <MessageCircle className="size-4" />
          اطلب التجميعة واتساب
        </a>
      ) : (
        <p className="mt-4 text-center text-xs leading-6 text-zinc-500">
          رقم الواتساب يُضاف من لوحة التحكم حتى يقدر الزبون يطلب التجميعة.
        </p>
      )}
    </div>
  );
}
