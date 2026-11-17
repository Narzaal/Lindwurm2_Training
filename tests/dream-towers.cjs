const assert=require('assert');
const {create,html}=require('./trainer-harness.cjs');
assert(!html.includes('dreamWorkshopBar'));
assert(!html.includes('explainDreamTowers'));
assert(!html.includes('practiceDreamTowers'));
const {run,el,canvasText}=create();el('confirmPreparation').onclick();let tests=0;
function advanceCorrect(){run('lastFrame=0;for(let i=1;running&&i<700;i++){Object.assign(player,dreamTarget(selectedRole));tick(i*50)}');}
// Every role, element and partner rhythm can read all clues and complete both bounded stages.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const meteor of ['fire','earth','dark','wind'])for(const rhythm of ['first','live']){
 run(`selectedRole='${role}';partnerRhythm='${rhythm}';fixedRng.meteor='${meteor}';guide=false;stopOnError=false;startDreamTowerPractice(true)`);
 assert(run('running'));assert.equal(run('dreamTime()'),77.19999999999999);

 assert.equal(run('dreamTower(selectedRole).type'),meteor);

 const seed=run('seed'),scenario=run('JSON.stringify(dreamScenario)'),prefs=run('JSON.stringify(fixedRng)');
 run('time=dreamOffset()+DREAM.arcanum+.01;updateUI()');
 // Restart so the spread, platform check and clue timings are actually simulated.
 run("startDreamTowerPractice(false)");advanceCorrect();
 assert(el('dreamTowerResultDialog').open,role+' '+meteor+' '+rhythm);assert(run('dreamTowerPractice.passed'));assert(!run('running'));
 assert(run('dreamTime()>=DREAM_TOWER_CHOICE&&dreamTime()<DREAM.red2'));assert(!run("dream.events.some(e=>e.key.startsWith('pair'))"));
 el('returnDreamTowers').onclick();assert.equal(run('seed'),seed);assert.equal(run('JSON.stringify(dreamScenario)'),scenario);assert.equal(run('JSON.stringify(fixedRng)'),prefs);
 assert(Math.abs(run('dreamTime()')-126.1)<.001);
 advanceCorrect();assert(el('dreamTowerResultDialog').open);assert(run('dreamTowerPractice.passed'));assert(run('dreamTime()>=DREAM.towers&&dreamTime()<DREAM.towers+.1'));
 assert(!run("dream.events.some(e=>['earth','baits'].includes(e.key))"));assert.equal(run('dream.towerRoles[selectedRole]'),meteor);tests++;
}
// Wrong platform, clipped spread and wrong tower stop the workshop even with stop-on-error off.
for(const mistake of ['platform','spread','tower','return']){
 run("selectedRole='MT';fixedRng.meteor='auto';stopOnError=false;startDreamTowerPractice(true)");
 if(mistake==='return'){advanceCorrect();el('returnDreamTowers').onclick();}
 run(`time=dreamOffset()+${mistake==='platform'?'DREAM.islands1':mistake==='spread'?'DREAM.arcanum':mistake==='return'?'DREAM.towers':'DREAM_TOWER_CHOICE'}-.01;for(const r of roles)Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamTarget(r));`);
 if(mistake==='platform')run('Object.assign(player,dp(14,0))');
 else if(mistake==='spread')run("Object.assign(player,actor(roles.find(r=>r!==selectedRole&&dreamLightVuln(r))))");
 else run('Object.assign(player,dreamTowerPositions().find(t=>t.side===dreamTower(selectedRole).side&&t.id!==dreamTower(selectedRole).id))');
 run('lastFrame=0;tick(50)');assert(el('errorDialog').open,mistake);assert(!el('explainDreamError').hidden);assert(!run('running'));
 const before=run('JSON.stringify({time,player,party,dream,dreamScenario})'),seed=run('seed');
 el('explainDreamError').onclick();assert.equal(run('dreamLinkLesson.kind'),'towers');assert(!el('dreamLessonDialog').hidden);
 assert(el('dreamLessonCopy').innerHTML.includes('groupe 1'));for(let i=0;i<3;i++)el('dreamLessonNext').onclick();
 assert(el('dreamLessonCopy').innerHTML.includes('Ton erreur'));assert(canvasText.includes('TON PLACEMENT'));
 run('tick(9000);play()');assert(!run('running'));assert.equal(run('JSON.stringify({time,player,party,dream,dreamScenario})'),before);
 el('retryTowerLesson').onclick();assert(run('running'));assert.equal(run('seed'),seed);assert.equal(run('dreamTowerPractice.stage'),mistake==='return'?'return':'read');tests++;
}
// Reading the lesson and retrying never leaks into the link lesson controls or loses the full range.
run('rangeStart=2;rangeEnd=5;applyTrainingRange();openDreamTowerLesson();setDreamLessonStep(3)');
const tutorialSeed=run('seed');el('retryTowerLesson').onclick();assert.equal(run('seed'),tutorialSeed);assert.equal(run('dreamTowerPractice.origin.rangeStart'),2);assert.equal(run('dreamTowerPractice.origin.rangeEnd'),5);
run('exitDreamTowerWorkshop()');assert(!run('dreamTowerPractice'));assert.equal(run('rangeStart'),4);assert.equal(run('rangeEnd'),4);assert(run('running'));assert.equal(run('time'),run('dreamOffset()'));tests++;
// Same draw / new draw controls stay in the workshop on desktop and mobile.
run('rangeStart=rangeEnd=4;applyTrainingRange();startDreamTowerPractice(true)');const repeatSeed=run('seed');el('restartBtn').onclick();assert.equal(run('seed'),repeatSeed);assert(run('dreamTowerPractice'));
el('mobileShuffle').onclick();assert.notEqual(run('seed'),repeatSeed);assert(run('dreamTowerPractice'));tests++;
// Snapshot recovery restores the workshop endpoint state too.
run("Object.assign(player,dreamTarget(selectedRole));var h=history[0];dreamTowerPractice.done=true;restoreTrainingSnapshot(h)");assert(!run('dreamTowerPractice.done'));tests++;
// Role groups in cloned stack errors stay independent from personal-clone groups.
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 run(`selectedRole='${role}';reset(true);time=dreamOffset()+DREAM.replay1;for(const r of roles){const target=dreamTarget(r);Object.assign(r===selectedRole?player:party.find(p=>p.role===r),{x:target.x,y:target.y});}Object.assign(player,dp(0,0));dreamResolveReplay(1)`);
 const errors=run('dream.failures.filter(f=>f.roles.includes(selectedRole)).map(f=>f.message).join(" ")');assert(errors.includes('Stack cloné · groupe '+run('dreamRoleGroup(selectedRole)')));assert(!errors.includes('groupe A'));assert(!errors.includes('groupe B'));tests++;
}
for(let clock=0;clock<8;clock++){run(`dreamScenario.clocks[roles.indexOf(selectedRole)]=${clock}`);assert.equal(run('dreamGroup(selectedRole)'),clock<4?1:0);tests++;}
// Early rewind without a checkpoint stays in the bounded exercise.
run("rangeStart=rangeEnd=4;selectedRole='MT';startDreamTowerPractice(true);time=dreamOffset()+DREAM.islands1-.01;Object.assign(player,dp(14,0));lastFrame=0;tick(50)");
assert(el('errorDialog').open);el('rewindTraining').onclick();assert(run('dreamTowerPractice'));assert(Math.abs(run('dreamTime()')-77.2)<.001);tests++;
// Continuing an early mistake stays in this bounded exercise.
run("time=dreamOffset()+DREAM.islands1-.01;Object.assign(player,dp(14,0));lastFrame=0;tick(50)");el('continueTraining').onclick();
assert(run('dreamTowerPractice'));assert(run('running'));tests++;
console.log('Passed '+tests+' tower workshop checks.');
