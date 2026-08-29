import { NextResponse } from "next/server";
import { readCatalog, removeProduct, upsertProduct } from "@/lib/catalog";
import { CATEGORIES, type Product } from "@/lib/types";

function asProduct(body: unknown, id: string): Product | null {
  if (!body || typeof body !== "object") return null;
  const value = body as Partial<Product>;
  if (!value.name || !value.brand || !value.category) return null;
  if (!CATEGORIES.includes(value.category)) return null;
  const price = Number(value.price);
  const stock = Number(value.stock);
  if (!Number.isFinite(price) || price < 0) return null;
  if (!Number.isFinite(stock) || stock < 0) return null;
  return {
    id,
    category: value.category,
    name: String(value.name).trim(),
    brand: String(value.brand).trim(),
    description: String(value.description ?? "").trim(),
    price,
    stock: Math.floor(stock),
    available: Boolean(value.available),
    specs: value.specs ?? {},
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const catalog = await readCatalog();
  const product = catalog.products.find((item) => item.id === id);
  if (!product) {
    return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const product = asProduct(await request.json(), id);
  if (!product) {
    return NextResponse.json({ error: "بيانات القطعة غير مكتملة" }, { status: 400 });
  }
  const saved = await upsertProduct(product);
  return NextResponse.json(saved);
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const removed = await removeProduct(id);
  if (!removed) {
    return NextResponse.json({ error: "القطعة غير موجودة" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
