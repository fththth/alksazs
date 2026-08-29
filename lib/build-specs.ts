import { CATEGORY_META, CATEGORY_ORDER } from "@/lib/categories";
import { formatPrice } from "@/lib/format";
import { PRINT_MESSAGE, PRINT_READY } from "@/lib/print-storage";
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
    const label = product.category === "psu" ? "القدرة" : "الاستهلاك";
    entries.push({ label, value: `${specs.wattage}W` });
  }

  return entries;
}

type BuildExportInput = {
  selected: Partial<Record<Category, Product>>;
  total: number;
  psu: number | null;
  issues: CompatIssue[];
};

export function isBuildComplete(selected: Partial<Record<Category, Product>>) {
  return CATEGORY_ORDER.every((key) => Boolean(selected[key]));
}

export function isBuildReady(
  selected: Partial<Record<Category, Product>>,
  issues: CompatIssue[]
) {
  return isBuildComplete(selected) && issues.length === 0;
}

function formatDate() {
  return new Intl.DateTimeFormat("ar-IQ", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());
}

/** Short text for copy, WhatsApp, and UI — part names + total only */
export function buildSummaryPlainText({ selected, total, psu, issues }: BuildExportInput) {
  const lines: string[] = [
    "القزاز لخدمات الحاسبات",
    "══════════════════════════════",
    `تاريخ التجميعة: ${formatDate()}`,
    "",
  ];

  for (const key of CATEGORY_ORDER) {
    const item = selected[key];
    const label = CATEGORY_META[key].label;
    if (!item) {
      lines.push(`${label}: —`);
    } else {
      lines.push(`${label}: ${productFullName(item)}`);
    }
  }

  lines.push("");
  lines.push("──────────────────────────────");
  lines.push(`السعر الإجمالي: ${formatPrice(total)}`);

  if (psu && !selected.psu) {
    lines.push(`مزود الطاقة المقترح: ${psu}W`);
  }

  if (issues.length > 0) {
    lines.push("");
    lines.push("⚠ تنبيهات التوافق:");
    for (const issue of issues) {
      lines.push(`• ${issue.message}`);
    }
  }

  lines.push("");
  lines.push("القزاز لخدمات الحاسبات — تجميعة حاسوب مخصصة");

  return lines.join("\n");
}

export function buildPrintHtml(
  { selected, total, issues }: BuildExportInput,
  assets: { logoUrl: string; splashUrl: string }
) {
  const rowsHtml = CATEGORY_ORDER.map((key) => {
    const item = selected[key];
    const meta = CATEGORY_META[key];

    if (!item) {
      return `
        <tr>
          <td class="cat">${meta.label}</td>
          <td class="name muted">—</td>
        </tr>
      `;
    }

    const specsInline = productSpecEntries(item)
      .map((s) => `${s.label}: ${s.value}`)
      .join(" · ");

    return `
      <tr>
        <td class="cat">${meta.label}</td>
        <td class="name">
          <strong>${productFullName(item)}</strong>
          ${specsInline ? `<span class="specs">${specsInline}</span>` : ""}
        </td>
      </tr>
    `;
  }).join("");

  const issuesHtml =
    issues.length > 0
      ? `<aside class="issues"><ul>${issues.map((i) => `<li>${i.message}</li>`).join("")}</ul></aside>`
      : "";

  const selectedCount = CATEGORY_ORDER.filter((k) => selected[k]).length;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تجميعة القزاز — ${formatDate()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4 portrait; margin: 10mm; }
    html, body {
      width: 210mm;
      height: 297mm;
      font-family: "Cairo", sans-serif;
      color: #0f2430;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body { background: #fff; }
    .sheet {
      width: 100%;
      height: 100%;
      max-height: 277mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      page-break-inside: avoid;
      page-break-after: avoid;
    }
    .head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      background: #1a7089;
      color: #fff;
      border-radius: 8px;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand img { width: 40px; height: 40px; object-fit: contain; }
    .brand h1 { font-size: 16px; font-weight: 700; }
    .brand p { font-size: 10px; opacity: 0.9; }
    .date { font-size: 10px; opacity: 0.9; text-align: left; }
    .content {
      flex: 1;
      padding: 10px 2px 0;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }
    .title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      color: #1a7089;
      font-weight: 700;
    }
    table { width: 100%; border-collapse: collapse; }
    tr { border-bottom: 1px solid #e2eaef; }
    tr:last-child { border-bottom: none; }
    td { padding: 5px 4px; vertical-align: top; font-size: 10px; line-height: 1.45; }
    .cat {
      width: 72px;
      font-weight: 700;
      color: #1a7089;
      white-space: nowrap;
    }
    .name strong {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: #0f2430;
    }
    .specs {
      display: block;
      margin-top: 1px;
      font-size: 9px;
      color: #5f7480;
    }
    .muted { color: #8a9ba6; }
    .issues {
      margin-top: 6px;
      padding: 6px 8px;
      border-radius: 6px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 9px;
    }
    .issues ul { padding-right: 14px; margin-top: 2px; }
    .total {
      margin-top: auto;
      padding: 10px 12px;
      border-radius: 8px;
      background: #1a7089;
      color: #fff;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .total span { font-size: 11px; }
    .total strong { font-size: 20px; font-weight: 800; }
    .foot {
      margin-top: 6px;
      text-align: center;
      font-size: 8px;
      color: #8a9ba6;
    }
    @media print {
      html, body { width: auto; height: auto; }
      .sheet { max-height: none; height: auto; }
    }
  </style>
</head>
<body>
  <article class="sheet">
    <header class="head">
      <div class="brand">
        <img src="${assets.logoUrl}" alt="القزاز" />
        <div>
          <h1>القزاز لخدمات الحاسبات</h1>
          <p>مواصفات التجميعة — ${selectedCount}/${CATEGORY_ORDER.length}</p>
        </div>
      </div>
      <div class="date">${formatDate()}</div>
    </header>

    <main class="content">
      <div class="title">
        <span>تفاصيل القطع</span>
        <span>الأسعار بـ IQD — بدون أسعار فردية</span>
      </div>

      <table>
        <tbody>${rowsHtml}</tbody>
      </table>

      ${issuesHtml}

      <div class="total">
        <span>السعر الإجمالي</span>
        <strong dir="ltr">${formatPrice(total)}</strong>
      </div>

      <p class="foot">القزاز لخدمات الحاسبات — AL-QAZZAZ COMPUTERS</p>
    </main>
  </article>
</body>
</html>`;
}

const PRINT_TRIGGER_SCRIPT = `
<script>
(function () {
  function triggerPrint() {
    window.focus();
    window.print();
  }

  function waitForImages() {
    var imgs = document.querySelectorAll("img");
    if (!imgs.length) {
      setTimeout(triggerPrint, 400);
      return;
    }

    var remaining = imgs.length;
    function done() {
      remaining -= 1;
      if (remaining <= 0) setTimeout(triggerPrint, 400);
    }

    imgs.forEach(function (img) {
      if (img.complete) done();
      else {
        img.addEventListener("load", done);
        img.addEventListener("error", done);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", waitForImages);
  } else {
    waitForImages();
  }
})();
</script>`;

function withPrintScript(html: string) {
  return html.replace("</body>", `${PRINT_TRIGGER_SCRIPT}</body>`);
}

export function renderPrintDocument(html: string) {
  document.open();
  document.write(withPrintScript(html));
  document.close();
}

function printInIframe(html: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "طباعة تجميعة القزاز");
  iframe.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;border:0;z-index:99999;background:#fff;";

  document.body.appendChild(iframe);

  const win = iframe.contentWindow;
  const doc = win?.document;
  if (!win || !doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(withPrintScript(html));
  doc.close();

  const cleanup = () => {
    window.setTimeout(() => iframe.remove(), 500);
  };

  win.addEventListener("afterprint", cleanup, { once: true });
  window.setTimeout(cleanup, 120_000);

  return true;
}

function printViaTab(input: BuildExportInput): boolean {
  const origin = window.location.origin;
  const popup = window.open(`${origin}/print`, "_blank");
  if (!popup) return false;

  let delivered = false;

  const deliver = () => {
    if (delivered) return;
    delivered = true;
    popup.postMessage({ type: PRINT_MESSAGE, payload: input }, origin);
  };

  const onReady = (event: MessageEvent) => {
    if (event.origin !== origin || event.data?.type !== PRINT_READY) return;
    deliver();
    window.removeEventListener("message", onReady);
  };

  window.addEventListener("message", onReady);
  window.setTimeout(deliver, 400);
  window.setTimeout(() => window.removeEventListener("message", onReady), 5000);

  return true;
}

export function printBuildSpecs(input: BuildExportInput) {
  if (typeof window === "undefined") return false;
  if (!isBuildReady(input.selected, input.issues)) return false;

  const origin = window.location.origin;
  const html = buildPrintHtml(input, {
    logoUrl: `${origin}/brand/mark.png`,
    splashUrl: `${origin}/brand/splash.jpg`,
  });

  // Same-page iframe: works in preview environments where blob: URLs fail (ERR_FILE_NOT_FOUND).
  if (printInIframe(html)) return true;

  // Optional tab preview via same-origin postMessage (no blob/sessionStorage).
  return printViaTab(input);
}

export async function copyBuildSpecs(input: BuildExportInput) {
  if (!isBuildReady(input.selected, input.issues)) {
    throw new Error("Build not ready");
  }
  const text = buildSummaryPlainText(input);
  await navigator.clipboard.writeText(text);
  return text;
}
