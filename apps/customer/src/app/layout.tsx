import type { Metadata } from "next";
import { Lora, Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
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
  title: "Healthy Foods | Fresh Daily Salads",
  description:
    "Healthy Foods crafts fresh small-batch salads daily. Create an account with mobile OTP + password, save your delivery addresses, and order online.",
  openGraph: {
    title: "Healthy Foods — Fresh Daily Salads",
    description:
      "Crisp, wholesome salad bowls prepared fresh each morning for campus and local delivery.",
    type: "website",
    locale: "en_US",
    siteName: "Healthy Foods",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lora.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen antialiased selection:bg-[var(--bg-accent-soft)] selection:text-[var(--text-primary)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
