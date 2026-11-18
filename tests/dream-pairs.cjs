const assert=require('assert');const {create,html}=require('./trainer-harness.cjs');const {run,el,canvasText}=create();el('confirmPreparation').onclick();let tests=0;
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(let clock=0;clock<8;clock++)for(const first of ['defam','stack'])for(const rhythm of ['first','live']){
 run(`selectedRole='${role}';partnerRhythm='${rhythm}';stopOnError=false;dreamWorkshopConfig={kind:'pairs',clock:'${clock}',pairFirst:'${first}'};startDreamTowerPractice(true,'pairs')`);
 assert.equal(run('dreamClock(selectedRole)'),clock);assert.equal(run('dream.sources[0].type'),first);assert(el('workshopBriefDialog').open);assert(el('workshopBriefCopy').textContent.includes('Ordre des vagues'));
 const seed=run('seed'),scenario=run('JSON.stringify(dreamScenario)');el('startWorkshopBrief').onclick();
 run('for(let i=0;i<700&&!dreamTowerPractice.done;i++){advanceToward(player,dreamTarget(selectedRole),DREAM_MOVE_SPEED*.05);var old=time;time+=.05;dreamUpdate(old,.05);}updateUI()');
 assert(run('dreamTowerPractice.done'));assert(run('dreamTowerPractice.passed'),role+' '+clock+' '+first+' '+rhythm+' '+run('JSON.stringify(dream.failures)'));
 assert.equal(run('dream.events.filter(e=>e.key.startsWith("pair")).length'),4);assert(!run('dream.events.some(e=>e.key==="towers")'));assert(el('dreamTowerResultDialog').open);
 el('explainTowerResult').onclick();assert.equal(run('dreamLinkLesson.variant'),'pairs');const state=run('JSON.stringify({time,dream,player,party,dreamScenario})');
 for(let s=0;s<4;s++){run(`setDreamLessonStep(${s});updateDreamLessonAnimation(dreamLinkLesson.startedAt+6500);render()`);assert.equal(run('dreamLinkLesson.step'),s);if(s===1){assert(el('dreamLessonCopy').innerHTML.includes('À cette position, le plan indique'));assert(!el('dreamLessonCopy').innerHTML.includes('depuis'));}}
 assert(canvasText.includes('QUATRE JOUEURS PAR STACK'));assert.equal(run('JSON.stringify({time,dream,player,party,dreamScenario})'),state);
 el('retryTowerLesson').onclick();assert.equal(run('seed'),seed);assert.equal(run('JSON.stringify(dreamScenario)'),scenario);assert.equal(run('dreamTowerPractice.stage'),'pairs');tests++;
}
// Live targets and lesson targets share the same west/east stack positions for every clone.
for(let clock=0;clock<8;clock++){
 run(`selectedRole='MT';dreamWorkshopConfig={kind:'pairs',clock:'${clock}',pairFirst:'stack'};startDreamTowerPractice(true,'pairs');time=dreamOffset()+DREAM.pair0-.1;var c=dreamTowerContext(null,'pairs')`);
 assert(run('Math.abs(dreamTarget(selectedRole).y)<DS'));assert.equal(run('dreamTarget(selectedRole).x>0'),clock<4);
 assert(run('dist(dreamTarget(selectedRole),dreamPairsTarget(c,selectedRole,0))<.001'));tests++;
}
// Missed / wrong stack and someone else's defamation all expose this lesson in normal runs and exercises.
for(const practice of [false,true])for(const failure of ['stack','wrongStack','defam']){
 run(`selectedRole='MT';stopOnError=true;dreamWorkshopConfig={kind:'pairs',clock:'0',pairFirst:'defam'};startDreamTowerPractice(true,'pairs');`);el('startWorkshopBrief').onclick();
 run(`if(!${practice})dreamTowerPractice=null;var wave=${failure==='defam'?0:1};time=dreamOffset()+dreamPairAt(wave)-.01;for(const role of roles)Object.assign(role===selectedRole?player:party.find(p=>p.role===role),dreamTarget(role));`);
 if(failure==='stack')run('Object.assign(player,dp(0,0))');
 if(failure==='wrongStack')run('player.x=-player.x');
 if(failure==='defam')run('Object.assign(player,dreamTarget(roles.find(r=>r!==selectedRole&&dreamGroup(r)!==dreamGroup(selectedRole)&&dreamOwn(r)[0].id%4===0)))');
 run('lastFrame=0;tick(50)');assert(el('errorDialog').open,failure);assert(!el('explainDreamError').hidden);el('explainDreamError').onclick();assert.equal(run('dreamLinkLesson.variant'),'pairs');run('setDreamLessonStep(3)');assert(el('dreamLessonCopy').innerHTML.includes('Ton erreur'));tests++;
}
// The chooser follows the encounter order and all standalone launch paths work.
assert.deepEqual(run('Object.keys(DREAM_WORKSHOPS)').join(','),'links,read,pairs,elements,finale');
const order=[...html.matchAll(/<option value="(links|read|pairs|elements|finale)">/g)].map(m=>m[1]);assert.deepEqual(order,['links','read','pairs','elements','finale']);
for(const learn of [true,false]){
 el('workshopKind').value='pairs';el('workshopRole').value='MT';el('workshopDraw').value='specific';el('workshopPairClock').value='5';el('workshopPairFirst').value='stack';
 run(`launchDreamWorkshop(${learn})`);assert.equal(run('dreamClock(selectedRole)'),5);assert.equal(run('dream.sources[0].type'),'stack');if(learn)assert.equal(run('dreamLinkLesson.variant'),'pairs');else assert(el('workshopBriefDialog').open);tests++;
}
console.log('Passed '+tests+' defamation / stack practice and explanation checks.');
