/* eslint-disable @next/next/no-img-element -- Transparent game sprites need no image optimizer. */
import { assetUrl } from "@/lib/asset-url";
export type SurpriseSpriteName = "squirrel" | "turtle" | "leaf" | "butterfly";
export function SurpriseSprite({ name }: { name: SurpriseSpriteName }) {
  return <img className="scene-sprite" src={assetUrl(`/assets/wildlife-v3/${name}.webp`)} alt="" aria-hidden="true" draggable={false} />;
}
