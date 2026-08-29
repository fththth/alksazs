import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import type { CompatIssue } from "@/lib/compatibility";
import type { Category, Product } from "@/lib/types";

export function productFullName(product: Product) {
  return `${product.brand} ${product.name}`.trim();
}

export function productSpecEntries(product: Product) {
  const entries: { label: string; value: string }[] = [];
  const { specs } = product;

  if (specs.socket) entries.push({ label: "السوكت", value: specs.socket });
  if (specs.ramType) entries.push({ label: "نوع الرام", value: specs.ramType });
  if (specs.formFactor) entries.push({ label: "الحجم", value: specs.formFactor });
  if (specs.capacity) entries.push({ label: "السعة", value: specs.capacity });
  if (specs.speed) entries.push({ label: "السرعة", value: specs.speed });
  if (specs.tdp !== undefined) entries.push({ label: "TDP", value: `${specs.tdp}W` });
  if (specs.wattage !== undefined) {
    entries.push({ label: "الاستهلاك", value: `${specs.wattage}W` });
  }

  return entries;
}

type BuildExportInput = {
  selected: Partial<Record<Category, Product>>;
  total: number;
  psu: number | null;
  issues: CompatIssue[];
};

function formatDate() {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

export function buildSpecsPlainText({ selected, total, psu, issues }: BuildExportInput) {
  const lines: string[] = [
    "القزاز لخدمات الحاسبات",
    "══════════════════════════════",
    `تاريخ التجميعة: ${formatDate()}`,
    "",
    "── مواصفات الجهاز ──",
    "",
  ];

  for (const key of CATEGORY_ORDER) {
    const item = selected[key];
    const label = CATEGORY_META[key].label;
    lines.push(`▸ ${label}`);

    if (!item) {
      lines.push("   — لم يُختر بعد");
      lines.push("");
      continue;
    }

    lines.push(`   الاسم: ${productFullName(item)}`);
    lines.push(`   السعر: ${formatPrice(item.price)}`);

    if (item.description) {
      lines.push(`   الوصف: ${item.description}`);
    }

    const specs = productSpecEntries(item);
    if (specs.length > 0) {
      lines.push("   المواصفات:");
      for (const spec of specs) {
        lines.push(`     • ${spec.label}: ${spec.value}`);
      }
    }

    lines.push("");
  }

  if (psu) {
    lines.push(`مزود الطاقة المقترح: ${psu}W`);
    lines.push("");
  }

  if (issues.length > 0) {
    lines.push("⚠ تنبيهات التوافق:");
    for (const issue of issues) {
      lines.push(`   • ${issue.message}`);
    }
    lines.push("");
  }

  lines.push("──────────────────────────────");
  lines.push(`السعر الإجمالي: ${formatPrice(total)}`);
  lines.push("");
  lines.push("القزاز لخدمات الحاسبات — تجميعة حاسوب مخصصة");

  return lines.join("\n");
}

export function buildPrintHtml(
  { selected, total, psu, issues }: BuildExportInput,
  logoUrl: string
) {
  const partsHtml = CATEGORY_ORDER.map((key) => {
    const item = selected[key];
    const meta = CATEGORY_META[key];

    if (!item) {
      return `
        <section class="part missing">
          <p class="part-label">${meta.label}</p>
          <p class="part-name muted">لم يُختر بعد</p>
        </section>
      `;
    }

    const specs = productSpecEntries(item)
      .map(
        (spec) =>
          `<li><span class="spec-label">${spec.label}</span><span class="spec-value">${spec.value}</span></li>`
      )
      .join("");

    return `
      <section class="part">
        <div class="part-head">
          <p class="part-label">${meta.label}</p>
          <p class="part-price" dir="ltr">${formatPrice(item.price)}</p>
        </div>
        <h3 class="part-name">${productFullName(item)}</h3>
        ${item.description ? `<p class="part-desc">${item.description}</p>` : ""}
        ${
          specs
            ? `<ul class="spec-list">${specs}</ul>`
            : `<p class="muted small">لا توجد مواصفات إضافية</p>`
        }
      </section>
    `;
  }).join("");

  const issuesHtml =
    issues.length > 0
      ? `<div class="issues">
          <strong>تنبيهات التوافق</strong>
          <ul>${issues.map((i) => `<li>${i.message}</li>`).join("")}</ul>
        </div>`
      : "";

  const psuHtml = psu
    ? `<p class="psu-note">مزود الطاقة المقترح: <strong dir="ltr">${psu}W</strong></p>`
    : "";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تجميعة القزاز للحاسبات</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: "Cairo", sans-serif;
      color: #142832;
      background: #fff;
      padding: 28px;
      line-height: 1.6;
    }
    .sheet {
      max-width: 760px;
      margin: 0 auto;
      border: 2px solid #1a7089;
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 24px 28px;
      background: linear-gradient(135deg, #1a7089, #2a8aa6);
      color: #fff;
    }
    .brand { display: flex; align-items: center; gap: 14px; }
    .brand img { width: 56px; height: 56px; object-fit: contain; }
    .brand h1 { font-size: 22px; font-weight: 700; }
    .brand p { font-size: 13px; opacity: 0.9; }
    .meta { text-align: left; font-size: 12px; opacity: 0.92; }
    .content { padding: 24px 28px 28px; }
    .intro { margin-bottom: 20px; color: #5f7480; font-size: 14px; }
    .part {
      border: 1px solid #cfdbe3;
      border-radius: 12px;
      padding: 16px 18px;
      margin-bottom: 12px;
      page-break-inside: avoid;
    }
    .part.missing { background: #f8fafb; border-style: dashed; }
    .part-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .part-label {
      font-size: 12px;
      font-weight: 700;
      color: #1a7089;
      letter-spacing: 0.04em;
    }
    .part-price {
      font-size: 15px;
      font-weight: 700;
      color: #1a7089;
    }
    .part-name {
      font-size: 17px;
      font-weight: 700;
      color: #142832;
      margin-bottom: 6px;
      word-break: break-word;
    }
    .part-desc {
      font-size: 13px;
      color: #5f7480;
      margin-bottom: 10px;
    }
    .spec-list {
      list-style: none;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 16px;
    }
    .spec-list li {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 13px;
      padding: 6px 10px;
      background: #eef3f6;
      border-radius: 8px;
    }
    .spec-label { color: #5f7480; }
    .spec-value { font-weight: 600; color: #142832; }
    .issues {
      margin: 16px 0;
      padding: 12px 14px;
      border-radius: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 13px;
    }
    .issues ul { margin-top: 6px; padding-right: 18px; }
    .psu-note {
      margin: 8px 0 16px;
      font-size: 14px;
      color: #1a4f61;
    }
    .total-box {
      margin-top: 18px;
      padding: 18px 20px;
      border-radius: 12px;
      background: #1a7089;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total-box span { font-size: 14px; opacity: 0.92; }
    .total-box strong { font-size: 24px; }
    .footer {
      margin-top: 18px;
      text-align: center;
      font-size: 12px;
      color: #5f7480;
    }
    .muted { color: #5f7480; }
    .small { font-size: 12px; }
    @media print {
      body { padding: 0; }
      .sheet { border: none; border-radius: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <header class="header">
      <div class="brand">
        <img src="${logoUrl}" alt="القزاز" />
        <div>
          <h1>القزاز لخدمات الحاسبات</h1>
          <p>مواصفات التجميعة الكاملة</p>
        </div>
      </div>
      <div class="meta">${formatDate()}</div>
    </header>
    <main class="content">
      <p class="intro">هذه ورقة مواصفات التجميعة المختارة. تحتوي على اسم كل قطعة كاملاً مع المواصفات والسعر.</p>
      ${partsHtml}
      ${psuHtml}
      ${issuesHtml}
      <div class="total-box">
        <span>السعر الإجمالي</span>
        <strong dir="ltr">${formatPrice(total)}</strong>
      </div>
      <p class="footer">الأسعار بـ IQD — القزاز لخدمات الحاسبات</p>
    </main>
  </div>
  <script>
    window.onload = function() {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;
}

export function printBuildSpecs(input: BuildExportInput) {
  const logoUrl = `${window.location.origin}/brand/mark.png`;
  const html = buildPrintHtml(input, logoUrl);
  const popup = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!popup) return false;
  popup.document.open();
  popup.document.write(html);
  popup.document.close();
  return true;
}

export async function copyBuildSpecs(input: BuildExportInput) {
  const text = buildSpecsPlainText(input);
  await navigator.clipboard.writeText(text);
  return text;
}
