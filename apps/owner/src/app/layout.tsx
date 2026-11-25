import type { Metadata } from "next";
import "@fontsource-variable/lora";
import "@fontsource-variable/plus-jakarta-sans";
import { OwnerAuthProvider } from "@/components/providers/OwnerAuthProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Healthy Foods — Owner Kitchen Portal",
  description:
    "Private owner kitchen console for Healthy Foods to manage menu items, upload salad photos, inspect delivery locations, and accept, decline, or mark orders delivered.",
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
