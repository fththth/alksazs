import {
  Cpu,
  CircuitBoard,
  MemoryStick,
  Gpu,
  HardDrive,
  Fan,
  Zap,
  Box,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/lib/types";

export const CATEGORY_META: Record<
  Category,
  { label: string; tabLabel: string; short: string; icon: LucideIcon; hint: string }
> = {
  cpu: {
    label: "المعالج",
    tabLabel: "المعالج",
    short: "CPU",
    icon: Cpu,
    hint: "قلب الجهاز. اختر حسب استخدامك: ألعاب، مونتاج، أو شغل يومي.",
  },
  motherboard: {
    label: "المذربورد",
    tabLabel: "المذربورد",
    short: "Motherboard",
    icon: CircuitBoard,
    hint: "لازم السوكت يطابق المعالج، ونوع الرام يطابق اللوحة.",
  },
  ram: {
    label: "الرامات",
    tabLabel: "الرام",
    short: "RAM",
    icon: MemoryStick,
    hint: "١٦ غيغا حد أدنى مريح، ٣٢ غيغا أفضل للألعاب والمونتاج.",
  },
  gpu: {
    label: "كرت الشاشة",
    tabLabel: "كرت",
    short: "GPU",
    icon: Gpu,
    hint: "أغلى قطعة عادة. حدّد الدقة: ١٠٨٠p أو ٢K أو ٤K.",
  },
  storage: {
    label: "التخزين",
    tabLabel: "تخزين",
    short: "Storage",
    icon: HardDrive,
    hint: "NVMe أسرع من SATA. تيرا يكفي للبداية، اثنين أريح.",
  },
  cooler: {
    label: "الكولر",
    tabLabel: "كولر",
    short: "Cooler",
    icon: Fan,
    hint: "المعالجات القوية تحتاج تبريد أفضل حتى ما ترتفع الحرارة.",
  },
  psu: {
    label: "مزود الطاقة",
    tabLabel: "مزود",
    short: "PSU",
    icon: Zap,
    hint: "اختر واط كافي للمعالج وكرت الشاشة — ٦٥٠W للمتوسط و ٨٥٠W للتجميعات القوية.",
  },
  case: {
    label: "الكيس",
    tabLabel: "كيس",
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
  "psu",
  "case",
];
