"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MonitorSmartphone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const onDashboard = pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0b0d14]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <BrandMark className="size-9 drop-shadow-[0_0_18px_rgba(212,160,23,0.35)]" />
          <span className="leading-tight">
            <span className="block font-heading text-lg font-bold tracking-tight text-amber-100">
              القزاز
            </span>
            <span className="block text-[11px] font-medium tracking-[0.18em] text-amber-200/55">
              للحاسبات
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: onDashboard ? "ghost" : "secondary", size: "sm" }),
              !onDashboard && "bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
            )}
          >
            <MonitorSmartphone />
            تجميعة الزبون
          </Link>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: onDashboard ? "secondary" : "ghost", size: "sm" }),
              onDashboard && "bg-amber-400/15 text-amber-100 hover:bg-amber-400/25"
            )}
          >
            <LayoutDashboard />
            لوحة التحكم
          </Link>
        </nav>
      </div>
    </header>
  );
}
