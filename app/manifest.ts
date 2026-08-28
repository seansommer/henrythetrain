import type { MetadataRoute } from "next";
import { assetUrl } from "@/lib/asset-url";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: assetUrl("/"),
    name: "Henry the Train",
    short_name: "Henry the Train",
    description: "Henry's playful railroad world with trains, lights, gates, and animal surprises.",
    start_url: assetUrl("/"),
    scope: assetUrl("/"),
    display: "standalone",
    orientation: "any",
    background_color: "#91d7f1",
    theme_color: "#163e57",
    icons: [
      { src: assetUrl("/icons/henry-home-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: assetUrl("/icons/henry-home-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      { src: assetUrl("/icons/henry-maskable-512.png"), sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
