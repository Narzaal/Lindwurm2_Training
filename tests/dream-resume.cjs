const assert=require('assert');
const {create,html}=require('./trainer-harness.cjs');const {run,el}=create();el('confirmPreparation').onclick();let tests=0;
for(const stage of ['read','return','elements','finale']){
 run(`selectedRole='MT';fixedRng.dream='0';startDreamTowerPractice(true,'${stage}');openDreamTowerLesson();setDreamLessonStep(dreamLinkLesson.variant==='finale'?4:dreamLinkLesson.variant==='elements'?2:3)`);
 const draw=run('JSON.stringify(dreamScenario)'),seed=run('seed');el('restartLessonTraining').onclick();
 assert.equal(run('rangeStart'),4);assert.equal(run('rangeEnd'),4);assert.equal(run('time'),run('dreamOffset()'));assert.equal(run('JSON.stringify(dreamScenario)'),draw);assert.equal(run('seed'),seed);assert(run('running'));assert(!run('dreamTowerPractice||dreamLinkPractice||dreamLinkLesson'));tests++;
}
run("startDreamLinkPractice()");const draw=run('JSON.stringify(dreamScenario)');el('restartPracticeTraining').onclick();assert.equal(run('JSON.stringify(dreamScenario)'),draw);assert.equal(run('time'),run('dreamOffset()'));tests++;
assert(!html.includes('Continuer Idyllic Dream'));assert(!html.includes('dreamResumeDialog'));assert(!html.includes('Quitter l’atelier'));
console.log('Passed '+tests+' workshop restart checks.');
