import type { Metadata } from "next";
import { B612_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const b612Mono = B612_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-b612-mono",
});

export const metadata: Metadata = {
  title: "CreateVault — Team Reference Library",
  description:
    "Your team's central hub for design references, dev tools, inspiration, and resources. The perfect starting point for any project.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${b612Mono.variable}`}>
      <body className={`min-h-screen bg-neutral-950 text-neutral-50 antialiased ${b612Mono.className}`}>
        <Header />
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <main>{children}</main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
