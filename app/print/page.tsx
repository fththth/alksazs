"use client";

import { useEffect, useRef } from "react";
import { buildPrintHtml, renderPrintDocument } from "@/lib/build-specs";
import type { PrintBuildPayload } from "@/lib/print-storage";
import { loadPrintBuild } from "@/lib/print-storage";

const PRINT_MESSAGE = "QAZZAZ_PRINT";

export default function PrintPage() {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const origin = window.location.origin;

    function render(payload: PrintBuildPayload) {
      const html = buildPrintHtml(payload, {
        logoUrl: `${origin}/brand/mark.png`,
        splashUrl: `${origin}/brand/splash.jpg`,
      });
      renderPrintDocument(html);
    }

    function showMissing() {
      document.body.innerHTML =
        '<p style="font-family:Cairo,sans-serif;text-align:center;padding:48px;color:#5f7480">ماكو بيانات للطباعة. ارجع للموقع واختر قطعك ثم اضغط طباعة.</p>';
    }

    const cached = loadPrintBuild();
    if (cached) {
      render(cached);
      return;
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== origin) return;
      if (event.data?.type !== PRINT_MESSAGE || !event.data.payload) return;
      window.removeEventListener("message", onMessage);
      render(event.data.payload as PrintBuildPayload);
    }

    window.addEventListener("message", onMessage);

    if (window.opener) {
      window.opener.postMessage({ type: "QAZZAZ_PRINT_READY" }, origin);
      window.setTimeout(() => {
        window.removeEventListener("message", onMessage);
        if (document.body.innerText.includes("جاري تحضير")) showMissing();
      }, 3000);
      return;
    }

    showMissing();
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
