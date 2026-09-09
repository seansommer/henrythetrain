import { WORLD, type SceneCamera } from "./scene-hotspots";

export type WildlifeKind = "deer" | "rabbit" | "raccoon" | "bear" | "squirrel" | "turtle" | "blue-birds" | "brown-birds" | "butterfly";
export const WILDLIFE = {
  deer: { width: 190, height: 290, duration: 9500 },
  rabbit: { width: 160, height: 225, duration: 8000 },
  raccoon: { width: 205, height: 240, duration: 10000 },
  bear: { width: 250, height: 270, duration: 8500 },
  squirrel: { width: 190, height: 200, duration: 8000 },
  turtle: { width: 225, height: 180, duration: 11000 },
  "blue-birds": { width: 215, height: 170, duration: 10500 },
  "brown-birds": { width: 200, height: 155, duration: 11500 },
  butterfly: { width: 95, height: 75, duration: 9000 },
} as const;

// Paths use the visible world bounds, so an entrance starts outside every screen.
export function wildlifePath(camera: SceneCamera, kind: WildlifeKind, index = 0) {
  const spec = WILDLIFE[kind];
  const left = -camera.x / camera.scale, top = -camera.y / camera.scale;
  const viewWidth = camera.width / camera.scale, viewHeight = camera.height / camera.scale;
  const right = left + viewWidth, bottom = top + viewHeight;
  const ground = Math.min(bottom - spec.height - 24, Math.max(WORLD.railY + 24, bottom - spec.height - 55));
  let fromX = left - spec.width - 32, fromY = ground;
  let stopX = left + viewWidth * .3 - spec.width / 2, stopY = ground;
  let toX = right + 32, toY = ground;
  if (kind === "raccoon" || kind === "turtle") {
    fromX = right + 32; stopX = left + viewWidth * (kind === "turtle" ? .71 : .54) - spec.width / 2;
    toX = kind === "turtle" ? right + 32 : left - spec.width - 32;
  } else if (kind === "rabbit") {
    fromX = right + 32; fromY = bottom + 32;
    stopX = left + viewWidth * .67 - spec.width / 2; toX = left - spec.width - 32;
  } else if (kind === "bear") {
    fromX = stopX = toX = left + viewWidth * .42 - spec.width / 2;
    fromY = toY = bottom + 32; stopY = bottom - spec.height * .82;
  } else if (kind === "squirrel") {
    stopX = left + viewWidth * .25 - spec.width / 2; toX = left - spec.width - 32;
  } else if (kind.endsWith("birds")) {
    fromY = toY = top + (WORLD.railY - top) * .38 - spec.height / 2;
    stopX = left + viewWidth * .5; stopY = fromY - 80;
    if (kind === "brown-birds") { fromX = right + 32; toX = left - spec.width - 32; fromY += 65; toY += 35; }
  } else if (kind === "butterfly") {
    fromX = left + viewWidth * (.5 + index * .06); fromY = bottom + 90;
    stopX = left + viewWidth * (.44 + index * .08); stopY = top + viewHeight * (.35 + index * .04);
    toX = index % 2 ? left - spec.width - 40 : right + 40; toY = top + 35 + index * 25;
  }
  return { ...spec, fromX, fromY, stopX, stopY, toX, toY };
}
