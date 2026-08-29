import type { Metadata } from "next";
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
    "جهّز حاسبك من القزاز لخدمات الحاسبات: معالج، مذربود، رامات، كرت شاشة، تخزين، كولر، وكيس — والسعر الإجمالي يطلع مباشرة.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const catalog = await readCatalog();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} dark h-full antialiased`}
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
