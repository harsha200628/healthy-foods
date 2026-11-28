import type { Metadata, Viewport } from "next";
import "@fontsource-variable/lora";
import "@fontsource-variable/plus-jakarta-sans";
import { OwnerAuthProvider } from "@/components/providers/OwnerAuthProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f8f5",
};

export const metadata: Metadata = {
  title: "Healthy Foods — Owner Kitchen Portal",
  description:
    "Private owner kitchen console for Healthy Foods to manage menu items, upload salad photos, inspect delivery locations, and accept, decline, or mark orders delivered.",
  appleWebApp: {
    capable: true,
    title: "HF Kitchen",
    statusBarStyle: "default",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <OwnerAuthProvider>{children}</OwnerAuthProvider>
      </body>
    </html>
  );
}
