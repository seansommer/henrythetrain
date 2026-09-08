// Optional developer asset regeneration. Requires local FFmpeg; never runs in a phone or CI build.
import { spawnSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { loadTs } from '../tests/load-ts.mjs';
const {renderTrainSound}=loadTs('../lib/train-sound.ts');
await mkdir(new URL('../public/assets/audio/',import.meta.url),{recursive:true});
for(let train=0;train<10;train++) {
 const samples=renderTrainSound(train),wav=Buffer.alloc(44+samples.length*2);
 wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);
 for(let i=0;i<samples.length;i++) wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);
 const path=new URL(`../public/assets/audio/train-${train}-v3.mp3`,import.meta.url).pathname;
 const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','wav','-i','pipe:0','-map_metadata','-1','-codec:a','libmp3lame','-b:a','64k',path],{input:wav});
 if(result.status!==0)throw Error(result.stderr.toString());
}
console.log('Rendered ten original train sounds as small, phone-ready MP3 files.');
