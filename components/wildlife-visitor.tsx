import type { CSSProperties } from "react";
import { WildlifeSprite } from "@/components/wildlife-sprite";
import { wildlifePath, type WildlifeKind } from "@/lib/wildlife-motion";
import type { SceneCamera } from "@/lib/scene-hotspots";

export function WildlifeVisitor({ kind, camera, index = 0 }: { kind: WildlifeKind; camera: SceneCamera; index?: number }) {
  const path = wildlifePath(camera, kind, index);
  const style = {
    width: path.width, height: path.height,
    "--visit-time": `${path.duration}ms`, "--visit-delay": `${index * 180}ms`,
    "--from-x": `${path.fromX}px`, "--from-y": `${path.fromY}px`,
    "--stop-x": `${path.stopX}px`, "--stop-y": `${path.stopY}px`,
    "--to-x": `${path.toX}px`, "--to-y": `${path.toY}px`,
  } as CSSProperties;
  return <div className={`wildlife-visitor visitor-${kind}`} style={style} aria-hidden="true">
    <div className="wildlife-body"><WildlifeSprite kind={kind} scale={camera.scale} index={index} /></div>
  </div>;
}
