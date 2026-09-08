"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SceneHotspot } from "@/components/scene-hotspot";
import { assetUrl } from "@/lib/asset-url";
import { SurpriseSprite } from "@/components/surprise-sprite";
import { RailroadAudio } from "@/lib/railroad-audio";
import { TRAIN_PROFILES, TRAIN_RUN_MS, LIGHT_RUN_MS, GATE_RUN_MS, HENRY_GREETING, shuffledBag, availableSurprises, createTrainTrips, type TrainTrip, type SurpriseTarget, type SurpriseKind } from "@/lib/train-profiles";
import { WORLD, SIGNALS, GATES, SCENE_TARGETS, sceneCamera, sceneHotspots, trackHotspot, signalHotspot, gateHotspot, trainTravel } from "@/lib/scene-hotspots";
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
  Settings2,
  X,
  Type,
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
  const [textVisible, setTextVisible] = useState(true);
  const [trainSpeed, setTrainSpeed] = useState(1);
  const [lightSpeed, setLightSpeed] = useState(1);
  const [gateSpeed, setGateSpeed] = useState(1);
  const [trainActive, setTrainActive] = useState(false);
  const [activeTrain, setActiveTrain] = useState(0);
  const [trainDirection, setTrainDirection] = useState<TrainTrip["direction"]>("right");
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
  const [camera, setCamera] = useState<ReturnType<typeof sceneCamera> | null>(null);
  const [titleVisible, setTitleVisible] = useState(true);
  const [announcement, setAnnouncement] = useState("Henry's railroad is ready!");
  const audio = useRef<RailroadAudio | null>(null);
  const trips = useRef(createTrainTrips());
  const surpriseBags = useRef<Record<SurpriseTarget, SurpriseKind[]>>({ tree: [], rock: [] });
  const surpriseBusy = useRef<Record<SurpriseTarget, boolean>>({ tree: false, rock: false });
  const animalsAllowed = useRef(true);
  const stage = useRef<HTMLElement | null>(null);
  const settings = useRef<HTMLDialogElement | null>(null);
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
    const update = () => {
      setCamera(sceneCamera(element.clientWidth, element.clientHeight));
    };
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
      setBirds(null);
      setSurprises((current) => Object.fromEntries(Object.entries(current).filter(([, event]) => !["squirrel", "turtle", "birds", "butterflies"].includes(event.kind))));
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
      if (!animalsAllowed.current) { schedule(showBirds, nextDelay(12_000, 27_000)); return; }
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

  const beginGame = useCallback(() => {
    if (gameStarted.current) return;
    gameStarted.current = true;
    schedule(() => setTitleVisible(false), 5_000);
  }, [schedule]);

  const triggerTrain = useCallback(async () => {
    if (trainBusy.current) return;
    beginGame();
    trainBusy.current = true;
    const trip = trips.current();
    const chosen = trip.train;
    const started = performance.now();
    setActiveTrain(chosen);
    setTrainDirection(trip.direction);
    setTrainActive(true);
    setAnnouncement(trip.direction === "left" ? `${TRAIN_PROFILES[chosen].name} is coming back!` : chosen === 1 ? HENRY_GREETING : `${TRAIN_PROFILES[chosen].name} is coming by!`);
    schedule(() => {
      setTrainActive(false);
      setAnnouncement("The track is clear. What will come next?");
      trainBusy.current = false;
    }, TRAIN_RUN_MS / trainSpeed);
    if (await ensureAudio()) {
      audio.current?.playButton();
      audio.current?.playTrain(chosen, (performance.now() - started) / 1000, trip.direction, trainSpeed);
    }
  }, [beginGame, ensureAudio, schedule, trainSpeed]);

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
    }, LIGHT_RUN_MS / lightSpeed);
    for (let bell = 1; bell <= 12; bell += 1) {
      schedule(() => audio.current?.playCrossingBell(), bell * 760 / lightSpeed);
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
    schedule(() => audio.current?.playGate("up"), 7_900 / gateSpeed);
    schedule(() => {
      setGatesActive(false);
      setAnnouncement("The railroad gates are back up.");
      gatesBusy.current = false;
    }, GATE_RUN_MS / gateSpeed);
    if (await ensureAudio()) {
      if (!gatesBusy.current) return;
      audio.current?.playButton();
      audio.current?.playGate("down");
    }
  };

  const triggerSurprise = useCallback((target: SurpriseTarget) => {
    if (surpriseBusy.current[target]) return;
    beginGame();
    surpriseBusy.current[target] = true;
    const choices = availableSurprises(target, animalsAllowed.current);
    if (surpriseBags.current[target].length === 0) {
      surpriseBags.current[target] = shuffledBag(choices.length).map((index) => choices[index]);
    }
    const kind = surpriseBags.current[target].pop()!;
    const { x, y } = SCENE_TARGETS[target];
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
  }, [beginGame, ensureAudio, schedule]);

  const hotspots = camera ? sceneHotspots(camera) : null;
  const trainWidth = activeTrain === 1 && trainDirection === "left" ? 1300 : WORLD.trainWidth;
  const travel = camera ? trainTravel(camera, trainDirection, trainWidth) : { from: -1000, to: WORLD.width };
  const trainStyle = {
    top: WORLD.railY, width: trainWidth,
    "--travel-from": `${travel.from}px`, "--travel-to": `${travel.to}px`,
    "--run-time": `${TRAIN_RUN_MS / trainSpeed}ms`,
  } as CSSProperties;

  return (
    <main className={`railroad-app ${textVisible ? "" : "hide-play-text"}`} style={{ "--gate-time": `${GATE_RUN_MS / gateSpeed}ms`, "--flash-time": `${1.2 / lightSpeed}s`, "--flash-half": `${-.6 / lightSpeed}s` } as CSSProperties}>
      <header className="game-header">
        <a className="game-center-shortcut" href="https://seansommer.github.io/gamecenter/" target="_top" aria-label="Return to Game Center" title="Game Center">
          <img src={assetUrl("/game-center-icon.png")} width="36" height="36" alt="" />
        </a>
        <h1>Henry the Train</h1>
        <nav className="sound-controls" aria-label="Sound and parent settings">
          <Button type="button" variant="secondary" size="icon-lg" className="round-control"
            aria-label={soundEnabled ? "Turn off all sound" : "Turn on all sound"} aria-pressed={soundEnabled}
            onClick={() => { setSoundEnabled(value => !value); void ensureAudio(); }}>
            {soundEnabled ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button type="button" variant="secondary" size="icon-lg" className="round-control"
            aria-label={musicEnabled ? "Turn off music" : "Turn on music"} aria-pressed={musicEnabled}
            onClick={() => { setMusicEnabled(value => !value); void ensureAudio(); }}>
            {musicEnabled ? <Music2 /> : <CircleStop />}
          </Button>
          <Button type="button" variant="secondary" size="icon-lg" className="round-control"
            aria-label="Open parent settings" aria-haspopup="dialog" aria-controls="parent-settings"
            onClick={() => settings.current?.showModal()}><Settings2 /></Button>
        </nav>
      </header>

      <section ref={stage} className="railroad-stage" aria-label="Henry's animated railroad crossing">
        {camera && <>
          <div className="railroad-world" aria-hidden="true" style={{
            width: WORLD.width, height: WORLD.height,
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale})`,
            backgroundImage: `url("${assetUrl("/assets/railroad-world-v3.webp")}")`,
          }}>
            {(["left", "right"] as const).map(side => (
              <div key={side} className={`crossing-signal ${lightsActive ? "is-flashing" : ""}`}
                style={{ left: SIGNALS[side].x, top: SIGNALS[side].y, width: SIGNALS[side].width, height: SIGNALS[side].height }}>
                <SceneSprite name={`signal-${side}`} />
                <i className="signal-lamp lamp-one" /><i className="signal-lamp lamp-two" />
              </div>
            ))}
            {(["left", "right"] as const).map(side => (
              <div key={side} className={`crossing-gate gate-${side} ${gatesActive ? "is-running" : ""}`}
                style={{ left: GATES[side].x, top: GATES[side].y }}>
                <img src={assetUrl(`/assets/crossing/gate-${side}.webp`)} alt="" draggable={false} />
              </div>
            ))}
            {trainActive && <div className="train-runner" style={trainStyle}>
              <img className={`train-sprite ${trainDirection === "left" && activeTrain !== 1 ? "face-left" : ""}`} src={assetUrl(`/assets/trains/${activeTrain}-${activeTrain === 1 ? trainDirection : "right"}.webp`)}
                alt="" draggable={false} />
            </div>}
            {birds !== null && animalsEnabled && <div className={`bird-flock flock-${birds}`}><SceneSprite name={BIRD_SPRITES[birds]} /></div>}
            {animalsEnabled && animal !== null && <div className={`animal-friend animal-${animal}`}><SceneSprite name={ANIMAL_SPRITES[animal]} /></div>}
            {(Object.entries(surprises) as [SurpriseTarget, ActiveSurprise][]).map(([target, event]) => (
              <div key={target} className={`surprise-event surprise-${event.kind}`}>
                {(event.kind === "squirrel" || event.kind === "turtle") && animalsEnabled &&
                  <div className={`animal-friend secret-animal secret-${target}`}><SurpriseSprite name={event.kind} /></div>}
                {event.kind === "birds" && animalsEnabled && <div className="bird-flock secret-birds"><SceneSprite name="blue-birds" /></div>}
                {(event.kind === "leaves" || event.kind === "butterflies" && animalsEnabled) && Array.from({ length: event.kind === "leaves" ? 7 : 4 }, (_, index) => (
                  <div key={index} className={`surprise-particle ${event.kind === "leaves" ? "breeze-leaf" : "secret-butterfly"}`}
                    style={{ left: event.x, top: event.y, "--i": index, "--drift": `${(index % 2 ? -1 : 1) * (90 + index * 24)}px`, "--lift": `${80 + index * 24}px` } as CSSProperties}>
                    <SurpriseSprite name={event.kind === "leaves" ? "leaf" : "butterfly"} />
                  </div>
                ))}
                {event.kind === "sparkles" && Array.from({ length: 8 }, (_, index) => (
                  <span key={index} className="rock-sparkle" style={{ left: event.x, top: event.y, "--i": index, "--drift": `${Math.cos(index * 0.7) * 110}px`, "--lift": `${45 + index * 11}px` } as CSSProperties}>✦</span>
                ))}
              </div>
            ))}
          </div>
          <SceneHotspot bounds={trackHotspot(camera)} active={trainActive} label="Send a train: tap the track" onActivate={triggerTrain} className="hotspot-track" />
          {(["left", "right"] as const).map(side => <SceneHotspot key={`signal-${side}`}
            bounds={signalHotspot(camera, side)} active={lightsActive} label={`Flash the lights: ${side} crossing signal`} onActivate={triggerLights} />)}
          {(["left", "right"] as const).map(side => <SceneHotspot key={`gate-${side}`}
            bounds={gateHotspot(camera, side)} active={gatesActive} label={`Lower the gates: ${side} crossing gate`} onActivate={triggerGates} />)}
          {hotspots && (["tree", "rock"] as const).map(target => <SceneHotspot key={target}
            bounds={hotspots[target]} active={Boolean(surprises[target])} label={`Explore the ${target}: discover a surprise`} onActivate={() => triggerSurprise(target)} />)}
        </>}
        <p className={`scene-tip ${titleVisible ? "" : "is-hidden"}`}>Tap the track, lights or gates. Try a tree or rock, too!</p>
        <p className="status-pill" role="status">{announcement}</p>
      </section>

      <section className="control-deck" aria-label="Railroad controls">
        <div className="big-buttons">
          <div className="action-column">
          <Button type="button" size="lg" className="game-button train-button" onClick={triggerTrain}
            disabled={trainActive} aria-busy={trainActive} aria-label="Send a Train">
            <TrainFront /><span>Train</span>
          </Button>
          <Slider className="speed-slider" min={0.5} max={1.5} step={0.25} value={[trainSpeed]} disabled={trainActive} onValueChange={value => setTrainSpeed(value[0] ?? 1)} aria-label="Train animation speed" aria-valuetext={`${trainSpeed} times normal speed; adjust between runs`} />
          <small className="speed-caption">Train speed · {trainSpeed}×</small></div>
          <div className="action-column">
          <Button type="button" size="lg" className="game-button lights-button" onClick={triggerLights}
            disabled={lightsActive} aria-busy={lightsActive} aria-label="Flash the Lights">
            <Siren /><span>Lights</span>
          </Button>
          <Slider className="speed-slider" min={0.5} max={1.5} step={0.25} value={[lightSpeed]} disabled={lightsActive} onValueChange={value => setLightSpeed(value[0] ?? 1)} aria-label="Lights animation speed" aria-valuetext={`${lightSpeed} times normal speed; adjust between runs`} />
          <small className="speed-caption">Lights speed · {lightSpeed}×</small></div>
          <div className="action-column">
          <Button type="button" size="lg" className="game-button gates-button" onClick={triggerGates}
            disabled={gatesActive} aria-busy={gatesActive} aria-label="Lower the Gates">
            <Play className="gate-icon" /><span>Gates</span>
          </Button>
          <Slider className="speed-slider" min={0.5} max={1.5} step={0.25} value={[gateSpeed]} disabled={gatesActive} onValueChange={value => setGateSpeed(value[0] ?? 1)} aria-label="Gates animation speed" aria-valuetext={`${gateSpeed} times normal speed; adjust between runs`} />
          <small className="speed-caption">Gates speed · {gateSpeed}×</small></div>
        </div>
        <Button type="button" variant="ghost" className="text-toggle" aria-label={textVisible ? "Hide game text" : "Show game text"} aria-pressed={!textVisible} onClick={() => setTextVisible(value => !value)}><Type /><span>{textVisible ? "Hide text" : "Show text"}</span></Button>
      </section>

      <dialog ref={settings} id="parent-settings" className="parent-settings" aria-labelledby="settings-title">
        <div className="settings-heading"><h2 id="settings-title">Parent settings</h2>
          <Button type="button" variant="ghost" size="icon-lg" className="close-settings" onClick={() => settings.current?.close()} aria-label="Close parent settings"><X /></Button>
        </div>
        <label className="animal-toggle" htmlFor="animals-toggle"><Bird aria-hidden="true" /><span>Animal visitors</span>
          <Switch id="animals-toggle" checked={animalsEnabled} onCheckedChange={toggleAnimals} aria-label="Show animal visitors" />
        </label>
        <div className="volume-mixer" aria-label="Volume controls">
          <div className="volume-row"><label id="music-volume-label"><Music2 aria-hidden="true" />Music<strong>{musicVolume}%</strong></label>
            <Slider value={[musicVolume]} min={0} max={100} step={1} aria-label="Background music volume"
              aria-valuetext={`${musicVolume} percent`} onValueChange={value => setMusicVolume(value[0] ?? 0)} />
          </div>
          <div className="volume-row"><label id="effects-volume-label"><Volume2 aria-hidden="true" />Sound effects<strong>{effectsVolume}%</strong></label>
            <Slider value={[effectsVolume]} min={0} max={100} step={1} aria-label="Sound effects volume"
              aria-valuetext={`${effectsVolume} percent`} onValueChange={value => setEffectsVolume(value[0] ?? 0)} />
          </div>
        </div>
        <p className="settings-note">{audioStarted ? "Music and train sounds have separate volume controls." : "Tap a play button to start the sounds."}</p>
        <Button type="button" size="lg" className="back-to-play" onClick={() => settings.current?.close()}>Back to play</Button>
      </dialog>
    </main>
  );
}
