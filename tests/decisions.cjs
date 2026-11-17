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

// Source-backed interval checks, including overlapping cleave/cones and the longer identification window.
assert.equal(T.staging,6);for(const [actual,expected] of [[T.jump-T.firefallTell,5.7],[T.rays-T.landing,.6],[T.defams-T.rays,1.4],[T.stack-T.defams,5.5],[T.cones-T.stack,1.8],[T.kick-T.kickTell,5],[T.reenact-T.kick,7.2],[T.reenactEnd-T.reenact,3],[T.netherEnd-T.netherTell,5],[T.wave0-T.netherEnd,1.2],[T.wave1-T.wave0,4],[T.wave2-T.wave1,4.4],[T.wave3-T.wave2,3.6]])assert.ok(Math.abs(actual-expected)<1e-8);
assert.ok(T.kickTell<T.cones&&T.kickMove>T.cones,'Cleave cast overlaps cones, movement follows cone resolution');
run("mode='placement';started=true;time=STAGING+COMBAT.stack+1;updateUI()");assert.equal(el('castName').textContent,'Snaking Kick');assert.equal(el('decisionTitle').textContent,'');assert.equal(el('decisionCopy').textContent,'');assert.equal(el('decisionCopy').hidden,true);
run('reset(false);started=true;running=true');frames(100);assert.equal(state().linksActive,false,'Personal attribution remains available past the old four-second window');assert.ok(state().staging);
// Chrono and casts remain continuous while bots wait and while they travel.
el('exercise').onchange({target:{value:'placement'}});
run("party.forEach((p,i)=>p.clock=i);setupActors();started=true;running=true;guide=false");frames(121);
run('sources.forEach(s=>{s.owner=null;s.lastTransfer=-100;s.contacts=[]});player={x:400,y:0,a:0}');const waiting=state().party.map(p=>({x:p.x,y:p.y})),t=state().time;frames(40);
assert.ok(state().time>t+1.9);assert.equal(state().decisions.status,'choosing');assert.deepEqual(state().party.map(p=>({x:p.x,y:p.y})),waiting);assert.ok(!el('castTime').textContent.includes('suspendu'));
run('Object.assign(player,sources.find(s=>s.id===plannedSources[selectedRole]));updateTethers()');frames(10);assert.equal(state().decisions.status,'choosing');frames(6);assert.equal(state().decisions.status,'joining');const joiningTime=state().time;frames(15);assert.ok(state().time>joiningTime+.7);assert.ok(state().party.some((p,i)=>p.role!==state().role&&(p.x!==waiting[i].x||p.y!==waiting[i].y)));
// Late or wrong player decisions never block the encounter: bots have a travel-aware departure deadline.
run('reset(false);started=true;running=true;player={x:400,y:0,a:0}');frames(1600);assert.equal(state().time,at('end'));assert.equal(state().running,false);assert.equal(state().decisions.done.length,10);
// All placement steps use the delayed rhythm, across all eight roles.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 run(`selectedRole='${role}';reset(true);started=true;running=true`);const seen=[];
 for(let i=0;i<1700&&state().time<at('end');i++){
  const s=state();if(s.decisions.active&&!seen.includes(s.decisions.active.id))seen.push(s.decisions.active.id);
  if(s.linksActive){run(`if(resolution.locked){Object.assign(player,resolutionTarget(me()));if(hasMechanic(selectedRole,'cone'))player.a=safeConeAt(selectedRole,player).a}else{const source=sources.find(s=>s.id===plannedSources[selectedRole]);if(source)Object.assign(player,source);else Object.assign(player,pt(me().clock*TAU/8,355));updateTethers()}`)}
  const old=state().time;frames(1);assert.ok(state().time>old,'Every running frame advances time, including bot waiting and joining');
 }
 assert.equal(state().resolution.failures.length,0,role+' correct placements resolve safely with delayed bots: '+JSON.stringify(state().resolution.failures));assert.equal(state().time,at('end'),role+' completes in real time');assert.equal(seen.length,10);assert.equal(state().decisions.done.length,10);
 const recorded=run('history.find(h=>h.decisions?.active?.id===\'nether\')');assert.ok(recorded);el('timeline').oninput({target:{value:recorded.t}});assert.equal(state().decisions.active.id,'nether');
}
// The delay cannot extend beyond the time available for a long route.
run('time=STAGING+COMBAT.wave2+.12;decisions.active=decisionPoints().find(p=>p.id==="pair3");decisions.status="choosing";decisions.readyFor=0;player={x:0,y:400,a:0};party.forEach((p,i)=>{p.x=i%2?325:-325;p.y=0})');assert.ok(run('latestPartnerDeparture()')<at('end'));run('time=latestPartnerDeparture();updateAutomaticDecision(.05)');assert.equal(state().decisions.status,'joining');
// Live and identification modes retain the same uninterrupted clock.
el('partnerRhythm').onchange({target:{value:'live'}});el('startBtn').onclick();frames(160);assert.ok(state().time>T.staging);assert.equal(state().decisions.status,'idle');assert.equal(el('decisionTitle').textContent,'');
el('partnerRhythm').onchange({target:{value:'first'}});el('exercise').onchange({target:{value:'staging'}});el('startBtn').onclick();frames(140);assert.equal(state().time,T.staging);assert.equal(state().running,false);
assert.ok(!fs.readFileSync('dist/index.html','utf8').includes('id="commitDecision"'));assert.ok(!fs.readFileSync('dist/app.js','utf8').includes('commitDecision'));
console.log('PASS: uninterrupted clock and casts during bot waiting/travel, delayed automatic departures, travel-aware deadlines, no confirmation, ten steps across eight roles, complete idle-player run, replay and continuous modes.');
