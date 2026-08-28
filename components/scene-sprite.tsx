import sheet from "@/lib/scene-sprites.json";
import clips from "@/lib/crossing-clips.json";
import { useId } from "react";
import { assetUrl } from "@/lib/asset-url";

export type SceneSpriteName = keyof typeof sheet.sprites;

/** The illustrated rows are not evenly spaced. Crop each subject explicitly. */
export function SceneSprite({ name, stretch = false }: { name: SceneSpriteName; stretch?: boolean }) {
  const [x, y, width, height] = sheet.sprites[name];
  const id = useId();
  const clip = clips[name as keyof typeof clips];

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
