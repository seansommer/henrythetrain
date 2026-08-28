// Bake the existing native SVG crops/clips into portable transparent PNGs.
// This preserves the illustrated pixels; it does not redraw the characters.
import { readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const sheet = JSON.parse(await readFile(new URL("lib/scene-sprites.json", root), "utf8"));
const surprises = JSON.parse(await readFile(new URL("lib/surprise-sprites.json", root), "utf8"));
const output = new URL("public/assets/wildlife/", root);
await mkdir(output, { recursive: true });

for (const name of ["deer", "rabbit", "raccoon", "bear", "blue-birds", "brown-birds"]) {
  const [left, top, width, height] = sheet.sprites[name];
  await sharp(new URL(`public${sheet.atlas}`, root).pathname)
    .extract({ left, top, width, height }).png()
    .toFile(new URL(`${name}.png`, output).pathname);
}

const atlas = (await readFile(new URL(`public${surprises.atlas}`, root))).toString("base64");
for (const [name, { crop: [x, y, width, height], clip }] of Object.entries(surprises.sprites)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${x} ${y} ${width} ${height}">
    <defs><clipPath id="silhouette"><path d="${clip}"/></clipPath></defs>
    <image href="data:image/png;base64,${atlas}" width="${surprises.width}" height="${surprises.height}" clip-path="url(#silhouette)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(new URL(`${name}.png`, output).pathname);
}
console.log("Exported ten existing wildlife sprites as transparent PNGs.");
