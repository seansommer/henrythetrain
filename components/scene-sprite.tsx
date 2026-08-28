/* eslint-disable @next/next/no-img-element -- Small pre-cropped sprites need no image optimizer. */
import sheet from "@/lib/scene-sprites.json";
import clips from "@/lib/crossing-clips.json";
import { useId } from "react";
import { assetUrl } from "@/lib/asset-url";

export type SceneSpriteName = keyof typeof sheet.sprites;
const WILDLIFE = new Set(["deer", "rabbit", "raccoon", "bear", "blue-birds", "brown-birds"]);

/** The illustrated rows are not evenly spaced. Crop each subject explicitly. */
export function SceneSprite({ name, stretch = false }: { name: SceneSpriteName; stretch?: boolean }) {
  const [x, y, width, height] = sheet.sprites[name];
  const id = useId();
  const clip = clips[name as keyof typeof clips];

  // Ordinary PNGs avoid SVG/WebP atlas decoding and clipping differences on phones.
  if (WILDLIFE.has(name)) {
    return <img className="scene-sprite" src={assetUrl(`/assets/wildlife/${name}.png`)}
      width={width} height={height} alt="" aria-hidden="true" draggable={false} />;
  }

  return (
    <svg
      className="scene-sprite"
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio={stretch ? "none" : "xMidYMax meet"}
      aria-hidden="true"
      focusable="false"
    >
      {clip && <defs><clipPath id={id}><path d={clip} /></clipPath></defs>}
      <image href={assetUrl(sheet.atlas)} width={sheet.width} height={sheet.height} clipPath={clip ? `url(#${id})` : undefined} />
    </svg>
  );
}
