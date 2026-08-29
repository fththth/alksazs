"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import type { Category, FormFactor, Product, RamType } from "@/lib/types";

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
      <div className="grid gap-2">
        <Label htmlFor="category">التصنيف</Label>
        <select
          id="category"
          className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
          value={product.category}
          onChange={(event) => update("category", event.target.value as Category)}
        >
          {CATEGORY_ORDER.map((key) => (
            <option key={key} value={key}>
              {CATEGORY_META[key].label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="brand">الشركة</Label>
          <Input
            id="brand"
            required
            value={product.brand}
            onChange={(event) => update("brand", event.target.value)}
            placeholder="AMD"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="name">الموديل</Label>
          <Input
            id="name"
            required
            value={product.name}
            onChange={(event) => update("name", event.target.value)}
            placeholder="Ryzen 7 7800X3D"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">الوصف</Label>
        <Textarea
          id="description"
          value={product.description}
          onChange={(event) => update("description", event.target.value)}
          placeholder="شنو مميز بهالقطعة للزبون؟"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="price">السعر IQD</Label>
          <Input
            id="price"
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
          <Label htmlFor="stock">الكمية</Label>
          <Input
            id="stock"
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
          className="size-4 accent-amber-400"
        />
        ظاهرة للزبون
      </label>

      {(product.category === "cpu" ||
        product.category === "motherboard" ||
        product.category === "cooler") && (
        <div className="grid gap-2">
          <Label htmlFor="socket">السوكت</Label>
          <Input
            id="socket"
            dir="ltr"
            placeholder="AM5 أو LGA1700"
            value={product.specs.socket ?? ""}
            onChange={(event) => updateSpec("socket", event.target.value || undefined)}
          />
        </div>
      )}

      {(product.category === "motherboard" || product.category === "ram") && (
        <div className="grid gap-2">
          <Label htmlFor="ramType">نوع الرام</Label>
          <select
            id="ramType"
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            value={product.specs.ramType ?? ""}
            onChange={(event) =>
              updateSpec("ramType", (event.target.value || undefined) as RamType | undefined)
            }
          >
            <option value="">بدون تحديد</option>
            <option value="DDR4">DDR4</option>
            <option value="DDR5">DDR5</option>
          </select>
        </div>
      )}

      {(product.category === "motherboard" || product.category === "case") && (
        <div className="grid gap-2">
          <Label htmlFor="formFactor">حجم اللوحة / الكيس</Label>
          <select
            id="formFactor"
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
            value={product.specs.formFactor ?? ""}
            onChange={(event) =>
              updateSpec(
                "formFactor",
                (event.target.value || undefined) as FormFactor | undefined
              )
            }
          >
            <option value="">بدون تحديد</option>
            <option value="ATX">ATX</option>
            <option value="mATX">mATX</option>
            <option value="ITX">ITX</option>
          </select>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {(product.category === "cpu" || product.category === "cooler") && (
          <div className="grid gap-2">
            <Label htmlFor="tdp">TDP / قدرة التبريد</Label>
            <Input
              id="tdp"
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
            <Label htmlFor="wattage">الواط / حجم الرديتر</Label>
            <Input
              id="wattage"
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
        {(product.category === "ram" ||
          product.category === "storage" ||
          product.category === "gpu") && (
          <div className="grid gap-2">
            <Label htmlFor="capacity">السعة</Label>
            <Input
              id="capacity"
              dir="ltr"
              placeholder="32GB أو 2TB"
              value={product.specs.capacity ?? ""}
              onChange={(event) => updateSpec("capacity", event.target.value || undefined)}
            />
          </div>
        )}
        {(product.category === "ram" || product.category === "storage") && (
          <div className="grid gap-2">
            <Label htmlFor="speed">السرعة</Label>
            <Input
              id="speed"
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
