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

  if (psu) {
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
  { selected, total, psu, issues }: BuildExportInput,
  assets: { logoUrl: string; splashUrl: string }
) {
  const rowsHtml = CATEGORY_ORDER.map((key, index) => {
    const item = selected[key];
    const meta = CATEGORY_META[key];
    const rowNum = String(index + 1).padStart(2, "0");

    if (!item) {
      return `
        <tr class="row missing">
          <td class="num">${rowNum}</td>
          <td class="cat">${meta.label}</td>
          <td class="name muted">لم يُختر بعد</td>
        </tr>
      `;
    }

    const specs = productSpecEntries(item);
    const specsHtml =
      specs.length > 0
        ? `<div class="spec-tags">${specs
            .map((s) => `<span class="tag"><em>${s.label}</em> ${s.value}</span>`)
            .join("")}</div>`
        : "";

    return `
      <tr class="row">
        <td class="num">${rowNum}</td>
        <td class="cat">${meta.label}</td>
        <td class="name">
          <strong>${productFullName(item)}</strong>
          ${item.description ? `<span class="desc">${item.description}</span>` : ""}
          ${specsHtml}
        </td>
      </tr>
    `;
  }).join("");

  const issuesHtml =
    issues.length > 0
      ? `<aside class="issues">
          <p class="issues-title">تنبيهات التوافق</p>
          <ul>${issues.map((i) => `<li>${i.message}</li>`).join("")}</ul>
        </aside>`
      : "";

  const psuHtml = psu
    ? `<p class="psu">⚡ مزود الطاقة المقترح: <strong dir="ltr">${psu}W</strong></p>`
    : "";

  const selectedCount = CATEGORY_ORDER.filter((k) => selected[k]).length;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تجميعة القزاز — ${formatDate()}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @page { size: A4; margin: 12mm; }
    body {
      font-family: "Cairo", sans-serif;
      color: #0f2430;
      background: #e8eef2;
      padding: 16px;
      line-height: 1.55;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .doc {
      max-width: 720px;
      margin: 0 auto;
      background: #fff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(15, 36, 48, 0.12);
    }
    .hero {
      position: relative;
      padding: 28px 32px 24px;
      color: #fff;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      inset: 0;
      background: url("${assets.splashUrl}") center/cover no-repeat;
      filter: brightness(0.55) saturate(1.1);
    }
    .hero-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(26, 112, 137, 0.92) 0%, rgba(15, 60, 78, 0.88) 100%);
    }
    .hero-inner {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand img {
      width: 64px;
      height: 64px;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
    }
    .brand h1 {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .brand p {
      font-size: 13px;
      opacity: 0.88;
      margin-top: 2px;
    }
    .badge {
      text-align: left;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 12px;
      padding: 10px 14px;
      font-size: 11px;
      backdrop-filter: blur(4px);
    }
    .badge strong {
      display: block;
      font-size: 13px;
      margin-top: 4px;
    }
    .body { padding: 28px 32px 32px; }
    .subtitle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 2px dashed #c5d5df;
    }
    .subtitle h2 {
      font-size: 18px;
      font-weight: 700;
      color: #1a7089;
    }
    .subtitle span {
      font-size: 12px;
      color: #5f7480;
      background: #eef4f7;
      padding: 4px 10px;
      border-radius: 999px;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 8px;
    }
    .row td {
      vertical-align: top;
      padding: 14px 12px;
      background: #f7fafb;
      border-top: 1px solid #e2eaef;
      border-bottom: 1px solid #e2eaef;
    }
    .row td:first-child {
      border-radius: 0 10px 10px 0;
      border-right: 1px solid #e2eaef;
      width: 36px;
      text-align: center;
      font-weight: 700;
      color: #1a7089;
      font-size: 12px;
    }
    .row td:last-child {
      border-radius: 10px 0 0 10px;
      border-left: 1px solid #e2eaef;
    }
    .row.missing td { background: #fafcfd; border-style: dashed; }
    .cat {
      width: 90px;
      font-size: 12px;
      font-weight: 700;
      color: #1a7089;
      white-space: nowrap;
    }
    .name {
      font-size: 14px;
      line-height: 1.65;
    }
    .name strong {
      display: block;
      font-size: 15px;
      font-weight: 700;
      color: #0f2430;
    }
    .desc {
      display: block;
      font-size: 12px;
      color: #5f7480;
      margin-top: 3px;
    }
    .spec-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }
    .tag {
      font-size: 11px;
      background: #fff;
      border: 1px solid #d4e2ea;
      border-radius: 6px;
      padding: 3px 8px;
      color: #0f2430;
    }
    .tag em {
      font-style: normal;
      color: #5f7480;
      margin-left: 4px;
    }
    .muted { color: #8a9ba6; font-style: italic; }
    .psu {
      margin: 16px 0 0;
      font-size: 13px;
      color: #1a4f61;
      padding: 10px 14px;
      background: #eef7fa;
      border-radius: 10px;
      border-right: 3px solid #1a7089;
    }
    .issues {
      margin-top: 16px;
      padding: 12px 14px;
      border-radius: 10px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #b91c1c;
      font-size: 13px;
    }
    .issues-title { font-weight: 700; margin-bottom: 6px; }
    .issues ul { padding-right: 18px; }
    .total-strip {
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 24px;
      border-radius: 14px;
      background: linear-gradient(135deg, #1a7089, #145a6e);
      color: #fff;
    }
    .total-strip .label {
      font-size: 14px;
      opacity: 0.9;
    }
    .total-strip .label small {
      display: block;
      font-size: 11px;
      opacity: 0.75;
      margin-top: 2px;
    }
    .total-strip .amount {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }
    .footer {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2eaef;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #8a9ba6;
    }
    .footer .stamp {
      font-weight: 700;
      color: #1a7089;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 10px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .doc { box-shadow: none; border-radius: 0; max-width: none; }
    }
  </style>
</head>
<body>
  <article class="doc">
    <header class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-inner">
        <div class="brand">
          <img src="${assets.logoUrl}" alt="القزاز" />
          <div>
            <h1>القزاز لخدمات الحاسبات</h1>
            <p>عرض سعر — تجميعة حاسوب مخصصة</p>
          </div>
        </div>
        <div class="badge">
          تاريخ الإصدار
          <strong>${formatDate()}</strong>
        </div>
      </div>
    </header>

    <main class="body">
      <div class="subtitle">
        <h2>تفاصيل التجميعة</h2>
        <span>${selectedCount} من ${CATEGORY_ORDER.length} قطع</span>
      </div>

      <table>
        <tbody>${rowsHtml}</tbody>
      </table>

      ${psuHtml}
      ${issuesHtml}

      <div class="total-strip">
        <div class="label">
          السعر الإجمالي
          <small>جميع الأسعار بالدينار العراقي (IQD)</small>
        </div>
        <div class="amount" dir="ltr">${formatPrice(total)}</div>
      </div>

      <footer class="footer">
        <span class="stamp">AL-QAZZAZ COMPUTERS</span>
        <span>هذه الوثيقة للاطلاع والطباعة — القزاز لخدمات الحاسبات</span>
      </footer>
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
  if (!isBuildComplete(input.selected)) return false;

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
  if (!isBuildComplete(input.selected)) {
    throw new Error("Build incomplete");
  }
  const text = buildSummaryPlainText(input);
  await navigator.clipboard.writeText(text);
  return text;
}
