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



for(const rhythm of ['live','first'])for(const variant of ['near','far'])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 el('exercise').onchange({target:{value:'candy'}});run(`selectedRole='${role}';partnerRhythm='${rhythm}';reset(true);candyScenario.variant='${variant}';started=true;running=true`);
 for(let i=0;i<1600&&state().running;i++){
  if(run("kind(selectedRole)==='tank'&&candyDesiredAggro()===selectedRole&&candy.aggro!==selectedRole"))key('e');
  const target=run('candyTarget(selectedRole)'),p=state().player,dx=target.x-p.x,dy=target.y-p.y;
  const kx=Math.abs(dx)>4?(dx>0?'ArrowRight':'ArrowLeft'):null,ky=Math.abs(dy)>4?(dy>0?'ArrowDown':'ArrowUp'):null;
  if(kx)key(kx);if(ky)key(ky);frames(1);if(kx)key(kx,'keyup');if(ky)key(ky,'keyup');
 }
 const s=state();assert.equal(s.time,75);assert.equal(s.candy.failures.length,0,JSON.stringify({role,rhythm,variant,scenario:s.candyScenario,errors:s.candy.failures,bursts:s.candy.events.filter(e=>e.key==='burst')}));
 assert.equal(s.candy.objects.filter(c=>c.slowed).length,2);assert.equal(s.candy.events.filter(e=>e.key==='burst').length,2);
 assert.equal(s.candy.events.find(e=>e.key==='nether').members.length,4);assert.ok(Object.values(s.checks).every(c=>c.ok));
 const h=run('history.find(h=>h.t>18&&h.t<19)');el('timeline').oninput({target:{value:h.t}});assert.equal(JSON.stringify(state().candy),JSON.stringify(h.candy));
}
console.log('PASS: all roles, near/far, delayed/live bots, keyboard movement, debuffs, candies, traversals, busters and replay.');
// Invalid actions must change outcomes; role assignment never grants immunity.
run("trainingExercise='candy';mode='candy';selectedRole='H1';reset(true);time=CANDY.assign;candyFireEvent('assign');const alpha=roles.find(r=>candy.debuffs[r]==='alpha');candyDamage([alpha],'test');time=CANDY.swap;candyFireEvent('swap')");
assert.ok(state().candy.failures.some(f=>f.message.startsWith('Alpha')));
assert.ok(state().candy.failures.some(f=>f.message.includes('aucun dégât')));
run("reset(true);time=CANDY.assign;candyFireEvent('assign');time=CANDY.invert;candyFireEvent('invert');party.forEach(p=>Object.assign(p,{x:280,y:0}));Object.assign(player,{x:0,y:0});candyScenario.variant='near';time=CANDY.nether;candyFireEvent('nether')");
assert.equal(state().candy.events.at(-1).target,state().role);
assert.ok(state().candy.failures.length>0);
// No interception means all four equal-distance candies activate together.
run("reset(true);candy.objects.forEach(c=>c.absorbedAt=c.close?23:26);candyStoreWaves()");
assert.equal(state().candy.waves[0].filter(c=>c.side!==state().candyScenario.closeSide).length,4);
// Every valid absorption arrangement has the intended safe zones; guidance is not involved in collision checks.
for(const closeSide of [0,1])for(const pair of [['donut','orange'],['orb','blue']]){
 context.pair=pair;context.side=closeSide;
 run("reset(true);candyScenario.closeSide=side;candyScenario.closePair=pair;candy.waves=[[],[]];for(const s of [0,1])for(const type of ['donut','orange','orb','blue']){const wave=Number(s===side?!pair.includes(type):pair.includes(type));candy.waves[wave].push({type,side:s,...candyHole(s)})}");
 for(const w of [0,1]){
  run(`time=${w?'CANDY.wave1+.2':'30'};party.forEach(p=>Object.assign(p,candyTarget(p.role)));Object.assign(player,candyTarget(selectedRole));candyResolveWave(${w})`);
  assert.equal(state().candy.failures.length,0);
 }
}
// Status HUD survives guidance toggles, exercise changes and replay.
run("trainingExercise='candy';mode='candy';reset(true);guide=false;time=CANDY.assign;candyFireEvent('assign');updateUI()");
assert.equal(el('personalDebuff').hidden,false);assert.ok(el('personalDebuffTimer').textContent.includes('17 s'));
assert.ok(!el('priorityRule').textContent.includes('À ralentir'));
el('exercise').onchange({target:{value:'placement'}});assert.equal(el('candyLegend').hidden,true);assert.equal(el('rep2Legend').hidden,true);
el('exercise').onchange({target:{value:'rep1'}});assert.equal(el('debuffRule').textContent,'Ténèbres → feu · Feu ou aucun → ténèbres');
console.log('PASS: wrong damage, missing beta damage, actual proximity, bad absorption order, all safe-zone combinations and HUD changes.');
// Full continuous sequence plus replay across the Replication II / Candies boundary.
el('exercise').onchange({target:{value:'full'}});run("selectedRole='H1';partnerRhythm='first';guide=true;reset(true);started=true;running=true");
for(let i=0;i<4500&&state().running;i++){
 if(state().candyActive)run('Object.assign(player,candyTarget(selectedRole))');
 else if(state().rep1Active)run('Object.assign(player,rep1Target(selectedRole))');
 else if(state().linksActive)run("if(resolution.locked){Object.assign(player,resolutionTarget(me()));if(hasMechanic(selectedRole,'cone'))player.a=safeConeAt(selectedRole,player).a}else{const src=sources.find(s=>s.id===plannedSources[selectedRole]);if(src)Object.assign(player,src);else Object.assign(player,pt(me().clock*TAU/8,355));updateTethers()}");
 frames(1);
}
assert.equal(state().time,208.3);assert.equal(state().candy.failures.length,0,JSON.stringify(state().candy.failures));assert.equal(state().rep1.failures.length,0);
const boundary=run('history.find(h=>h.t>132&&h.t<133)');el('timeline').oninput({target:{value:boundary.t}});assert.equal(state().candyActive,false);el('startBtn').onclick();frames(140);assert.equal(state().candyActive,true);assert.equal(state().candy.phase,1);assert.equal(el('simTitle').textContent,'Candy Crush');
console.log('PASS: full 208.3-second sequence and replay across the Candies transition.');
