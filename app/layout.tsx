import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProxTools",
  description: "Wallet, SMS, SME, billing, and admin inventory dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
