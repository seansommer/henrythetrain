# Henry the Train

An interactive railroad-crossing scene made for Henry. Push three independent
controls, or tap the scene itself, to send a surprise train across the screen,
flash the warning lights, or lower and raise the crossing gates.

**Live game:** https://seansommer.github.io/henrythetrain/

## What is included

- Ten distinct train surprises: independent random draws from all ten engines, with each train reversing direction on its next appearance
- A blue passenger train with **HENRY** on its engine
- Fixed, non-restartable light and gate sequences
- Controls that can all run at the same time
- Random bird flyovers
- Four random animal friends that pop up and wave
- Transparent crossing equipment with fixed pivots in the same scene coordinates as the rails
- An **Animals on/off** switch, including the hidden foreground animal visits
- Tree surprises: flying leaves, a waving squirrel, or a bird fly-by
- Rock surprises: a waving turtle, butterflies, or a sparkle fountain
- Each hiding place cycles through all three outcomes in shuffled order
- Smaller control buttons and a shorter panel for more scenery
- Original procedural music and locally created train recordings played through the Web Audio API
- Ten signature train sounds with continuous rail rattle and wheel clacks
- Train whistles and signature effects only — no browser voice or spoken audio
- Tap either illustrated signal, either moving gate, or the center rails
- Bright volume tracks with large handles and a properly aligned animal switch
- One uniform scene camera for portrait, landscape and desktop; scenery and wheels cannot scale independently
- Custom link-sharing artwork, a favicon, and separate mobile home-screen artwork
- Separate master-sound and music controls plus music and effects sliders
- Responsive layouts for phones, tablets, laptops, and desktops
- Keyboard and screen-reader labels for every control

The game has no application accounts, advertising, tracking, Firebase project,
or saved personal data. Music is synthesized locally; original train effects are
served as small bundled MP3 files without blocking animation. There is no speech synthesis, voice service, or recorded speech. The
Henry greeting is an on-screen caption only. Muting all sound or setting SFX to
zero also mutes the train effects.


## GitHub Pages setup

Target address: **https://seansommer.github.io/henrythetrain/**

1. Rename the GitHub repository to `henrythetrain` (lowercase) for that exact path.
2. Open **Settings → Pages → Build and deployment → Source → GitHub Actions**.
3. Open **Actions → Deploy Henry the Train → Run workflow** after changing these settings.

The included `.github/workflows/pages.yml` builds a static export and deploys
on every push to `main`, or on a manual run. No `docs/` folder, Firebase,
Cloudflare Worker, API key, or sign-in is required for the Pages version.
The workflow derives the URL prefix from the actual repository name, so it also
works before a rename at `/HenryTheTrain/`. The existing public Site remains
available at the address above while Pages is being configured.

Build the lowercase Pages version locally:

```bash
npm run build:pages
node scripts/verify-pages.mjs
```

Only the `out/` static files are uploaded to Pages. Source, server code, and
environment files are not included in the published artifact.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

## Verify

```bash
npm run lint
npm test
```

The artwork in `public/assets/` was created specifically for this project.
The original train recordings are created from `lib/train-sound.ts` with
`scripts/render-train-audio.mjs` (optional developer regeneration requires FFmpeg).
Music and other effects are synthesized live. No external audio service is used.

The rebuilt game uses real-alpha WebP sprites in `public/assets/trains/`,
`crossing/` and `wildlife-v3/`. Henry has separate artwork for each direction,
with upright lettering. The other unlettered trains can safely reuse mirrored
art. Generation provenance and crop bounds are in `docs/artwork-revamp.json`.
The old atlas files are retained as source history but are no longer rendered.

The bottom dock contains just three compact play buttons. Parent settings hold
the animal toggle and independent volume sliders. Scene taps show one 360ms
ripple; action locks never keep a touch area highlighted. Browser resizing
updates only the camera, leaving the train's wheel baseline fixed to the rail.

Animation controls: compact sliders beneath Train, Lights and Gates select 0.5×–1.5× speed between runs. Train audio follows the selected train speed. The bottom Hide text / Show text toggle hides the scene messages and play labels; accessible names and parent settings remain available. Only the header links to Game Center. Enlarged gate arms pivot at the signal posts and meet across the path. Crossing lamps alternate even when reduced motion is enabled.


The foreground rock sits lower with its tap target following the artwork, and transparent grass tufts dress both signal bases. The shared camera frames the extra foreground without stretching any sprites. Every animal has a screen-aware entrance, pause or flight, and exit; reduced motion removes the small bounces and wingbeats while keeping gentle travel. Landscape phones use a narrow control dock on the right instead of a bottom panel. Cyan, violet and lime glossy buttons keep each action distinct. Speeds, text visibility, animals and sound preferences are saved only in this browser. Artwork prompts and export provenance are in `docs/artwork-ground-v5.json`.
