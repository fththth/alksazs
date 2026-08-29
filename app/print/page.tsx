"use client";

import { useEffect } from "react";
import { buildPrintHtml, renderPrintDocument } from "@/lib/build-specs";
import { clearPrintBuild, loadPrintBuild } from "@/lib/print-storage";

export default function PrintPage() {
  useEffect(() => {
    const payload = loadPrintBuild();
    if (!payload) {
      document.body.innerHTML =
        '<p style="font-family:Cairo,sans-serif;text-align:center;padding:48px;color:#5f7480">ماكو بيانات للطباعة. ارجع للموقع واختر قطعك ثم اضغط طباعة.</p>';
      return;
    }

    clearPrintBuild();

    const origin = window.location.origin;
    const html = buildPrintHtml(payload, {
      logoUrl: `${origin}/brand/mark.png`,
      splashUrl: `${origin}/brand/splash.jpg`,
    });

    renderPrintDocument(html);
  }, []);

  return (
    <div
      style={{
        fontFamily: "Cairo, sans-serif",
        textAlign: "center",
        padding: 48,
        color: "#1a7089",
      }}
    >
      جاري تحضير الطباعة…
    </div>
  );
}
