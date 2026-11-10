const test=require('node:test');const assert=require('node:assert/strict');const path=require('path');const fs=require('fs');
const {ACHIEVEMENTS,SIMPLE_TARGETS,mergeAchievementState}=require('../src/achievements');
const {discoverSaveFiles}=require('../src/save-reader');
test('contains all 55 current The Planet Crafter Steam achievements',()=>{assert.equal(ACHIEVEMENTS.length,55);assert.equal(new Set(ACHIEVEMENTS.map(x=>x.name)).size,55);});
test('includes cumulative craft and Terra Token targets',()=>{assert.equal(SIMPLE_TARGETS['Barely surviving'].target,10);assert.equal(SIMPLE_TARGETS['Unstoppable'].target,1000);assert.equal(SIMPLE_TARGETS['Space magnate'].target,100000);});
test('Steam state remains authoritative',()=>{const rows=mergeAchievementState(null,[{name:'Shelter',unlocked:true}]);assert.equal(rows.find(x=>x.name==='Shelter').state,'unlocked');assert.equal(rows.find(x=>x.name==='New Sky').state,'unknown');});
test('save discovery reads json files only',()=>{const dir=fs.mkdtempSync(path.join(require('os').tmpdir(),'eden-test-'));fs.writeFileSync(path.join(dir,'WorldOne.json'),'{}');fs.writeFileSync(path.join(dir,'note.txt'),'x');const r=discoverSaveFiles({manualRoot:dir});assert.equal(r.files.length,1);assert.equal(r.files[0].name,'WorldOne.json');fs.rmSync(dir,{recursive:true,force:true});});

test('Eden UI does not instruct users to relaunch the game for absent numeric stats',()=>{const source=fs.readFileSync(path.join(__dirname,'..','src','renderer.js'),'utf8');assert.equal(source.includes('Start The Planet Crafter once'),false);assert.equal(source.includes('completion-dial--eden'),true);});
test('Steam counter mapping contains no copied Pacific Drive heuristics',()=>{const source=fs.readFileSync(path.join(__dirname,'..','src','steam-reader.js'),'utf8');assert.equal(source.includes("DRIVER'S ED DROPOUT"),false);assert.equal(source.includes('schema-structure'),true);});

test('Project Eden ships separate fifteen-image open and closed card banks',()=>{
  const assets=path.join(__dirname,'..','src','assets');
  const closed=fs.readdirSync(assets).filter(n=>/^achievement-card-closed-\d{2}\.webp$/.test(n));
  const open=fs.readdirSync(assets).filter(n=>/^achievement-card-open-\d{2}\.webp$/.test(n));
  assert.equal(closed.length,15); assert.equal(open.length,15);
  const crypto=require('node:crypto'); const hashes=[...closed,...open].map(n=>crypto.createHash('sha256').update(fs.readFileSync(path.join(assets,n))).digest('hex')); assert.equal(new Set(hashes).size,30);
});
test('Project Eden completion banner is gated behind full resolved completion',()=>{
  const renderer=fs.readFileSync(path.join(__dirname,'..','src','renderer.js'),'utf8');
  assert.match(renderer,/total > 0 && unlocked === total && unknown === 0/);
  const html=fs.readFileSync(path.join(__dirname,'..','src','index.html'),'utf8');
  assert.match(html,/id="completionBanner"[^>]*hidden/);
});
test('Project Eden header uses aspect-preserving cover treatment',()=>{
  const css=fs.readFileSync(path.join(__dirname,'..','src','styles.css'),'utf8');
  assert.match(css,/app-header-eden\.webp'\) center \/ cover no-repeat/);
  assert.equal(css.includes("app-header-eden.webp') right center / auto 100%"),false);
});

test('Project Eden dial keeps the shared family gauge and adds the subtle 15-phase rail',()=>{const css=fs.readFileSync(path.join(__dirname,'..','src','styles.css'),'utf8');const renderer=fs.readFileSync(path.join(__dirname,'..','src','renderer.js'),'utf8');assert.match(css,/Eden terraformation phase rail/);assert.match(css,/eden-phase-scale/);assert.match(renderer,/phaseColours/);assert.match(renderer,/Barren/);assert.match(renderer,/Flora/);assert.match(renderer,/Complete/);assert.equal(renderer.includes('eden-dial-accent--warm'),false);assert.equal(renderer.includes('eden-dial-accent--life'),false);});
