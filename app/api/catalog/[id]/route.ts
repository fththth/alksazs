import { NextResponse } from "next/server";
import { readCatalog, removeProduct, upsertProduct } from "@/lib/catalog";
import { parseProduct } from "@/lib/product-validation";

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
  const product = parseProduct(await request.json(), id);
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
