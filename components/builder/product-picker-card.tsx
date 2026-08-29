"use client";

import { Check, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatStock } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

type Props = {
  product: Product;
  chosen: boolean;
  incompatible: boolean;
  out: boolean;
  reason: string | null;
  onPick: () => void;
};

function specChips(product: Product) {
  const chips: string[] = [];
  if (product.specs.socket) chips.push(product.specs.socket);
  if (product.specs.ramType) chips.push(product.specs.ramType);
  if (product.specs.formFactor) chips.push(product.specs.formFactor);
  if (product.specs.capacity) chips.push(product.specs.capacity);
  if (product.specs.wattage) chips.push(`${product.specs.wattage}W`);
  return chips;
}

export function ProductPickerCard({
  product,
  chosen,
  incompatible,
  out,
  reason,
  onPick,
}: Props) {
  const blocked = out || incompatible;
  const chips = specChips(product);

  return (
    <li>
      <div
        className={cn(
          "rounded-xl border p-3 transition sm:p-4",
          chosen && !incompatible
            ? "border-primary/40 bg-primary/5"
            : incompatible
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-background"
        )}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <p
              className={cn(
                "font-heading text-sm font-semibold leading-snug sm:text-base",
                incompatible ? "text-destructive" : "text-foreground"
              )}
            >
              {product.brand} {product.name}
            </p>
            {chosen && !incompatible ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                <Check className="size-3" />
                مختار
              </Badge>
            ) : null}
            {out ? <Badge variant="outline">نفد</Badge> : null}
            {incompatible ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="size-3" />
                غير متوافق
              </Badge>
            ) : null}
          </div>

          {chips.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
              <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                {formatStock(product.stock)}
              </span>
            </div>
          ) : null}

          {reason ? <p className="mt-2 text-xs leading-5 text-destructive">{reason}</p> : null}
        </div>

        <div className="mt-3 flex flex-col gap-2 border-t border-border/80 pt-3 sm:mt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:border-0 sm:pt-0">
          <p
            className={cn(
              "font-heading text-lg font-bold sm:text-xl",
              incompatible ? "text-destructive/70" : "text-primary"
            )}
            dir="ltr"
          >
            {formatPrice(product.price)}
          </p>
          <Button
            type="button"
            size="default"
            variant={chosen && !incompatible ? "outline" : "default"}
            disabled={blocked}
            onClick={onPick}
            className="min-h-11 w-full px-5 sm:min-h-8 sm:w-auto sm:min-w-[4.5rem] sm:px-3"
          >
            {chosen && !incompatible ? "تغيير" : "اختيار"}
          </Button>
        </div>
      </div>
    </li>
  );
}
