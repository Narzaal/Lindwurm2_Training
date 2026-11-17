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
perfect();event('jump');assert.equal(state().resolution.jump.role,'MT');assert.equal(state().resolution.jump.to.y,-210);
run('time=STAGING+(COMBAT.jump+COMBAT.landing)/2');const middle=run('combatBossPosition()');assert.ok(middle.y<0&&middle.y>-210&&middle.lift>0,'Boss jump animates from centre to actual tether holder');
event('landing');event('rays');
assert.deepEqual([...state().resolution.rayTargets].sort(),['OT','H1','R1','R2'].sort(),'The four closest other players bait rays');
assert.equal(state().resolution.farTarget,'M1','The no-tether player at south baits the far defamation');assert.equal(state().resolution.failures.length,0,'Reference prepositions resolve jump and rays cleanly');
event('defams');const defams=state().resolution.events.find(e=>e.key==='defams');assert.equal(defams.targets.length,3);assert.equal(new Set(defams.targets).size,3);assert.equal(state().resolution.effects.filter(e=>e.kind==='defam').length,3);assert.equal(state().resolution.failures.length,0);
run('for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}');event('stack');
const stacks=state().resolution.events.find(e=>e.key==='stack').stacks;assert.equal(stacks.length,2);assert.ok(stacks.every(s=>s.members.length===4));event('cones');assert.equal(state().resolution.failures.length,0,'Reference stacks and bot cones resolve without friendly fire');

// Firefall's bound target cannot move before the proximity rays resolve.
perfect();event('jump');run('running=true');const boundPosition=state().player;key('ArrowDown');frames(8);key('ArrowDown','keyup');assert.equal(state().player.y,boundPosition.y,'Firefall target is bound through the jump and landing');run('running=false');

// Targets depend on positions, not on the intended role or prescribed northern slots.
perfect();event('jump');event('landing');run("Object.assign(party.find(p=>p.role==='M2'),{x:0,y:-260});Object.assign(party.find(p=>p.role==='H2'),{x:0,y:415})");event('rays');
assert.ok(state().resolution.rayTargets.includes('M2'),'A misplaced defamation player can steal a proximity bait');assert.equal(state().resolution.farTarget,'H2','Farthest targeting is recalculated from real positions');assert.ok(state().resolution.failures.some(f=>f.roles.includes('M2')));
event('defams');assert.ok(state().resolution.failures.some(f=>f.message.includes('deux défamations')),'A bad far bait can receive a second defamation');
perfect();jumpAndRays();run("Object.assign(party.find(p=>p.role==='OT'),{x:370,y:110})");event('defams');assert.ok(state().resolution.failures.some(f=>f.roles.includes('OT')&&f.message.includes('défamation')),'Huge defamations detect other players in their radius');

// Light parties come from the green/red player-clone groups, regardless of original roles.
perfect();run(`const shuffled=[7,3,0,5,1,6,2,4];party.forEach((p,i)=>p.clock=shuffled[i]);setupActors();linksActive=true;for(const s of sources)s.owner=party.find(p=>plannedSources[p.role]===s.id)?.role??null;resetCombat();lockAssignments();for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)}`);event('stack');
const grouping=state().resolution.events.find(e=>e.key==='stack').stacks;for(const stack of grouping){const expected=state().party.filter(p=>(p.clock<4?'green':'red')===stack.group).map(p=>p.role).sort();assert.deepEqual([...stack.members].sort(),[...expected])}
assert.equal(state().resolution.failures.length,0);

// Bots can face either forward or backward, and avoid a user standing in front of them.
perfect();run(`for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)};Object.assign(player,{x:-75,y:-210});time=STAGING+COMBAT.cones-.1;updateConeBots(.05)`);
assert.ok(Math.abs(Math.abs(state().party.find(p=>p.role==='R2').a)-Math.PI)<.01,'Red cone bot turns backward when the user stands in front');event('cones');assert.ok(state().resolution.events.find(e=>e.key==='cones').cones.every(c=>c.hits.length===0));
perfect();run(`for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)};Object.assign(player,{x:-75,y:-60});time=STAGING+COMBAT.cones-.1;updateConeBots(.05)`);assert.ok(Math.abs(state().party.find(p=>p.role==='R2').a)<.01,'Bot turns forward when backward would hit the user');event('cones');assert.ok(state().resolution.events.find(e=>e.key==='cones').cones.every(c=>c.hits.length===0));
perfect();run(`for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,q);else Object.assign(p,q)};Object.assign(player,{x:-75,y:-135});time=STAGING+COMBAT.stack+.01;for(let i=0;i<10;i++){time+=.05;updateConeBots(.05)}`);event('cones');assert.ok(state().resolution.events.find(e=>e.key==='cones').cones.every(c=>c.hits.length===0),'Bot steps aside if the user initially overlaps its cone origin');
perfect('OT');run(`for(const p of party){const q=resolutionTarget(p,4);if(p.role===selectedRole)Object.assign(player,{...q,a:-Math.PI/2});else Object.assign(p,q)}`);event('cones');assert.ok(state().resolution.failures.some(f=>f.roles.includes('OT')&&f.message.includes('cône touche')),'The player’s own unsafe facing is detected');

// Drive all eight trainee roles through the full timeline with actual movement input.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 el('exercise').onchange({target:{value:'placement'}});el('roleGrid').events.click({target:{closest:()=>({dataset:{role}})}});el('shuffle').onclick();el('startBtn').onclick();
 assert.equal(state().visiblePlayerClones.length,8);
 const mine=state().party.find(p=>p.role===role),angle=mine.clock*Math.PI/4;
 while(state().time<T.staging+.1)frames(1);
 const source=state().sources.find(s=>s.id===state().plannedSources[role]);if(source)walk(source);
 while(state().time<at('lock')+.1)frames(1);assert.equal(state().checks[at('lock')].ok,true,'Fast direct acquisition still obtains the priority tether');
 const before=state().player;const destination=run('resolutionTarget(me(),1)');walk(destination);assert.ok(Math.hypot(state().player.x-destination.x,state().player.y-destination.y)<30);
 while(state().time<at('defams')+.1)frames(1);const grouped=run('resolutionTarget(me(),4)');walk(grouped);
 if(state().resolution.links[role].some(s=>s.type==='cone')){key('ArrowUp');frames(1);key('ArrowUp','keyup')}
 while(state().time<at('cones')+.05)frames(1);key(' ');assert.equal(state().running,false);const failed=Object.values(state().checks).filter(c=>!c.ok);assert.equal(failed.length,0,`Full resolution for ${role}: ${failed.map(c=>c.reason).join('; ')}`);assert.equal(state().resolution.events.length,7);
}
const finalEvents=state().resolution.events;el('timeline').oninput({target:{value:at('rays')+.2}});assert.equal(state().running,false);assert.ok(state().resolution.events.some(e=>e.key==='rays'));assert.ok(!state().resolution.events.some(e=>e.key==='defams'),'Replay restores the combat events at the selected time');el('timeline').oninput({target:{value:at('lock')-.1}});assert.equal(state().resolution.locked,false,'Replay can return before the frozen assignments');key(' ');while(state().time<at('cones')+.05)frames(1);key(' ');assert.equal(state().resolution.events.length,7,'Resuming from a replay cannot skip combat events');
console.log('PASS: boss jump, four proximity targets, actual far bait, three defamation collisions, green/red four-player stacks, safe forward/backward bot cones, overlap escape, unsafe player facing and all 8 roles through the first resolution.');
