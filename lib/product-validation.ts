import { CATEGORIES, type Product } from "@/lib/types";

export function parseProduct(body: unknown, id?: string): Product | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<Product>;
  const productId = id ?? value.id;
  if (!productId || !value.name || !value.brand || !value.category) return null;
  if (!CATEGORIES.includes(value.category)) return null;

  const price = Number(value.price);
  const stock = Number(value.stock);
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(stock) || stock < 0) return null;

  return {
    id: String(productId),
    category: value.category,
    name: String(value.name).trim(),
    brand: String(value.brand).trim(),
    description: String(value.description ?? "").trim(),
    price,
    stock: Math.floor(stock),
    available: Boolean(value.available),
    specs: {
      socket: value.specs?.socket ? String(value.specs.socket) : undefined,
      ramType:
        value.specs?.ramType === "DDR4" || value.specs?.ramType === "DDR5"
          ? value.specs.ramType
          : undefined,
      formFactor:
        value.specs?.formFactor === "ATX" ||
        value.specs?.formFactor === "mATX" ||
        value.specs?.formFactor === "ITX"
          ? value.specs.formFactor
          : undefined,
      tdp:
        value.specs?.tdp !== undefined && Number.isFinite(Number(value.specs.tdp))
          ? Number(value.specs.tdp)
          : undefined,
      wattage:
        value.specs?.wattage !== undefined && Number.isFinite(Number(value.specs.wattage))
          ? Number(value.specs.wattage)
          : undefined,
      capacity: value.specs?.capacity ? String(value.specs.capacity) : undefined,
      speed: value.specs?.speed ? String(value.specs.speed) : undefined,
    },
  };
}
