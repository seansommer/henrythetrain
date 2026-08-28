import type { Metadata } from "next";
import "./globals.css";
import { assetUrl } from "@/lib/asset-url";

export const metadata: Metadata = {
  title: "Henry the Train",
  description:
    "Push the buttons to send surprise trains past Henry's animated railroad crossing.",
  icons: {
    icon: assetUrl("/favicon.svg"),
    shortcut: assetUrl("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
