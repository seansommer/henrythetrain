import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadTs } from './load-ts.mjs';
const { TRAIN_PROFILES, createTrainTrips, shuffledBag, availableSurprises } = loadTs('../lib/train-profiles.ts');
const { WORLD, sceneCamera, sceneHotspots, trackHotspot, signalHotspot, gateHotspot, trainTravel } = loadTs('../lib/scene-hotspots.ts');
const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const screens=[[320,410],[390,660],[430,750],[768,820],[1440,752],[844,230],[932,250],[1920,930],[320,720]];
test('each tap draws independently from all ten trains and remembers each return direction',()=>{
 const draws=[0,0,.1,.9,0,.1,.99]; let index=0;
 const next=createTrainTrips(()=>draws[index++]);
 const trips=draws.map(()=>next());
 assert.deepEqual(trips.map(trip=>[trip.train,trip.direction]),[[0,'right'],[0,'left'],[1,'right'],[9,'right'],[0,'right'],[1,'left'],[9,'left']]);
 for(let train=0;train<10;train++) assert.equal(createTrainTrips(()=>(train+.1)/10)().train,train);
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

test('every wildlife route enters and exits outside the visible camera',()=>{
 const {WILDLIFE,wildlifePath}=loadTs('../lib/wildlife-motion.ts');
 for(const [w,h] of screens) for(const kind of Object.keys(WILDLIFE)) {
  const camera=sceneCamera(w,h), p=wildlifePath(camera,kind);
  const outside=(x,y)=>((x+p.width)*camera.scale+camera.x<=0 || x*camera.scale+camera.x>=w || (y+p.height)*camera.scale+camera.y<=0 || y*camera.scale+camera.y>=h);
  assert.ok(outside(p.fromX,p.fromY),`${kind} starts outside ${w}x${h}`);
  assert.ok(outside(p.toX,p.toY),`${kind} leaves ${w}x${h}`);
  assert.ok(!outside(p.stopX,p.stopY),`${kind} visits visible foreground/sky`);
 }
});
