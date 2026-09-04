'use strict';

/**
 * The Planet Crafter exposes 55 Steam achievements. Steam remains authoritative;
 * optional JSON world saves are surfaced only as read-only context.
 */
const ACHIEVEMENTS = [
  ['EDEN_STATIC_001', 'Shelter', 'Construct your first living compartment', 'Building', false, null, 'progress'],
  ['EDEN_STATIC_002', 'The Rare Red Ore', 'Find Iridium', 'Resources', false, null, 'progress'],
  ['EDEN_STATIC_003', 'Vegetables in space', 'Craft your first food grower', 'Building', false, null, 'progress'],
  ['EDEN_STATIC_004', 'Barely surviving', 'Craft 10 items', 'Crafting', false, 10, 'items'],
  ['EDEN_STATIC_005', 'New Sky', 'Reach full blue sky', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_006', 'Clouds in the sky', 'Reach clouds', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_007', 'Golden flower', 'Find your first golden seed', 'Exploration', true, null, 'progress'],
  ['EDEN_STATIC_008', 'Life from the sky', 'Reach rain level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_009', 'What could go wrong?', 'Craft your first nuclear reactor', 'Building', false, null, 'progress'],
  ['EDEN_STATIC_010', 'Are we leaving?', 'Craft your first launch platform', 'Building', false, null, 'progress'],
  ['EDEN_STATIC_011', 'The Blue Rare Ore', 'Find Osmium', 'Resources', false, null, 'progress'],
  ['EDEN_STATIC_012', 'Biomass', 'Craft your first biodome', 'Building', false, null, 'progress'],
  ['EDEN_STATIC_013', 'Liquid water', 'Reach liquid water level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_014', 'Automation', 'Craft your first ore extractor', 'Automation', false, null, 'progress'],
  ['EDEN_STATIC_015', 'The Pink Rare Ore', 'Craft or find a Pulsar Quartz', 'Resources', true, null, 'progress'],
  ['EDEN_STATIC_016', 'The White Rare Ore', 'Find Zeolite', 'Resources', false, null, 'progress'],
  ['EDEN_STATIC_017', 'Flowers on hostile planet', 'Craft your first flower spreader', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_018', 'So much water', 'Reach full lakes level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_019', 'Greenery', 'Reach moss level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_020', "It's growing", 'Reach herbs level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_021', 'Not the face!', 'Get hit by an asteroid', 'Survival', false, null, 'progress'],
  ['EDEN_STATIC_022', 'Getting comfy', 'Craft 100 items', 'Crafting', false, 100, 'items'],
  ['EDEN_STATIC_023', 'Genetic Engineer', 'Craft your first DNA Manipulator', 'Biology', false, null, 'progress'],
  ['EDEN_STATIC_024', 'The Forests', 'Reach trees level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_025', 'Mushrooms river', 'Discover the mushroom river', 'Exploration', false, null, 'progress'],
  ['EDEN_STATIC_026', 'Jungle', 'Craft your first tree spreader', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_027', 'A Door ?', 'Find a weird door in a cave', 'Exploration', true, null, 'progress'],
  ['EDEN_STATIC_028', 'Vivarium', 'Reach insects level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_029', 'Rainbow caves', 'Discover the rainbow caves', 'Exploration', false, null, 'progress'],
  ['EDEN_STATIC_030', 'The factory must grow', 'Build an autocrafter', 'Automation', false, null, 'progress'],
  ['EDEN_STATIC_031', 'Space Trading', 'Build a space trading rocket', 'Trading', false, null, 'progress'],
  ['EDEN_STATIC_032', 'Breath', 'Reach atmosphere level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_033', 'Space smuggler', 'Gain a total of 100 Terra Tokens', 'Trading', false, 100, 'Terra Tokens'],
  ['EDEN_STATIC_034', 'The Yellow Rare Ore', 'Find Solar Quartz', 'Resources', false, null, 'progress'],
  ['EDEN_STATIC_035', 'Fusion Energy', 'Craft your first fusion cell', 'Crafting', true, null, 'progress'],
  ['EDEN_STATIC_036', 'Space pirate', 'Gain a total of 1000 Terra Tokens', 'Trading', false, 1000, 'Terra Tokens'],
  ['EDEN_STATIC_037', 'Farming on Mars', 'Create your first outside farm', 'Biology', false, null, 'progress'],
  ['EDEN_STATIC_038', 'Bubbles under water', 'Reach fish level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_039', 'Space trader', 'Gain a total of 10000 Terra Tokens', 'Trading', false, 10000, 'Terra Tokens'],
  ['EDEN_STATIC_040', 'Logistics', 'Build a drone', 'Automation', false, null, 'progress'],
  ['EDEN_STATIC_041', 'Space frogs', 'Reach amphibians stage', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_042', 'Ancient paradise', 'Find the ancient paradise', 'Exploration', false, null, 'progress'],
  ['EDEN_STATIC_043', 'Distant Wrecks', 'Craft a portal generator', 'Exploration', false, null, 'progress'],
  ['EDEN_STATIC_044', 'Evolution', 'Reach mammals level', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_045', 'Space zoo', 'Craft an animal shelter', 'Biology', false, null, 'progress'],
  ['EDEN_STATIC_046', 'Jump in lava', 'Get lava damages', 'Survival', false, null, 'progress'],
  ['EDEN_STATIC_047', 'New life forms', 'Craft your first DNA sequence', 'Biology', false, null, 'progress'],
  ['EDEN_STATIC_048', 'The Cenote', 'Discover the cenote biome', 'Exploration', false, null, 'progress'],
  ['EDEN_STATIC_049', 'Space magnate', 'Gain a total of 100000 Terra Tokens', 'Trading', false, 100000, 'Terra Tokens'],
  ['EDEN_STATIC_050', 'Biosphere', 'Reach complete terraformation', 'Terraforming', false, null, 'progress'],
  ['EDEN_STATIC_051', 'Unstoppable', 'Craft 1000 items', 'Crafting', false, 1000, 'items'],
  ['EDEN_STATIC_052', 'Cookie factory', 'Bake a cookie', 'Crafting', false, null, 'progress'],
  ['EDEN_STATIC_053', 'Subjection', 'Leave the planet with Sentinel Corp', 'Endings', true, null, 'progress'],
  ['EDEN_STATIC_054', 'Subversion', 'Leave the planet with the Wardens portal', 'Endings', true, null, 'progress'],
  ['EDEN_STATIC_055', 'Subservience', 'Leave the planet with smugglers', 'Endings', true, null, 'progress']
].map(([apiName,name,description,category,hidden=false,target=null,unit='progress'])=>({apiName,name,description,category,hidden,target,unit}));

const SIMPLE_TARGETS = Object.fromEntries(ACHIEVEMENTS.filter(item=>Number.isFinite(item.target)&&item.target>1).map(item=>[item.name,{target:item.target,unit:item.unit}]));
function normalizeName(value=''){return String(value).replace(/[’‘]/g,"'").replace(/\s+/g,' ').trim().toUpperCase();}
function guidanceFor(definition){
  const hidden=definition.hidden?'Hidden achievement: this requirement may reveal exploration or ending details. ':'';
  const counter=Number.isFinite(definition.target)&&definition.target>1?`Steam defines a cumulative target of ${definition.target.toLocaleString('en-GB')} ${definition.unit}. `:'';
  return `${hidden}${definition.description}. ${counter}Steam decides the final locked or unlocked state.`.replace(/\s+/g,' ').trim();
}
function mergeAchievementState(save,steamRows=[]){
  const {selectedSaveEvidence}=require('./save-reader');
  const byApiName=new Map(steamRows.filter(r=>r.apiName).map(r=>[r.apiName,r]));
  const byName=new Map(steamRows.map(r=>[normalizeName(r.name),r]));
  return ACHIEVEMENTS.map(definition=>{
    const steam=byName.get(normalizeName(definition.name))||byApiName.get(definition.apiName)||{};
    const state=steam.unlocked===true?'unlocked':steam.unlocked===false?'locked':'unknown';
    const progress=steam.progress&&Number.isFinite(Number(steam.progress.current))?{...steam.progress,unit:definition.unit}:null;
    let summary='Steam has not exposed a reliable state for this achievement.';
    if(progress) summary=`${Number(progress.current).toLocaleString('en-GB')} / ${Number(progress.target).toLocaleString('en-GB')} ${definition.unit}`;
    else if(state==='unlocked') summary='Steam confirms this achievement is unlocked.';
    else if(state==='locked') summary=Number.isFinite(definition.target)?'Steam confirms this achievement is locked; its numeric stat is currently unavailable.':'Steam confirms this achievement is locked.';
    const item={...definition,apiName:steam.apiName||definition.apiName,description:steam.description||definition.description,guidance:guidanceFor(definition),state,unlockedAt:steam.unlockedAt||null,iconUrl:steam.iconUrl||null,displayProgress:progress,steam,evidence:{summary,source:progress?'Steam local UserStats counter':'Steam achievement state',substates:[]}};
    return {...item,saveEvidence:selectedSaveEvidence(save,item)};
  });
}
module.exports={ACHIEVEMENTS,SIMPLE_TARGETS,normalizeName,mergeAchievementState};
