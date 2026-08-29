import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { CatalogProvider } from "@/components/catalog-provider";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { readCatalog } from "@/lib/catalog";

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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = await readCatalog();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${cairo.className} min-h-full flex flex-col bg-background text-foreground`}>
        <Providers>
          <CatalogProvider initialCatalog={catalog}>
            <SiteHeader />
            {children}
          </CatalogProvider>
        </Providers>
      </body>
    </html>
  );
}
