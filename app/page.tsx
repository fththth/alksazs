"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const BuilderApp = dynamic(
  () => import("@/components/builder/builder-app").then((mod) => mod.BuilderApp),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
        <Loader2 className="size-8 animate-spin text-cyan-200" />
        <p>قاعدين نجهّز القطع...</p>
      </div>
    ),
  }
);

export default function HomePage() {
  return <BuilderApp />;
}
