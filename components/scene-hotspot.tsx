import { Button } from "@/components/ui/button";
import type { Hotspot } from "@/lib/scene-hotspots";
import type { SurpriseTarget } from "@/lib/train-profiles";

export function SceneHotspot({ target, bounds, active, onExplore }: {
  target: SurpriseTarget;
  bounds: Hotspot;
  active: boolean;
  onExplore: (target: SurpriseTarget) => void;
}) {
  return (
    <Button type="button" variant="ghost" className={`scene-hotspot hotspot-${target}`}
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height }}
      onClick={() => onExplore(target)} aria-label={`Explore the ${target}: discover a surprise`} aria-disabled={active}>
      <span className="sr-only">Explore the {target}</span>
    </Button>
  );
}
