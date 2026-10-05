import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: { default: "Hearth Furniture — Office, Home & Commercial Furniture in Pakistan", template: "%s | Hearth Furniture" },
  description: "Shop executive chairs, office tables, workstations, café and home furniture online. Delivery and installation available.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={manrope.variable} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
