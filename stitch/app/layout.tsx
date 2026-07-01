import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ProductConsultantChatWidget } from "@/components/product-consultant-chat-widget";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "The Kinetic Vault",
  description: "Bộ giao diện quản trị dựng bằng Next.js",
};

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${manrope.variable}`}>
      <body>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader
            color="#3b82f6"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
          />
          {children}
          <ProductConsultantChatWidget />
          <Toaster
            richColors
            position="top-right"
            expand={true}
            gap={8}
            offset={16}
            toastOptions={{
              duration: 4000,
              classNames: {
                toast:
                  "!rounded-2xl !border !shadow-2xl !backdrop-blur-xl !font-sans",
                title: "!font-bold !text-sm",
                description: "!text-xs !opacity-75",
                actionButton: "!rounded-xl !text-xs !font-bold",
                cancelButton: "!rounded-xl !text-xs",
                closeButton:
                  "!rounded-full !border !border-white/20 !bg-white/10 !text-white/70 hover:!bg-white/20",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
