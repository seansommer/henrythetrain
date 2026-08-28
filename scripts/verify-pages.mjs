import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
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
console.log(`Static export validated for ${base}/: game shell and all referenced assets are present.`);
