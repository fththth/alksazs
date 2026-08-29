import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "القزاز للحاسبات",
  description:
    "جهّز حاسبك من القزاز للحاسبات: معالج، مذربود، رامات، كرت شاشة، تخزين، كولر، وكيس — والسعر الإجمالي يطلع مباشرة.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`${cairo.className} min-h-full flex flex-col bg-background text-foreground`}>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
