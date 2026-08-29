import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Gpu,
  HardDrive,
  Fan,
  Box,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_META: Record<
  Category,
  { label: string; short: string; icon: LucideIcon; hint: string }
> = {
  cpu: {
    label: "المعالج",
    short: "CPU",
    icon: Cpu,
    hint: "قلب الجهاز. اختر حسب استخدامك: ألعاب، مونتاج، أو شغل يومي.",
  },
  motherboard: {
    label: "المذربود",
    short: "Motherboard",
    icon: CircuitBoard,
    hint: "لازم السوكت يطابق المعالج، ونوع الرام يطابق اللوحة.",
  },
  ram: {
    label: "الرامات",
    short: "RAM",
    icon: MemoryStick,
    hint: "١٦ غيغا حد أدنى مريح، ٣٢ غيغا أفضل للألعاب والمونتاج.",
  },
  gpu: {
    label: "كرت الشاشة",
    short: "GPU",
    icon: Gpu,
    hint: "أغلى قطعة عادة. حدّد الدقة: ١٠٨٠p أو ٢K أو ٤K.",
  },
  storage: {
    label: "التخزين",
    short: "Storage",
    icon: HardDrive,
    hint: "NVMe أسرع من SATA. تيرا يكفي للبداية، اثنين أريح.",
  },
  cooler: {
    label: "الكولر",
    short: "Cooler",
    icon: Fan,
    hint: "المعالجات القوية تحتاج تبريد أفضل حتى ما ترتفع الحرارة.",
  },
  case: {
    label: "الكيس",
    short: "Case",
    icon: Box,
    hint: "لازم يتسع للوحة الأم وللتبريد، مع تهوية جيدة.",
  },
};

export const CATEGORY_ORDER: Category[] = [
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "storage",
  "cooler",
  "case",
];
