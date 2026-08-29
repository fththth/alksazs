import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Catalog, Product, ShopSettings } from "@/lib/types";
import { seedCatalog } from "@/lib/seed";

const dataDir = path.join(process.cwd(), "data");
const catalogPath = path.join(dataDir, "catalog.json");

async function ensureCatalogFile() {
  try {
    await readFile(catalogPath, "utf8");
  } catch {
    await mkdir(dataDir, { recursive: true });
    await writeFile(catalogPath, JSON.stringify(seedCatalog, null, 2), "utf8");
  }
}

export async function readCatalog(): Promise<Catalog> {
  await ensureCatalogFile();
  const raw = await readFile(catalogPath, "utf8");
  const parsed = JSON.parse(raw) as Catalog;
  return {
    settings: {
      whatsapp: parsed.settings?.whatsapp ?? "",
      shopNote: parsed.settings?.shopNote ?? seedCatalog.settings.shopNote,
    },
    products: Array.isArray(parsed.products) ? parsed.products : [],
  };
}

export async function writeCatalog(catalog: Catalog) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(catalogPath, JSON.stringify(catalog, null, 2), "utf8");
}

export async function listProducts() {
  const catalog = await readCatalog();
  return catalog.products;
}

export async function upsertProduct(product: Product) {
  const catalog = await readCatalog();
  const index = catalog.products.findIndex((item) => item.id === product.id);
  if (index >= 0) {
    catalog.products[index] = product;
  } else {
    catalog.products.unshift(product);
  }
  await writeCatalog(catalog);
  return product;
}

export async function removeProduct(id: string) {
  const catalog = await readCatalog();
  const next = catalog.products.filter((item) => item.id !== id);
  if (next.length === catalog.products.length) return false;
  catalog.products = next;
  await writeCatalog(catalog);
  return true;
}

export async function updateSettings(settings: ShopSettings) {
  const catalog = await readCatalog();
  catalog.settings = settings;
  await writeCatalog(catalog);
  return settings;
}

export async function restoreSeed() {
  await writeCatalog(seedCatalog);
  return seedCatalog;
}
