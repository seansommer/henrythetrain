import type { WildlifeKind } from "./wildlife-motion";

type Bone = {
  pivot: [number, number];
  region: [number, number, number, number];
  angle: number;
  frequency: number;
  phase?: number;
  mode?: "walk" | "idle";
  fold?: number;
};
type Rig = { bones: Bone[]; rest: [number, number]; stride: number; bounce: number };
const TAU = Math.PI * 2;

// Normalized joints in the ORIGINAL transparent artwork. Skinning bends the
// connected image around shoulders, hips and wing roots without cutout seams.
export const WILDLIFE_RIGS: Record<WildlifeKind, Rig> = {
  deer: { rest: [.36, .57], stride: 1.7, bounce: .016, bones: [
    { pivot: [.76,.59], region: [.74,.30,1.13,.76], angle: 0.21, frequency: 1.5, mode: "idle" },
    { pivot: [.28,.66], region: [-.08,.60,.40,1.15], angle: 0.133, frequency: 1.7, mode: "walk" },
    { pivot: [.52,.67], region: [.35,.62,.76,1.15], angle: -0.133, frequency: 1.7, mode: "walk" },
    { pivot: [.57,.43], region: [-.12,-.12,.98,.56], angle: 0.0245, frequency: .45 },
    { pivot: [.27,.57], region: [.08,.41,.36,.69], angle: 0.133, frequency: 1.8 },
  ]},
  rabbit: { rest: [.34,.52], stride: 1.5, bounce: .085, bones: [
    { pivot: [.25,.58], region: [-.12,.42,.35,.76], angle: -0.196, frequency: 1.7, mode: "idle" },
    { pivot: [.43,.31], region: [.22,-.12,.73,.36], angle: -0.056, frequency: 1.5 },
    { pivot: [.60,.36], region: [.55,-.08,1.12,.42], angle: 0.063, frequency: 1.5, phase: .6 },
    { pivot: [.30,.85], region: [-.12,.78,.45,1.16], angle: -0.112, frequency: 1.5, mode: "walk" },
    { pivot: [.63,.85], region: [.46,.77,.87,1.16], angle: 0.112, frequency: 1.5, mode: "walk" },
  ]},
  raccoon: { rest: [.42,.65], stride: 1.6, bounce: .016, bones: [
    { pivot: [.78,.54], region: [.71,.31,1.12,.66], angle: 0.21, frequency: 1.6, mode: "idle" },
    { pivot: [.38,.84], region: [-.12,.46,.43,1.13], angle: -0.084, frequency: .7 },
    { pivot: [.44,.82], region: [.28,.79,.63,1.14], angle: 0.119, frequency: 1.6, mode: "walk" },
    { pivot: [.71,.84], region: [.61,.78,.98,1.14], angle: -0.119, frequency: 1.6, mode: "walk" },
    { pivot: [.57,.46], region: [.11,-.12,.94,.54], angle: 0.0315, frequency: .4 },
  ]},
  bear: { rest: [.28,.72], stride: 1, bounce: 0, bones: [
    { pivot: [.74,.46], region: [.65,.12,1.14,.60], angle: 0.245, frequency: 1.4, mode: "idle" },
    { pivot: [.50,.43], region: [-.10,-.12,.83,.55], angle: 0.0315, frequency: .4 },
    { pivot: [.22,.60], region: [-.10,.42,.32,.89], angle: 0.049, frequency: .65 },
  ]},
  squirrel: { rest: [.22,.73], stride: 2.1, bounce: .028, bones: [
    { pivot: [.82,.58], region: [.77,.31,1.12,.68], angle: .26, frequency: 1.9, mode: "idle" },
    { pivot: [.38,.84], region: [-.14,.05,.48,1.08], angle: -.13, frequency: 1.1 },
    { pivot: [.54,.83], region: [.36,.74,.69,1.15], angle: .16, frequency: 2.1, mode: "walk" },
    { pivot: [.75,.82], region: [.67,.76,.99,1.15], angle: -.16, frequency: 2.1, mode: "walk" },
    { pivot: [.68,.46], region: [.40,-.12,.95,.57], angle: .04, frequency: .6 },
  ]},
  turtle: { rest: [.46,.64], stride: .85, bounce: .006, bones: [
    { pivot: [.69,.49], region: [.54,-.12,1.13,.68], angle: .055, frequency: .45 },
    { pivot: [.15,.80], region: [-.12,.72,.29,1.14], angle: .15, frequency: .85, mode: "walk" },
    { pivot: [.49,.75], region: [.33,.69,.64,1.14], angle: -.14, frequency: .85, mode: "walk" },
    { pivot: [.81,.75], region: [.73,.66,1.13,1.13], angle: .13, frequency: .85, mode: "walk" },
  ]},
  "blue-birds": { rest: [0,0], stride: 0, bounce: 0, bones: [
    { pivot: [.44,.60], region: [-.16,-.16,.48,.84], angle: -.29, frequency: 2.8 },
    { pivot: [.75,.59], region: [.69,-.13,1.15,.85], angle: .29, frequency: 2.8 },
    { pivot: [.44,.74], region: [.04,.68,.52,1.13], angle: .08, frequency: 1.4 },
  ]},
  "brown-birds": { rest: [0,0], stride: 0, bounce: 0, bones: [
    { pivot: [.39,.59], region: [-.16,-.16,.47,.84], angle: -.295, frequency: 2.5 },
    { pivot: [.69,.59], region: [.64,-.16,1.16,.84], angle: .295, frequency: 2.5 },
    { pivot: [.42,.75], region: [.06,.69,.50,1.14], angle: .09, frequency: 1.25 },
  ]},
  butterfly: { rest: [0,0], stride: 0, bounce: 0, bones: [
    { pivot: [.49,.53], region: [-.2,-.2,.49,1.2], angle: -.025, frequency: 3.2, fold: .52 },
    { pivot: [.51,.53], region: [.51,-.2,1.2,1.2], angle: .025, frequency: 3.2, fold: .52 },
  ]},
};

function smooth(a: number, b: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export function walkingAmount(kind: WildlifeKind, progress: number) {
  const [start,end] = WILDLIFE_RIGS[kind].rest;
  if (!end || kind === "bear") return 0;
  return 1 - smooth(start - .035, start, progress) * (1 - smooth(end, end + .035, progress));
}

export function createWildlifeMesh(kind: WildlifeKind, columns = 24, rows = 24) {
  const bones = WILDLIFE_RIGS[kind].bones;
  const coordinates: number[] = [], weights: number[][] = [], indices: number[] = [];
  for (let row = 0; row <= rows; row++) for (let col = 0; col <= columns; col++) {
    const x = col / columns, y = row / rows;
    coordinates.push(x, y);
    weights.push(bones.map(({ region: [left,top,right,bottom] }, index) => {
      // Wing tips follow their shoulder; feather into the chest gradually.
      if (kind.endsWith("birds") && index < 2) {
        const side = index === 0 ? 1 - smooth(.10,.48,x) : smooth(.64,.96,x);
        return side * (1 - smooth(.65,.95,y));
      }
      const featherX = (right - left) * .22, featherY = (bottom - top) * .22;
      return smooth(left, left + featherX, x) * (1 - smooth(right - featherX, right, x))
        * smooth(top, top + featherY, y) * (1 - smooth(bottom - featherY, bottom, y));
    }));
    if (row < rows && col < columns) {
      const a = row * (columns + 1) + col, b = a + 1, c = a + columns + 1, d = c + 1;
      indices.push(a,b,c,b,d,c);
    }
  }
  return { coordinates: new Float32Array(coordinates), weights, indices: new Uint16Array(indices) };
}

export type WildlifeMesh = ReturnType<typeof createWildlifeMesh>;
export function poseWildlife(mesh: WildlifeMesh, kind: WildlifeKind, seconds: number, progress: number, output = new Float32Array(mesh.coordinates.length)) {
  const rig = WILDLIFE_RIGS[kind], walking = walkingAmount(kind, progress);
  const joints = rig.bones.map(bone => {
    const cycle = Math.sin(seconds * TAU * bone.frequency + (bone.phase || 0));
    const activity = bone.mode === "walk" ? walking : bone.mode === "idle" ? 1 - walking * .8 : 1;
    const angle = bone.angle * cycle * activity;
    return { ...bone, cos: Math.cos(angle), sin: Math.sin(angle), squash: 1 - (bone.fold || 0) * (cycle + 1) / 2 };
  });
  const bounce = Math.abs(Math.sin(seconds * TAU * rig.stride)) * rig.bounce * walking;
  for (let vertex = 0; vertex < mesh.weights.length; vertex++) {
    const x = mesh.coordinates[vertex * 2], y = mesh.coordinates[vertex * 2 + 1];
    let dx = 0, dy = 0;
    joints.forEach((bone, index) => {
      const weight = mesh.weights[vertex][index], px = x - bone.pivot[0], py = y - bone.pivot[1];
      dx += ((px * bone.cos - py * bone.sin) * bone.squash - px) * weight;
      dy += (px * bone.sin + py * bone.cos - py) * weight;
    });
    output[vertex * 2] = x + dx;
    output[vertex * 2 + 1] = y + dy - bounce;
  }
  return output;
}
