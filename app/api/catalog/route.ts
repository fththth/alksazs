import { NextResponse } from "next/server";
import {
  readCatalog,
  restoreSeed,
  updateSettings,
  upsertProduct,
} from "@/lib/catalog";
import { parseProduct } from "@/lib/product-validation";
import type { ShopSettings } from "@/lib/types";

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
  const product = parseProduct(body.product ?? body);
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
