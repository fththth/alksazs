"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import type { Category, FormFactor, Product, RamType } from "@/lib/types";
import { cn } from "@/lib/utils";

export function emptyProduct(category: Category): Product {
  return {
    id: crypto.randomUUID(),
    category,
    name: "",
    brand: "",
    description: "",
    price: 0,
    stock: 1,
    available: true,
    specs: {},
  };
}

type ChipOption = { value: string; label: string };

function ChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: ChipOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value || "none"}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition",
                active
                  ? "border-primary/30 bg-primary/10 text-primary font-medium"
                  : "border-border bg-background text-muted-foreground hover:border-primary/20 hover:bg-muted"
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  product: Product;
  onChange: (product: Product) => void;
  onSubmit: () => void;
  saving: boolean;
};

export function ProductForm({ product, onChange, onSubmit, saving }: Props) {
  function update<K extends keyof Product>(key: K, value: Product[K]) {
    onChange({ ...product, [key]: value });
  }

  function updateSpec<K extends keyof Product["specs"]>(
    key: K,
    value: Product["specs"][K] | undefined
  ) {
    const specs = { ...product.specs };
    if (value === undefined || value === "") {
      delete specs[key];
    } else {
      specs[key] = value;
    }
    onChange({ ...product, specs });
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <ChipGroup
        label="التصنيف"
        value={product.category}
        options={CATEGORY_ORDER.map((key) => ({
          value: key,
          label: CATEGORY_META[key].label,
        }))}
        onChange={(value) => {
          const nextCategory = value as Category;
          if (nextCategory === product.category) return;
          onChange({ ...product, category: nextCategory, specs: {} });
        }}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="product-brand">الشركة</Label>
          <Input
            id="product-brand"
            required
            autoComplete="off"
            value={product.brand}
            onChange={(event) => update("brand", event.target.value)}
            placeholder="AMD"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="product-model">الموديل</Label>
          <Input
            id="product-model"
            required
            autoComplete="off"
            value={product.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ryzen 7 7800X3D"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="product-description">الوصف</Label>
        <Textarea
          id="product-description"
          value={product.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="شنو مميز بهالقطعة للزبون؟"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="product-price">السعر IQD</Label>
          <Input
            id="product-price"
            type="number"
            min={0}
            step="1000"
            required
            dir="ltr"
            value={product.price}
            onChange={(event) => update("price", Number(event.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="product-stock">الكمية</Label>
          <Input
            id="product-stock"
            type="number"
            min={0}
            step="1"
            required
            dir="ltr"
            value={product.stock}
            onChange={(event) => update("stock", Number(event.target.value))}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={product.available}
          onChange={(event) => update("available", event.target.checked)}
          className="size-4 accent-primary"
        />
        ظاهرة للزبون
      </label>

      {(product.category === "cpu" ||
        product.category === "motherboard" ||
        product.category === "cooler") && (
        <div className="grid gap-2">
          <Label htmlFor="product-socket">السوكت</Label>
          <Input
            id="product-socket"
            dir="ltr"
            placeholder="AM5 أو LGA1700"
            value={product.specs.socket ?? ""}
            onChange={(event) => updateSpec("socket", event.target.value || undefined)}
          />
        </div>
      )}

      {(product.category === "motherboard" || product.category === "ram") && (
        <ChipGroup
          label="نوع الرام"
          value={product.specs.ramType ?? ""}
          options={[
            { value: "", label: "بدون تحديد" },
            { value: "DDR4", label: "DDR4" },
            { value: "DDR5", label: "DDR5" },
          ]}
          onChange={(value) =>
            updateSpec("ramType", (value || undefined) as RamType | undefined)
          }
        />
      )}

      {(product.category === "motherboard" || product.category === "case") && (
        <ChipGroup
          label="حجم اللوحة / الكيس"
          value={product.specs.formFactor ?? ""}
          options={[
            { value: "", label: "بدون تحديد" },
            { value: "ATX", label: "ATX" },
            { value: "mATX", label: "mATX" },
            { value: "ITX", label: "ITX" },
          ]}
          onChange={(value) =>
            updateSpec("formFactor", (value || undefined) as FormFactor | undefined)
          }
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(product.category === "cpu" || product.category === "cooler") && (
          <div className="grid gap-2">
            <Label htmlFor="product-tdp">TDP / قدرة التبريد</Label>
            <Input
              id="product-tdp"
              type="number"
              min={0}
              dir="ltr"
              value={product.specs.tdp ?? ""}
              onChange={(event) =>
                updateSpec(
                  "tdp",
                  event.target.value === "" ? undefined : Number(event.target.value)
                )
              }
            />
          </div>
        )}
        {(product.category === "gpu" || product.category === "cooler") && (
          <div className="grid gap-2">
            <Label htmlFor="product-wattage">الواط / حجم الرديتر</Label>
            <Input
              id="product-wattage"
              type="number"
              min={0}
              dir="ltr"
              value={product.specs.wattage ?? ""}
              onChange={(event) =>
                updateSpec(
                  "wattage",
                  event.target.value === "" ? undefined : Number(event.target.value)
                )
              }
            />
          </div>
        )}
        {product.category === "psu" && (
          <div className="grid gap-2">
            <Label htmlFor="product-psu-wattage">قدرة مزود الطاقة (W)</Label>
            <Input
              id="product-psu-wattage"
              type="number"
              min={0}
              dir="ltr"
              placeholder="750"
              value={product.specs.wattage ?? ""}
              onChange={(event) =>
                updateSpec(
                  "wattage",
                  event.target.value === "" ? undefined : Number(event.target.value)
                )
              }
            />
          </div>
        )}
        {(product.category === "ram" ||
          product.category === "storage" ||
          product.category === "gpu") && (
          <div className="grid gap-2">
            <Label htmlFor="product-capacity">السعة</Label>
            <Input
              id="product-capacity"
              dir="ltr"
              placeholder="32GB أو 2TB"
              value={product.specs.capacity ?? ""}
              onChange={(event) => updateSpec("capacity", event.target.value || undefined)}
            />
          </div>
        )}
        {(product.category === "ram" || product.category === "storage") && (
          <div className="grid gap-2">
            <Label htmlFor="product-speed">السرعة</Label>
            <Input
              id="product-speed"
              dir="ltr"
              placeholder="6000 MT/s"
              value={product.specs.speed ?? ""}
              onChange={(event) => updateSpec("speed", event.target.value || undefined)}
            />
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="submit" disabled={saving || !product.name || !product.brand}>
          حفظ القطعة
        </Button>
      </div>
    </form>
  );
}
