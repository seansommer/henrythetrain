import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

const { TRAIN_PROFILES, HENRY_GREETING, shuffledBag, availableSurprises, TRAIN_RUN_MS, LIGHT_RUN_MS, GATE_RUN_MS } = loadTs("../lib/train-profiles.ts");
const { sceneHotspots } = loadTs("../lib/scene-hotspots.ts");
const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

test("ten trains have unique signatures and verified forward directions", () => {
  assert.equal(TRAIN_PROFILES.length, 10);
  assert.equal(new Set(TRAIN_PROFILES.map((p) => JSON.stringify([p.beat, p.rumble, p.horn, p.pattern]))).size, 10);
  assert.equal(TRAIN_PROFILES.map((p) => p.direction).join(","), "right,right,left,right,left,left,left,left,right,left");
  assert.equal(TRAIN_PROFILES[1].greeting, HENRY_GREETING);
  assert.match(HENRY_GREETING, /Choo Choo, Hey Henry, Let's goooo/);
});

test("shuffle bags exhaust their full set before refilling", () => {
  for (let i = 0; i < 50; i++) {
    const bag = shuffledBag(10);
    assert.equal(bag.length, 10);
    assert.equal(new Set(bag).size, 10);
    assert.ok(bag.every((entry) => entry >= 0 && entry < 10));
  }
});

test("each hiding place has three different outcomes and honors animals off", () => {
  for (const target of ["tree", "rock"]) {
    assert.equal(availableSurprises(target, true).length, 3);
    assert.equal(new Set(availableSurprises(target, true)).size, 3);
    const quiet = availableSurprises(target, false);
    assert.equal(quiet.length, 2);
    assert.ok(!quiet.includes("squirrel") && !quiet.includes("turtle"));
  }
  assert.match(page, /animalsAllowed\.current = enabled/);
  assert.match(page, /animalsEnabled && animal !== null/);
});

test("tree and rock targets follow the painting at phone, tablet, and desktop sizes", () => {
  for (const [w, h] of [[320, 300], [390, 530], [768, 700], [1440, 752], [844, 260], [320, 720]]) {
    for (const hotspot of Object.values(sceneHotspots(w, h))) {
      assert.ok(hotspot.x >= 0 && hotspot.x <= w && hotspot.y >= 0 && hotspot.y <= h, `${w}x${h}`);
      assert.ok(hotspot.width >= 48 && hotspot.height >= 48);
    }
  }
});

test("independent actions have busy guards and complete even if audio fails", () => {
  assert.equal(TRAIN_RUN_MS, 9000);
  assert.equal(LIGHT_RUN_MS, 10000);
  assert.equal(GATE_RUN_MS, 10000);
  for (const [name, flag, duration] of [["Train", "train", "TRAIN"], ["Lights", "lights", "LIGHT"], ["Gates", "gates", "GATE"]]) {
    const section = page.slice(page.indexOf(`const trigger${name} =`), page.indexOf(`const trigger${name} =`) + 1700);
    assert.match(section, new RegExp(`if \\(${flag}Busy.current\\) return`));
    assert.ok(section.indexOf(`}, ${duration}_RUN_MS)`) < section.indexOf("await ensureAudio()"));
  }
  assert.match(page, /schedule\(\(\) => setTitleVisible\(false\), 5_000\)/);
});
