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
- Original procedural music and sound effects made with the Web Audio API
- Separate master-sound and music controls plus music and effects sliders
- Responsive layouts for phones, tablets, laptops, and desktops
- Keyboard and screen-reader labels for every control

The game has no accounts, advertising, tracking, external APIs, Firebase
project, or saved personal data.

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
