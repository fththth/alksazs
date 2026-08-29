import { NextResponse } from "next/server";
import {
  readCatalog,
  restoreSeed,
  updateSettings,
  upsertProduct,
} from "@/lib/catalog";
import type { Product, ShopSettings } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

function asProduct(body: unknown): Product | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<Product>;
  if (!value.id || !value.name || !value.brand || !value.category) return null;
  if (!CATEGORIES.includes(value.category)) return null;
  const price = Number(value.price);
  const stock = Number(value.stock);
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(stock) || stock < 0) return null;
  return {
    id: String(value.id),
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
        value.specs?.wattage !== undefined &&
        Number.isFinite(Number(value.specs.wattage))
          ? Number(value.specs.wattage)
          : undefined,
      capacity: value.specs?.capacity ? String(value.specs.capacity) : undefined,
      speed: value.specs?.speed ? String(value.specs.speed) : undefined,
    },
  };
}

export async function GET() {
  const catalog = await readCatalog();
  return NextResponse.json(catalog, {
    headers: {
      "Cache-Control": "private, max-age=5, stale-while-revalidate=60",
    },
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as { action?: string; product?: unknown };
  if (body.action === "restore") {
    const catalog = await restoreSeed();
    return NextResponse.json(catalog);
  }
  const product = asProduct(body.product ?? body);
  if (!product) {
    return NextResponse.json({ error: "بيانات القطعة غير مكتملة" }, { status: 400 });
  }
  const saved = await upsertProduct(product);
  return NextResponse.json(saved, { status: 201 });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<ShopSettings>;
  const current = await readCatalog();
  const settings = await updateSettings({
    whatsapp: String(body.whatsapp ?? current.settings.whatsapp),
    shopNote: String(body.shopNote ?? current.settings.shopNote),
  });
  return NextResponse.json(settings);
}
