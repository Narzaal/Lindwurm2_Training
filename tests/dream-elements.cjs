const assert=require('assert');
const {create,html}=require('./trainer-harness.cjs');
const {run,el,canvasText}=create();el('confirmPreparation').onclick();let tests=0;
assert(!html.includes('dreamWorkshopBar'));
function advance(){run(`lastFrame=0;for(let i=1;running&&i<600;i++){
 const jump=dream.jumps[selectedRole];if(!(jump&&time<jump.end))advanceToward(player,dreamTarget(selectedRole),DREAM_MOVE_SPEED*.05);
 tick(i*50);
}`);}
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const type of ['fire','earth','dark','wind'])for(const rhythm of ['first','live']){
 run(`rangeStart=rangeEnd=4;selectedRole='${role}';fixedRng.meteor='${type}';partnerRhythm='${rhythm}';guide=false;stopOnError=false;startDreamTowerPractice(true,'elements')`);
 assert(Math.abs(run('dreamTime()')-130.5)<.001);assert.equal(run('dreamTower(selectedRole).type'),type);
 assert(run('dist(player,dreamTower(selectedRole))<.001'));const seed=run('seed'),scenario=run('JSON.stringify(dreamScenario)');
 advance();
 assert(!el('errorDialog').open,role+' '+type+' '+rhythm+' '+el('errorMessage').textContent);
 assert(el('dreamTowerResultDialog').open);assert(run('dreamTowerPractice.passed'));assert(!run('running'));
 assert(run('dreamTime()>=DREAM.baits&&dreamTime()<DREAM.baits+.1'));
 assert.equal(run('dream.towerRoles[selectedRole]'),type);assert(run('dream.events.some(e=>e.key==="earth")'));
 if(type==='wind')assert(run('dream.jumps[selectedRole].landed'));
 el('explainTowerResult').onclick();assert.equal(run('dreamLinkLesson.variant'),'elements');
 const before=run('JSON.stringify({time,dream,dreamScenario,player,party,history})');
 for(let s=0;s<3;s++){run(`setDreamLessonStep(${s});updateDreamLessonAnimation(dreamLinkLesson.startedAt+11000);render()`);assert(el('dreamLessonCopy').innerHTML.length>100);}
 assert(canvasText.includes('TERRE PROCHE · FEU LOIN'));assert.equal(run('JSON.stringify({time,dream,dreamScenario,player,party,history})'),before);
 el('retryTowerLesson').onclick();assert.equal(run('seed'),seed);assert.equal(run('JSON.stringify(dreamScenario)'),scenario);assert.equal(run('dreamTowerPractice.stage'),'elements');
 el('shuffle').onclick();assert.equal(run('dreamTowerPractice.stage'),'elements');assert.notEqual(run('seed'),seed);tests++;
}
// Actual combat failures route to the corresponding explanation and preserve the failed draw.
for(const failure of ['wind','dark','fire','earth','bait']){
 run(`selectedRole='MT';fixedRng.meteor='${failure==='bait'?'earth':failure}';startDreamTowerPractice(true,'elements')`);
 if(['wind','dark'].includes(failure))run('time=dreamOffset()+DREAM.towers-.01;Object.assign(player,dreamTower(selectedRole));lastFrame=0;tick(50)');
 if(failure==='fire'){run('Object.assign(player,dreamTowerTarget(selectedRole));time=dreamOffset()+DREAM.towers-.01;lastFrame=0;tick(50);player.x+=10;tick(100);time=dreamOffset()+DREAM.earth-.01;tick(150)');}
 if(failure==='earth')run('Object.assign(player,dreamTowerTarget(selectedRole));time=dreamOffset()+DREAM.towers-.01;lastFrame=0;tick(50);time=dreamOffset()+DREAM.earth-.01;tick(100)');
 if(failure==='bait')run('time=dreamOffset()+DREAM.baits-.01;for(const r of roles){dream.towerRoles[r]=dreamTower(r).type;Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamBaitTarget(r));}Object.assign(player,dp(dreamWest(selectedRole)?-20:20,6));lastFrame=0;tick(50)');
 assert(el('errorDialog').open,failure+' '+el('errorMessage').textContent);assert(!el('explainDreamError').hidden,failure);
 const seed=run('seed');el('explainDreamError').onclick();assert.equal(run('dreamLinkLesson.variant'),'elements',failure);
 run('setDreamLessonStep(2)');assert(el('dreamLessonCopy').innerHTML.includes('Ton erreur'));el('retryTowerLesson').onclick();assert.equal(run('seed'),seed);assert.equal(run('dreamTowerPractice.stage'),'elements');tests++;
}
// The next atelier is offered inside the successful return result, never in a permanent banner.
run("startDreamTowerPractice(true,'return');time=dreamOffset()+DREAM.towers-.01;for(const r of roles)Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamTowerTarget(r));lastFrame=0;tick(50)");
assert(!el('nextDreamElements').hidden);el('nextDreamElements').onclick();assert.equal(run('dreamLinkLesson.variant'),'elements');tests++;
// Element errors in full Idyllic Dream also expose the lesson, without an active workshop.
run("rangeStart=rangeEnd=4;fixedRng.meteor='wind';stopOnError=true;reset(true);time=dreamOffset()+DREAM.towers-.01;for(const r of roles)Object.assign(r===selectedRole?player:party.find(p=>p.role===r),dreamTowerTarget(r));Object.assign(player,dreamTower(selectedRole));running=true;lastFrame=0;tick(50)");
assert(!run('dreamTowerPractice'));assert(el('errorDialog').open);el('explainDreamError').onclick();assert.equal(run('dreamLinkLesson.variant'),'elements');tests++;
console.log('Passed '+tests+' element lesson and practice checks.');
