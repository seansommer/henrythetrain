import sheet from "@/lib/scene-sprites.json";

export type SceneSpriteName = keyof typeof sheet.sprites;

/** The illustrated rows are not evenly spaced. Crop each subject explicitly. */
export function SceneSprite({ name }: { name: SceneSpriteName }) {
  const [x, y, width, height] = sheet.sprites[name];

  return (
    <svg
      className="scene-sprite"
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
      focusable="false"
    >
      <image href={sheet.atlas} width={sheet.width} height={sheet.height} />
    </svg>
  );
}
