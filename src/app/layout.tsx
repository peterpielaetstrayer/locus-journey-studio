import type { Metadata } from "next";
import { Geist, Source_Serif_4 } from "next/font/google";
import { AppChrome } from "@/components/shared/AppChrome";
import { ConnectedHeader } from "@/components/shared/ConnectedHeader";
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
    "Water Writes the Landscape — a place-first learning experience at First Landing State Park",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${sourceSerif.variable} antialiased`}>
        <AppChrome connectedHeader={<ConnectedHeader />}>
          {children}
        </AppChrome>
      </body>
    </html>
  );
}
