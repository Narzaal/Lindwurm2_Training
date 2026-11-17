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








// Shared physical-to-screen scale across all normal arena phases and interludes.
for(const ex of ['rep1','placement','candy','dream','all']){
 run(`trainingExercise='${ex}';mode='${ex}';reset(true);time=${ex==='all'?15:0};`);
 const radius=run('(isDreamActive()?DS:REP1_SCALE)*20*arenaZoom()');assert.equal(radius,390,ex);
 run('render();updateUI()');
}
// Actual casts only: no return-to-towers stage title or fake progress timer.
run("trainingExercise='dream';mode='dream';guide=false;reset(true);started=true;time=DREAM.islands2;updateUI()");
assert.equal(el('castName').textContent,'');assert.equal(el('castbar').style.visibility,'hidden');
assert.equal(el('decisionTitle').textContent,'');assert.equal(el('objectivePanel').hidden,true);
run('time=151;updateUI()');assert.equal(el('castName').textContent,'Temporal Curtain');assert.equal(el('castbar').style.visibility,'visible');
run("trainingExercise='placement';mode='placement';reset(true);started=true;time=rep2At(COMBAT.reenactEnd+1);updateUI()");
assert.equal(el('castName').textContent,'');
// Status label, effect description and timer remain separate in every module.
run("trainingExercise='candy';mode='candy';reset(true);time=CANDY.assign;candy.debuffs.MT='alpha';selectedRole='MT';updateUI()");
assert.equal(el('personalDebuffLabel').textContent,'ALPHA');assert.equal(el('personalDebuffTimer').textContent,'17 s');
run("trainingExercise='rep1';mode='rep1';reset(true);time=REP1.fire1;rep1.debuffs.MT='dark';updateUI()");
assert.equal(el('personalDebuffLabel').textContent,'TÉNÈBRES');assert.equal(el('personalDebuffHint').textContent,'Vulnérabilité');assert.equal(el('personalDebuffTimer').hidden,true);
run("trainingExercise='dream';mode='dream';reset(true);time=DREAM.towers;dream.towerRoles.MT='wind';updateUI()");
assert.equal(el('personalDebuffLabel').textContent,'LOIN');assert.equal(el('personalDebuffTimer').hidden,false);
// Rendering is independent from movement-history samples; rewind storage remains available.
run("trainingExercise='placement';mode='placement';guide=false;reset(true);started=true;time=20;history=[];globalThis.pathCalls=[];ctx.lineTo=(...p)=>pathCalls.push(p);render();globalThis.withoutHistory=JSON.stringify(pathCalls);pathCalls=[];history=[{t:0,x:10000,y:10000},{t:1,x:-10000,y:-10000}];render()");
assert.equal(run('JSON.stringify(pathCalls)'),run('withoutHistory'));
// The pointer conversion must follow the camera, including near the edge of the hit area.
run("trainingExercise='staging';mode='staging';reset(true);started=true;globalThis.tap=pt(me().clock*TAU/8,295)");
const tap=run('({x:500+tap.x*arenaZoom(),y:500+tap.y*arenaZoom()})');
el('arena').events.pointerdown({clientX:tap.x,clientY:tap.y});assert.equal(run('selectedClock'),run('me().clock'));
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/style.css','utf8');
assert.ok(html.indexOf('id="personalDebuff"')>html.indexOf('id="arenaViewport"'));
assert.ok(html.indexOf('id="personalDebuff"')<html.indexOf('id="arena"'));
assert.ok(html.includes('id="arenaToast" hidden'));
assert.ok(css.includes('.arena-viewport{position:relative;')&&css.includes('aspect-ratio:1'));
assert.ok(css.includes('.arena-viewport .personal-debuff{position:absolute;'));
console.log('PASS: constant arena scale, fixed overlay structure, actual casts only, shared statuses, no trail and camera-correct pointer targeting.');
