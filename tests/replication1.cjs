const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(), handlers={}, store=new Map();let frame,now=0;
function el(id){if(!elements.has(id))elements.set(id,{id,value:'',checked:true,open:false,dataset:{},style:{},getBoundingClientRect(){return id==='arena'?{left:0,top:0,width:1000,height:1000}:{left:0,top:0,width:106,height:106}},setPointerCapture(){},classList:{toggle(){}},events:{},addEventListener(name,cb){this.events[name]=cb},focus(){document.activeElement=this},showModal(){this.open=true},close(){this.open=false},getContext(){return new Proxy({},{get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)})}});return elements.get(id)}
const document={getElementById:el,querySelector:el,querySelectorAll:()=>[],addEventListener(){},activeElement:null};
const window={addEventListener:(name,cb)=>handlers[name]=cb};
let randomState=Number(process.env.CZ_TEST_SEED||42);const seededMath=Object.create(Math);seededMath.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296};
store.set('cz-mapping',JSON.stringify(['none','stack','cone','defam','boss','defam','cone','stack']));
const context={document,window,localStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v)},Image:class{complete=false;naturalWidth=0},requestAnimationFrame:cb=>frame=cb,Math:seededMath,console};
vm.createContext(context);vm.runInContext(fs.readFileSync('dist/combat.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/reconstitution.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/decisions.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/replication1.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/candies.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/idyllic.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/encounter.js','utf8'),context);vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);el('exercise').onchange({target:{value:'links'}});
const state=()=>window.cloneZone.snapshot(),key=(k,type='keydown')=>handlers[type]({key:k,preventDefault(){},repeat:false});
const T=JSON.parse(vm.runInContext('JSON.stringify({staging:STAGING,...COMBAT})',context));const at=k=>T.staging+T[k];
function frames(n){for(let i=0;i<n;i++){now+=50;frame(now)}}
function walk(target){for(let i=0;i<150;i++){const p=state().player,dx=target.x-p.x,dy=target.y-p.y;if(Math.hypot(dx,dy)<20)break;let x=Math.abs(dx)>6?(dx>0?'ArrowRight':'ArrowLeft'):null,y=Math.abs(dy)>6?(dy>0?'ArrowDown':'ArrowUp'):null;if(x)key(x);if(y)key(y);frames(1);if(x)key(x,'keyup');if(y)key(y,'keyup')}assert.ok(Math.hypot(state().player.x-target.x,state().player.y-target.y)<82,'Can approach the source with keyboard controls')}


const run=code=>vm.runInContext(code,context);


// Every quarter-turn, cardinal element pair and cone orientation is legal.
for(let cardinal=0;cardinal<4;cardinal++)for(let north=0;north<4;north++)for(const horizontal of [cardinal%2===1]){
 run(`trainingExercise='rep1';mode='rep1';reset(false);rep1Scenario={fireCardinal:${cardinal},north:${north},horizontal:${horizontal},kickRole:'MT',turns:0};time=REP1.fire1;party.forEach(p=>Object.assign(p,rep1Initial(p.role)));Object.assign(player,rep1Initial(selectedRole));rep1FireEvent('fire1');time=REP1.cones1;rep1FireEvent('cones1');time=REP1.dark1;rep1FireEvent('dark1')`);
 const s=state();assert.equal(Object.values(s.rep1.debuffs).filter(x=>x==='fire').length,2);assert.equal(Object.values(s.rep1.debuffs).filter(x=>x==='dark').length,4);assert.equal(s.rep1.failures.length,0,JSON.stringify({cardinal,north,horizontal,errors:s.rep1.failures}));
 run(`time=REP1.fire2;party.forEach(p=>Object.assign(p,rep1Static(p.role)));Object.assign(player,rep1Static(selectedRole));rep1FireEvent('fire2');time=REP1.cones2;rep1FireEvent('cones2');time=REP1.dark2;rep1FireEvent('dark2')`);
 assert.equal(state().rep1.failures.length,0,JSON.stringify({cardinal,north,horizontal,errors:state().rep1.failures}));
}
console.log('PASS: all 16 clone patterns, actual first debuffs and second baits, both cone orientations.');
// Keyboard play through all role/rotation combinations and both bot rhythms.
for(const rhythm of ['live','first'])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 el('exercise').onchange({target:{value:'rep1'}});run(`selectedRole='${role}';partnerRhythm='${rhythm}';reset(true);started=true;running=true`);
 for(let i=0;i<1100&&state().running;i++){
  const target=run('rep1Target(selectedRole)'),p=state().player,dx=target.x-p.x,dy=target.y-p.y;
  const kx=Math.abs(dx)>4?(dx>0?'ArrowRight':'ArrowLeft'):null,ky=Math.abs(dy)>4?(dy>0?'ArrowDown':'ArrowUp'):null;
  if(kx)key(kx);if(ky)key(ky);frames(1);if(kx)key(kx,'keyup');if(ky)key(ky,'keyup');
 }
 assert.equal(state().time,52);assert.equal(state().rep1.failures.length,0,role+' '+rhythm+' '+JSON.stringify(state().rep1Scenario)+' '+JSON.stringify(state().rep1.failures));
 assert.equal(state().rep1.events.length,10);assert.ok(Object.values(state().checks).every(c=>c.ok));
 const recorded=run('history.find(h=>h.t>28&&h.t<29)');el('timeline').oninput({target:{value:recorded.t}});assert.deepEqual(state().rep1.debuffs,recorded.rep1.debuffs);assert.equal(state().rep1.events.length,4);
}
console.log('PASS: keyboard movement, live/delayed bots, eight roles, all mechanics and replay.');
// Wrong proximity really changes the target; role names do not grant immunity.
run("trainingExercise='rep1';mode='rep1';reset(false);rep1Scenario.fireCardinal=0;rep1Scenario.horizontal=false;time=REP1.fire1;party.forEach(p=>Object.assign(p,rep1Initial(p.role)));Object.assign(player,{x:0,y:-297.5});rep1FireEvent('fire1')");assert.equal(state().rep1.events[0].targets[0].target,state().role);assert.ok(state().rep1.failures.length>0);
// Continuous combined timeline, including rewind across the Replication I/II boundary.
el('exercise').onchange({target:{value:'sequence'}});run("selectedRole='MT';partnerRhythm='first';reset(true);started=true;running=true");
for(let i=0;i<2700&&state().running;i++){
 if(state().rep1Active)run('Object.assign(player,rep1Target(selectedRole))');
 else if(state().linksActive)run("if(resolution.locked){Object.assign(player,resolutionTarget(me()));if(hasMechanic(selectedRole,'cone'))player.a=safeConeAt(selectedRole,player).a}else{const s=sources.find(s=>s.id===plannedSources[selectedRole]);if(s)Object.assign(player,s);else Object.assign(player,pt(me().clock*TAU/8,355));updateTethers()}");
 frames(1);
}
assert.equal(state().time,127.2);assert.equal(state().rep1.failures.length,0);assert.equal(state().resolution.failures.length,0,JSON.stringify(state().resolution.failures));assert.ok(Object.values(state().checks).every(c=>c.ok));assert.equal(state().decisions.done.length,10);
const beforeBoundary=run('history.find(h=>h.t>48&&h.t<49)');el('timeline').oninput({target:{value:beforeBoundary.t}});assert.equal(state().rep1Active,true);assert.equal(state().linksActive,false);assert.equal(el('simTitle').textContent,'Replication 1');el('startBtn').onclick();frames(210);assert.equal(state().rep1Active,false);assert.equal(state().linksActive,true);assert.equal(el('simTitle').textContent,'Replication 2');
// The guided red cleave never precedes the cone hit; the cast still starts on time.
run("trainingExercise='placement';mode='placement';reset(false);linksActive=true;lockAssignments();let recordedSectors=[];drawSector=(...args)=>recordedSectors.push(args);time=rep2At(COMBAT.cones-.01);drawReconstitution();globalThis.sectorCount=recordedSectors.length");assert.equal(context.sectorCount,0);
run("time=rep2At(COMBAT.cones)+.001;drawReconstitution();globalThis.sectorCount=recordedSectors.length");assert.equal(context.sectorCount,1);
console.log('PASS: distance-based failure, full combined timeline, replay across encounters, delayed guided cleave.');
