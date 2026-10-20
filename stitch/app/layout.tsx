import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ProductConsultantChatWidget } from "@/components/product-consultant-chat-widget";
import { ProductCompareProvider } from "@/components/product-compare-context";
import { CompareFloatingBar } from "@/components/compare-floating-bar";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jakarta",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#6366f1",
};

export const metadata: Metadata = {
  title: {
    default: "The Kinetic Vault — Hệ Thống Thương Mại Điện Tử",
    template: "%s | The Kinetic Vault",
  },
  description: "Cửa hàng thời trang & phụ kiện cao cấp — The Kinetic Vault E-commerce",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Kinetic Vault",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
};

import NextTopLoader from "nextjs-toploader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${jakarta.variable}`}>
      <body>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
        {/* PWA Service Worker: Disable & Unregister on localhost in dev to prevent reload loops */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                var isLocal = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
                if (isLocal) {
                  // In local development, unregister any active service worker and clear caches to prevent HMR reload loops
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                    }
                  });
                  if ('caches' in window) {
                    caches.keys().then(function(keys) {
                      for (var i = 0; i < keys.length; i++) caches.delete(keys[i]);
                    });
                  }
                } else {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(reg) { console.log('[PWA] Service Worker đã đăng ký:', reg.scope); })
                      .catch(function(err) { console.warn('[PWA] Service Worker đăng ký thất bại:', err); });
                  });
                }
              }
            `,
          }}
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
            crawl={false}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
          />
          <ProductCompareProvider>
            {children}
            <CompareFloatingBar />
            <ProductConsultantChatWidget />
          </ProductCompareProvider>
          <Toaster
            theme="dark"
            position="top-right"
            expand={true}
            gap={8}
            offset={16}
            toastOptions={{
              duration: 4000,
              classNames: {
                toast:
                  "!rounded-2xl !border !border-white/15 !bg-zinc-950/95 !text-zinc-100 !shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] !backdrop-blur-2xl !font-sans",
                title: "!font-bold !text-sm !text-white",
                description: "!text-xs !text-zinc-300",
                actionButton: "!rounded-xl !text-xs !font-bold",
                cancelButton: "!rounded-xl !text-xs",
                closeButton:
                  "!rounded-full !border !border-white/20 !bg-zinc-900 !text-zinc-400 hover:!text-white hover:!bg-zinc-800",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
