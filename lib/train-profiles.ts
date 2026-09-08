export const HENRY_GREETING = "Choo Choo, Hey Henry, Let's goooo!";

export const TRAIN_RUN_MS = 9_000;
export const LIGHT_RUN_MS = 10_000;
export const GATE_RUN_MS = 10_000;

// Each profile is intentionally familiar: a fixed rhythm, horn, and timbre.
export const TRAIN_PROFILES = [
  { name: "Red Steam Special", kind: "steam", beat: 0.32, rumble: 92, horn: [392, 494, 587], pattern: [0.65, 1.2] },
  { name: "Henry's Blue Express", kind: "steam", beat: 0.29, rumble: 105, horn: [523, 659, 784], pattern: [0.6, 1.05], greeting: HENRY_GREETING },
  { name: "Sunny Track Helper", kind: "diesel", beat: 0.26, rumble: 132, horn: [311, 392], pattern: [0.65, 1.05, 1.45] },
  { name: "Green Electric", kind: "electric", beat: 0.2, rumble: 80, horn: [392, 523], pattern: [0.8, 1.7] },
  { name: "Silver Speedster", kind: "electric", beat: 0.16, rumble: 65, horn: [659, 880], pattern: [0.85] },
  { name: "Orange Freight", kind: "diesel", beat: 0.39, rumble: 56, horn: [146, 185, 220], pattern: [0.8, 2.1] },
  { name: "Purple Night Express", kind: "steam", beat: 0.31, rumble: 85, horn: [440, 554, 659], pattern: [0.7, 1.25, 2.0] },
  { name: "Golden Vintage", kind: "steam", beat: 0.34, rumble: 72, horn: [349, 440, 523], pattern: [0.7, 1.5] },
  { name: "Teal Commuter", kind: "electric", beat: 0.22, rumble: 110, horn: [587, 784], pattern: [0.65, 0.98] },
  { name: "Rainbow Celebration", kind: "toy", beat: 0.28, rumble: 118, horn: [523, 659, 784, 1047], pattern: [0.65, 0.95, 1.25, 1.55] },
] as const;

export type SurpriseTarget = "tree" | "rock";
export type SurpriseKind = "leaves" | "squirrel" | "birds" | "turtle" | "butterflies" | "sparkles";
export const SURPRISES: Record<SurpriseTarget, readonly SurpriseKind[]> = {
  tree: ["leaves", "squirrel", "birds"],
  rock: ["turtle", "butterflies", "sparkles"],
};

export function shuffledBag(size: number, random = Math.random): number[] {
  const bag = Array.from({ length: size }, (_, index) => index);
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function availableSurprises(target: SurpriseTarget, animals: boolean): readonly SurpriseKind[] {
  return SURPRISES[target].filter((kind) => animals || !["squirrel", "turtle", "birds", "butterflies"].includes(kind));
}

export type TrainTrip = { train: number; direction: "left" | "right" };

/** Shuffle all trains; each engine remembers which way it must travel next. */
export function createTrainTrips(random = Math.random) {
  let bag: number[] = [];
  let last = -1;
  const directions = TRAIN_PROFILES.map(() => "right" as TrainTrip["direction"]);
  return (): TrainTrip => {
    if (!bag.length) {
      bag = shuffledBag(TRAIN_PROFILES.length, random);
      if (bag[bag.length - 1] === last) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const train = bag.pop()!, direction = directions[train];
    directions[train] = direction === "right" ? "left" : "right";
    last = train;
    return { train, direction };
  };
}
