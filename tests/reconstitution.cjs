const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(), handlers={}, store=new Map();let frame,now=0;
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',checked:true,open:false,dataset:{},style:{},getBoundingClientRect(){return id==='arena'?{left:0,top:0,width:1000,height:1000}:{left:0,top:0,width:106,height:106}},setPointerCapture(){},classList:{toggle(){}},events:{},addEventListener(name,cb){this.events[name]=cb},focus(){document.activeElement=this},showModal(){this.open=true},close(){this.open=false},getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)})}});return elements.get(id)}
const document={getElementById:el,querySelector:el,querySelectorAll:()=>[],addEventListener(){},activeElement:null};
const window={addEventListener:(name,cb)=>handlers[name]=cb};
let randomState=Number(process.env.CZ_TEST_SEED||42);const seededMath=Object.create(Math);seededMath.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296};
store.set('cz-mapping',JSON.stringify(['none','stack','cone','defam','boss','defam','cone','stack']));
const context={document,window,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Image:class{complete=false;naturalWidth=0},requestAnimationFrame:cb=>frame=cb,Math:seededMath,console};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/combat.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/reconstitution.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/decisions.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/replication1.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/candies.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/idyllic.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/encounter.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);vm.runInContext("partnerRhythm='live'",context);el('exercise').onchange({target:{value:'links'}});
const state=()=>window.cloneZone.snapshot(),key=(k,type='keydown')=>handlers[type]({key:k,preventDefault(){},repeat:false});
const T=JSON.parse(vm.runInContext('JSON.stringify({staging:STAGING,...COMBAT})',context));const at=k=>T.staging+T[k];
function frames(n){for(let i=0;i<n;i++){now+=50;frame(now)}}
function walk(target){for(let i=0;i<150;i++){const p=state().player,dx=target.x-p.x,dy=target.y-p.y;if(Math.hypot(dx,dy)<20)break;let x=Math.abs(dx)>6?(dx>0?'ArrowRight':'ArrowLeft'):null,y=Math.abs(dy)>6?(dy>0?'ArrowDown':'ArrowUp'):null;if(x)key(x);if(y)key(y);frames(1);if(x)key(x,'keyup');if(y)key(y,'keyup')}assert.ok(Math.hypot(state().player.x-target.x,state().player.y-target.y)<82,'Can approach the source with keyboard controls')}


const run=code=>vm.runInContext(code,context);
function perfect(selected='MT'){
 run(`reset(true);mode='placement';selectedRole=${JSON.stringify(selected)};party.forEach((p,i)=>p.clock=i);setupActors();started=true;running=false;time=STAGING+COMBAT.lock;linksActive=true;for(const s of sources)s.owner=party.find(p=>plannedSources[p.role]===s.id)?.role??null;party.forEach(p=>p.visited=true);lockAssignments();for(const p of party){const q=resolutionTarget(p,1);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}`);
}
function event(key){run(`time=STAGING+COMBAT.${key};fireCombatEvent('${key}')`)}
function jumpAndRays(){event('jump');event('landing');event('rays')}
function firstPass(){perfect();jumpAndRays();event('defams');run('for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}');event('stack');event('cones');}
// Identification lines are a temporary visual, never a second tether during mechanic acquisition.
run("reset(true);window.testLines=[];window.originalLine=line;line=function(a,b,color,...rest){window.testLines.push(color);return window.originalLine(a,b,color,...rest)};render()");assert.ok(context.window.testLines.includes('#bcfff0'));
run("started=true;running=true");frames(125);run('window.testLines=[];render();running=false');assert.ok(!context.window.testLines.includes('#bcfff0'),'Attribution tethers disappear when mechanic tethers become active');run('line=window.originalLine');
// Enlarged defamations detect players who would have been outside the previous radius.
perfect();jumpAndRays();run('Object.assign(player,{x:40,y:110})');event('defams');assert.ok(state().resolution.failures.some(f=>f.roles.includes('MT')&&f.message.includes('défamation')));
// Cleave locks onto any player, including a DPS, and never follows their later movement.
firstPass();run("scenarioKickRole='M2'");event('kickTell');const frozen=state().resolution.cleave.angle;assert.equal(state().resolution.cleave.target,'M2');run("Object.assign(party.find(p=>p.role==='M2'),{x:300,y:200});for(const p of party){const q=behindTarget(p);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}");assert.equal(state().resolution.cleave.angle,frozen);event('kick');assert.equal(state().resolution.events.find(e=>e.key==='kick').hits.length,0);
firstPass();run("scenarioKickRole='M2'");event('kickTell');run('Object.assign(player,{x:resolution.boss.x-Math.sin(resolution.cleave.angle)*100,y:resolution.boss.y-Math.cos(resolution.cleave.angle)*100})');event('kick');assert.ok(state().resolution.events.find(e=>e.key==='kick').hits.includes('MT'),'Cleave hits players in the frozen front half');
firstPass();run('prepareCloneMemories()');const memories=state().resolution.cloneMemories;assert.deepEqual([...memories.MT],['boss']);assert.deepEqual([...memories.M1],['defam'],'The no-link player clone stores the far defamation, not nothing');assert.deepEqual([...memories.OT],['cone']);assert.deepEqual([...memories.H1],['stack']);
// Both proximity casts resolve at the same time as A/C, then all four clone pairs replay.
for(const variant of ['near','far']){
 firstPass();run(`scenarioVariant='${variant}'`);event('reenact');event('netherTell');
 run('time=STAGING+COMBAT.wave0-.1;for(const p of party){const q=extendedTarget(p);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}');
 event('replayLanding');event('wave0');event('replayRays');const first=state().resolution.events.find(e=>e.key==='wave0');assert.equal(first.nether.variant,variant);assert.equal(first.nether.targets.length,2);assert.ok(first.nether.stacks.every(s=>s.members.length===2));assert.ok(first.nether.targets.every(r=>!state().resolution.rayTargets.includes(r)));assert.deepEqual(Array.from(state().resolution.events.find(e=>e.key==='replayRays').rays,r=>r.target).sort(),[...state().resolution.rayTargets].sort());assert.equal(state().resolution.failures.length,0,`Clean first pair + ${variant} stacks: ${JSON.stringify(state().resolution.failures)}`);
 for(const key of ['wave1','replayCone1','wave2','wave3','replayCone3']){run(`time=STAGING+COMBAT.${key}-.1;for(const p of party){const q=extendedTarget(p);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}`);event(key)}
 const waves=state().resolution.events.filter(e=>e.key.startsWith('wave'));assert.deepEqual(Array.from(waves,e=>Array.from(e.pair)),[[0,4],[1,5],[2,6],[3,7]]);assert.equal(state().resolution.failures.length,0,`All clone mechanics resolve with ${variant} strategy`);
}
// Cloned rays keep the original targets even if a different player becomes closest.
firstPass();event('reenact');event('netherTell');run('time=STAGING+COMBAT.wave0-.1;for(const p of party){const q=extendedTarget(p);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)};Object.assign(player,{x:0,y:-300})');event('replayRays');assert.ok(!state().resolution.events.find(e=>e.key==='replayRays').rays.some(r=>r.target==='MT'));
// A bad Near bait follows actual geometry instead of silently forcing intended targets.
firstPass();run("scenarioVariant='near'");event('reenact');event('netherTell');run('time=STAGING+COMBAT.wave0-.1;for(const p of party){const q=extendedTarget(p);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)};Object.assign(party.find(p=>p.role===resolution.rayTargets[0]),{x:resolution.boss.x,y:resolution.boss.y+40})');event('wave0');assert.ok(state().resolution.events.find(e=>e.key==='wave0').nether.targets.includes(state().resolution.rayTargets[0]));assert.ok(state().resolution.failures.some(f=>f.message.includes('rayon a aussi')));
// Clone stacks use H/R left and M/T right, independent of randomized player-clone groups.
firstPass();for(const role of ['MT','OT','M1','M2','H1','H2','R1','R2']){const target=run(`cloneStackTarget(party.find(p=>p.role==='${role}'))`);assert.equal(target.x>0,['MT','OT','M1','M2'].includes(role),`${role} uses its role-based stack side`)}
for(let offset=0;offset<8;offset++){run(`party.forEach((p,i)=>p.clock=(i+${offset})%8)`);for(const role of ['MT','OT','M1','M2','H1','H2','R1','R2'])assert.equal(run(`cloneStackTarget(party.find(p=>p.role==='${role}')).x>0`),['MT','OT','M1','M2'].includes(role))}
// Complete keyboard-driven runs for each role and each announced cast variant.
for(const variant of ['near','far'])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 el('exercise').onchange({target:{value:'placement'}});el('roleGrid').events.click({target:{closest:()=>({dataset:{role}})}});el('shuffle').onclick();run(`scenarioVariant='${variant}'`);el('startBtn').onclick();
 while(state().time<T.staging+.1)frames(1);const source=state().sources.find(s=>s.id===state().plannedSources[role]);if(source)walk(source);
 while(state().time<at('lock')+.1)frames(1);walk(run('resolutionTarget(me(),1)'));
 while(state().time<at('defams')+.1)frames(1);walk(run('resolutionTarget(me(),4)'));if(state().resolution.links[role].some(s=>s.type==='cone')){key('ArrowUp');frames(1);key('ArrowUp','keyup')}
 while(state().time<at('kickMove')+.05)frames(1);walk(run('extendedTarget(me())'));
 while(state().time<at('reenact')+.1)frames(1);walk(run('extendedTarget(me())'));
 while(state().time<at('netherTell')+.1)frames(1);assert.equal(state().resolution.netherVariant,variant);walk(run('extendedTarget(me())'));
 for(const time of ['replayRays','replayCone1','wave2'].map(k=>at(k)+.2)){while(state().time<time)frames(1);walk(run('extendedTarget(me())'))}
 frames(300);assert.equal(state().time,at('end'));const bad=Object.values(state().checks).filter(c=>!c.ok);assert.equal(bad.length,0,`${role} ${variant}: ${bad.map(c=>c.reason).join('; ')}`);assert.equal(state().resolution.events.length,18);for(const tower of state().resolution.events.find(e=>e.key==='wave2').activated.filter(c=>c.mechanics.includes('stack'))){assert.deepEqual([...tower.members].sort(),tower.clock===2?['M1','M2','MT','OT']:['H1','H2','R1','R2']);}
}
const waveEvents=state().resolution.events.filter(e=>e.key.startsWith('wave'));el('timeline').oninput({target:{value:at('wave0')+.8}});assert.equal(state().resolution.events.filter(e=>e.key.startsWith('wave')).length,1);el('timeline').oninput({target:{value:at('netherTell')-1}});assert.equal(state().resolution.netherVariant,null);key(' ');frames(600);assert.equal(state().resolution.events.filter(e=>e.key.startsWith('wave')).length,4,'Replay restores memories and resumes all four pairs exactly once');
console.log('PASS: temporary attribution links, enlarged defamation collision, arbitrary-player frozen cleave, recorded clone memories, A/C → 1/3 → B/D → 2/4, both real proximity variants, original ray targets, wrong-bait detection, all 8 roles in Near and Far, and replay across reconstruction.');
