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









// Boundary protection is an input constraint, never a geometry change or a failure.
const geometry=run('JSON.stringify(GEOMETRY)');
for(const ex of ['rep1','placement','candy','dream','all']){
 run(`trainingExercise='${ex}';mode='${ex}';demoMode=false;reset(true);time=0;player.x=1000;player.y=1000;checkDeathWall()`);
 const scale=ex==='dream'?19.5:21.25;assert.ok(Math.hypot(state().player.x,state().player.y)<20*scale);
 assert.equal(Object.values(state().checks).filter(c=>!c.ok).length,0);
 assert.equal(run('JSON.stringify(GEOMETRY)'),geometry);
}
run("trainingExercise='dream';mode='dream';reset(true);time=DREAM.towers;globalThis.edge=dp(-23.9,0);Object.assign(player,dp(-25,0));checkDeathWall(edge)");
assert.ok(run('dist(player,dp(-14,0))<10*DS'),'Island border blocks accidental walking off');
run('dream.jumps.MT={end:time+1};player={x:0,y:0,a:0};checkDeathWall(edge)');assert.equal(state().player.x,0,'Scripted wind jump crosses the void');
// Multiple failures survive a module reset and are not duplicated by the checkpoint.
run("trainingExercise='placement';mode='placement';selectedRole='MT';reset(true);time=20;combatError(['MT'],'Erreur une');combatError(['MT'],'Erreur deux');checks['20']={ok:false,reason:'Erreur une'};updateUI()");
assert.equal(state().feedback.length,2);assert.equal(el('feedbackCount').textContent,'2 erreurs');
assert.ok(el('feedbackList').innerHTML.includes('Erreur une')&&el('feedbackList').innerHTML.includes('Erreur deux'));
run("time=25;checks['25']={ok:true,reason:'Stack : résolu.'};updateUI()");assert.ok(el('liveFeedback').textContent.startsWith('✓'));
run('time=26;resolution=freshResolution();updateUI()');assert.equal(state().feedback.length,3);
run('time=19;updateUI()');assert.equal(state().feedback.length,0);assert.equal(el('feedbackCount').textContent,'0 erreur');
run('time=21;updateUI()');assert.equal(state().feedback.length,2);
// Branching the replay discards future results.
run('running=false;started=true;play()');assert.ok(run('feedback.every(e=>e.at<=time+.001)'));
run('reset(false);updateUI()');assert.equal(state().feedback.length,0);
// Real keyboard input can slide against the boundary without entering it.
run("trainingExercise='placement';mode='placement';reset(true);started=true;running=true;Object.assign(player,{x:424,y:0});time=8");
key('ArrowRight');frames(15);key('ArrowRight','keyup');assert.ok(Math.hypot(state().player.x,state().player.y)<425);
console.log('PASS: protected circular/island borders, unchanged AOEs, wind jump, all errors, success checks, cross-module persistence, replay filtering and reset.');
