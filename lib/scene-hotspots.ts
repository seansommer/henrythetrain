export type Hotspot = { x: number; y: number; width: number; height: number };
const IMAGE_WIDTH = 1672;
const IMAGE_HEIGHT = 941;
const ANCHORS = {
  tree: [[1520, 287, 210, 210], [76, 244, 178, 256], [413, 330, 135, 126], [919, 414, 54, 40]],
  rock: [[1465, 748, 230, 170], [247, 728, 230, 150], [474, 778, 84, 64], [1370, 501, 100, 50], [361, 461, 120, 65], [938, 796, 45, 30]],
} as const;

/** Match background-size: cover and its vertical position, including phone crops. */
export function sceneHotspots(width: number, height: number): Record<"tree" | "rock", Hotspot> {
  const scale = Math.max(width / IMAGE_WIDTH, height / IMAGE_HEIGHT);
  const offsetX = (width - IMAGE_WIDTH * scale) / 2;
  const offsetY = (height - IMAGE_HEIGHT * scale) * (width <= 560 ? 0.65 : 0.59);
  const place = (anchors: typeof ANCHORS.tree | typeof ANCHORS.rock) => {
    const mapped = anchors.map(([x, y, w, h]) => ({
      x: x * scale + offsetX, y: y * scale + offsetY,
      width: Math.max(48, w * scale), height: Math.max(48, h * scale),
    }));
    return mapped.find((a) => a.x - a.width / 2 >= 4 && a.x + a.width / 2 <= width - 4 && a.y - a.height / 2 > 0 && a.y + a.height / 2 < height - 28) ?? mapped.at(-1)!;
  };
  return { tree: place(ANCHORS.tree), rock: place(ANCHORS.rock) };
}
