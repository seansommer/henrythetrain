import assert from "node:assert/strict";
import test from "node:test";
import { loadTs } from "./load-ts.mjs";

test("all trains have a full-length rumble and repeated two-wheel rail clacks", () => {
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts");
  for (let train = 0; train < 10; train++) {
    const audio = new RailroadAudio();
    const tones = [], noise = [];
    audio.tone = (event) => tones.push(event);
    audio.noise = (...event) => noise.push(event);
    audio.playTrain(train);
    assert.ok(noise.some(([at, duration]) => at === 0 && duration === 9));
    assert.ok(noise.filter(([, duration]) => duration < 0.1).length >= 40);
    assert.ok(noise.every(([at, duration]) => at + duration <= 9.01));
    assert.ok(tones.length > 20);
  }
});

test("late audio start catches up and never begins a stale passing sequence", () => {
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts");
  const audio = new RailroadAudio();
  const events = [];
  audio.tone = () => {};
  audio.noise = (...event) => events.push(event);
  audio.playTrain(1, 3);
  assert.ok(events.every(([at, duration]) => at + duration <= 6.01));
  const count = events.length;
  audio.playTrain(1, 10);
  assert.equal(events.length, count);
});

test("Henry greeting uses SFX volume, a local voice, and obeys master mute", () => {
  const spoken = [];
  let cancelled = 0;
  const voice = { lang: "en-US", localService: true };
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts", {
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text; } },
    speechSynthesis: { getVoices: () => [voice], speak: (u) => spoken.push(u), cancel: () => cancelled++ },
    setTimeout: () => 1, clearTimeout: () => {},
  });
  const audio = new RailroadAudio();
  audio.setEffectsVolume(0.4);
  assert.equal(audio.speakTrain(1), true);
  assert.equal(spoken[0].text, "Choo Choo, Hey Henry, Let's goooo!");
  assert.equal(spoken[0].voice, voice);
  assert.equal(spoken[0].volume, 0.4);
  audio.setEnabled(false);
  assert.equal(cancelled, 1);
  assert.equal(audio.speakTrain(1), false);
  audio.setEnabled(true);
  audio.setEffectsVolume(0);
  assert.equal(audio.speakTrain(1), false);
});

test("missing browser audio or speech support is a harmless silent fallback", async () => {
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts");
  const audio = new RailroadAudio();
  assert.equal(await audio.start(), false);
  assert.equal(audio.speakTrain(1), false);
});
