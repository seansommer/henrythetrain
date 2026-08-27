import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("defines ten named surprise trains including Henry's express", () => {
  assert.match(page, /Henry's Blue Express/);
  assert.match(page, /const TRAIN_COUNT = 10/);
  assert.match(page, /Rainbow Celebration/);
});

test("each main action has an independent non-restart guard", () => {
  assert.match(page, /if \(trainBusy\.current\) return/);
  assert.match(page, /if \(lightsBusy\.current\) return/);
  assert.match(page, /if \(gatesBusy\.current\) return/);
  assert.match(page, /const TRAIN_RUN_MS = 9_000/);
  assert.match(page, /const LIGHT_RUN_MS = 10_000/);
  assert.match(page, /const GATE_RUN_MS = 10_000/);
});

test("the game includes randomized wildlife and bird timing", () => {
  assert.match(page, /Math\.random\(\) \* 4/);
  assert.match(page, /Math\.random\(\) \* 2/);
  assert.match(page, /nextDelay\(8_000, 19_000\)/);
  assert.match(page, /nextDelay\(12_000, 27_000\)/);
});

test("all scene artwork is backed by project assets", () => {
  assert.match(css, /railroad-world\.webp/);
  assert.match(css, /ten-trains-v2\.webp/);
  assert.match(css, /railroad-friends-v2\.webp/);
});

test("responsive and reduced-motion rules are present", () => {
  assert.match(css, /@media \(max-width: 560px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /100dvh/);
});

test("train sprites travel nose-first in their confirmed direction", () => {
  assert.match(page, /const TRAIN_DIRECTIONS = \[/);
  assert.match(page, /direction-\$\{trainDirection\}/);
  assert.match(css, /@keyframes train-pass-right/);
  assert.match(css, /@keyframes train-pass-left/);
});

test("the title clears five seconds after the first game action", () => {
  assert.match(page, /schedule\(\(\) => setTitleVisible\(false\), 5_000\)/);
  assert.match(page, /if \(gameStarted\.current\) return/);
  assert.match(css, /\.title-sign\.is-hidden/);
});

test("music and sound effects have independent volume sliders", () => {
  assert.match(page, /Background music volume/);
  assert.match(page, /Sound effects volume/);
  assert.match(page, /setMusicVolume/);
  assert.match(page, /setEffectsVolume/);
});

test("animals are anchored to the foreground edge", () => {
  assert.match(css, /\.animal-friend[\s\S]*?bottom:\s*-10%/);
  assert.match(css, /\.animal-0[\s\S]*?left:\s*1%/);
  assert.match(css, /\.animal-3[\s\S]*?right:\s*1%/);
  assert.match(css, /\.animal-2[\s\S]*?background-position:\s*66\.666% 50%/);
  assert.match(css, /\.bird-flock\.flock-0[\s\S]*?background-position:\s*0 100%/);
});
