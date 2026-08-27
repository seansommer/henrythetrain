import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sheet = JSON.parse(await readFile(new URL("../lib/scene-sprites.json", import.meta.url), "utf8"));
const component = await readFile(new URL("../components/scene-sprite.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("all eight wildlife and cloud sprites have explicit in-bounds crops", () => {
  assert.equal(Object.keys(sheet.sprites).length, 8);
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
  assert.match(component, /<image href=\{sheet.atlas\}/);
  assert.match(css, /\.scene-sprite\s*\{[^}]*overflow:\s*hidden/s);
  for (const selector of ["cloud", "bird-flock", "animal-friend"]) {
    const rule = css.match(new RegExp(`\\.${selector}\\s*\\{([^}]+)\\}`))[1];
    assert.doesNotMatch(rule, /background-size|background-position|background-image/);
  }
});
