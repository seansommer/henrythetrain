# Henry the Train

An interactive railroad-crossing scene made for Henry. Push three independent
controls to send a surprise train across the screen, flash the warning lights,
or lower and raise the crossing gates.

**Live game:** https://henry-the-train.fatherearth.chatgpt.site

## What is included

- Ten distinct train surprises, shuffled so every train appears before a repeat
- A blue passenger train with **HENRY** on its engine
- Fixed, non-restartable light and gate sequences
- Controls that can all run at the same time
- Slowly moving clouds
- Random bird flyovers
- Four random animal friends that pop up and wave
- Longer, precisely clipped gates with fixed-size hinges anchored to each signal
- An **Animals on/off** switch, including the hidden foreground animal visits
- Tree surprises: flying leaves, a waving squirrel, or a bird fly-by
- Rock surprises: a waving turtle, butterflies, or a sparkle fountain
- Each hiding place cycles through all three outcomes in shuffled order
- Smaller control buttons and a shorter panel for more scenery
- Original procedural music and sound effects made with the Web Audio API
- Ten signature train sounds with continuous rail rattle and wheel clacks
- Henry's train says **“Choo Choo, Hey Henry, Let's goooo!”**
- Separate master-sound and music controls plus music and effects sliders
- Responsive layouts for phones, tablets, laptops, and desktops
- Keyboard and screen-reader labels for every control

The game has no application accounts, advertising, tracking, Firebase project,
or saved personal data. The spoken greeting uses browser speech synthesis;
the voice varies by device. A local English voice is preferred when available.
If speech is unsupported, the greeting remains on screen and the train still
plays its whistle and rail sounds. Muting all sound or setting SFX to zero also
mutes speech. Some browsers apply speech-volume changes on the next utterance.

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
Music and sound effects are synthesized in real time, so there are no
third-party audio files or licenses to manage.

The new squirrel, turtle, leaf, and butterfly art is in
`public/assets/henry-surprise-atlas-v1.png`. `lib/surprise-sprites.json` supplies
the exact native clipping silhouettes, removing the generated matte and stray
fragment without repainting the characters. See `docs/surprise-art.md` for the
generation brief.
