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


// All 90 valid symbol permutations must select the first matching source in the stated order.
const configured=JSON.parse(vm.runInContext('JSON.stringify(mapping)',context));
assert.deepEqual(configured,['boss','cone','stack','defam','none','defam','stack','cone'],'User-provided assignments replace the old saved draft');
assert.equal(vm.runInContext('priorityFor(0).startMark',context),'A');assert.equal(vm.runInContext('priorityFor(7).startMark',context),'4');
const variants=[];function permutations(prefix,counts){if(prefix.length===6){variants.push(prefix);return}for(const type of ['cone','stack','defam'])if(counts[type])permutations([...prefix,type],{...counts,[type]:counts[type]-1})}
permutations([],{cone:2,stack:2,defam:2});assert.equal(variants.length,90);
for(const variant of variants){
 const pool=variant.map((type,i)=>({id:i,type,spot:['N','NE','SE','S','SO','NO'][i],x:Math.sin(i*Math.PI/3)*250,y:-Math.cos(i*Math.PI/3)*250}));
 pool.push({id:'boss',type:'boss',x:0,y:0});context.testPool=pool;
 const selected=JSON.parse(vm.runInContext('JSON.stringify(Array.from({length:8},(_,clock)=>sourceForClock(clock,testPool)?.id??null))',context));
 assert.equal(selected[0],'boss');assert.equal(selected[4],null);
 for(const [green,red,type] of [[1,7,'cone'],[2,6,'stack'],[3,5,'defam']]){
  assert.equal(selected[green],variant.indexOf(type),'Green scans clockwise starting at A');
  assert.equal(selected[red],variant.lastIndexOf(type),'Red scans anticlockwise starting at 4, including 4 itself');
 }
 assert.equal(new Set(selected.filter(x=>x!==null)).size,7,'Two groups never reserve the same matching source');
}
delete context.testPool;

const initialSeed=state().seed;
const expectedSourcePositions=[[0,-250],[125*Math.sqrt(3),-125],[125*Math.sqrt(3),125],[0,250],[-125*Math.sqrt(3),125],[-125*Math.sqrt(3),-125]];
assert.deepEqual(Array.from(state().clones,c=>c.spot),['N','NE','SE','S','SO','NO']);for(let i=0;i<6;i++){assert.ok(Math.abs(state().clones[i].x-expectedSourcePositions[i][0])<1e-8);assert.ok(Math.abs(state().clones[i].y-expectedSourcePositions[i][1])<1e-8)}
assert.equal(state().clones.length,6);for(const type of ['stack','cone','defam'])assert.equal(state().clones.filter(c=>c.type===type).length,2);
assert.equal(state().visiblePlayerClones.length,8,'All eight player clones are already present before the simulation starts');
assert.equal(state().attributionLinks.length,8);assert.equal(new Set(state().attributionLinks.map(l=>l.role)).size,8);
for(const link of state().attributionLinks){const p=state().party.find(p=>p.role===link.role);assert.equal(link.clock,p.clock);assert.equal(link.transferable,false);assert.ok(Math.abs(Math.hypot(link.clone.x,link.clone.y)-325)<.001)}
el('startBtn').onclick();assert.equal(state().visiblePlayerClones.length,8);frames(20);assert.equal(state().linksActive,false,'Personal attribution links cannot be stolen during the short identification phase');
const initialLink=state().attributionLinks.find(l=>l.role===state().role);key('ArrowRight');frames(2);key('ArrowRight','keyup');const movedLink=state().attributionLinks.find(l=>l.role===state().role);assert.equal(movedLink.clock,initialLink.clock);assert.equal(movedLink.player.x,state().player.x);assert.ok(movedLink.player.x>initialLink.player.x,'The personal link follows its actual player without changing clone');
while(state().time<T.staging+.05)frames(1);assert.equal(state().linksActive,true,'Mechanic tethers appear after six seconds without any proximity requirement');

// Every role can go directly to the priority source without touching or approaching its player clone.
const seen=new Set();
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 el('roleGrid').events.click({target:{closest:()=>({dataset:{role}})}});
 assert.equal(state().seed,initialSeed);assert.equal(state().role,role);seen.add(state().required);
 el('startBtn').onclick();
 const mine=state().party.find(p=>p.role===role),angle=mine.clock*Math.PI/4;
 while(state().time<T.staging+.1)frames(1);
 assert.equal(state().sources.length,7);assert.equal(state().sources.filter(s=>s.owner!==null).length,7,'All seven tethers have persistent owners');
 const source=state().sources.find(s=>s.id===state().plannedSources[role]);
 if(source){
   walk({x:Math.sin(angle)*350,y:-Math.cos(angle)*350});
   const targetAngle=source.id==='boss'?angle:Math.atan2(source.x,-source.y);
   let current=angle,delta=Math.atan2(Math.sin(targetAngle-current),Math.cos(targetAngle-current));
   for(let i=0;i<48&&Math.abs(delta)>.03;i++){
     current+=Math.sign(delta)*Math.min(Math.abs(delta),.1);
     walk({x:Math.sin(current)*350,y:-Math.cos(current)*350});
     delta=Math.atan2(Math.sin(targetAngle-current),Math.cos(targetAngle-current));
   }
   walk(source);frames(16);
   assert.equal(state().sources.find(s=>s.id===source.id).owner,role,'Approaching the source takes its tether without pressing a button');
 }
 frames(800);assert.equal(state().time,T.staging+24);assert.equal(state().running,false);
 assert.equal(state().checks[T.staging+24].ok,true,'Correct tether survives until lock');
 for(const bot of state().party.filter(p=>p.role!==role)){
   assert.ok(bot.phase==='hold'||state().plannedSources[bot.role]===undefined,'NPC is not blocked by a clone visitation gate');
   const target=state().sources.find(s=>s.id===state().plannedSources[bot.role]);
   if(target){assert.equal(target.owner,bot.role,'NPC retrieves its assigned tether');assert.ok(Math.hypot(bot.x-target.x,bot.y-target.y)<1,'NPC stays under its source');}
 }
}
assert.equal(seen.size,5);assert.equal(state().stats.attempts,8);assert.equal(state().stats.wins,8);

const noLinkRole=state().party.find(p=>p.clock===4).role;el('roleGrid').events.click({target:{closest:()=>({dataset:{role:noLinkRole}})}});el('startBtn').onclick();frames(600);assert.equal(state().checks[T.staging+24].ok,true,'Acquisition succeeds without approaching the own clone');assert.equal(state().nearOwnClone,false);

// Controlled collision scenarios cover theft, multiple links, protection and lock behavior.
function scenario(code){vm.runInContext(code,context)}

scenario(`reset(false);selectedRole='MT';party.find(p=>p.role==='MT').clock=1;setupActors();linksActive=true;const target=sourceForClock(1);const other=sources.find(s=>s.type==='cone'&&s.id!==target.id);sources.forEach(s=>s.owner=null);other.owner='MT'`);
assert.equal(state().held,'cone');assert.equal(vm.runInContext('goodLinks()',context),false,'Correct symbol on a lower-priority source is rejected');
const immutableTarget=state().plannedSources.MT;
scenario(`const expected=sources.find(s=>s.id===plannedSources.MT);sources.forEach(s=>s.owner=null);expected.owner='MT'`);
assert.equal(vm.runInContext('goodLinks()',context),true,'Only the exact priority source validates');
assert.equal(state().plannedSources.MT,immutableTarget,'Source priority is independent of existing ownership');
scenario(`reset(false);selectedRole='MT';const bot=party.find(p=>p.role==='OT');bot.clock=7;party.find(p=>p.role==='MT').clock=1;setupActors();started=true;linksActive=true;time=15;const bot2=party.find(p=>p.role==='OT');Object.assign(bot2,{visited:true,phase:'clone',...pt(7*TAU/8,325)});const lower=sources.find(s=>s.type==='cone'&&s.id!==plannedSources.OT);lower.owner='OT';updateActors(.05)`);
assert.equal(state().party.find(p=>p.role==='OT').phase,'seek','NPC still leaves to retrieve the first source even when already holding the same mechanic');
scenario('reset(true)');

scenario(`reset(false);started=true;running=false;linksActive=true;time=15;party.forEach((p,i)=>{p.x=-390+i*4;p.y=350;p.visited=true});selectedRole='MT';player={x:0,y:0,a:0};Object.assign(party.find(p=>p.role==='OT'),{x:100,y:0});sources=[{id:0,type:'stack',x:-100,y:0,owner:'OT',lastTransfer:-100,contacts:[]}];updateTethers()`);
assert.equal(state().sources[0].owner,'MT','Crossing an extended tether automatically transfers it');
scenario(`updateTethers();updateTethers()`);assert.equal(state().sources[0].owner,'MT','A stationary contact does not cause frame-by-frame ownership oscillation');
scenario(`time=16;player={x:-100,y:0,a:0};Object.assign(party.find(p=>p.role==='OT'),{x:-99,y:0});updateTethers()`);
assert.equal(state().sources[0].owner,'MT','Parking directly under the source protects the shortened tether');
scenario(`time=17;player={x:100,y:100,a:0};Object.assign(party.find(p=>p.role==='H1'),{x:0,y:50});Object.assign(party.find(p=>p.role==='OT'),{x:350,y:350});sources[0].contacts=[];updateTethers()`);
assert.equal(state().sources[0].owner,'H1','A simulated player can steal an exposed player tether');
scenario(`time=18;player={x:0,y:50,a:0};Object.assign(party.find(p=>p.role==='H1'),{x:100,y:100});sources[0].contacts=[];sources.push({id:1,type:'cone',x:300,y:0,owner:'MT',lastTransfer:-100,contacts:[]});updateTethers()`);
assert.equal(state().sources.filter(s=>s.owner==='MT').length,2,'Picking up a second tether does not silently delete the first');
scenario(`time=38;player={x:300,y:300,a:0};sources[0].owner='OT';sources[0].lastTransfer=-100;sources[0].contacts=[];Object.assign(party.find(p=>p.role==='OT'),{x:300,y:300});updateTethers()`);
assert.equal(state().sources[0].owner,'OT','Locked tethers cannot be transferred');

// Replay restores moving NPCs and every tether owner, not just the local player.
el('exercise').onchange({target:{value:'links'}});el('startBtn').onclick();frames(340);
const replayTime=state().time,earlier=JSON.stringify(state().sources),earlierParty=JSON.stringify(state().party);
frames(80);el('timeline').oninput({target:{value:replayTime}});
assert.equal(state().running,false);assert.equal(JSON.stringify(state().sources),earlier);assert.equal(JSON.stringify(state().party),earlierParty);
key(' ');frames(5);assert.ok(state().time>replayTime);key(' ');const paused=state().time;frames(5);assert.equal(state().time,paused);

// Analogue input, multitouch and cancellation remain functional.
el('restartBtn').onclick();const pointer=(x,y,id=7)=>({pointerId:id,clientX:x,clientY:y,preventDefault(){}});
const pos0=state().player;
el('joystick').events.pointerdown(pointer(87,53));assert.equal(state().stick.x,1);frames(10);assert.ok(state().player.x-pos0.x>70);
el('joystick').events.pointermove(pointer(200,200));assert.ok(Math.hypot(state().stick.x,state().stick.y)<=1.001);
el('joystick').events.pointerdown(pointer(19,53,8));assert.equal(state().stick.pointerId,7);
el('joystick').events.pointercancel(pointer(200,200));assert.equal(state().stick.x,0);const stopped=state().player;frames(10);assert.equal(state().player.x,stopped.x);
el('joystick').events.pointerdown(pointer(56,54));assert.equal(state().stick.x,0);el('touchPause').onclick();assert.equal(state().running,false);assert.equal(state().stick.pointerId,null);
el('exercise').onchange({target:{value:'placement'}});el('startBtn').onclick();frames(1600);assert.equal(state().time,at('end'));assert.equal(Object.keys(state().checks).length,19);
el('exercise').onchange({target:{value:'staging'}});el('startBtn').onclick();
while(!state().visiblePlayerClones.some(p=>p.role===state().role))frames(1);
const own=state().visiblePlayerClones.find(p=>p.role===state().role),angle=own.clock*Math.PI/4;
const attemptsBeforeObservation=state().stats.attempts;frames(140);assert.equal(state().checks[T.staging].ok,true);assert.equal(state().stats.attempts,attemptsBeforeObservation,'Identification-only mode imposes no proximity score');
el('shuffle').onclick();assert.notEqual(state().seed,initialSeed);
console.log('PASS: all 90 symbol permutations, exact green/red priority, fixed A/C and symmetric assignments, wrong-source rejection, NPC correction despite an existing matching tether, 8 roles, eight clones and eight personal links at start, no clone proximity gate, automatic source pickup, exposed-tether interception by player and NPCs, short-tether protection, multiple persistent tethers, locked ownership, seven NPC routes and holds, complete replay, joystick and placement regression.');
