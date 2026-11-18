const assert=require('assert');
const {create,html}=require('./trainer-harness.cjs');
let {el,run,canvasText,imageDraws}=create();el('confirmPreparation').onclick();let tests=0;
// All eight personal clones and both source layouts retain the actual failed draw.
for(let clock=0;clock<8;clock++)for(const cardinalDefam of [false,true]){
 run(`rangeStart=rangeEnd=4;selectedRole='MT';fixedRng.dream='${clock}';reset(true);dreamScenario.cardinalDefam=${cardinalDefam};dreamReset();time=dreamOffset()+DREAM.lock+.001;for(const s of dream.sources)if(s.owner===selectedRole)s.owner='OT';running=true;dreamFireEvent('lock');updateUI()`);
 assert(el('errorDialog').open);assert.equal(el('explainDreamError').hidden,false);
 const before=run('JSON.stringify({time,seed,party,dreamScenario,dream,player,guide,fixedRng,history})'),target=run('dreamSource(selectedRole).id');
 el('explainDreamError').onclick();assert(!el('dreamLessonDialog').hidden);assert(!el('errorDialog').open);assert(canvasText.includes('ORDRE ATTENDU'));
 assert(el('dreamLessonCopy').innerHTML.includes('Le plan ci-contre fixe la mécanique'));assert(!el('dreamLessonCopy').innerHTML.includes('sens horaire'));
 run('tick(2500);tick(4700);play()');assert(!run('running'));assert(run('dreamLinkLesson.elapsed>0'));
 el('dreamLessonNext').onclick();assert(el('dreamLessonCopy').innerHTML.includes(run('marks[dreamClock(selectedRole)]')));assert(el('dreamLessonCopy').innerHTML.includes('sur un marqueur'));
 assert(el('dreamLessonCopy').innerHTML.includes('La couleur du marqueur'));
 el('dreamLessonNext').onclick();assert(el('dreamLessonCopy').innerHTML.includes(run(`marks[${target}]`)));assert(el('dreamLessonCopy').innerHTML.includes('aucun lien'));
 const copy=el('dreamLessonCopy').innerHTML;
 // Initial tethers come from the real random draw, not the expected destination.
 assert(run('dreamLinkLesson.sources.every(s=>s.initialOwner===dreamScenario.initialOwners[s.id])'));
 assert(run('dreamLessonActors().links.every(l=>l.owner===dreamScenario.initialOwners[l.sourceId])'));
 run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+1500)');assert(run('dreamLessonActors().links.every(l=>l.owner===dreamScenario.initialOwners[l.sourceId])'));
 run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+3500)');
 assert(run('dreamLessonActors().actors.filter(p=>p.role!==selectedRole).every(p=>dist(p,dreamCloneWaitingPos(dreamClock(p.role)))<.001)'));
 assert(run('dreamLessonActors().links.every(l=>l.owner===selectedRole||l.owner===dreamScenario.initialOwners[l.sourceId])'));
 assert(run('dreamLessonActors().actors.filter(p=>p.role!==selectedRole).every(p=>dist(p,dreamCloneWaitingPos(dreamClock(p.role)))<.001)'));
 run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+5500)');
 assert(run('dist(dreamLessonActors().actors.find(p=>p.role===selectedRole),dreamSource(selectedRole))<.001'));
 assert(run('dreamLessonActors().links.find(l=>l.sourceId===dreamSource(selectedRole).id).owner===selectedRole'));
 assert(run('dreamLessonActors().links.every(l=>l.owner===selectedRole||l.owner===dreamScenario.initialOwners[l.sourceId])'));
 run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+8500)');
 assert(run('dist(dreamLessonActors().actors.find(p=>p.role===selectedRole),dreamSource(selectedRole))<.001'));
 run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+11000);render()');assert(canvasText.includes('BON LIEN'));
 assert(run('dreamLessonActors().links.every(l=>dreamSource(l.owner).id===l.sourceId)'));
 const end=run('JSON.stringify(dreamLessonActors())');run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+14000)');assert(run('dreamLessonActors().links.every(l=>l.owner===dreamScenario.initialOwners[l.sourceId])'));assert(run('dreamLessonActors().actors.every(p=>dist(p,dreamCloneWaitingPos(dreamClock(p.role)))<.001)'));run('updateDreamLessonAnimation(dreamLinkLesson.startedAt+25000)');assert.equal(run('JSON.stringify(dreamLessonActors())'),end);
 assert.equal(el('dreamLessonCopy').innerHTML,copy);assert(!html.includes('dreamLessonMotion'));
 assert.equal(run('JSON.stringify({time,seed,party,dreamScenario,dream,player,guide,fixedRng,history})'),before);
 el('repeatDreamLesson').onclick();assert.equal(run('dreamLinkLesson.step'),0);assert.equal(run('dreamLinkLesson.elapsed'),0);
 el('closeDreamLesson').onclick();assert(el('errorDialog').open);assert(el('dreamLessonDialog').hidden);tests++;
}
// Wrong symbol, correct symbol from a wrong source, and multiple links.
for(const mode of ['symbol','source','multiple']){
 run(`reset(false);time=dreamOffset()+DREAM.lock+.001;var expected=dreamSource(selectedRole);for(const s of dream.sources)if(s.owner===selectedRole)s.owner='OT';var wrong=dream.sources.find(s=>${mode==='symbol'?"s.type!==expected.type":"s.type===expected.type&&s.id!==expected.id"});wrong.owner=selectedRole;${mode==='multiple'?"expected.owner=selectedRole;":''}running=true;dreamFireEvent('lock');updateUI();openDreamLinkLesson();setDreamLessonStep(2)`);
 assert(el('dreamLessonCopy').innerHTML.includes(mode==='multiple'?'plusieurs liens':mode==='source'?'bon symbole':'Tu portais un lien'));tests++;
}
// Other errors and phases do not offer this specific explanation.
run("reset(false);time=dreamOffset()+DREAM.stored;running=true;dreamError([selectedRole],'Attaques mémorisées.');updateUI()");assert(el('explainDreamError').hidden);tests++;
run("reset(false);rangeStart=rangeEnd=2;reset(false);time=rep2At(COMBAT.lock);running=true;checks[time]={ok:false,reason:'Mauvais lien Replication 2'};updateUI()");assert(el('explainDreamError').hidden);tests++;
// Practice starts beside a fresh personal clone, with the bots two-thirds to their personal clones.
run("rangeStart=rangeEnd=4;fixedRng.dream='0';reset(true);stopOnError=false;guide=false");const oldClock=run('dreamClock(selectedRole)');
el('practiceDreamLinks').onclick();assert(Math.abs(run('dreamTime()')-47.2)<.0001);assert.notEqual(run('dreamClock(selectedRole)'),oldClock);assert.equal(run('fixedRng.dream'),'0');assert(!run('guide'));assert(run('running'));assert.equal(run('dream.events.length'),0);assert(run('dist(player,dreamClonePos(dreamClock(selectedRole)))<50'));assert(run('party.filter(p=>p.role!==selectedRole).every(p=>dist(p,dreamCloneWaitingPos(dreamClock(p.role)))<.001)'));tests++;
run("Object.assign(player,dreamSource(selectedRole));lastFrame=0;for(let i=1;running&&i<700;i++)tick(i*50)");
assert(el('dreamPracticeDialog').open);assert(!run('running'));assert(run('dreamTime()>=DREAM.lock&&dreamTime()<DREAM.lock+.1'));assert(!run("dream.events.some(e=>e.key==='stored')"));tests++;
const succeededClock=run('dreamClock(selectedRole)');el('anotherDreamPractice').onclick();assert(!el('dreamPracticeDialog').open);assert.notEqual(run('dreamClock(selectedRole)'),succeededClock);
run("lastFrame=0;for(let i=1;running&&dreamTime()<DREAM.lock-.1&&i<700;i++)tick(i*50);player={...dp(0,-19),a:0};for(const s of dream.sources)if(s.owner===selectedRole)s.owner='OT';time=dreamOffset()+DREAM.lock-.01;tick(lastFrame+50)");
assert(el('errorDialog').open);assert(!el('explainDreamError').hidden);assert(!run('running'));tests++;
el('explainDreamError').onclick();el('restartLessonTraining').onclick();assert(el('dreamLessonDialog').hidden);assert(!run('dreamLinkPractice'));assert.equal(run('time'),run('trainingStartTime()'));assert(run('running'));tests++;
// Every role can complete the bounded exercise with either partner rhythm.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const rhythm of ['first','live']){
 run(`selectedRole='${role}';partnerRhythm='${rhythm}';startDreamLinkPractice();Object.assign(player,dreamSource(selectedRole));lastFrame=0;for(let i=1;running&&i<700;i++)tick(i*50)`);
 assert(el('dreamPracticeDialog').open,role+' / '+rhythm);assert(!run('running'));assert(!run("dream.failures.some(e=>e.roles.includes(selectedRole))"));tests++;
}
// Bots stop two-thirds during identification and hold that exact position until mechanic links appear.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const rhythm of ['first','live'])for(const cardinalDefam of [false,true]){
 run(`selectedRole='${role}';partnerRhythm='${rhythm}';rangeStart=rangeEnd=4;stopOnError=false;fixedRng.dream='auto';reset(true);dreamScenario.cardinalDefam=${cardinalDefam};dreamReset();`);
 run('for(let i=1;i<=1023;i++){var old=time;time=dreamOffset()+i*.05;if(dreamTime()>=DREAM.clone)Object.assign(player,dreamClonePos(dreamClock(selectedRole)));dreamUpdate(old,.05);if(dreamTime()>22&&party.some(p=>p.role!==selectedRole&&dist(p,dreamCloneWaitingPos(dreamClock(p.role)))>.001))throw Error("A bot left its two-thirds waiting point");}');
 assert(run('party.filter(p=>p.role!==selectedRole).every(p=>dist(p,dreamCloneWaitingPos(dreamClock(p.role)))<.001)'),role+' / '+rhythm+' bots hold two-thirds');
 assert(run('party.filter(p=>p.role!==selectedRole).every(p=>dist(p,dreamClonePos(dreamClock(p.role)))>85)'));assert(run('party.filter(p=>p.role!==selectedRole).every(p=>Math.abs(Math.hypot(p.x,p.y)*3-Math.hypot(dreamClonePos(dreamClock(p.role)).x,dreamClonePos(dreamClock(p.role)).y)*2)<.001)'));
 run('for(let i=1024;i<=1413;i++){var old=time;time=dreamOffset()+i*.05;Object.assign(player,dreamTarget(selectedRole));dreamUpdate(old,.05);}');
 assert(run('party.filter(p=>p.role!==selectedRole).every(p=>dreamOwn(p.role).length===1&&dreamOwn(p.role)[0].id===dreamSource(p.role).id)'),role+' / '+rhythm+' bots get their own link');tests++;
}
// Draw the actual scenes: every bot tether has the player's width and full opacity.
run("var savedLine=line;var paintedLinks=[];line=(a,b,color,width,dash)=>paintedLinks.push({color,width});guide=false;rangeStart=rangeEnd=4;reset(true);time=dreamOffset()+DREAM.clone+2;paintedLinks=[];drawDream()");
assert.equal(run('paintedLinks.length'),8);assert(run("paintedLinks.every(l=>l.width===2&&l.color==='#bcffec')"));tests++;
run('time=dreamOffset()+DREAM.links+2;paintedLinks=[];drawDream()');assert.equal(run('paintedLinks.length'),8);assert(run("paintedLinks.every(l=>l.width===2.5&&l.color==='#ffdb9c')"));tests++;
run('rangeStart=rangeEnd=2;reset(true);paintedLinks=[];render()');assert.equal(run('paintedLinks.length'),8);assert(run("paintedLinks.every(l=>l.width===3&&l.color==='#bcfff0')"));tests++;
run('time=rep2At()+1;linksActive=true;for(const s of sources)s.owner=s.initialOwner;paintedLinks=[];render()');assert.equal(run('paintedLinks.length'),7);assert(run("paintedLinks.every(l=>l.width===3&&l.color==='#ffac87')"));tests++;
run('line=savedLine');
// The practice departure is the same with a correct/wrong initial link and either rhythm.
for(const rhythm of ['first','live'])for(const initiallyCorrect of [false,true]){
 run(`selectedRole='MT';partnerRhythm='${rhythm}';startDreamLinkPractice();var target=dreamSource(selectedRole);var mine=dreamOwn(selectedRole)[0];var other=dream.sources.find(s=>s.owner!==selectedRole&&s.id!==target.id);var chosen=${initiallyCorrect} ? target : other;var previous=chosen.owner;chosen.owner=selectedRole;if(mine.id!==chosen.id)mine.owner=previous;Object.assign(player,target);var beforeWait=JSON.stringify(party);`);
 run('for(var n=0;n<160;n++){var old=time;time+=.05;dreamUpdate(old,.05);}');
 assert(run('dreamTime()<DREAM.links+4.01'));assert(!run('dream.departed'));assert.equal(run('JSON.stringify(party)'),run('beforeWait'));
 run('for(var n=0;n<22;n++){var old=time;time+=.05;dreamUpdate(old,.05);}');
 assert(run('dream.departed'));assert(run('dreamTime()<DREAM.links+5.2'));tests++;
}
// Holding an initially correct link away from its source never starts the practice bots early.
run("partnerRhythm='live';startDreamLinkPractice();var target=dreamSource(selectedRole),mine=dreamOwn(selectedRole)[0],oldOwner=target.owner;target.owner=selectedRole;if(mine.id!==target.id)mine.owner=oldOwner;player={x:0,y:0,a:0};var beforeWait=JSON.stringify(party);for(var n=0;n<250;n++){var old=time;time+=.05;dreamUpdate(old,.05);}");
assert(!run('dream.departed'));assert.equal(run('JSON.stringify(party)'),run('beforeWait'));tests++;
run('Object.assign(player,dreamSource(selectedRole));for(var n=0;n<25;n++){var old=time;time+=.05;dreamUpdate(old,.05);}');assert(run('dream.departed'));tests++;
// Contact rules transfer a crossed link before a mover reaches its destination, with the same cooldown.
run("var sample=[{id:0,x:0,y:0,owner:'MT',contacts:[],lastTransfer:-100}];var positions=Object.fromEntries(roles.map((r,i)=>[r,{x:500+i*40,y:500}]));positions.MT={x:100,y:0};positions.OT={x:40,y:20};transferDreamTethers(sample,r=>positions[r],0,()=>true)");
assert.equal(run('sample[0].owner'),'MT');run("positions.OT.y=8;transferDreamTethers(sample,r=>positions[r],.1,()=>true)");assert.equal(run('sample[0].owner'),'OT');
run("positions.H1={x:20,y:4};transferDreamTethers(sample,r=>positions[r],.3,()=>true)");assert.equal(run('sample[0].owner'),'OT');run("transferDreamTethers(sample,r=>positions[r],.6,()=>true)");assert.equal(run('sample[0].owner'),'H1');tests++;
// The red reality starts when the opening Idyllic Dream cast finishes.
run("rangeStart=rangeEnd=4;reset(true);background.complete=dreamRedFloor.complete=dreamBlueFloor.complete=dreamPlatformTexture.complete=true;background.naturalWidth=dreamRedFloor.naturalWidth=dreamBlueFloor.naturalWidth=dreamPlatformTexture.naturalWidth=1254");
for(const at of [0,4.99]){imageDraws.length=0;canvasText.length=0;run(`time=dreamOffset()+${at};render()`);assert(imageDraws.includes('assets/arena.png'));assert(!imageDraws.includes('assets/idyllic-red-floor.png'));assert(!canvasText.includes('RÉALITÉ ROUGE'));tests++;}
imageDraws.length=0;canvasText.length=0;run('time=dreamOffset()+5;render()');assert(imageDraws.includes('assets/idyllic-red-floor.png'));assert(canvasText.includes('RÉALITÉ ROUGE'));tests++;
imageDraws.length=0;run('time=dreamOffset()+30;render()');assert(imageDraws.includes('assets/idyllic-blue-floor.png'));assert(!imageDraws.includes('assets/idyllic-red-floor.png'));tests++;
// All three platform phases retain their own old texture, without outer cardinal badges.
run('var savedCardinalText=text;var cardinalDraws=[];text=(value,x,y,...rest)=>{if(Math.hypot(x,y)>450&&marks.includes(value))cardinalDraws.push(value);savedCardinalText(value,x,y,...rest)}');
for(const at of [84,135,184]){imageDraws.length=0;canvasText.length=0;run(`time=dreamOffset()+${at};cardinalDraws=[];render()`);assert.equal(imageDraws.filter(src=>src==='assets/idyllic-platforms.svg').length,2);assert(!imageDraws.includes('assets/idyllic-blue-floor.png'));assert(!imageDraws.includes('assets/idyllic-red-floor.png'));assert(!canvasText.includes('RÉALITÉ BLEUE'));assert.equal(run('cardinalDraws.length'),0);tests++;}
run('time=dreamOffset()+106;cardinalDraws=[];render()');assert.equal(run('cardinalDraws.join(",")'),'A,B,C,D');run('text=savedCardinalText');tests++;
// All splits validate the assigned island at separation, including the last cone island.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const key of ['islands1','islands2','islands3'])for(const coneEast of [false,true]){
 for(const correct of [false,true]){
  run(`rangeStart=rangeEnd=4;selectedRole='${role}';demoMode=false;partnerRhythm='live';stopOnError=true;reset(true);dreamScenario.coneEast=${coneEast};var split=DREAM.${key};var expectedSide='${key}'==='islands3'?(dreamScenario.coneEast?1:-1):(dreamWest(selectedRole)?-1:1);time=dreamOffset()+split-.02;for(const r of roles)Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamTarget(r));Object.assign(player,dp(expectedSide*${correct?1:-1}*14,0));running=true;dreamUpdate(time-.01,.01);`);
  assert(!run(`dream.events.some(e=>e.key==='${key}')`),'not before the floor splits');
  run('var previous=time;time+=.03;dreamUpdate(previous,.03);updateUI()');
  assert.equal(run(`dream.events.filter(e=>e.key==='${key}').length`),1);
  assert.equal(!!el('errorDialog').open,!correct,role+' / '+key+' / '+coneEast);
  assert.equal(run('dream.failures.some(e=>e.roles.includes(selectedRole))'),!correct);
  if(!correct){assert(el('errorMessage').textContent.includes('Mauvaise plateforme'));assert(el('errorMessage').textContent.includes(run("expectedSide<0?'gauche':'droite'")));if(key!=='islands3')assert(el('errorMessage').textContent.includes(run("dreamWest(selectedRole)?'groupe 1':'groupe 2'")));assert.equal(run('activeFailure.checkpoint'),null);}
  else assert.equal(run('previousSuccessfulCheckpoint(time+.01).successfulCheckpoint'),key==='islands3'?'Plateforme du clone à cônes':key==='islands2'?'Retour sur la plateforme du groupe':'Plateforme du groupe');
  run('var previous=time;time+=.03;dreamUpdate(previous,.03)');assert.equal(run(`dream.events.filter(e=>e.key==='${key}').length`),1);
  tests++;
 }
}
// Wrong island still records an error when automatic pausing is disabled; combat offset is respected.
for(const full of [false,true]){
 run(`trainingExercise='${full?'all':'dream'}';rangeStart=${full?0:4};rangeEnd=${full?5:4};reset(true);selectedRole='MT';stopOnError=false;time=dreamOffset()+DREAM.islands1-.02;for(const r of roles)Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamTarget(r));Object.assign(player,dp(14,0));running=true;var previous=time;time+=.03;dreamUpdate(previous,.03);updateUI()`);
 assert(!el('errorDialog').open);assert(run('running'));assert(run("dream.failures.some(e=>e.roles.includes('MT')&&e.message.includes('Mauvaise plateforme'))"));tests++;
}
// A player still in the gap fails before fall recovery snaps them onto an island.
run("rangeStart=rangeEnd=4;reset(true);selectedRole='MT';time=dreamOffset()+DREAM.islands1-.02;Object.assign(player,dp(0,0));var previous=time;time+=.03;dreamUpdate(previous,.03)");
assert(run("dream.failures.some(e=>e.roles.includes('MT')&&e.message.includes('Mauvaise plateforme'))"));assert(run('dreamOnFloor(player)'));assert(!run('history.some(h=>h.successfulCheckpoint)'));tests++;
// Wind can cross and land on the other island after towers, without a false platform failure.
run("reset(true);selectedRole='MT';time=dreamOffset()+DREAM.towers+.1;Object.assign(player,dp(-14,0));dream.jumps.MT={from:dp(-14,0),to:dp(14,0),start:time,end:time+1.2};for(let i=0;i<35;i++){var previous=time;time+=.05;dreamUpdate(previous,.05)}");
assert(!run("dream.failures.some(e=>e.roles.includes('MT'))"));assert(run('player.x>0'));tests++;
// Real movement throughout the sequence gets everyone to the three platforms in time.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const coneEast of [false,true]){
 run(`selectedRole='${role}';demoMode=true;partnerRhythm='live';reset(true);dreamScenario.coneEast=${coneEast};for(let i=0;i<3740;i++){demoMove(.05);var previous=time;time+=.05;dreamUpdate(previous,.05);}`);
 assert.equal(run("dream.events.filter(e=>e.key.startsWith('islands')).length"),3);
 assert(run("dream.events.filter(e=>e.key.startsWith('islands')).every(e=>e.errors.length===0)"),role+' / '+coneEast+' all actors reach platforms');tests++;
}
// Short and long routes share the actual manual speed and stop exactly at the destination.
for(const length of [90,300,600]){
 const at=run(`dreamLessonMove({x:0,y:0},{x:${length},y:0},.25)`);assert(Math.abs(at.x-run('DREAM_MOVE_SPEED')*.25)<1e-8);
 assert.equal(run(`dreamLessonMove({x:0,y:0},{x:${length},y:0},10).x`),length);tests++;
}
console.log('Passed '+tests+' checks: dream lessons, link practice, rendering and platform assignment.');
