/* eslint-disable @next/next/no-img-element -- Native silhouette clips are pre-rendered to PNG. */
import sheet from "@/lib/surprise-sprites.json";
import { assetUrl } from "@/lib/asset-url";

export type SurpriseSpriteName = keyof typeof sheet.sprites;

/** Pre-rendered native silhouettes preserve the art without a live SVG clip. */
export function SurpriseSprite({ name }: { name: SurpriseSpriteName }) {
  const { crop: [, , width, height] } = sheet.sprites[name];
  return (
    <img className="scene-sprite" src={assetUrl(`/assets/wildlife/${name}.png`)}
      width={width} height={height} alt="" aria-hidden="true" draggable={false} />
  );
}
