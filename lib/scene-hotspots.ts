export type Hotspot = { x: number; y: number; width: number; height: number; rotation?: number };
export type SceneCamera = { scale: number; x: number; y: number; width: number; height: number };

// All art and movement use world units; only this camera scales the scene.
export const WORLD = { width: 3072, height: 2048, railY: 1280, trainWidth: 1000 } as const;
export const ACTION_AREA = { width: 1000, height: 750 } as const;
export const SIGNALS = {
  left: { x: 1039, y: 1090, width: 162, height: 340 },
  right: { x: 1871, y: 1090, width: 162, height: 340 },
} as const;
export const GATES = { left: { x: 1120, y: 1360 }, right: { x: 1952, y: 1360 } } as const;
export const SCENE_TARGETS = {
  tree: { x: 1125, y: 1000, width: 160, height: 150 },
  rock: { x: 1920, y: 1480, width: 160, height: 150 },
  train: { x: 1536, y: WORLD.railY, width: 230, height: 120 },
} as const;

export function sceneCamera(width: number, height: number): SceneCamera {
  width = Math.max(1, width); height = Math.max(1, height);
  const scale = Math.min(width / ACTION_AREA.width, height / ACTION_AREA.height);
  const worldHeight = WORLD.height * scale;
  const desiredY = height * 0.56 - WORLD.railY * scale;
  const y = worldHeight < height ? (height - worldHeight) / 2 : Math.max(height - worldHeight, Math.min(0, desiredY));
  return { scale, x: (width - WORLD.width * scale) / 2, y, width, height };
}
export function projectTarget(camera: SceneCamera, target: Hotspot): Hotspot {
  return { x: camera.x + target.x * camera.scale, y: camera.y + target.y * camera.scale,
    width: Math.max(44, target.width * camera.scale), height: Math.max(44, target.height * camera.scale) };
}
export function sceneHotspots(camera: SceneCamera) {
  return { tree: projectTarget(camera, SCENE_TARGETS.tree), rock: projectTarget(camera, SCENE_TARGETS.rock) };
}
export function trackHotspot(camera: SceneCamera) { return projectTarget(camera, SCENE_TARGETS.train); }
export function signalHotspot(camera: SceneCamera, side: keyof typeof SIGNALS) {
  const s = SIGNALS[side];
  return projectTarget(camera, { x: s.x + s.width / 2, y: s.y + s.height * 0.4, width: s.width, height: s.height * 0.6 });
}
export function gateHotspot(camera: SceneCamera, side: keyof typeof GATES) {
  const hinge = GATES[side];
  return { ...projectTarget(camera, { x: hinge.x + (side === "left" ? 73 : -73), y: hinge.y - 202, width: 430, height: 98 }), rotation: side === "left" ? -70 : 70 };
}
export function trainTravel(camera: SceneCamera, direction: "left" | "right", trainWidth: number = WORLD.trainWidth) {
  const left = -camera.x / camera.scale - trainWidth - 24;
  const right = (camera.width - camera.x) / camera.scale + 24;
  return direction === "right" ? { from: left, to: right } : { from: right, to: left };
}
