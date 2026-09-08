/* eslint-disable @next/next/no-img-element -- Transparent game sprites need no image optimizer. */
import { assetUrl } from "@/lib/asset-url";
export type SceneSpriteName = "signal-left" | "signal-right" | "deer" | "rabbit" | "raccoon" | "bear" | "blue-birds" | "brown-birds";
export function SceneSprite({ name }: { name: SceneSpriteName }) {
  const folder = name.startsWith("signal-") ? "crossing" : "wildlife-v3";
  return <img className="scene-sprite" src={assetUrl(`/assets/${folder}/${name}.webp`)} alt="" aria-hidden="true" draggable={false} />;
}
