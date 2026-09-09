"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { assetUrl } from "@/lib/asset-url";
import { WILDLIFE, type WildlifeKind } from "@/lib/wildlife-motion";
import { createWildlifeRenderer, WILDLIFE_PADDING } from "@/lib/wildlife-renderer";

export function WildlifeSprite({ kind, scale, index }: { kind: WildlifeKind; scale: number; index: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [animated, setAnimated] = useState(false);
  const src = assetUrl(`/assets/wildlife-v3/${kind}.webp`), spec = WILDLIFE[kind];
  useEffect(() => {
    if (!canvas.current) return;
    const density = Math.min(window.devicePixelRatio || 1, 2), padding = 1 + WILDLIFE_PADDING * 2;
    canvas.current.width = Math.max(64, Math.ceil(spec.width * scale * density * padding));
    canvas.current.height = Math.max(64, Math.ceil(spec.height * scale * density * padding));
  }, [scale, spec.width, spec.height]);

  useEffect(() => {
    const surface = canvas.current;
    if (!surface) return;
    let alive = true, frame = 0, lastFrame = -Infinity;
    let renderer: ReturnType<typeof createWildlifeRenderer> = null;
    const started = performance.now() + index * 180;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const image = new Image();
    const tick = (now: number) => {
      if (!alive || !renderer || document.hidden || reduced.matches) return;
      if (now - lastFrame >= 1000 / 30) {
        const elapsed = Math.max(0, now - started);
        if (!renderer.draw(elapsed / 1000, elapsed / spec.duration)) { setAnimated(false); return; }
        lastFrame = now;
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      if (!alive || !renderer) return;
      setAnimated(!reduced.matches);
      if (!document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
    };
    const lost = () => { cancelAnimationFrame(frame); if (alive) setAnimated(false); };
    image.onload = () => {
      if (!alive) return;
      renderer = createWildlifeRenderer(surface, image, kind);
      if (renderer) {
        renderer.draw(0, 0);
        resume();
      }
    };
    surface.addEventListener("webglcontextlost", lost);
    document.addEventListener("visibilitychange", resume);
    reduced.addEventListener("change", resume);
    image.src = src;
    return () => {
      alive = false; image.onload = null; cancelAnimationFrame(frame);
      surface.removeEventListener("webglcontextlost", lost);
      document.removeEventListener("visibilitychange", resume);
      reduced.removeEventListener("change", resume);
      renderer?.dispose();
    };
  }, [src, kind, index, spec.duration]);

  const padding = `${WILDLIFE_PADDING * 100}%`;
  return <div className={`wildlife-art ${animated ? "is-articulated" : ""}`} style={{ "--art-padding": padding } as CSSProperties}>
    <img className="scene-sprite wildlife-still" src={src} alt="" draggable={false} />
    <canvas ref={canvas} className="wildlife-canvas" aria-hidden="true" />
  </div>;
}
