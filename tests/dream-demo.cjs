const assert=require('assert'),{create}=require('./trainer-harness.cjs');const {run,el,canvasText}=create();el('confirmPreparation').onclick();let checks=0;
for(const kind of ['links','read','pairs','elements','finale']){
 el('workshopKind').value=kind;el('workshopRole').value='MT';el('workshopDraw').value='random';run('launchDreamWorkshop(true);setDreamLessonStep(99)');
 assert.equal(el('dreamLessonTitle').textContent,'Démonstration');assert(el('dreamLessonNext').hidden);assert(!el('dreamLessonActions').hidden);
 const before=run('JSON.stringify({time,dream,player,party,dreamScenario,seed})');
 for(const seconds of [0,1,3,5,7,10,13,17,22,28,33,39,44,70]){
  run(`updateDreamLessonAnimation(dreamLinkLesson.startedAt+${seconds*1000});render()`);
  assert.equal(el('dreamLessonTitle').textContent,'Démonstration');checks++;
 }
 assert.equal(run('JSON.stringify({time,dream,player,party,dreamScenario,seed})'),before);
 el('repeatDreamLesson').onclick();assert.equal(el('dreamLessonTitle').textContent,'Démonstration');assert.equal(run('dreamLinkLesson.elapsed'),0);
 el('dreamLessonPrevious').onclick();assert.equal(el('dreamLessonNext').textContent,'Démonstration →');checks++;
}
// Four chronological waves, actual alternating types, no teleport and manual movement speed.
for(const clock of [0,1,2,3,4,5,6,7])for(const first of ['stack','defam']){
 run(`selectedRole='MT';dreamWorkshopConfig={kind:'pairs',clock:'${clock}',pairFirst:'${first}'};startDreamTowerPractice(true,'pairs');openDreamTowerLesson(dreamTowerContext(null,'pairs'));setDreamLessonStep(4)`);
 const before=run('JSON.stringify({time,dream,player,party,dreamScenario})');
 let previous=null;
 for(let i=0;i<540;i++){
  const frame=run(`dreamPairDemoFrame(dreamLinkLesson,${i*.05})`);
  if(previous)for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])assert(Math.hypot(frame.positions[role].x-previous.positions[role].x,frame.positions[role].y-previous.positions[role].y)<=run('DREAM_MOVE_SPEED')*.05+1e-7);
  previous=frame;
 }
 for(let wave=0;wave<4;wave++){
  assert.equal(run(`dreamPairDemoFrame(dreamLinkLesson,dreamPairDemoFrame(dreamLinkLesson,0).at[${wave}]).wave`),wave);
  assert(run(`roles.every(r=>dist(dreamPairDemoFrame(dreamLinkLesson,dreamPairDemoFrame(dreamLinkLesson,0).at[${wave}]).positions[r],dreamPairsTarget(dreamLinkLesson,r,${wave}))<.001)`));
 }
 assert.equal(run('JSON.stringify({time,dream,player,party,dreamScenario})'),before);checks++;
}
console.log('Passed '+checks+' demonstration rendering / sequence / movement checks.');
