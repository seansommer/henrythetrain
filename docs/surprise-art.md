# Surprise artwork

Generated with the built-in image-generation tool as one atlas, using the
existing animal atlas only as a style reference. No paid API or model fallback
was used. Final asset: `public/assets/henry-surprise-atlas-v1.png` (1254 × 1254).

The generator returned an RGB checkerboard rather than true alpha. The game
therefore uses exact code-native silhouette clips in `lib/surprise-sprites.json`.
These preserve the original illustration pixels, omit the matte and isolated
fragment, and are independent of the crop rectangles. Each sprite was checked
against a solid green background before integration.

## Generation prompt

Use case: stylized-concept
Asset type: transparent PNG game sprite atlas for Henry the Train, intended for independent sprite clipping, not a rendered interface.
Primary request: Generate exactly ONE new square 2x2 sprite atlas with exactly four separate original sprites on a genuinely transparent background with a true alpha channel.
Input images: Image 1 is STYLE REFERENCE ONLY. Match the charming, professional storybook / softly rendered 3D illustration style of its smiling animal friends, including appealing large expressive eyes, warm friendly expressions, finely detailed soft fur where appropriate, dimensional shading and clean polished silhouettes. Do not modify or reproduce the reference atlas; do not copy its railroad equipment, birds, clouds, grid, or background.
Composition/framing: Four equal quadrants in a square canvas. Center each sprite within its own quadrant. Keep every part of every sprite strictly inside its quadrant with at least 15% clear transparent padding from all four quadrant edges, so there are very wide uninterrupted transparent gutters and outer margins. No sprite overlaps another.
Top-left quadrant: Exactly one smiling reddish-brown squirrel, waist-up and front-facing, with a fluffy curved tail, soft cream muzzle and chest, bright friendly eyes, and one paw raised in a cheerful wave toward the viewer. Include the full waving paw and full tail inside the quadrant.
Top-right quadrant: Exactly one friendly emerald-green turtle, front-facing head and upper body with rounded patterned shell visible behind the shoulders, bright friendly eyes and a welcoming smile, with one foreleg raised and waving toward the viewer. Include the full waving foreleg and the full shown shell inside the quadrant.
Bottom-left quadrant: Exactly ONE fresh green-and-golden leaf with a visible delicate stem and natural veins. A clean, softly dimensional cutout. No branch, no second leaf.
Bottom-right quadrant: Exactly ONE small blue-and-gold butterfly with wings spread, elegant natural wing shapes, subtle clean wing details, body and antennae intact. No second butterfly.
Lighting/mood: Soft, warm, bright, cheerful, high-quality children's storybook character lighting, matching the reference animal friends.
Constraints: Preserve genuine transparency everywhere outside the four sprite silhouettes, including all gutters and margins. Transparent PNG output with real alpha. Four isolated sprites total, no extra objects. Clean antialiased edges suitable for compositing.
Avoid: labels, lettering, text, logos, watermarks, drawn grid lines, panel borders, white matte, colored backdrop, checkerboard drawn into pixels, stray fragments, glow halos, ground planes, cast-shadow slabs, props, scenery, UI, cropping, extra leaves, extra butterflies.
