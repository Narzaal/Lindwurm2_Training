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




for(let turns=0;turns<4;turns++){
 run(`trainingExercise='candy';mode='candy';reset(true);candyScenario.turns=${turns};candy.aggro='OT';Object.assign(party.find(p=>p.role==='OT'),{x:50,y:-135});time=CANDY.sobatTell;candyFireEvent('sobatTell');globalThis.firstHeading=candy.heading;time=CANDY.turn;candyFireEvent('turn')`);
 assert.ok(Math.abs(state().candy.heading-context.firstHeading-turns*Math.PI/2)<1e-10);
 const frozen=state().candy.heading;
 run("time=CANDY.repeat+.8;Object.assign(party.find(p=>p.role==='OT'),{x:350,y:200});candyUpdate(time-.05,.05)");
 assert.equal(state().candy.heading,frozen,'Tank movement must not rotate the boss after the second cleave');
}
for(const rhythm of ['live','first'])for(let turns=0;turns<4;turns++)for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 run(`trainingExercise='candy';mode='candy';selectedRole='${role}';partnerRhythm='${rhythm}';reset(true);candyScenario.turns=${turns};time=59;candy.entered=true;candy.aggro='OT';candy.heading=0;party.forEach(p=>Object.assign(p,candyTarget(p.role)));Object.assign(player,candyTarget(selectedRole));started=true;running=true`);
 let facing=null;
 for(let i=0;i<340&&state().running;i++){
  const p=state().player,target=run('candyTarget(selectedRole)'),dx=target.x-p.x,dy=target.y-p.y;
  const kx=Math.abs(dx)>4?(dx>0?'ArrowRight':'ArrowLeft'):null,ky=Math.abs(dy)>4?(dy>0?'ArrowDown':'ArrowUp'):null;
  if(kx)key(kx);if(ky)key(ky);frames(1);if(kx)key(kx,'keyup');if(ky)key(ky,'keyup');
  const s=state();if(s.time>65.8){if(facing===null)facing=s.candy.heading;assert.equal(s.candy.heading,facing);}
 }
 const s=state();assert.equal(s.time,75);assert.equal(s.candy.failures.length,0,JSON.stringify({role,rhythm,turns,failures:s.candy.failures}));
 assert.deepEqual(Array.from(s.candy.events.filter(e=>['sobat','repeat','finishers'].includes(e.key)),e=>e.key),['sobat','repeat','finishers']);
}
console.log('PASS: relative 0/90/180/270-degree turns, frozen final facing, all roles and both rhythms through solo buster, cleave and two tank AoEs.');
// The verified 120-degree cone has a 60-degree half-angle, on both world axes.
for(const type of ['blue','orange'])for(const angle of [50,65]){
 context.coneType=type;context.coneAngle=angle;
 const hit=run("candyInShape(pt((coneAngle+(coneType==='orange'?90:0))*Math.PI/180,200),{x:0,y:0,type:coneType})");
 assert.equal(hit,angle===50);
}
console.log('PASS: Candy cones hit at 50 degrees and are safe at 65 degrees from their axis.');
