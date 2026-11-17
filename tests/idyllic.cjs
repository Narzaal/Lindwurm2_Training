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





for(let pattern=0;pattern<8;pattern++)for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 run(`trainingExercise='dream';mode='dream';selectedRole='${role}';partnerRhythm='${pattern%2?'first':'live'}';reset(true);dreamScenario.cardinalDefam=${!!(pattern&1)};dreamScenario.cardinalFirst=${!!(pattern&2)};dreamScenario.verticalNorth=${!!(pattern&4)};dreamScenario.absorbedNorth=${!!(pattern&2)};dreamScenario.coneEast=${!!(pattern&1)};dreamReset();dreamEnter();running=true;started=true;history=[]`);
 run(`for(let i=1;i<=4200;i++){const old=time;advanceToward(player,dreamTarget(selectedRole),185*.05);time=i*.05;dreamUpdate(old,.05);}`);
 const s=state();const failures=s.dream.failures;
 if(failures.length){console.error(JSON.stringify({pattern,role,failures:failures.slice(0,12)},null,2));process.exit(1)}
 assert.equal(s.dream.events.length,14);
 run('render();updateUI()');
}
console.log('PASS: 64 full Idyllic runs, all roles, both rhythms, both clone orders, both initial symbols, both cone orientations and portal sides.');
// Incorrect input must fail; guidance is not an automatic success flag.
run("trainingExercise='dream';mode='dream';selectedRole='MT';reset(true);time=DREAM.lock;dreamCheck('bad-links','Liens',()=>{for(const s of dream.sources)s.owner='MT';dreamFireEvent('lock')})");
assert.ok(state().dream.failures.some(f=>f.roles.includes('MT')));
run("reset(true);time=DREAM.towers;party.forEach(p=>Object.assign(p,dreamTowerTarget(p.role)));Object.assign(player,dreamTowerTarget(selectedRole));globalThis.lightRole=roles.find(dreamLightVuln);globalThis.darkTower=dreamTowerPositions().find(t=>t.type==='dark');if(lightRole===selectedRole)Object.assign(player,darkTower);else Object.assign(party.find(p=>p.role===lightRole),darkTower);dreamResolveTowers()");
assert.ok(state().dream.failures.length,'wrong or double tower must fail');
run("reset(true);dream.towerRoles.MT='fire';dream.fireAnchors.MT={x:0,y:0};player={x:12,y:0,a:0};time=DREAM.towers+1;dream.departed=false;dreamUpdate(time-.05,.05);time=DREAM.earth;dreamFireEvent('earth')");
assert.ok(state().dream.hotFailed.includes('MT'));
assert.ok(Object.values(state().checks).some(c=>!c.ok));
run("reset(true);time=DREAM.stored;player={x:0,y:0,a:0};dreamFireEvent('stored')");
assert.ok(state().dream.failures.some(f=>f.roles.includes('MT')),'central chariot must hit');
// Save/seek/resume restores mutable tower effects and removes future checks.
run("reset(true);started=true;time=134;dream.towerRoles.MT='earth';record();time=140;dream.towerRoles.MT='fire';checks['140']={ok:false,reason:'future'};record()");
el('timeline').oninput({target:{value:'134'}});
assert.equal(state().dream.towerRoles.MT,'earth');
run('play()');assert.equal(state().checks['140'],undefined);
// UI and renderer at every phase, with guidance on and off.
for(const guided of [true,false])for(const t of [0,13,17,33,52,71,84,86,93,101,107,112,117,122,132,135,141,154,158,168,178,184,191,198,205]){
 run(`reset(true);guide=${guided};time=${t};render();updateUI()`);
 assert.equal(el('simTitle').textContent,'Idyllic Dream');
}
run("guide=false;time=52;updateUI()");assert.equal(el('assignmentName').textContent,'Lecture personnelle');
// Live tick, keyboard movement, and transition from the previous module.
el('exercise').onchange({target:{value:'dream'}});el('startBtn').onclick();const x=state().player.x;key('ArrowRight');frames(4);key('ArrowRight','keyup');assert.ok(state().player.x>x);
el('exercise').onchange({target:{value:'all'}});
assert.equal(run('duration()'),555.5);
run("time=dreamOffset()-.025;started=true;running=true;candy.entered=true");frames(2);
assert.equal(state().dreamActive,true);assert.equal(state().dream.entered,true);assert.equal(state().candyActive,false);
console.log('PASS: bad links, invalid towers, Hot Blooded movement, stored AoE, replay, hidden guidance, phase rendering, keyboard movement and full-sequence entry.');
// Island separation is the movement deadline, even if the player never moves.
for(const rhythm of ['first','live'])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const phase of [1,2,3]){
 run(`trainingExercise='dream';mode='dream';selectedRole='${role}';partnerRhythm='${rhythm}';reset(true);dreamScenario.coneEast=true;time=${phase===1?75.3:phase===2?122.4:176.3};party.forEach(p=>Object.assign(p,dp(${phase===3?'-14':'dreamWest(p.role)?14:-14'},0)));Object.assign(player,dp(-14,0));globalThis.birth=DREAM.islands${phase};while(time<birth-.05){const old=time;time=Math.min(birth-.05,time+.05);dreamUpdate(old,.05);}`);
 for(const p of state().party.filter(p=>p.role!==role)){
  const west=['MT','H1','M1','R1'].includes(p.role),cx=phase===3?14:(west?-14:14);
  assert.ok(Math.hypot(p.x-cx*19.5,p.y)<9.8*19.5,`Arrive BEFORE separation: ${rhythm} ${role} phase ${phase} ${p.role}`);
 }
 run('for(let j=0;j<10;j++){const old=time;time+=.05;dreamUpdate(old,.05)}');
 assert.ok(!state().dream.failures.some(f=>f.message.startsWith('Chute')&&f.roles.some(r=>r!==role)),'No bot may cross the void after separation');
}
// Tower phases must not show any of the stored clone hazards, even with guidance.
for(const t of [84,86,94,132,134,138,144]){
 run(`reset(true);guide=true;time=${t};globalThis.shapes=[];globalThis.originalShape=drawDreamShape;drawDreamShape=e=>shapes.push(e.type);render();drawDreamShape=originalShape`);
 assert.deepEqual(Array.from(context.shapes),[],`No stored telegraphs during towers at ${t}`);
}
run('reset(true);guide=false;time=34;globalThis.shapes=[];globalThis.originalShape=drawDreamShape;drawDreamShape=e=>shapes.push(e.type);render();drawDreamShape=originalShape');
assert.deepEqual(Array.from(context.shapes),['double','double','circle'],'Initial memory read stays visible without guidance');
console.log('PASS: all roles and both rhythms arrive on the assigned island before all three separations, idle player cannot delay bots into the void, no stale tower-phase telegraphs.');
// Reenactment: the mechanic type must never overwrite the renderer's circle type.
function captureDreamDraw(){
 run(`globalThis.renderedShapes=[];globalThis.renderedMarkers=[];globalThis.savedShape=drawDreamShape;globalThis.savedIcon=icon;drawDreamShape=e=>{renderedShapes.push({...e});savedShape(e)};icon=(type,x,y,r)=>{renderedMarkers.push({type,x,y});savedIcon(type,x,y,r)};render();drawDreamShape=savedShape;icon=savedIcon`);
 return {shapes:Array.from(context.renderedShapes),markers:Array.from(context.renderedMarkers)};
}
for(const cardinalFirst of [true,false]){
 run(`trainingExercise='dream';mode='dream';reset(true);dreamScenario.cardinalFirst=${cardinalFirst};dream.sources.forEach(s=>s.owner=roles.find(r=>dreamSource(r).id===s.id));for(let i=0;i<4;i++)dreamResolvePair(i);dream.effects=[]`);
 assert.deepEqual(Array.from(run('roles.slice().sort((a,b)=>dreamClock(a)-dreamClock(b)).map(r=>dream.assignments[r])')),['defam','stack','stack','defam','defam','stack','stack','defam']);
 for(const wave of [1,2]){
  const impact=wave===1?176:196.9;
  run(`time=${wave===1?171:193};guide=true;dream.effects=[]`);
  let drawn=captureDreamDraw();
  assert.equal(drawn.shapes.length,2);assert.ok(drawn.shapes.every(s=>s.type==='circle'&&!s.impact));
  assert.equal(drawn.shapes.filter(s=>s.stack).length,0);assert.equal(drawn.shapes.filter(s=>s.r===20*19.5).length,2);
  assert.equal(drawn.markers.filter(m=>m.type==='stack').length,2);assert.equal(drawn.markers.filter(m=>m.type==='defam').length,2);
  const activeClocks=Array.from(run('dreamReplayClones(dreamReplayWave()).map(s=>s.clock)')).sort();
  assert.deepEqual(activeClocks,((cardinalFirst?wave===1:wave===2)?[0,2,4,6]:[1,3,5,7]));
  run('guide=false');drawn=captureDreamDraw();assert.equal(drawn.shapes.length,0);assert.equal(drawn.markers.length,0);
  run(`time=${impact};dreamResolveReplay(${wave})`);drawn=captureDreamDraw();
  assert.equal(drawn.shapes.length,4,'Actual impacts visible without guidance');assert.ok(drawn.shapes.every(s=>s.type==='circle'&&s.impact));assert.equal(drawn.shapes.filter(s=>s.stack).length,2);
  run(`guide=true;time=${impact+.5}`);drawn=captureDreamDraw();
  assert.equal(drawn.shapes.length,4);assert.ok(drawn.shapes.every(s=>s.type==='circle'),'Only current impact, no next cones');
  assert.equal(run('dreamStep().id'),'replay'+wave);
 }
}
run('reset(true);guide=true;time=177.5');assert.equal(captureDreamDraw().shapes.length,0,'No island hazard preview before blue return');
run('time=DREAM.blue4');assert.deepEqual(captureDreamDraw().shapes.map(s=>s.type),['double','circle']);
run('reset(true);time=DREAM.earth;dreamFireEvent("earth")');assert.ok(state().dream.effects.every(e=>e.type==='circle'),'Earth puddles use a drawable circle too');
console.log('PASS: correct clockwise memories, both formations preview only defams and resolve 2 stacks/2 defams in red, real impacts in unguided mode, next telegraphs wait until current resolution finishes.');

// Explicit near/far labels, fire countdown, release and meteor drop/impact, also unguided.
run("trainingExercise='dream';mode='dream';selectedRole='MT';reset(true);guide=false;dream.towerRoles.MT='dark';time=DREAM.towers+2.1;updateUI()");
assert.equal(el('personalDebuffLabel').textContent,'PROCHE');
assert.ok(el('debuffGrid').innerHTML.includes('PROCHE'));
run("dream.towerRoles.MT='wind';updateUI()");assert.equal(el('personalDebuffLabel').textContent,'LOIN');
run("dream.towerRoles.MT='fire';time=DREAM.towers;updateUI()");
assert.equal(el('personalDebuffTimer').textContent,'5.0 s');assert.equal(el('personalDebuffTimer').hidden,false);
run('time=DREAM.towers+DREAM_FIRE_DURATION-.04;updateUI()');assert.equal(el('personalDebuffTimer').textContent,'0.1 s');
assert.equal(run("dreamDebuff('MT').short"),'IMMOBILE');
run('time=DREAM.towers+DREAM_FIRE_DURATION;updateUI()');assert.equal(el('personalDebuffLabel').textContent,'FEU TERMINÉ');
assert.equal(el('personalDebuffHint').hidden,true);assert.equal(el('personalDebuffTimer').hidden,true);
run("dream.hotFailed=[];dream.fireAnchors.MT={x:0,y:0};player={x:12,y:0,a:0};dream.departed=false;dreamUpdate(time-.05,.05)");
assert.equal(run("dream.hotFailed.includes('MT')"),false,'Movement allowed exactly when countdown expires');
run('time=DREAM.towers+1;updateUI()');assert.equal(el('personalDebuffTimer').textContent,'4.0 s','Rewind restores countdown');
run("time=DREAM.baits;dream.towerRoles.MT='dark';updateUI()");assert.equal(el('personalDebuff').hidden,true);
run('globalThis.meteorDraws=[];globalThis.originalMeteor=drawDreamMeteor;drawDreamMeteor=(...args)=>meteorDraws.push(args)');
run('time=DREAM.towers-.9;drawDreamTower({x:0,y:0,type:"fire"})');
assert.ok(Math.abs(run('meteorDraws.at(-1)[1]')-100)<.001);
run('time=DREAM.towers-.1;drawDreamTower({x:0,y:0,type:"fire"})');
assert.ok(run('meteorDraws.at(-1)[1]')<22,'Meteor descends to the tower');
run('meteorDraws=[];time=DREAM.towers-.001;drawDreamMeteorImpacts()');assert.equal(run('meteorDraws.length'),0,'No early impact');
run('time=DREAM.towers;drawDreamMeteorImpacts()');assert.equal(run('meteorDraws.length'),8,'Eight meteors visibly land on impact');
assert.ok(run('meteorDraws.every(args=>args[1]===0)'));
run('meteorDraws=[];time=DREAM.towers+.9;drawDreamMeteorImpacts()');assert.equal(run('meteorDraws.length'),0,'Impact clears quickly');
run('drawDreamMeteor=originalMeteor;globalThis.debuffWords=[];globalThis.originalText=text;text=(word,...args)=>{debuffWords.push(word);originalText(word,...args)};time=DREAM.towers+1;dream.towerRoles.MT="fire";render()');
assert.ok(Array.from(run('debuffWords')).includes('FEU'));assert.ok(Array.from(run('debuffWords')).includes('4.0 s'));
run('debuffWords=[];drawDreamMeteor({x:0,y:0,type:"fire"});drawDreamMeteor({x:0,y:0,type:"earth"});text=originalText');
assert.ok(Array.from(run('debuffWords')).includes('FEU'));assert.ok(Array.from(run('debuffWords')).includes('TERRE'));
console.log('PASS: readable near/far, fire countdown/release at the movement boundary, rewind, distinct meteor labels and eight synchronized falling impacts.');
