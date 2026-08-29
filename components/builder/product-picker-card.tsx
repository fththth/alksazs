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
          "flex items-center gap-3 rounded-xl border p-3 transition sm:p-4",
          chosen && !incompatible
            ? "border-primary/40 bg-primary/5"
            : incompatible
              ? "border-destructive/30 bg-destructive/5"
              : "border-border bg-background"
        )}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-heading text-sm font-semibold sm:text-base",
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
            <div className="mt-1.5 flex flex-wrap gap-1.5">
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

          {reason ? <p className="mt-1.5 text-xs text-destructive">{reason}</p> : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <p
            className={cn(
              "font-heading text-base font-bold sm:text-lg",
              incompatible ? "text-destructive/70" : "text-primary"
            )}
            dir="ltr"
          >
            {formatPrice(product.price)}
          </p>
          <Button
            type="button"
            size="sm"
            variant={chosen && !incompatible ? "outline" : "default"}
            disabled={blocked}
            onClick={onPick}
            className="min-w-[72px]"
          >
            {chosen && !incompatible ? "تغيير" : "اختيار"}
          </Button>
        </div>
      </div>
    </li>
  );
}
