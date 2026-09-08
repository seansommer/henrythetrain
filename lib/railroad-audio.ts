import { TRAIN_PROFILES, TRAIN_RUN_MS } from "./train-profiles";
import { assetUrl } from "./asset-url";

type ToneOptions = {
  frequency: number;
  duration: number;
  volume?: number;
  when?: number;
  type?: OscillatorType;
  endFrequency?: number;
};

/** Original, locally synthesized audio; no network audio service or API keys. */
export class RailroadAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private trainBuffers = new Map<number, Promise<AudioBuffer>>();
  private trainSource: AudioBufferSourceNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private enabled = true;
  private musicEnabled = true;
  private musicLevel = 0.35;
  private effectsLevel = 0.75;

  async start() {
    if (!this.context) {
      if (typeof AudioContext === "undefined") return false;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.music = this.context.createGain();
      this.effects = this.context.createGain();
      this.master.gain.value = this.enabled ? 0.8 : 0;
      this.music.gain.value = this.musicEnabled ? this.musicLevel * 0.58 : 0;
      this.effects.gain.value = this.effectsLevel * 0.88;
      this.music.connect(this.master);
      this.effects.connect(this.master);
      const limiter = this.context.createDynamicsCompressor();
      limiter.threshold.value = -12; limiter.knee.value = 18; limiter.ratio.value = 6;
      limiter.attack.value = .006; limiter.release.value = .18;
      this.master.connect(limiter); limiter.connect(this.context.destination);
      this.noiseBuffer = this.context.createBuffer(1, this.context.sampleRate * 2, this.context.sampleRate);
      const samples = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    }
    if (this.context.state === "suspended") await this.context.resume();
    this.syncLevels();
    this.startMusic();
    return this.context.state === "running";
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.syncLevels();
  }
  setMusicEnabled(enabled: boolean) { this.musicEnabled = enabled; this.syncLevels(); }
  setMusicVolume(level: number) { this.musicLevel = Math.min(1, Math.max(0, level)); this.syncLevels(); }
  setEffectsVolume(level: number) {
    this.effectsLevel = Math.min(1, Math.max(0, level));
    this.syncLevels();
  }

  private syncLevels() {
    if (!this.context || !this.master || !this.music || !this.effects) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(this.enabled ? 0.8 : 0, now, 0.035);
    this.music.gain.setTargetAtTime(this.musicEnabled ? this.musicLevel * 0.58 : 0, now, 0.08);
    this.effects.gain.setTargetAtTime(this.effectsLevel * 0.88, now, 0.04);
  }

  private tone({ frequency, duration, volume = 0.12, when = 0, type = "sine", endFrequency }: ToneOptions) {
    if (!this.context || !this.effects) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.025, duration / 4));
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.effects);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private noise(when: number, duration: number, volume: number, frequency: number, type: BiquadFilterType = "bandpass") {
    if (!this.context || !this.effects || !this.noiseBuffer) return;
    const start = this.context.currentTime + when;
    const source = this.context.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = frequency;
    filter.Q.value = 0.7;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + Math.min(0.5, duration * 0.13));
    gain.gain.setValueAtTime(Math.max(0.0002, volume * 0.85), start + duration * 0.68);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.effects);
    source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    source.start(start);
    source.stop(start + duration + 0.02);
  }

  private musicTone(frequency: number, duration: number) {
    if (!this.context || !this.music) return;
    const start = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.music);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  private startMusic() {
    if (this.musicTimer) return;
    const melody = [262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392, 523, 440, 392, 330, 294];
    const playStep = () => {
      if (!this.context || this.context.state !== "running" || !this.enabled || !this.musicEnabled) return;
      const note = melody[this.musicStep % melody.length];
      this.musicTone(note, 0.38);
      if (this.musicStep % 4 === 0) this.musicTone(note / 2, 0.72);
      this.musicStep++;
    };
    playStep();
    this.musicTimer = setInterval(playStep, 470);
  }

  playButton() { this.tone({ frequency: 480, endFrequency: 720, duration: 0.13, volume: 0.08, type: "triangle" }); }
  playCrossingBell() {
    this.tone({ frequency: 880, duration: 0.18, volume: 0.17 });
    this.tone({ frequency: 1320, duration: 0.11, volume: 0.07, when: 0.03 });
  }
  playGate(direction: "down" | "up") {
    this.tone({ frequency: direction === "down" ? 230 : 170, endFrequency: direction === "down" ? 120 : 280, duration: 1.5, volume: 0.08, type: "sawtooth" });
    this.tone({ frequency: 620, duration: 0.09, volume: 0.06, when: 1.55, type: "square" });
  }

  async playTrain(train: number, elapsed = 0, direction: "left" | "right" = "right") {
    const context = this.context;
    if (!context || !this.effects || !TRAIN_PROFILES[train] || elapsed >= TRAIN_RUN_MS / 1000) return;
    const began = Date.now();
    let loading = this.trainBuffers.get(train);
    if (!loading) {
      loading = fetch(assetUrl(`/assets/audio/train-${train}-v3.mp3`)).then(response => {
        if (!response.ok) throw new Error("Train sound unavailable");
        return response.arrayBuffer();
      }).then(data => context.decodeAudioData(data));
      this.trainBuffers.set(train, loading);
    }
    let buffer: AudioBuffer;
    try { buffer = await loading; }
    catch { this.trainBuffers.delete(train); return; }
    if (this.context !== context || context.state !== "running") return;
    const offset = Math.max(0, elapsed + (Date.now() - began) / 1000);
    if (offset >= buffer.duration) return;
    try { this.trainSource?.stop(); } catch { /* already ended */ }
    const source = context.createBufferSource();
    source.buffer = buffer;
    const panner = context.createStereoPanner();
    const start = context.currentTime;
    const sign = direction === "right" ? 1 : -1;
    panner.pan.setValueAtTime(sign * (-.85 + 1.7 * offset / buffer.duration), start);
    panner.pan.linearRampToValueAtTime(sign * .85, start + buffer.duration - offset);
    source.connect(panner); panner.connect(this.effects);
    this.trainSource = source;
    source.onended = () => { source.disconnect(); panner.disconnect(); if (this.trainSource === source) this.trainSource = null; };
    source.start(start, offset);
  }

  playChirp() {
    this.tone({ frequency: 1220, endFrequency: 1780, duration: 0.12, volume: 0.055 });
    this.tone({ frequency: 1420, endFrequency: 2050, duration: 0.1, volume: 0.05, when: 0.16 });
  }
  playAnimal(animal: number) {
    const note = [523, 587, 659, 698, 784, 440][animal % 6];
    this.tone({ frequency: note, duration: 0.16, volume: 0.08, type: "triangle" });
    this.tone({ frequency: note * 1.5, duration: 0.19, volume: 0.06, when: 0.12, type: "triangle" });
  }
  playSurprise() {
    [523, 659, 784, 1047].forEach((frequency, i) => this.tone({ frequency, when: i * 0.12, duration: 0.3, volume: 0.06, type: "triangle" }));
  }
  destroy() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    void this.context?.close().catch(() => {});
    this.context = null;
    this.noiseBuffer = null;
    this.trainSource = null;
    this.trainBuffers.clear();
  }
}
