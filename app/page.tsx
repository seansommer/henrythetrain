"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SceneHotspot } from "@/components/scene-hotspot";
import { assetUrl } from "@/lib/asset-url";
import { SurpriseSprite } from "@/components/surprise-sprite";
import { RailroadAudio } from "@/lib/railroad-audio";
import { TRAIN_PROFILES, TRAIN_RUN_MS, LIGHT_RUN_MS, GATE_RUN_MS, HENRY_GREETING, shuffledBag, availableSurprises, type SurpriseTarget, type SurpriseKind } from "@/lib/train-profiles";
import { sceneHotspots, type Hotspot } from "@/lib/scene-hotspots";
import { SceneSprite, type SceneSpriteName } from "@/components/scene-sprite";
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

const ANIMAL_SPRITES: SceneSpriteName[] = ["deer", "rabbit", "raccoon", "bear"];
const BIRD_SPRITES: SceneSpriteName[] = ["blue-birds", "brown-birds"];
const SURPRISE_LABELS: Record<SurpriseKind, string> = {
  leaves: "Whoosh! The tree is sending you leaves!",
  squirrel: "Peekaboo! A squirrel says hello!",
  birds: "You found a secret bird fly-by!",
  turtle: "A little turtle has come to wave!",
  butterflies: "Look! Butterflies were hiding by the rock!",
  sparkles: "You found the rock's sparkle surprise!",
};
type ActiveSurprise = { kind: SurpriseKind; x: number; y: number };

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
  const [animalsEnabled, setAnimalsEnabled] = useState(true);
  const [surprises, setSurprises] = useState<Partial<Record<SurpriseTarget, ActiveSurprise>>>({});
  const [hotspots, setHotspots] = useState<Record<SurpriseTarget, Hotspot> | null>(null);
  const [titleVisible, setTitleVisible] = useState(true);
  const [announcement, setAnnouncement] = useState("Henry's railroad is ready!");
  const audio = useRef<RailroadAudio | null>(null);
  const trainBag = useRef<number[]>([]);
  const surpriseBags = useRef<Record<SurpriseTarget, SurpriseKind[]>>({ tree: [], rock: [] });
  const surpriseBusy = useRef<Record<SurpriseTarget, boolean>>({ tree: false, rock: false });
  const animalsAllowed = useRef(true);
  const stage = useRef<HTMLElement | null>(null);
  const lastAnimal = useRef(-1);
  const gameStarted = useRef(false);
  const lightsBusy = useRef(false);
  const gatesBusy = useRef(false);
  const trainBusy = useRef(false);
  const schedule = useTimeoutRegistry();

  const prepareAudio = useCallback(() => {
    if (!audio.current) audio.current = new RailroadAudio();
    audio.current.setEnabled(soundEnabled);
    audio.current.setMusicEnabled(musicEnabled);
    audio.current.setMusicVolume(musicVolume / 100);
    audio.current.setEffectsVolume(effectsVolume / 100);
    return audio.current;
  }, [effectsVolume, musicEnabled, musicVolume, soundEnabled]);

  const ensureAudio = useCallback(async () => {
    try {
      const ready = await prepareAudio().start();
      setAudioStarted(ready);
      return ready;
    } catch {
      // A blocked audio device must never freeze a visual action or its lock.
      return false;
    }
  }, [prepareAudio]);

  useEffect(() => {
    if (!stage.current) return;
    const element = stage.current;
    const update = () => setHotspots(sceneHotspots(element.clientWidth, element.clientHeight));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const toggleAnimals = (enabled: boolean) => {
    animalsAllowed.current = enabled;
    setAnimalsEnabled(enabled);
    surpriseBags.current = { tree: [], rock: [] };
    if (!enabled) {
      setAnimal(null);
      setSurprises((current) => Object.fromEntries(Object.entries(current).filter(([, event]) => event.kind !== "squirrel" && event.kind !== "turtle")));
    }
  };

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
      if (!animalsAllowed.current) {
        schedule(showAnimal, nextDelay(8_000, 19_000));
        return;
      }
      let next = Math.floor(Math.random() * 4);
      if (next === lastAnimal.current) next = (next + 1) % 4;
      lastAnimal.current = next;
      setAnimal(next);
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

  const pullTrain = useCallback(() => {
    if (trainBag.current.length === 0) trainBag.current = shuffledBag(TRAIN_PROFILES.length);
    return trainBag.current.pop() ?? 0;
  }, []);

  const beginGame = useCallback(() => {
    if (gameStarted.current) return;
    gameStarted.current = true;
    schedule(() => setTitleVisible(false), 5_000);
  }, [schedule]);

  const triggerTrain = useCallback(async () => {
    if (trainBusy.current) return;
    beginGame();
    trainBusy.current = true;
    const chosen = pullTrain();
    const started = performance.now();
    setActiveTrain(chosen);
    setTrainActive(true);
    setAnnouncement(chosen === 1 ? HENRY_GREETING : `${TRAIN_PROFILES[chosen].name} is coming by!`);
    schedule(() => {
      setTrainActive(false);
      setAnnouncement("The track is clear. What will come next?");
      trainBusy.current = false;
    }, TRAIN_RUN_MS);
    // Speech must be requested during the tap, not after the audio unlock promise.
    prepareAudio().speakTrain(chosen);
    if (await ensureAudio()) {
      audio.current?.playButton();
      audio.current?.playTrain(chosen, (performance.now() - started) / 1000);
    }
  }, [beginGame, ensureAudio, prepareAudio, pullTrain, schedule]);

  const triggerLights = async () => {
    if (lightsBusy.current) return;
    beginGame();
    lightsBusy.current = true;
    setLightsActive(true);
    setAnnouncement("The crossing lights are flashing!");
    schedule(() => {
      setLightsActive(false);
      setAnnouncement("The crossing lights are off.");
      lightsBusy.current = false;
    }, LIGHT_RUN_MS);
    for (let bell = 1; bell <= 12; bell += 1) {
      schedule(() => audio.current?.playCrossingBell(), bell * 760);
    }
    if (await ensureAudio()) {
      if (!lightsBusy.current) return;
      audio.current?.playButton();
      audio.current?.playCrossingBell();
    }
  };

  const triggerGates = async () => {
    if (gatesBusy.current) return;
    beginGame();
    gatesBusy.current = true;
    setGatesActive(true);
    setAnnouncement("The railroad gates are coming down!");
    schedule(() => audio.current?.playGate("up"), 7_900);
    schedule(() => {
      setGatesActive(false);
      setAnnouncement("The railroad gates are back up.");
      gatesBusy.current = false;
    }, GATE_RUN_MS);
    if (await ensureAudio()) {
      if (!gatesBusy.current) return;
      audio.current?.playButton();
      audio.current?.playGate("down");
    }
  };

  const triggerSurprise = useCallback((target: SurpriseTarget) => {
    if (surpriseBusy.current[target] || !hotspots) return;
    beginGame();
    surpriseBusy.current[target] = true;
    const choices = availableSurprises(target, animalsAllowed.current);
    if (surpriseBags.current[target].length === 0) {
      surpriseBags.current[target] = shuffledBag(choices.length).map((index) => choices[index]);
    }
    const kind = surpriseBags.current[target].pop()!;
    const { x, y } = hotspots[target];
    setSurprises((current) => ({ ...current, [target]: { kind, x, y } }));
    setAnnouncement(SURPRISE_LABELS[kind]);
    schedule(() => {
      setSurprises((current) => { const remaining = { ...current }; delete remaining[target]; return remaining; });
      surpriseBusy.current[target] = false;
    }, kind === "birds" ? 8_500 : 4_800);
    void ensureAudio().then((ready) => {
      if (!ready || !surpriseBusy.current[target]) return;
      if ((kind === "squirrel" || kind === "turtle") && !animalsAllowed.current) return;
      if (kind === "birds") audio.current?.playChirp();
      else if (kind === "squirrel" || kind === "turtle") audio.current?.playAnimal(kind === "squirrel" ? 4 : 5);
      else audio.current?.playSurprise();
    });
  }, [beginGame, ensureAudio, hotspots, schedule]);

  const trainStyle = {
    "--train-column": activeTrain % 2,
    "--train-row": Math.floor(activeTrain / 2),
  } as CSSProperties;
  const trainDirection = TRAIN_PROFILES[activeTrain].direction;

  return (
    <main className="railroad-app" style={{ "--world-image": `url("${assetUrl("/assets/railroad-world.webp")}")`, "--train-image": `url("${assetUrl("/assets/ten-trains-v2.webp")}")` } as CSSProperties}>
      <section ref={stage} className="railroad-stage" aria-label="Henry's animated railroad crossing">
        <div className="world-pan" aria-hidden="true" />
        <div className="cloud cloud-one" aria-hidden="true">
          <SceneSprite name="cloud-one" />
        </div>
        <div className="cloud cloud-two" aria-hidden="true">
          <SceneSprite name="cloud-two" />
        </div>

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

        {(["left", "right"] as const).map((side) => (
          <div key={side} className={`crossing crossing-${side}`} aria-hidden="true">
            <div className={`crossing-signal ${lightsActive ? "is-flashing" : ""}`}>
              <SceneSprite name={`signal-${side}`} />
            </div>
            <div className={`crossing-gate gate-${side} ${gatesActive ? "is-running" : ""}`}>
              <div className="gate-beam"><SceneSprite name={`beam-${side}`} stretch /></div>
              <div className="gate-hinge"><SceneSprite name={`hinge-${side}`} /></div>
            </div>
          </div>
        ))}

        {hotspots && (["tree", "rock"] as const).map((target) => (
          <SceneHotspot key={target} target={target} bounds={hotspots[target]} active={Boolean(surprises[target])} onExplore={triggerSurprise} />
        ))}

        {(Object.entries(surprises) as [SurpriseTarget, ActiveSurprise][]).map(([target, event]) => (
          <div key={target} className={`surprise-event surprise-${event.kind}`} aria-hidden="true">
            {(event.kind === "squirrel" || event.kind === "turtle") && animalsEnabled && (
              <div className={`animal-friend secret-animal secret-${target}`}><SurpriseSprite name={event.kind} /></div>
            )}
            {event.kind === "birds" && <div className="bird-flock secret-birds"><SceneSprite name="blue-birds" /></div>}
            {(event.kind === "leaves" || event.kind === "butterflies") && Array.from({ length: event.kind === "leaves" ? 9 : 4 }, (_, index) => (
              <div key={index} className={`surprise-particle ${event.kind === "leaves" ? "breeze-leaf" : "secret-butterfly"}`}
                style={{ left: event.x, top: event.y, "--i": index, "--drift": `${(index % 2 ? -1 : 1) * (90 + index * 24)}px`, "--lift": `${80 + index * 24}px` } as CSSProperties}>
                <SurpriseSprite name={event.kind === "leaves" ? "leaf" : "butterfly"} />
              </div>
            ))}
            {event.kind === "sparkles" && Array.from({ length: 10 }, (_, index) => (
              <span key={index} className="rock-sparkle" style={{ left: event.x, top: event.y, "--i": index, "--drift": `${Math.cos(index * 0.7) * 110}px`, "--lift": `${45 + index * 11}px` } as CSSProperties}>✦</span>
            ))}
          </div>
        ))}

        {birds !== null && (
          <div className={`bird-flock flock-${birds}`} aria-label="Birds are flying overhead">
            <SceneSprite name={BIRD_SPRITES[birds]} />
            <span className="sr-only">Birds fly overhead</span>
          </div>
        )}

        {animalsEnabled && animal !== null && (
          <div className={`animal-friend animal-${animal}`} aria-live="polite">
            <SceneSprite name={ANIMAL_SPRITES[animal]} />
            <span className="sr-only">A friendly animal pops up and waves hello</span>
          </div>
        )}

        {trainActive && (
          <div
            className={`train-runner direction-${trainDirection}`}
            role="img"
            aria-label={`${TRAIN_PROFILES[activeTrain].name} passing ${trainDirection}`}
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
          <div className="panel-options">
            <label className="animal-toggle" htmlFor="animals-toggle">
              <Bird aria-hidden="true" />
              <span>Animals {animalsEnabled ? "on" : "off"}</span>
              <Switch id="animals-toggle" checked={animalsEnabled} onCheckedChange={toggleAnimals} aria-label="Show animal pop-ups" />
            </label>
          </div>
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
            <small>{trainActive ? TRAIN_PROFILES[activeTrain].name : "10 surprise trains"}</small>
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
          <span>Try touching a tree or a rock. There are secrets to discover!</span>
        </div>
      </section>
    </main>
  );
}
