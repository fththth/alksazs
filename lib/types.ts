export const CATEGORIES = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "cooler",
  "psu",
  "case",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type RamType = "DDR4" | "DDR5";
export type FormFactor = "ATX" | "mATX" | "ITX";
export type ThemeMode = "light" | "dark";

export type ProductSpecs = {
  socket?: string;
  ramType?: RamType;
  formFactor?: FormFactor;
  tdp?: number;
  wattage?: number;
  capacity?: string;
  speed?: string;
};

export type Product = {
  id: string;
  category: Category;
  name: string;
  brand: string;
  description: string;
  /** السعر بالدينار العراقي */
  price: number;
  stock: number;
  available: boolean;
  specs: ProductSpecs;
};

export type ShopSettings = {
  whatsapp: string;
  shopNote: string;
  themeMode: ThemeMode;
};

export type Catalog = {
  settings: ShopSettings;
  products: Product[];
};

export type BuildSelection = Partial<Record<Category, string | string[]>>;
