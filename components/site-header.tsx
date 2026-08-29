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
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" prefetch className="flex items-center gap-3">
          <BrandMark className="size-10" size={80} />
          <span className="leading-tight">
            <span className="block font-heading text-base font-bold tracking-tight text-foreground">
              القزاز
            </span>
            <span className="block text-[11px] font-medium text-muted-foreground">
              لخدمات الحاسبات
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 rounded-full border border-border bg-muted/60 p-1">
          <Link
            href="/"
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full",
              !onDashboard && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <MonitorSmartphone />
            <span className="hidden sm:inline">تجميعة الزبون</span>
            <span className="sm:hidden">التجميعة</span>
          </Link>
          <Link
            href="/dashboard"
            prefetch
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "rounded-full",
              onDashboard && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <LayoutDashboard />
            <span className="hidden sm:inline">لوحة التحكم</span>
            <span className="sm:hidden">التحكم</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
