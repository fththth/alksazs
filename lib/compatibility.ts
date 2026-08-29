import {
  getProductsForCategory,
  getSelectionIds,
  type SelectedBuild,
} from "@/lib/build-selection-utils";
import type { Category, FormFactor, Product, BuildSelection } from "@/lib/types";

const FORM_SUPPORT: Record<FormFactor, FormFactor[]> = {
  ATX: ["ATX", "mATX", "ITX"],
  mATX: ["mATX", "ITX"],
  ITX: ["ITX"],
};

function socketTokens(value: string) {
  return value
    .split(/[/,|]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function coolerSupportsSocket(coolerSocket: string, cpuSocket: string) {
  return socketTokens(coolerSocket).some((token) => token === cpuSocket);
}

function productLabel(product: Product) {
  return `${product.brand} ${product.name}`.trim();
}

function firstProduct(selected: SelectedBuild, category: Category) {
  return getProductsForCategory(selected, category)[0];
}

export type CompatIssue = {
  id: string;
  message: string;
};

export function getSelectedProducts(
  products: Product[],
  selection: BuildSelection
): SelectedBuild {
  const map: SelectedBuild = {};

  for (const category of Object.keys(selection) as Category[]) {
    const ids = getSelectionIds(selection, category);
    const found = ids
      .map((id) => products.find((item) => item.id === id))
      .filter((item): item is Product => Boolean(item));

    if (found.length === 0) continue;

    if (category === "ram" || category === "storage") {
      map[category] = found;
    } else {
      map[category] = found[0];
    }
  }

  return map;
}

export function incompatibilityReason(
  product: Product,
  selected: SelectedBuild
): string | null {
  const cpu = firstProduct(selected, "cpu");
  const motherboard = firstProduct(selected, "motherboard");
  const rams = getProductsForCategory(selected, "ram");
  const pcCase = firstProduct(selected, "case");

  if (product.category === "motherboard" && cpu?.specs.socket) {
    if (product.specs.socket && product.specs.socket !== cpu.specs.socket) {
      return `السوكت ${product.specs.socket} لا يطابق المعالج ${cpu.specs.socket}`;
    }
  }

  if (product.category === "cpu" && motherboard?.specs.socket) {
    if (product.specs.socket && product.specs.socket !== motherboard.specs.socket) {
      return `السوكت ${product.specs.socket} لا يطابق المذربود ${motherboard.specs.socket}`;
    }
  }

  if (product.category === "ram") {
    if (motherboard?.specs.ramType && product.specs.ramType) {
      if (product.specs.ramType !== motherboard.specs.ramType) {
        return `هذا النوع ${product.specs.ramType} والمذربود يدعم ${motherboard.specs.ramType}`;
      }
    }
    const firstRam = rams[0];
    if (firstRam?.specs.ramType && product.specs.ramType) {
      if (product.specs.ramType !== firstRam.specs.ramType) {
        return `لازم كل الرامات من نفس النوع (${firstRam.specs.ramType})`;
      }
    }
  }

  if (product.category === "motherboard") {
    for (const ram of rams) {
      if (product.specs.ramType && ram.specs.ramType && product.specs.ramType !== ram.specs.ramType) {
        return `المذربود ${product.specs.ramType} والرامات ${ram.specs.ramType}`;
      }
    }
  }

  if (product.category === "cooler" && cpu?.specs.socket) {
    if (product.specs.socket && !coolerSupportsSocket(product.specs.socket, cpu.specs.socket)) {
      return `هذا الكولر غير مذكور لسوكت ${cpu.specs.socket}`;
    }
  }

  if (product.category === "case" && motherboard?.specs.formFactor) {
    const supported = product.specs.formFactor
      ? FORM_SUPPORT[product.specs.formFactor]
      : undefined;
    if (supported && !supported.includes(motherboard.specs.formFactor)) {
      return `الكيس ${product.specs.formFactor} لا يتسع للوحة ${motherboard.specs.formFactor}`;
    }
  }

  if (product.category === "motherboard" && pcCase?.specs.formFactor) {
    const supported = FORM_SUPPORT[pcCase.specs.formFactor];
    if (
      product.specs.formFactor &&
      supported &&
      !supported.includes(product.specs.formFactor)
    ) {
      return `الكيس ${pcCase.specs.formFactor} أصغر من اللوحة ${product.specs.formFactor}`;
    }
  }

  if (product.category === "cooler" && pcCase?.specs.formFactor === "ITX") {
    if ((product.specs.wattage ?? 0) >= 240) {
      return "الكيس الصغير قد لا يتسع لمبرد مائي بهذا الحجم";
    }
    if ((product.specs.tdp ?? 0) >= 250) {
      return "الكيس الصغير قد لا يتسع لهذا الكولر الكبير";
    }
  }

  if (product.category === "psu") {
    const recommended = estimatePsuWattage(selected);
    if (recommended && product.specs.wattage && product.specs.wattage < recommended) {
      return `قدرة ${product.specs.wattage}W أقل من المطلوب تقريباً (${recommended}W)`;
    }
  }

  return null;
}

export function buildIssues(
  products: Product[],
  selection: BuildSelection
): CompatIssue[] {
  const selected = getSelectedProducts(products, selection);
  const issues: CompatIssue[] = [];

  for (const category of Object.keys(selected) as Category[]) {
    for (const product of getProductsForCategory(selected, category)) {
      if (product.stock <= 0) {
        issues.push({
          id: `stock-${product.id}`,
          message: `${productLabel(product)} نفد من المخزون`,
        });
      } else if (!product.available) {
        issues.push({
          id: `avail-${product.id}`,
          message: `${productLabel(product)} غير متوفر حالياً`,
        });
      }

      const reason = incompatibilityReason(product, selected);
      if (reason) {
        issues.push({ id: `${product.category}-${product.id}`, message: reason });
      }
    }
  }

  return uniqueIssues(issues);
}

function uniqueIssues(issues: CompatIssue[]) {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.message)) return false;
    seen.add(issue.message);
    return true;
  });
}

export function estimatePsuWattage(selected: SelectedBuild) {
  const cpu = firstProduct(selected, "cpu")?.specs.tdp ?? 0;
  const gpu = firstProduct(selected, "gpu")?.specs.wattage ?? 0;
  if (!cpu && !gpu) return null;
  const raw = cpu + gpu + 150;
  const rounded = Math.ceil(raw / 50) * 50;
  return Math.max(550, rounded);
}

export function buildTotal(selected: SelectedBuild) {
  let total = 0;
  for (const category of Object.keys(selected) as Category[]) {
    for (const item of getProductsForCategory(selected, category)) {
      total += item.price;
    }
  }
  return total;
}
