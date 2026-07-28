import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { PrototypeBanner } from "@/components/shared/PrototypeBanner";
import { ConnectedHeader } from "@/components/shared/ConnectedHeader";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LOCUS Journey Studio",
  description:
    "Turn the world into a learning environment — Water Writes the Landscape prototype",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${sourceSerif.variable} antialiased`}>
        <PrototypeBanner />
        <header className="border-b border-border bg-surface px-4 py-3">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted">LOCUS</p>
              <h1 className="text-lg font-semibold">Journey Studio</h1>
            </div>
            <ConnectedHeader />
            <RoleSwitcher />
          </div>
        </header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
