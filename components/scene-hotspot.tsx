import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Hotspot } from "@/lib/scene-hotspots";

/** Feedback belongs to the tap, never to the length of the action. */
export function SceneHotspot({ bounds, active, label, onActivate, className = "" }: {
  bounds: Hotspot; active: boolean; label: string; onActivate: () => void; className?: string;
}) {
  const [tap, setTap] = useState(0);
  return (
    <Button type="button" variant="ghost" className={`scene-hotspot ${className}`}
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height, transform: `translate(-50%,-50%) rotate(${bounds.rotation || 0}deg)` }}
      onClick={() => { if (!active) { setTap(value => value + 1); onActivate(); } }}
      aria-label={label} aria-disabled={active}>
      {tap > 0 && <span key={tap} className="tap-ring" aria-hidden="true" />}
    </Button>
  );
}
