import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CatalogProvider } from "@/components/catalog-provider";
import { ShopThemeProvider } from "@/components/shop-theme-provider";
import { SiteHeader } from "@/components/site-header";
import { readCatalog } from "@/lib/catalog";
import { parseThemeMode } from "@/lib/theme";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "القزاز لخدمات الحاسبات",
  description:
    "جهّز حاسبك من القزاز لخدمات الحاسبات: معالج، مذربورد، رامات، كرت شاشة، تخزين، كولر، مزود طاقة، وكيس — والسعر الإجمالي يطلع مباشرة.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = await readCatalog();
  const themeMode = parseThemeMode(catalog.settings.themeMode);

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased${themeMode === "dark" ? " dark" : ""}`}
      suppressHydrationWarning
    >
      <body className={`${cairo.className} min-h-full flex flex-col bg-background text-foreground`}>
        <CatalogProvider initialCatalog={catalog}>
          <ShopThemeProvider>
            <SiteHeader />
            {children}
          </ShopThemeProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
