import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: {
    default: "PantryPal",
    template: "%s | PantryPal"
  },
  description: "Lista de compras privada e stock simples para casa.",
  applicationName: "PantryPal",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PantryPal",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/pantrypal-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/pantrypal-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/pantrypal-icon.svg", type: "image/svg+xml" }
    ],
    apple: [{ url: "/icons/pantrypal-192.png", sizes: "192x192", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#fbf9f8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
