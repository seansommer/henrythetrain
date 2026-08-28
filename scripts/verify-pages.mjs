import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import sharp from "sharp";
const repo = (process.env.GITHUB_REPOSITORY ?? "seansommer/henrythetrain").split("/").at(-1);
const base = `/${repo}`;
const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
assert.match(html, /Henry the Train/);
assert.match(html, /Send a Train/);
assert.match(html, /Show animal pop-ups/);
assert.ok(html.includes(`${base}/_next/`), "JavaScript must use the repository subpath");
for (const name of ["railroad-world.webp", "ten-trains-v2.webp", "railroad-friends-v2.webp", "henry-surprise-atlas-v1.png"]) {
  await access(new URL(`../out/assets/${name}`, import.meta.url));
}
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  const url = match[1];
  if (url.startsWith("data:") || url.startsWith("http")) continue;
  assert.ok(url.startsWith(`${base}/`), `Root-relative asset would break Pages: ${url}`);
  await access(new URL(`../out${url.slice(base.length).split("?")[0]}`, import.meta.url));
}
await access(new URL("../out/.nojekyll", import.meta.url));
assert.match(html, /viewport-fit=cover/);
for (const label of ["Background music volume", "Sound effects volume"]) {
  assert.ok(html.includes(`role="slider" aria-label="${label}"`), "Slider handle needs its own accessible label");
}
for (const name of ["deer", "rabbit", "raccoon", "bear", "blue-birds", "brown-birds", "squirrel", "turtle", "leaf", "butterfly"]) {
  await access(new URL(`../out/assets/wildlife/${name}.png`, import.meta.url));
}
const origin = `https://seansommer.github.io${base}/`;
assert.ok(html.includes(`property="og:image" content="${origin}og.png"`));
assert.ok(html.includes('property="og:title" content="Henry the Train"'));
assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
const card = await sharp(new URL("../out/og.png", import.meta.url).pathname).metadata();
assert.equal(card.width, 1200);
assert.equal(card.height, 630);
const manifest = JSON.parse(await readFile(new URL("../out/manifest.webmanifest", import.meta.url), "utf8"));
assert.equal(manifest.start_url, `${base}/`);
assert.equal(manifest.scope, `${base}/`);
assert.equal(manifest.display, "standalone");
assert.equal(manifest.name, "Henry the Train");
for (const icon of manifest.icons) {
  assert.ok(icon.src.startsWith(`${base}/`));
  const metadata = await sharp(new URL(`../out${icon.src.slice(base.length)}`, import.meta.url).pathname).metadata();
  assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes);
}
const apple = await sharp(new URL("../out/apple-touch-icon.png", import.meta.url).pathname).metadata();
assert.equal(apple.width, 180);
assert.equal(apple.height, 180);
console.log(`Static export validated for ${base}/: game shell and all referenced assets are present.`);
