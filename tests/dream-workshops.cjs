const assert=require('assert');
const {create,html}=require('./trainer-harness.cjs');const {run,el,canvasText}=create();el('confirmPreparation').onclick();let tests=0;
function form(kind){el('workshopKind').value=kind;el('workshopDraw').value='specific';el('workshopRole').value='MT';for(const id of ['Clock','Symbol','Meteor','Hemisphere','First','Absorbed','Island','Axis'])el('workshop'+id).value='auto';}
// Every personal position and displayed clone symbol is selectable independently.
for(let clock=0;clock<8;clock++)for(const symbol of ['auto','defam','stack']){
 form('links');el('workshopClock').value=String(clock);el('workshopSymbol').value=symbol;
 const prefs=run('JSON.stringify(fixedRng)');run('launchDreamWorkshop(true)');
 assert.equal(run('dreamClock(selectedRole)'),clock);if(symbol!=='auto')assert.equal(run('dream.sources[dreamClock(selectedRole)].type'),symbol);
 assert(run('dreamLinkLesson.educational'));assert(!el('dreamLessonCopy').innerHTML.includes('Ton erreur'));assert(!el('workshopBriefDialog').open);assert(!run('running'));
 run('setDreamLessonStep(2)');assert(!el('dreamLessonCopy').innerHTML.includes('Ton erreur'));assert.equal(run('JSON.stringify(fixedRng)'),prefs);tests++;
}
// Specific element and hemisphere are compatible for every role; full-run RNG settings stay intact.
for(const stage of ['read','elements'])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const meteor of ['fire','earth','dark','wind'])for(const north of [true,false]){
 run(`selectedRole='${role}';dreamWorkshopConfig={kind:'${stage}',meteor:'${meteor}',hemisphere:'${north?'north':'south'}'};startDreamTowerPractice(true,'${stage}')`);
 assert.equal(run('dreamTower(selectedRole).type'),meteor);assert.equal(run('dreamTower(selectedRole).y<0'),north);tests++;
}
// All finale combinations use the real movement, stacks, platform and stored-cone checks.
run('dreamWorkshopConfig=null');
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const first of [false,true])for(const absorbed of [false,true])for(const east of [false,true])for(const vertical of [false,true]){
 run(`selectedRole='${role}';partnerRhythm='first';dreamWorkshopConfig={kind:'finale',first:'${first?'cardinal':'intercardinal'}',absorbed:'${absorbed?'north':'south'}',island:'${east?'east':'west'}',axis:'${vertical?'vertical':'horizontal'}'};startDreamTowerPractice(true,'finale')`);
 assert(el('workshopBriefDialog').open);assert(!run('running'));assert(el('workshopBriefCopy').textContent.includes(first?'cardinaux':'intercardinaux'));
 el('startWorkshopBrief').onclick();
 run(`for(let i=0;i<1200&&!dreamTowerPractice.done;i++){advanceToward(player,dreamTarget(selectedRole),DREAM_MOVE_SPEED*.05);var old=time;time+=.05;dreamUpdate(old,.05);}updateUI()`);
 assert(run('dreamTowerPractice.done'));assert(run('dreamTowerPractice.passed'),role+' '+first+' '+absorbed+' '+east+' '+vertical+' '+run('JSON.stringify(dream.failures.filter(f=>f.roles.includes(selectedRole)))'));
 assert(el('dreamTowerResultDialog').open);assert(!el('nextDreamElements').hidden===false);assert(run('dreamTime()>=DREAM.storedFinal&&dreamTime()<DREAM.storedFinal+.1'));
 assert(run('dream.events.some(e=>e.key==="replay1")&&dream.events.some(e=>e.key==="safe")&&dream.events.some(e=>e.key==="replay2")'));
 el('explainTowerResult').onclick();const frozen=run('JSON.stringify({time,dream,player,party,dreamScenario})');
 for(let s=0;s<5;s++){run(`setDreamLessonStep(${s});updateDreamLessonAnimation(dreamLinkLesson.startedAt+12000);render()`);assert.equal(run('dreamLinkLesson.step'),s);}
 assert(canvasText.includes('SECOND STACK · DERNIER CÔNE'));assert.equal(run('JSON.stringify({time,dream,player,party,dreamScenario})'),frozen);tests++;
}
// A final-phase failure offers its own explanation and retry keeps the exact draw.
run("dreamWorkshopConfig=null;selectedRole='MT';stopOnError=true;startDreamTowerPractice(true,'finale')");el('startWorkshopBrief').onclick();
run('time=dreamOffset()+DREAM.replay1-.01;Object.assign(player,dp(0,0));lastFrame=0;tick(50)');
assert(el('errorDialog').open);assert(!el('explainDreamError').hidden);const seed=run('seed');el('explainDreamError').onclick();assert.equal(run('dreamLinkLesson.variant'),'finale');run('setDreamLessonStep(4)');assert(el('dreamLessonCopy').innerHTML.includes('Ton erreur'));el('retryTowerLesson').onclick();assert.equal(run('seed'),seed);assert.equal(run('dreamTowerPractice.stage'),'finale');tests++;
// Standalone chooser launches each lesson or exercise with no failed run required.
for(const stage of ['read','elements','finale'])for(const learn of [true,false]){form(stage);run(`launchDreamWorkshop(${learn})`);if(learn)assert(run('dreamLinkLesson'));else assert(el('workshopBriefDialog').open);tests++;}
// Only one Idyllic restart is visible if the sequence starts at Idyllic.
for(const full of [false,true]){
 run(`dreamWorkshopConfig=null;rangeStart=${full?0:4};rangeEnd=4;applyTrainingRange();stopOnError=true;time=dreamOffset()+DREAM.stored;running=true;dreamError([selectedRole],'Attaque mémorisée : mauvaise zone sûre.');updateUI()`);
 assert(el('errorDialog').open);assert(el('retryMechanic').hidden);assert.equal(el('retryTraining').hidden,!full);assert(!el('restartDreamFromError').hidden);tests++;
}
assert(html.includes('id="workshopsNav"'));assert(html.includes('id="prepareWorkshops"'));assert(!html.includes('dreamWorkshopBar'));
console.log('Passed '+tests+' workshop selection, configuration, finale and restart checks.');
