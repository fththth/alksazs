import type { Category, FormFactor, Product, BuildSelection } from "@/lib/types";

const FORM_SUPPORT: Record<FormFactor, FormFactor[]> = {
  ATX: ["ATX", "mATX", "ITX"],
  mATX: ["mATX", "ITX"],
  ITX: ["ITX"],
};

export type CompatIssue = {
  id: string;
  message: string;
};

export function getSelectedProducts(
  products: Product[],
  selection: BuildSelection
) {
  const map: Partial<Record<Category, Product>> = {};
  for (const [category, id] of Object.entries(selection) as [Category, string][]) {
    const found = products.find((item) => item.id === id);
    if (found) map[category] = found;
  }
  return map;
}

export function incompatibilityReason(
  product: Product,
  selected: Partial<Record<Category, Product>>
): string | null {
  const cpu = selected.cpu;
  const motherboard = selected.motherboard;
  const ram = selected.ram;
  const pcCase = selected.case;

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

  if (product.category === "ram" && motherboard?.specs.ramType) {
    if (product.specs.ramType && product.specs.ramType !== motherboard.specs.ramType) {
      return `هذا النوع ${product.specs.ramType} والمذربود يدعم ${motherboard.specs.ramType}`;
    }
  }

  if (product.category === "motherboard" && ram?.specs.ramType) {
    if (product.specs.ramType && product.specs.ramType !== ram.specs.ramType) {
      return `المذربود ${product.specs.ramType} والرامات ${ram.specs.ramType}`;
    }
  }

  if (product.category === "cooler" && cpu?.specs.socket) {
    if (product.specs.socket && !product.specs.socket.includes(cpu.specs.socket)) {
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
  }

  return null;
}

export function buildIssues(
  products: Product[],
  selection: BuildSelection
): CompatIssue[] {
  const selected = getSelectedProducts(products, selection);
  const issues: CompatIssue[] = [];

  for (const product of Object.values(selected)) {
    if (!product) continue;
    const reason = incompatibilityReason(product, selected);
    if (reason) {
      issues.push({ id: `${product.category}-${product.id}`, message: reason });
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

export function estimatePsuWattage(
  selected: Partial<Record<Category, Product>>
) {
  const cpu = selected.cpu?.specs.tdp ?? 0;
  const gpu = selected.gpu?.specs.wattage ?? 0;
  if (!cpu && !gpu) return null;
  const raw = cpu + gpu + 150;
  const rounded = Math.ceil(raw / 50) * 50;
  return Math.max(550, rounded);
}

export function buildTotal(selected: Partial<Record<Category, Product>>) {
  return Object.values(selected).reduce((sum, item) => sum + (item?.price ?? 0), 0);
}
