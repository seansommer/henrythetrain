"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Bird,
  CircleStop,
  Music2,
  Play,
  Siren,
  TrainFront,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

const TRAIN_COUNT = 10;
const TRAIN_RUN_MS = 9_000;
const LIGHT_RUN_MS = 10_000;
const GATE_RUN_MS = 10_000;

const TRAIN_NAMES = [
  "Red Steam Special",
  "Henry's Blue Express",
  "Sunny Track Helper",
  "Green Electric",
  "Silver Speedster",
  "Orange Freight",
  "Purple Night Express",
  "Golden Vintage",
  "Teal Commuter",
  "Rainbow Celebration",
] as const;

const TRAIN_DIRECTIONS = [
  "right",
  "right",
  "left",
  "right",
  "left",
  "left",
  "left",
  "left",
  "right",
  "left",
] as const;

type ToneOptions = {
  frequency: number;
  duration: number;
  volume?: number;
  when?: number;
  type?: OscillatorType;
  endFrequency?: number;
};

class RailroadAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private music: GainNode | null = null;
  private effects: GainNode | null = null;
  private musicTimer: ReturnType<typeof setInterval> | null = null;
  private musicStep = 0;
  private enabled = true;
  private musicEnabled = true;
  private musicLevel = 0.35;
  private effectsLevel = 0.75;

  async start() {
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.music = this.context.createGain();
      this.effects = this.context.createGain();
      this.master.gain.value = 0.8;
      this.music.gain.value = this.musicLevel * 0.58;
      this.effects.gain.value = this.effectsLevel * 0.88;
      this.music.connect(this.master);
      this.effects.connect(this.master);
      this.master.connect(this.context.destination);
    }
    if (this.context.state === "suspended") await this.context.resume();
    this.syncLevels();
    this.startMusic();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.syncLevels();
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    this.syncLevels();
  }

  setMusicVolume(level: number) {
    this.musicLevel = Math.min(1, Math.max(0, level));
    this.syncLevels();
  }

  setEffectsVolume(level: number) {
    this.effectsLevel = Math.min(1, Math.max(0, level));
    this.syncLevels();
  }

  private syncLevels() {
    if (!this.context || !this.master || !this.music || !this.effects) return;
    const now = this.context.currentTime;
    this.master.gain.setTargetAtTime(this.enabled ? 0.8 : 0, now, 0.035);
    this.music.gain.setTargetAtTime(
      this.musicEnabled ? this.musicLevel * 0.58 : 0,
      now,
      0.08,
    );
    this.effects.gain.setTargetAtTime(this.effectsLevel * 0.88, now, 0.04);
  }

  private tone({
    frequency,
    duration,
    volume = 0.12,
    when = 0,
    type = "sine",
    endFrequency,
  }: ToneOptions) {
    if (!this.context || !this.effects) return;
    const start = this.context.currentTime + when;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    }
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.effects);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  }

  private musicTone(frequency: number, when: number, duration = 0.34) {
    if (!this.context || !this.music) return;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const start = this.context.currentTime + when;
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.music);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.04);
  }

  private startMusic() {
    if (this.musicTimer) return;
    const melody = [262, 330, 392, 330, 294, 349, 440, 349, 262, 330, 392, 523, 440, 392, 330, 294];
    const playStep = () => {
      if (!this.context || !this.enabled || !this.musicEnabled) return;
      const note = melody[this.musicStep % melody.length];
      this.musicTone(note, 0, 0.38);
      if (this.musicStep % 4 === 0) this.musicTone(note / 2, 0, 0.72);
      this.musicStep += 1;
    };
    playStep();
    this.musicTimer = setInterval(playStep, 470);
  }

  playButton() {
    this.tone({ frequency: 480, endFrequency: 720, duration: 0.13, volume: 0.1, type: "triangle" });
  }

  playCrossingBell() {
    this.tone({ frequency: 880, duration: 0.18, volume: 0.17 });
    this.tone({ frequency: 1320, duration: 0.11, volume: 0.07, when: 0.03 });
  }

  playGate(direction: "down" | "up") {
    this.tone({
      frequency: direction === "down" ? 230 : 170,
      endFrequency: direction === "down" ? 120 : 280,
      duration: 1.5,
      volume: 0.12,
      type: "sawtooth",
    });
    this.tone({ frequency: 620, duration: 0.09, volume: 0.1, when: 1.55, type: "square" });
  }

  playTrain(train: number) {
    const isSteam = train === 0 || train === 7;
    const base = isSteam ? 620 : 164 + (train % 4) * 18;
    this.tone({ frequency: base, duration: isSteam ? 0.95 : 1.25, volume: 0.25, type: isSteam ? "sine" : "sawtooth" });
    this.tone({ frequency: base * (isSteam ? 1.2 : 1.5), duration: 0.8, volume: 0.13, when: 0.16, type: "triangle" });
    for (let i = 0; i < 14; i += 1) {
      this.tone({ frequency: 88 + (i % 2) * 22, duration: 0.08, volume: 0.06, when: 1.2 + i * 0.38, type: "square" });
    }
  }

  playChirp() {
    this.tone({ frequency: 1220, endFrequency: 1780, duration: 0.12, volume: 0.055 });
    this.tone({ frequency: 1420, endFrequency: 2050, duration: 0.1, volume: 0.05, when: 0.16 });
  }

  playAnimal(animal: number) {
    const notes = [523, 587, 659, 698];
    this.tone({ frequency: notes[animal], duration: 0.16, volume: 0.08, type: "triangle" });
    this.tone({ frequency: notes[animal] * 1.5, duration: 0.19, volume: 0.06, when: 0.12, type: "triangle" });
  }

  destroy() {
    if (this.musicTimer) clearInterval(this.musicTimer);
    this.musicTimer = null;
    void this.context?.close();
    this.context = null;
  }
}

function nextDelay(min: number, max: number) {
  return Math.round(min + Math.random() * (max - min));
}

function useTimeoutRegistry() {
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
    return timer;
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  return schedule;
}

export default function Home() {
  const [trainActive, setTrainActive] = useState(false);
  const [activeTrain, setActiveTrain] = useState(0);
  const [lightsActive, setLightsActive] = useState(false);
  const [gatesActive, setGatesActive] = useState(false);
  const [animal, setAnimal] = useState<number | null>(null);
  const [birds, setBirds] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicVolume, setMusicVolume] = useState(35);
  const [effectsVolume, setEffectsVolume] = useState(75);
  const [audioStarted, setAudioStarted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(true);
  const [announcement, setAnnouncement] = useState("Henry's railroad is ready!");
  const audio = useRef<RailroadAudio | null>(null);
  const trainBag = useRef<number[]>([]);
  const gameStarted = useRef(false);
  const lightsBusy = useRef(false);
  const gatesBusy = useRef(false);
  const trainBusy = useRef(false);
  const schedule = useTimeoutRegistry();

  const ensureAudio = useCallback(async () => {
    if (!audio.current) audio.current = new RailroadAudio();
    audio.current.setEnabled(soundEnabled);
    audio.current.setMusicEnabled(musicEnabled);
    audio.current.setMusicVolume(musicVolume / 100);
    audio.current.setEffectsVolume(effectsVolume / 100);
    await audio.current.start();
    setAudioStarted(true);
  }, [effectsVolume, musicEnabled, musicVolume, soundEnabled]);

  useEffect(() => {
    audio.current?.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    audio.current?.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  useEffect(() => {
    audio.current?.setMusicVolume(musicVolume / 100);
  }, [musicVolume]);

  useEffect(() => {
    audio.current?.setEffectsVolume(effectsVolume / 100);
  }, [effectsVolume]);

  useEffect(() => () => audio.current?.destroy(), []);

  useEffect(() => {
    let alive = true;
    const showAnimal = () => {
      if (!alive) return;
      const next = Math.floor(Math.random() * 4);
      setAnimal((previous) => (previous === next ? (next + 1) % 4 : next));
      audio.current?.playAnimal(next);
      schedule(() => {
        if (alive) setAnimal(null);
        schedule(showAnimal, nextDelay(8_000, 19_000));
      }, 3_900);
    };
    const showBirds = () => {
      if (!alive) return;
      const next = Math.floor(Math.random() * 2);
      setBirds(next);
      audio.current?.playChirp();
      schedule(() => {
        if (alive) setBirds(null);
        schedule(showBirds, nextDelay(12_000, 27_000));
      }, 8_500);
    };
    schedule(showAnimal, nextDelay(5_000, 10_000));
    schedule(showBirds, nextDelay(8_000, 15_000));
    return () => {
      alive = false;
    };
  }, [schedule]);

  const pullTrain = () => {
    if (trainBag.current.length === 0) {
      trainBag.current = Array.from({ length: TRAIN_COUNT }, (_, index) => index)
        .map((value) => ({ value, order: Math.random() }))
        .sort((a, b) => a.order - b.order)
        .map(({ value }) => value);
    }
    return trainBag.current.pop() ?? 0;
  };

  const beginGame = () => {
    if (gameStarted.current) return;
    gameStarted.current = true;
    schedule(() => setTitleVisible(false), 5_000);
  };

  const triggerTrain = async () => {
    if (trainBusy.current) return;
    beginGame();
    trainBusy.current = true;
    const chosen = pullTrain();
    setActiveTrain(chosen);
    setTrainActive(true);
    setAnnouncement(`${TRAIN_NAMES[chosen]} is coming by!`);
    await ensureAudio();
    audio.current?.playButton();
    audio.current?.playTrain(chosen);
    schedule(() => {
      setTrainActive(false);
      setAnnouncement("The track is clear. What will come next?");
      trainBusy.current = false;
    }, TRAIN_RUN_MS);
  };

  const triggerLights = async () => {
    if (lightsBusy.current) return;
    beginGame();
    lightsBusy.current = true;
    setLightsActive(true);
    setAnnouncement("The crossing lights are flashing!");
    await ensureAudio();
    audio.current?.playButton();
    audio.current?.playCrossingBell();
    for (let bell = 1; bell <= 12; bell += 1) {
      schedule(() => audio.current?.playCrossingBell(), bell * 760);
    }
    schedule(() => {
      setLightsActive(false);
      setAnnouncement("The crossing lights are off.");
      lightsBusy.current = false;
    }, LIGHT_RUN_MS);
  };

  const triggerGates = async () => {
    if (gatesBusy.current) return;
    beginGame();
    gatesBusy.current = true;
    setGatesActive(true);
    setAnnouncement("The railroad gates are coming down!");
    await ensureAudio();
    audio.current?.playButton();
    audio.current?.playGate("down");
    schedule(() => audio.current?.playGate("up"), 7_900);
    schedule(() => {
      setGatesActive(false);
      setAnnouncement("The railroad gates are back up.");
      gatesBusy.current = false;
    }, GATE_RUN_MS);
  };

  const trainStyle = {
    "--train-column": activeTrain % 2,
    "--train-row": Math.floor(activeTrain / 2),
  } as CSSProperties;
  const trainDirection = TRAIN_DIRECTIONS[activeTrain];

  return (
    <main className="railroad-app">
      <section className="railroad-stage" aria-label="Henry's animated railroad crossing">
        <div className="world-pan" aria-hidden="true" />
        <div className="cloud cloud-one" aria-hidden="true" />
        <div className="cloud cloud-two" aria-hidden="true" />

        <header className="game-header">
          <div className={`title-sign ${titleVisible ? "" : "is-hidden"}`}>
            <span className="eyebrow">ALL ABOARD</span>
            <h1>Henry the Train</h1>
            <p>What will come by next?</p>
          </div>
          <div className="sound-controls" aria-label="Sound controls">
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="round-control"
              aria-label={soundEnabled ? "Turn off all sound" : "Turn on all sound"}
              aria-pressed={soundEnabled}
              onClick={() => setSoundEnabled((value) => !value)}
            >
              {soundEnabled ? <Volume2 /> : <VolumeX />}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              className="round-control"
              aria-label={musicEnabled ? "Turn off music" : "Turn on music"}
              aria-pressed={musicEnabled}
              onClick={() => setMusicEnabled((value) => !value)}
            >
              {musicEnabled ? <Music2 /> : <CircleStop />}
            </Button>
          </div>
        </header>

        <div className={`crossing-signal signal-left ${lightsActive ? "is-flashing" : ""}`} aria-hidden="true" />
        <div className={`crossing-signal signal-right ${lightsActive ? "is-flashing" : ""}`} aria-hidden="true" />
        <div className={`crossing-gate gate-left ${gatesActive ? "is-running" : ""}`} aria-hidden="true" />
        <div className={`crossing-gate gate-right ${gatesActive ? "is-running" : ""}`} aria-hidden="true" />

        {birds !== null && (
          <div className={`bird-flock flock-${birds}`} aria-label="Birds are flying overhead">
            <span className="sr-only">Birds fly overhead</span>
          </div>
        )}

        {animal !== null && (
          <div className={`animal-friend animal-${animal}`} aria-live="polite">
            <span className="sr-only">A friendly animal pops up and waves hello</span>
          </div>
        )}

        {trainActive && (
          <div
            className={`train-runner direction-${trainDirection}`}
            role="img"
            aria-label={`${TRAIN_NAMES[activeTrain]} passing ${trainDirection}`}
          >
            <div className="train-sprite" style={trainStyle} />
          </div>
        )}

        <div className="status-pill" aria-live="polite">
          {announcement}
        </div>
      </section>

      <section className="control-deck" aria-label="Railroad controls">
        <div className="control-intro">
          <span className="control-kicker">HENRY&apos;S CONTROL PANEL</span>
          <strong>Push a big button!</strong>
          <span className="audio-ready">
            {audioStarted ? "Sounds are ready" : "Your first tap starts the music"}
          </span>
          <div className="volume-mixer" aria-label="Volume controls">
            <label className="volume-row">
              <span>
                <Music2 aria-hidden="true" />
                Music
                <strong>{musicVolume}%</strong>
              </span>
              <Slider
                value={[musicVolume]}
                min={0}
                max={100}
                step={1}
                aria-label="Background music volume"
                onValueChange={(value) => setMusicVolume(value[0] ?? 0)}
              />
            </label>
            <label className="volume-row">
              <span>
                <Volume2 aria-hidden="true" />
                Sound effects
                <strong>{effectsVolume}%</strong>
              </span>
              <Slider
                value={[effectsVolume]}
                min={0}
                max={100}
                step={1}
                aria-label="Sound effects volume"
                onValueChange={(value) => setEffectsVolume(value[0] ?? 0)}
              />
            </label>
          </div>
        </div>

        <div className="big-buttons">
          <Button
            type="button"
            size="lg"
            className="game-button train-button"
            onClick={triggerTrain}
            disabled={trainActive}
            aria-busy={trainActive}
          >
            <TrainFront />
            <span>{trainActive ? "Train Coming!" : "Send a Train"}</span>
            <small>{trainActive ? TRAIN_NAMES[activeTrain] : "10 surprise trains"}</small>
          </Button>
          <Button
            type="button"
            size="lg"
            className="game-button lights-button"
            onClick={triggerLights}
            disabled={lightsActive}
            aria-busy={lightsActive}
          >
            <Siren />
            <span>{lightsActive ? "Lights Flashing!" : "Flash the Lights"}</span>
            <small>{lightsActive ? "Ding, ding, ding!" : "Crossing signal"}</small>
          </Button>
          <Button
            type="button"
            size="lg"
            className="game-button gates-button"
            onClick={triggerGates}
            disabled={gatesActive}
            aria-busy={gatesActive}
          >
            <Play className="gate-icon" />
            <span>{gatesActive ? "Gates Moving!" : "Lower the Gates"}</span>
            <small>{gatesActive ? "Down, wait, and up" : "Same ride every time"}</small>
          </Button>
        </div>

        <div className="surprise-note">
          <Bird aria-hidden="true" />
          <span>Keep watching—the birds and animal friends love to say hello.</span>
        </div>
      </section>
    </main>
  );
}
