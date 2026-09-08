import { TRAIN_PROFILES, TRAIN_RUN_MS } from "./train-profiles";

/** Original sound design: rolling wheels, rail joints, steam and a breathy whistle.
 * Render once per train, then play one small buffer instead of hundreds of beeps.
 */
export function renderTrainSound(train: number, sampleRate = 22050): Float32Array {
  const profile = TRAIN_PROFILES[train];
  if (!profile || !Number.isFinite(sampleRate) || sampleRate < 8000 || sampleRate > 96000) throw new Error("Invalid train sound");
  const duration = TRAIN_RUN_MS / 1000;
  const samples = new Float32Array(Math.round(duration * sampleRate));
  let seed = 731 + train * 15427, low = 0, body = 0;
  const tau = Math.PI * 2;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate;
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    const noise = (seed >>> 0) / 2147483648 - 1;
    low += .027 * (noise - low);
    body += .19 * (noise - body);
    const pass = Math.pow(Math.max(0, Math.sin(Math.PI * t / duration)), 1.15);
    const phase = t % profile.beat;
    const joint = (time: number) => time >= 0 && time < .07 ? Math.exp(-time * 65) * (body * .5 + Math.sin(tau * 380 * time) * .15) : 0;
    let value = low * .7 + (body - low) * .08 + (joint(phase) + joint(phase - .09)) * .75;
    if (profile.kind === "steam" || profile.kind === "toy") {
      const puff = Math.min(1, phase / .014) * Math.exp(-phase / (profile.beat * .24));
      value += (body - low) * puff * .68;
    } else {
      value += Math.sin(tau * (profile.rumble * .62) * t) * .022;
    }
    profile.pattern.forEach((start, index) => {
      const age = t - start - .55;
      const length = profile.kind === "diesel" ? 1.1 : index === 0 ? .9 : .62;
      if (age <= 0 || age >= length) return;
      const breath = Math.min(1, age / .12, (length - age) / .22);
      const drift = 1 - .025 * age / length;
      const vibrato = 1 + .002 * Math.sin(tau * 4.5 * t);
      const tones = profile.kind === "steam" || profile.kind === "toy"
        ? [profile.horn[0] * .72, profile.horn[0] * 1.09]
        : profile.horn;
      let horn = 0;
      for (const pitch of tones) {
        const angle = tau * pitch * drift * vibrato * age;
        horn += Math.sin(angle) + .18 * Math.sin(angle * 2) + .07 * Math.sin(angle * 3);
      }
      value += breath * (horn / tones.length * .17 + (noise - body) * .028);
    });
    // A smooth approach/departure envelope and soft limiter prevent sudden peaks.
    samples[i] = Math.tanh(value * 1.35) * pass * .7;
  }
  return samples;
}
