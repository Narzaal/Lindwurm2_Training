const assert=require('assert');
const {create}=require('./trainer-harness.cjs');
const {run,el}=create();el('confirmPreparation').onclick();let checks=0;
const cases={links:16,read:64,pairs:16,elements:64,finale:128};
for(const [kind,count] of Object.entries(cases)){
 el('workshopKind').value=kind;el('workshopRole').value='MT';el('workshopDraw').value='random';run('launchDreamWorkshop(true);setDreamLessonStep(1)');
 const seen=new Set(),prefs=run('JSON.stringify(fixedRng)');
 for(let i=0;i<count;i++){
  const key=run(`JSON.stringify(dreamLessonKind()==='links'||dreamLessonKind()==='pairs'?[dreamLinkLesson.clock,dreamLinkLesson.sources[0].type]:dreamLessonKind()==='finale'?[dreamLinkLesson.role,dreamLinkLesson.scenario.cardinalFirst,dreamLinkLesson.scenario.absorbedNorth,dreamLinkLesson.scenario.coneEast,dreamLinkLesson.scenario.verticalNorth]:[dreamLinkLesson.role,dreamLinkLesson.target.type,dreamLinkLesson.target.y<0])`);
  assert(!seen.has(key),kind+' repeats before all alternatives are covered');seen.add(key);
  assert.equal(run('dreamLinkLesson.step'),1);assert.equal(run('dreamLessonKind()'),kind);assert(!run('running'));
  assert.equal(run('JSON.stringify(fixedRng)'),prefs);
  const live=run('JSON.stringify({time,dreamScenario,dream,player,party})');
  const max=kind==='links'||kind==='elements'?2:kind==='finale'?4:3;
  for(let step=0;step<=max;step++){
   run(`setDreamLessonStep(${step});updateDreamLessonAnimation(6500);render()`);
   const copy=el('dreamLessonCopy').innerHTML;assert(copy.includes('La règle'));assert(copy.includes('Dans cet exemple'));assert(!copy.includes('Ton erreur'));assert(!/undefined|NaN/.test(copy));
  }
  assert.equal(run('JSON.stringify({time,dreamScenario,dream,player,party})'),live,'illustrations do not advance combat');
  const example=run('JSON.stringify(dreamLinkLesson.scenario)'),seed=run('dreamLinkLesson.seed');
  el('retryTowerLesson').onclick();assert.equal(run('JSON.stringify(dreamScenario)'),example);assert.equal(run('seed'),seed);
  if(kind==='links')run('openDreamLinkLesson(dreamCurrentLinkContext(true))');else run(`openDreamTowerLesson(dreamTowerContext(null,${kind==='read'?'null':JSON.stringify(kind)}))`);
  run('setDreamLessonStep(1)');el('nextDreamExample').onclick();checks++;
 }
 assert.equal(seen.size,count);
}
// The user's example: clone 2, second defamation, east stacks / northeast defams,
// regardless of which mechanic begins the four waves.
for(const first of ['defam','stack']){
 run(`selectedRole='MT';dreamWorkshopConfig={kind:'pairs',clock:'3',pairFirst:'${first}'};startDreamTowerPractice(true,'pairs');openDreamTowerLesson(dreamTowerContext(null,'pairs'));setDreamLessonStep(1)`);
 const copy=el('dreamLessonCopy').innerHTML;assert(copy.includes('deuxième défamation'));assert(copy.includes('groupe B'));assert(copy.includes('nord-est'));assert(copy.includes('l’est'));checks++;
}
// Choosing an example pre-fills the current case; cancelling keeps the illustration.
run('setDreamLessonStep(2)');const example=run('JSON.stringify(dreamLinkLesson)');el('configureDreamLesson').onclick();assert.equal(el('workshopPairClock').value,'3');el('closeWorkshops').onclick();assert.equal(run('JSON.stringify(dreamLinkLesson)'),example);checks++;
console.log('Passed '+checks+' general teaching / variant coverage / same-example practice checks.');
