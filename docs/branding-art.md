# Henry the Train artwork and mobile presentation

The three branding images were created with the built-in image-generation tool.
There are no external image services at runtime. The final images were resized
for their delivery formats and checked visually.

- `public/og.png`: 1200 × 630 link-sharing card, exact title **Henry the Train**.
- `public/favicon-32.png`, `public/favicon-48.png`, and `public/favicon.ico`:
  a separate frontal blue locomotive composition, kept readable at small sizes.
- `public/apple-touch-icon.png`: 180 × 180 mobile home-screen icon.
- `public/icons/henry-home-192.png` and `henry-home-512.png`: full-bleed blue
  locomotive in the countryside; distinct from the favicon.
- `public/icons/henry-maskable-512.png`: opaque maskable version for launchers.

`app/layout.tsx` uses the correct absolute sharing image URL on GitHub Pages.
The static manifest scopes the installed app to the repository subpath and
uses standalone display. `viewport-fit=cover` lets the landscape painting
reach the screen edges while controls retain safe-area spacing. Browser chrome
can still remain when playing in an ordinary browser tab.

## Existing wildlife

No generated replacement characters are used. `scripts/export-wildlife.mjs`
exports the six existing animal/bird crops and pre-renders the four existing
native surprise silhouettes into ten independent transparent PNGs. This avoids
live SVG/WebP atlas cropping for wildlife. The original illustration pixels
are retained; the original source atlases and clipping definitions remain.

All ten outputs were inspected against green and tested for real transparency
and visible colored content. Regenerate with `node scripts/export-wildlife.mjs`.

## Generation prompts

### henry-social-card

Use case: illustration-story. Asset: landscape social sharing card for the existing children's game Henry the Train. Use reference image 1 only for the identity and rendered style of the BLUE steam train in its UPPER RIGHT: vivid royal blue locomotive, black smokebox and chimney, brass/gold trim and golden headlight, blue tender and a blue passenger carriage, realistic friendly toy proportions, no human face. Reference image 2 provides the lush sunny railroad-crossing countryside style, NOT a layout to copy exactly.
Create one cohesive, polished storybook scene, landscape 1920x1008 (1.905:1). Blue Henry travels across a green countryside railroad crossing, with a large appealing locomotive and connected tender/passenger carriage across the lower middle, seen from a gentle three-quarter side angle. Rich grassy hills, track and crossing, brilliant sky blue, soft white clouds, warm golden sunshine. Keep essential art away from the outer 7% so a 1200x630 crop is safe.
Add the exact large title at the top, perfectly legible, reading: "Henry the Train". Typography must be warm, playful, sturdy storybook lettering, dark navy with a warm cream or gold outline, high contrast against the clear sky. Spell exactly H-e-n-r-y [space] t-h-e [space] T-r-a-i-n. The title is one cohesive part of the composition. No other text, no extra logos, no watermarks, no border, no split panels, no sprite sheet. Full opaque image.

### henry-home-icon

Use case: illustration-story. Asset: distinct 1024x1024 square home-screen icon for Henry the Train. Reference image 1 is only for the identity of the BLUE steam locomotive in the UPPER RIGHT: vivid royal blue boiler and cab, black front and chimney, golden brass headlight and fine warm gold trim, blue wheels; no human face. Reference image 2 supplies the lush sunny countryside and storybook rendered finish.
Create a single new close composition of a large friendly blue Henry locomotive in gentle front three-quarter view on tracks in sunny green countryside. Rounded realistic toy/storybook rendering, tactile glossy painted metal, warm golden light, radiant sky-blue sky, soft green hills. The locomotive must dominate and be immediately recognizable when reduced. Keep the entire essential locomotive silhouette inside the central 80% of the square, with some breathing room around its chimney and wheels. Do not put long carriages into the composition. Full-bleed opaque square with square image corners, NO drawn rounded corners, no border, no circular badge. No text anywhere, no letters, no watermark, no tiny details that compete with the main silhouette. Not a social card: one centered iconic locomotive.

### henry-favicon-source

Use case: logo-brand. Asset: separate 1024x1024 square favicon source for Henry the Train, purpose-built to remain recognizable at 16 to 32 pixels. Use the BLUE steam locomotive in the UPPER RIGHT of the reference only as a character/color cue.
Create one simplified BLUE steam locomotive viewed directly from the front, large centered bold silhouette. Rounded friendly toy-like form with royal blue cab and body, dark navy circular smokebox, one prominent glowing golden headlight centered high on the smokebox, a short dark chimney, and simple blue front bumper/wheels. Do NOT add a human face. Restrict detail to a few strong shapes. High contrast clean edges, small amount of soft 3D shading for storybook warmth, not photoreal. Minimal plain sky-blue background, fully opaque. Essential subject comfortably inside central 80% of square. No landscape, no carriage, no rails, no clouds, no border, no rounded image corners. No text, no letters, no watermark. Must be visibly different from the scenic home-screen icon: simple straight-on locomotive symbol.

