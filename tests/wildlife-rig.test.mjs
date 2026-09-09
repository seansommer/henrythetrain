import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTs } from './load-ts.mjs';
const { WILDLIFE } = loadTs('../lib/wildlife-motion.ts');
const { createWildlifeMesh, poseWildlife, walkingAmount } = loadTs('../lib/wildlife-rig.ts');

test('every animal can articulate throughout its visit without folded triangles or clipped limbs', () => {
  for (const [kind, spec] of Object.entries(WILDLIFE)) {
    const mesh = createWildlifeMesh(kind);
    for (let seconds = 0; seconds < spec.duration / 1000; seconds += .067) {
      const posed = poseWildlife(mesh, kind, seconds, seconds * 1000 / spec.duration);
      for (const coordinate of posed) {
        assert.ok(Number.isFinite(coordinate), kind);
        assert.ok(coordinate >= -.16 && coordinate <= 1.16, `${kind} fits padded canvas: ${coordinate}`);
      }
      for (let index = 0; index < mesh.indices.length; index += 3) {
        const a = mesh.indices[index] * 2, b = mesh.indices[index + 1] * 2, c = mesh.indices[index + 2] * 2;
        const area = (posed[b] - posed[a]) * (posed[c + 1] - posed[a + 1]) - (posed[c] - posed[a]) * (posed[b + 1] - posed[a + 1]);
        assert.ok(area > 0, `${kind} skin folded at ${seconds.toFixed(2)}s`);
      }
    }
  }
});

test('walking stops while a visitor pauses to wave and resumes for its exit', () => {
  for (const kind of ['deer', 'rabbit', 'raccoon', 'squirrel', 'turtle']) {
    assert.equal(walkingAmount(kind, .1), 1, kind);
    assert.equal(walkingAmount(kind, .5), 0, kind);
    assert.equal(walkingAmount(kind, .9), 1, kind);
  }
  assert.equal(walkingAmount('bear', .5), 0);
});

test('animal motion bends individual parts instead of translating the entire sprite', () => {
  for (const kind of Object.keys(WILDLIFE)) {
    const mesh = createWildlifeMesh(kind), posed = poseWildlife(mesh, kind, .22, .5);
    let smallest = Infinity, largest = 0;
    for (let index = 0; index < posed.length; index += 2) {
      const distance = Math.hypot(posed[index] - mesh.coordinates[index], posed[index + 1] - mesh.coordinates[index + 1]);
      smallest = Math.min(smallest, distance); largest = Math.max(largest, distance);
    }
    assert.ok(largest - smallest > .005, kind);
  }
});
