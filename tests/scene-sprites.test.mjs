import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";

const sheet = JSON.parse(await readFile(new URL("../lib/scene-sprites.json", import.meta.url), "utf8"));
const component = await readFile(new URL("../components/scene-sprite.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("all wildlife, clouds, and crossing parts have explicit in-bounds crops", () => {
  assert.equal(Object.keys(sheet.sprites).length, 14);
  for (const [name, [x, y, width, height]] of Object.entries(sheet.sprites)) {
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0, name);
    assert.ok(x + width <= sheet.width && y + height <= sheet.height, name);
  }
});

test("animal crops exclude the crossing objects above them", () => {
  for (const name of ["deer", "rabbit", "raccoon", "bear"]) {
    assert.ok(sheet.sprites[name][1] > 407, name);
  }
});

test("flying sprite crops exclude the animals above them", () => {
  for (const name of ["blue-birds", "brown-birds", "cloud-one", "cloud-two"]) {
    assert.ok(sheet.sprites[name][1] >= 780, name);
  }
  assert.ok(sheet.sprites.rabbit[1] + sheet.sprites.rabbit[3] < sheet.sprites["brown-birds"][1]);
});

test("sprite viewports clip the atlas instead of repeating equal grid cells", () => {
  assert.match(component, /viewBox=\{`\$\{x\} \$\{y\} \$\{width\} \$\{height\}`\}/);
  assert.match(component, /<image href=\{assetUrl\(sheet.atlas\)\}/);
  assert.match(css, /\.scene-sprite\s*\{[^}]*overflow:\s*hidden/s);
  for (const selector of ["cloud", "bird-flock", "animal-friend"]) {
    const rule = css.match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))[1];
    assert.doesNotMatch(rule, /background-size|background-position|background-image/);
  }
});

test("gate hinges and arms exclude all animal rows and use separate viewports", () => {
  for (const name of ["hinge-left", "hinge-right", "beam-left", "beam-right"]) {
    const [, y, , height] = sheet.sprites[name];
    assert.ok(y + height < 410, name);
  }
  assert.match(css, /transform-origin: 21px 32px/);
  assert.match(css, /transform-origin: calc\(100% - 21px\) 32px/);
  assert.match(css, /width: clamp\(265px, 37vw, 640px\)/);
  assert.doesNotMatch(css, /background-size: 400% 300%/);
});

test("new surprise art has independent silhouettes, not square matte crops", async () => {
  const surprises = JSON.parse(await readFile(new URL("../lib/surprise-sprites.json", import.meta.url), "utf8"));
  assert.equal(Object.keys(surprises.sprites).length, 4);
  for (const { crop: [x, y, w, h], clip } of Object.values(surprises.sprites)) {
    assert.ok(x >= 0 && y >= 0 && x + w <= surprises.width && y + h <= surprises.height);
    assert.ok(clip.startsWith("M") && clip.endsWith("Z") && clip.length > 100);
  }
});

test("every wildlife PNG contains visible colored artwork and real transparency", async () => {
  for (const name of ["deer", "rabbit", "raccoon", "bear", "blue-birds", "brown-birds", "squirrel", "turtle", "leaf", "butterfly"]) {
    const file = new URL(`../public/assets/wildlife/${name}.png`, import.meta.url).pathname;
    assert.equal((await sharp(file).metadata()).hasAlpha, true, name);
    const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let clear = 0, colored = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] === 0) clear++;
      if (data[i + 3] > 128 && Math.max(...data.subarray(i, i + 3)) - Math.min(...data.subarray(i, i + 3)) > 15) colored++;
    }
    const area = info.width * info.height;
    assert.ok(clear > area * 0.1, `${name}: no opaque white/checkerboard rectangle`);
    assert.ok(colored > area * 0.08, `${name}: not a blank or white sprite`);
  }
});
