import { useId } from "react";
import sheet from "@/lib/surprise-sprites.json";
import { assetUrl } from "@/lib/asset-url";

export type SurpriseSpriteName = keyof typeof sheet.sprites;

/** Native silhouette clips remove the generated matte without altering artwork. */
export function SurpriseSprite({ name }: { name: SurpriseSpriteName }) {
  const id = useId();
  const { crop: [x, y, width, height], clip } = sheet.sprites[name];
  return (
    <svg className="scene-sprite" viewBox={`${x} ${y} ${width} ${height}`} preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <defs><clipPath id={id}><path d={clip} /></clipPath></defs>
      <image href={assetUrl(sheet.atlas)} width={sheet.width} height={sheet.height} clipPath={`url(#${id})`} />
    </svg>
  );
}
