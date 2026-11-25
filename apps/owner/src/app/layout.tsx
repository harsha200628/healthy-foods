import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import { OwnerAuthProvider } from "@/components/providers/OwnerAuthProvider";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang="en" className={`${lora.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen antialiased">
        <OwnerAuthProvider>{children}</OwnerAuthProvider>
      </body>
    </html>
  );
}
