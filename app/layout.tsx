import type { Metadata, Viewport } from "next";
import "./globals.css";
import { assetUrl } from "@/lib/asset-url";

const siteUrl = process.env.NEXT_PUBLIC_BASE_PATH
  ? `https://seansommer.github.io${assetUrl("/")}`
  : "https://henry-the-train.fatherearth.chatgpt.site/";
const description = "All aboard! Tap trains, crossing lights, gates, and hidden surprises in Henry's playful railroad world.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#163e57",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Henry the Train",
  description,
  applicationName: "Henry the Train",
  alternates: { canonical: siteUrl },
  manifest: assetUrl("/manifest.webmanifest"),
  appleWebApp: { capable: true, title: "Henry the Train", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: assetUrl("/favicon-32.png"), sizes: "32x32", type: "image/png" },
      { url: assetUrl("/favicon-48.png"), sizes: "48x48", type: "image/png" },
    ],
    shortcut: assetUrl("/favicon.ico"),
    apple: [{ url: assetUrl("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website", title: "Henry the Train", siteName: "Henry the Train",
    description, url: siteUrl,
    images: [{ url: new URL("og.png", siteUrl).href, width: 1200, height: 630, alt: "Henry the Train — a blue steam train at a sunny countryside crossing" }],
  },
  twitter: {
    card: "summary_large_image", title: "Henry the Train", description,
    images: [new URL("og.png", siteUrl).href],
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
