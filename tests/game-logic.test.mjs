import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadTs } from './load-ts.mjs';
const { TRAIN_PROFILES, createTrainTrips, shuffledBag, availableSurprises } = loadTs('../lib/train-profiles.ts');
const { WORLD, sceneCamera, sceneHotspots, trackHotspot, signalHotspot, gateHotspot, trainTravel } = loadTs('../lib/scene-hotspots.ts');
const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const screens=[[320,410],[390,660],[430,750],[768,820],[1440,752],[844,230],[932,250],[1920,930],[320,720]];
test('shuffled trains alternate their own direction without immediate repeats',()=>{
 const next=createTrainTrips(); const lastDirections=new Map(); let previous=-1;
 for(let cycle=0;cycle<5;cycle++) { const seen=new Set(); for(let i=0;i<10;i++) {
  const trip=next(); assert.notEqual(trip.train,previous); previous=trip.train;
  assert.equal(trip.direction,lastDirections.get(trip.train)==='right'?'left':'right');
  lastDirections.set(trip.train,trip.direction);seen.add(trip.train);
 } assert.equal(seen.size,10); }
});
test('shuffle bags contain every train exactly once',()=>{ const bag=shuffledBag(10);assert.equal(new Set(bag).size,10);assert.ok(bag.every(v=>v>=0&&v<10)); });
test('every camera keeps the rail and central touch target together without stretching',()=>{
 for(const [width,height] of screens){const c=sceneCamera(width,height),track=trackHotspot(c);assert.equal(track.y,c.y+WORLD.railY*c.scale);assert.equal(track.x,width/2);assert.ok(track.y>44&&track.y<height-40);assert.ok(c.scale>0);}
});
test('essential tap targets stay reachable in phone, landscape and desktop cameras',()=>{
 for(const [w,h] of screens){const c=sceneCamera(w,h);const all=[...Object.values(sceneHotspots(c)),trackHotspot(c),signalHotspot(c,'left'),signalHotspot(c,'right'),gateHotspot(c,'left'),gateHotspot(c,'right')];
  for(const t of all){assert.ok(t.width>=44&&t.height>=44);assert.ok(t.x>=22&&t.x<=w-22,`${w}x${h} target x`);assert.ok(t.y>=22&&t.y<=h-22,`${w}x${h} target y`);}
 }
});
test('both directions enter and leave fully outside the camera including longer return art',()=>{
 for(const [w,h] of screens)for(const trainWidth of [1000,1300]){const c=sceneCamera(w,h);const right=trainTravel(c,'right',trainWidth),left=trainTravel(c,'left',trainWidth);assert.ok((right.from+trainWidth)*c.scale+c.x<0);assert.ok(right.to*c.scale+c.x>w);assert.equal(left.from,right.to);assert.equal(left.to,right.from);}
});
test('animals off excludes every animal surprise',()=>{for(const target of ['tree','rock']) {const choices=availableSurprises(target,false);assert.ok(choices.length);assert.ok(choices.every(k=>k==='leaves'||k==='sparkles'));}});
test('independent actions complete even when audio cannot start',()=>{
 for(const [name,flag,duration] of [['Train','train','TRAIN'],['Lights','lights','LIGHT'],['Gates','gates','GATE']]){const start=page.indexOf(`const trigger${name} =`),section=page.slice(start,start+1900);assert.match(section,new RegExp(`if \\(${flag}Busy.current\\) return`));assert.ok(section.indexOf(`}, ${duration}_RUN_MS /`) < section.indexOf('await ensureAudio()'));}
 assert.doesNotMatch(page,/speechSynthesis|speakTrain/);
});
