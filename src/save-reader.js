'use strict';

const fs = require('fs');
const path = require('path');

function defaultSaveRoot() {
  if (process.env.USERPROFILE) return path.join(process.env.USERPROFILE, 'AppData', 'LocalLow', 'MijuGames', 'Planet Crafter');
  if (process.env.LOCALAPPDATA) return path.join(path.dirname(process.env.LOCALAPPDATA), 'LocalLow', 'MijuGames', 'Planet Crafter');
  return null;
}
const SAVE_ROOT = defaultSaveRoot();

function descriptor(filePath) {
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile() || !/\.json$/i.test(filePath)) return null;
    const name = path.basename(filePath);
    return { key:path.resolve(filePath), path:path.resolve(filePath), folder:path.dirname(filePath), name,
      type:/backup/i.test(name)?'Backup world save':'World save', size:stat.size, modifiedAt:stat.mtime.toISOString(), format:'The Planet Crafter JSON save' };
  } catch { return null; }
}
function scan(root) {
  try { return fs.readdirSync(root,{withFileTypes:true}).filter(e=>e.isFile()&&/\.json$/i.test(e.name)).map(e=>descriptor(path.join(root,e.name))).filter(Boolean); }
  catch { return []; }
}
function discoverSaveFiles({ manualRoot=null, selectedPath=null }={}) {
  const roots=[SAVE_ROOT,manualRoot].filter(Boolean).map(x=>path.resolve(x)).filter((v,i,a)=>a.indexOf(v)===i).filter(x=>{try{return fs.statSync(x).isDirectory()}catch{return false}});
  const files=roots.flatMap(scan).sort((a,b)=>Date.parse(b.modifiedAt)-Date.parse(a.modifiedAt));
  const key=selectedPath?path.resolve(selectedPath).toLowerCase():null;
  const selected=key?files.find(f=>f.key.toLowerCase()===key)||null:null;
  return { available:files.length>0, roots, files, selected };
}
function selectedSaveEvidence(selected) {
  if (!selected) return { available:false, summary:'No The Planet Crafter save selected. Steam remains the achievement authority.', details:[] };
  return { available:true, summary:'The selected world file supplies read-only local context only. Steam remains authoritative for achievement state.', details:[
    {label:'Selected file',value:selected.name},{label:'Data type',value:selected.type},{label:'Last written',value:selected.modifiedAt},{label:'File size',value:`${(selected.size/1024).toLocaleString('en-GB',{maximumFractionDigits:1})} KB`},{label:'Format',value:selected.format}
  ]};
}
module.exports={ SAVE_ROOT, discoverSaveFiles, selectedSaveEvidence };
