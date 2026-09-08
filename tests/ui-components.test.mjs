import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
const page=await readFile(new URL('../app/page.tsx',import.meta.url),'utf8');
const css=await readFile(new URL('../app/globals.css',import.meta.url),'utf8');
test('parent settings keep independent volume sliders out of the play-button row',()=>{
 const deck=page.slice(page.indexOf('<section className="control-deck"'),page.indexOf('<dialog'));
 assert.equal((deck.match(/<Slider/g)||[]).length,3);assert.doesNotMatch(deck,/game-center-footer|<Switch/);assert.match(page,/<dialog[\s\S]*Background music volume/);assert.match(page,/Sound effects volume/);assert.match(page,/Show animal visitors/);
});
test('tap feedback is brief and no busy or hover state lights the touch areas',()=>{
 assert.match(css,/tap-feedback 360ms/);assert.match(css,/\.scene-hotspot:hover[^}]*background:transparent!important; box-shadow:none!important/s);assert.doesNotMatch(css,/active-button-glow/);
});
test('the page uses the same camera for the scene and hotspots and never mirrors Henry lettering',()=>{
 assert.match(page,/sceneCamera\(element.clientWidth, element.clientHeight\)/);assert.match(page,/scale\(\$\{camera.scale\}\)/);assert.match(page,/trainDirection === "left" && activeTrain !== 1/);assert.match(css,/100dvh/);assert.match(css,/prefers-reduced-motion/);
});
