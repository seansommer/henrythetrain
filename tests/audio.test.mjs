import assert from 'node:assert/strict';
import test from 'node:test';
import { loadTs } from './load-ts.mjs';
const {renderTrainSound}=loadTs('../lib/train-sound.ts');
function rms(a,start,end){let total=0;for(let i=start;i<end;i++)total+=a[i]*a[i];return Math.sqrt(total/(end-start));}
test('ten original sounds fill the run, have finite samples and stay below clipping',()=>{
 const signatures=new Set();
 for(let train=0;train<10;train++){const samples=renderTrainSound(train);assert.equal(samples.length,22050*9);let peak=0;for(const n of samples){assert.ok(Number.isFinite(n));peak=Math.max(peak,Math.abs(n));}assert.ok(peak>.05&&peak<.71);signatures.add(Array.from(samples.slice(25000,25020)).join(','));}
 assert.equal(signatures.size,10);
});
test('passing trains fade in and away instead of starting or ending abruptly',()=>{
 const a=renderTrainSound(1);assert.equal(a[0],0);assert.ok(Math.abs(a.at(-1))<.0001);const middle=rms(a,22050*4,22050*5);assert.ok(rms(a,0,2205)<middle*.3);assert.ok(rms(a,a.length-2205,a.length)<middle*.3);
});
test('invalid sound requests cannot allocate uncontrolled audio buffers',()=>{assert.throws(()=>renderTrainSound(99));assert.throws(()=>renderTrainSound(0,Infinity));assert.throws(()=>renderTrainSound(0,1000000));});
test('missing audio support is a silent fallback and stale trains never create audio',async()=>{
 const {RailroadAudio}=loadTs('../lib/railroad-audio.ts');const audio=new RailroadAudio();assert.equal(await audio.start(),false);assert.doesNotThrow(()=>audio.playTrain(1,10,'left'));audio.destroy();
});
