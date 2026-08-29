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
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link href="/" prefetch className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <BrandMark className="size-9 shrink-0 sm:size-10" size={80} />
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-heading text-sm font-bold tracking-tight text-foreground sm:text-base">
              القزاز
            </span>
            <span className="block truncate text-[10px] font-medium text-muted-foreground sm:text-[11px]">
              لخدمات الحاسبات
            </span>
          </span>
        </Link>

        <nav className="flex shrink-0 items-center gap-0.5 rounded-full border border-border bg-muted/60 p-0.5 sm:gap-1 sm:p-1">
          <Link
            href="/"
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 rounded-full px-2.5 text-xs sm:h-8 sm:px-3 sm:text-sm",
              !onDashboard && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <MonitorSmartphone className="size-4" />
            <span className="hidden sm:inline">تجميعة الزبون</span>
            <span className="sm:hidden">التجميعة</span>
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 rounded-full px-2.5 text-xs sm:h-8 sm:px-3 sm:text-sm",
              onDashboard && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <LayoutDashboard className="size-4" />
            <span className="hidden sm:inline">لوحة التحكم</span>
            <span className="sm:hidden">التحكم</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
