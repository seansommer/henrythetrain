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

test("train actions and volume controls never request browser speech", () => {
  const forbidden = () => { throw new Error("Browser speech must never be used"); };
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts", {
    SpeechSynthesisUtterance: forbidden,
    speechSynthesis: new Proxy({}, { get: forbidden }),
  });
  const audio = new RailroadAudio();
  audio.tone = () => {};
  audio.noise = () => {};
  for (let train = 0; train < 10; train++) audio.playTrain(train);
  audio.setEnabled(false);
  audio.setEffectsVolume(0);
  audio.setEnabled(true);
  audio.setEffectsVolume(0.4);
  audio.destroy();
  assert.equal(audio.speakTrain, undefined);
});

test("missing browser audio support is a harmless silent fallback", async () => {
  const { RailroadAudio } = loadTs("../lib/railroad-audio.ts");
  assert.equal(await new RailroadAudio().start(), false);
});
