const test=require('node:test');const assert=require('node:assert/strict');const path=require('path');const fs=require('fs');
const {ACHIEVEMENTS,SIMPLE_TARGETS,mergeAchievementState}=require('../src/achievements');
const {discoverSaveFiles}=require('../src/save-reader');
test('contains all 55 current The Planet Crafter Steam achievements',()=>{assert.equal(ACHIEVEMENTS.length,55);assert.equal(new Set(ACHIEVEMENTS.map(x=>x.name)).size,55);});
test('includes cumulative craft and Terra Token targets',()=>{assert.equal(SIMPLE_TARGETS['Barely surviving'].target,10);assert.equal(SIMPLE_TARGETS['Unstoppable'].target,1000);assert.equal(SIMPLE_TARGETS['Space magnate'].target,100000);});
test('Steam state remains authoritative',()=>{const rows=mergeAchievementState(null,[{name:'Shelter',unlocked:true}]);assert.equal(rows.find(x=>x.name==='Shelter').state,'unlocked');assert.equal(rows.find(x=>x.name==='New Sky').state,'unknown');});
test('save discovery reads json files only',()=>{const dir=fs.mkdtempSync(path.join(require('os').tmpdir(),'eden-test-'));fs.writeFileSync(path.join(dir,'WorldOne.json'),'{}');fs.writeFileSync(path.join(dir,'note.txt'),'x');const r=discoverSaveFiles({manualRoot:dir});assert.equal(r.files.length,1);assert.equal(r.files[0].name,'WorldOne.json');fs.rmSync(dir,{recursive:true,force:true});});
