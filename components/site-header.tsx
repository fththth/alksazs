"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, MonitorSmartphone } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const onDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    router.prefetch(onDashboard ? "/" : "/dashboard");
  }, [onDashboard, router]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/15 bg-[#1a5a73]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" prefetch className="flex items-center gap-3">
          <BrandMark className="size-12" size={96} />
          <span className="leading-tight">
            <span className="block font-heading text-lg font-bold tracking-tight text-white">
              القزاز
            </span>
            <span className="block text-[12px] font-semibold text-white/80">
              لخدمات الحاسبات
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            prefetch
            className={cn(
              buttonVariants({ variant: onDashboard ? "ghost" : "secondary", size: "sm" }),
              !onDashboard && "bg-white text-[#12394c] hover:bg-white/90"
            )}
          >
            <MonitorSmartphone />
            تجميعة الزبون
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className={cn(
              buttonVariants({ variant: onDashboard ? "secondary" : "ghost", size: "sm" }),
              onDashboard && "bg-white text-[#12394c] hover:bg-white/90"
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
