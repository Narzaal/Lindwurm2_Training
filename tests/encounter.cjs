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






run("trainingExercise='all';mode='placement';demoMode=true;partnerRhythm='live';selectedRole='MT';reset(true);started=true;running=true");
frames(11200);
const snap=state();
assert.equal(snap.time,555.5);
assert.equal(snap.rep1.failures.length,0);
assert.equal(snap.resolution.failures.length,0);
assert.equal(snap.candy.failures.length,0);
assert.equal(snap.dream.failures.length,0);
assert.equal(Object.values(snap.checks).filter(x=>!x.ok).length,0);

assert.equal(run('encounter.events.filter(e=>e.name.includes("Arcadian Hell")).length'),3);
assert.equal(run('encounter.events.filter(e=>/Arcadia Aflame|Idyllic Dream|Meteor/.test(e.name)).length'),5);
run('globalThis.realRender=render;globalThis.realUI=updateUI;render=()=>{};updateUI=()=>{}');
for(const role of ['OT','H1','H2','M1','M2','R1','R2']){
 run(`selectedRole='${role}';trainingExercise='all';mode='placement';demoMode=true;partnerRhythm='live';reset(true);started=true;running=true`);
 frames(11200);const s=state();
 const failures=[...s.rep1.failures,...s.resolution.failures,...s.candy.failures,...s.dream.failures];
 assert.equal(s.time,555.5,role);assert.equal(failures.length,0,role+JSON.stringify(failures));
 assert.equal(Object.values(s.checks).filter(c=>!c.ok).length,0,role+JSON.stringify(s.checks));
}
run('render=realRender;updateUI=realUI');
run("demoMode=false;trainingExercise='placement';reset(true);player.x=426;player.y=0;checkDeathWall()");assert.ok(Math.hypot(state().player.x,state().player.y)<425);assert.ok(!Object.values(state().checks).some(c=>!c.ok));
console.log('PASS: all eight roles through 555.5 s demo, 8 raidwide events, final buster and lethal ring.');
