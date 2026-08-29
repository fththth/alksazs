"use client";

import { useEffect, useRef } from "react";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import {
  categoryHasSelection,
  filledCategoryCount,
  type SelectedBuild,
} from "@/lib/build-selection-utils";
import type { Category } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  category: Category;
  selected: SelectedBuild;
  onSelect: (category: Category) => void;
};

export function CategoryTabs({ category, selected, onSelect }: Props) {
  const doneCount = filledCategoryCount(selected, CATEGORY_ORDER);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [category]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>خطوات التجميعة</span>
        <span className="font-medium text-primary">
          {doneCount}/{CATEGORY_ORDER.length}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {CATEGORY_ORDER.map((key) => {
          const done = categoryHasSelection(selected, key);
          const active = category === key;
          return (
            <button
              key={key}
              type="button"
              title={CATEGORY_META[key].label}
              onClick={() => onSelect(key)}
              className={cn(
                "h-1.5 flex-1 rounded-full transition",
                done ? "bg-emerald-500" : active ? "bg-primary" : "bg-muted"
              )}
            />
          );
        })}
      </div>

      {/* Mobile: horizontal scroll with large touch targets */}
      <div
        ref={scrollRef}
        className="flex flex-nowrap gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden"
      >
        {CATEGORY_ORDER.map((key) => {
          const item = CATEGORY_META[key];
          const Icon = item.icon;
          const chosen = categoryHasSelection(selected, key);
          const active = category === key;

          return (
            <button
              key={key}
              ref={active ? activeRef : undefined}
              type="button"
              onClick={() => onSelect(key)}
              className={cn(
                "flex min-h-[4.25rem] w-[4.75rem] shrink-0 snap-start flex-col items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[10px] font-medium transition",
                active ? "chip-active shadow-sm" : "chip-idle",
                chosen && !active ? "border-emerald-200/80 bg-emerald-50/50" : null
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="leading-tight">{item.tabLabel}</span>
              {chosen ? <span className="size-1.5 rounded-full bg-emerald-500" /> : null}
            </button>
          );
        })}
      </div>

      {/* Desktop: compact grid */}
      <div className="hidden gap-1 md:grid md:grid-cols-8">
        {CATEGORY_ORDER.map((key) => {
          const item = CATEGORY_META[key];
          const Icon = item.icon;
          const chosen = categoryHasSelection(selected, key);
          const active = category === key;

          return (
            <button
              key={key}
              type="button"
              title={item.label}
              aria-pressed={active}
              onClick={() => onSelect(key)}
              className={cn(
                "flex min-h-9 min-w-0 cursor-pointer items-center justify-center gap-1 rounded-full border px-1.5 py-2 text-[11px] leading-tight transition sm:px-2 sm:text-xs",
                active ? "chip-active" : "chip-idle"
              )}
            >
              <Icon className="size-3 shrink-0" />
              <span className="truncate">{item.tabLabel}</span>
              {chosen ? <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
