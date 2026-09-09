import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import sharp from 'sharp';
const art=JSON.parse(await readFile(new URL('../docs/artwork-revamp.json',import.meta.url),'utf8'));
test('every production sprite has real transparent edges and visible artwork',async()=>{
 assert.equal(art.exported.length,25);
 for(const sprite of art.exported){const path=new URL('../'+sprite.path,import.meta.url).pathname;const m=await sharp(path).metadata();assert.equal(m.hasAlpha,true,sprite.path);const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});let clear=0,solid=0;for(let i=3;i<data.length;i+=4){if(data[i]===0)clear++;if(data[i]>128)solid++;}assert.ok(clear>info.width*info.height*.05,sprite.path);assert.ok(solid>info.width*info.height*.15,sprite.path);}
});
test('both Henry directions use separate native transparent sprites',async()=>{
 const right=await readFile(new URL('../public/assets/trains/1-right.webp',import.meta.url));const left=await readFile(new URL('../public/assets/trains/1-left.webp',import.meta.url));assert.notEqual(right.toString('base64'),left.toString('base64'));assert.ok(left.length>1000&&right.length>1000);
});
test('world artwork matches the camera aspect ratio',async()=>{const m=await sharp(new URL('../public/assets/railroad-world-v5.webp',import.meta.url).pathname).metadata();assert.equal(m.width/m.height,3072/2048);});

test('post grass keeps transparent margins for natural overlap',async()=>{
 const path=new URL('../public/assets/crossing/post-grass-v4.webp',import.meta.url).pathname;
 const {data,info}=await sharp(path).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal((await sharp(path).metadata()).hasAlpha,true);
 for(const pixel of [0,info.width-1,(info.height-1)*info.width,info.width*info.height-1]) assert.equal(data[pixel*4+3],0);
});
