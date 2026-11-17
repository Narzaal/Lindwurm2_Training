const assert=require('assert');const {create}=require('./trainer-harness.cjs');const {run,el}=create();el('confirmPreparation').onclick();let tests=0;
run('var floorDraws=[];var drawnActors=[];var savedFloor=drawDreamArenaFloor,savedPlatforms=drawDreamPlatforms,savedDot=playerDot;drawDreamArenaFloor=blue=>floorDraws.push(blue?"blue":"red");drawDreamPlatforms=()=>floorDraws.push("platforms");playerDot=(p)=>drawnActors.push({...p});');
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(const first of [false,true])for(const east of [false,true])for(const vertical of [false,true]){
 run(`selectedRole='${role}';startDreamTowerPractice(true,'finale');dreamScenario.cardinalFirst=${first};dreamScenario.coneEast=${east};dreamScenario.verticalNorth=${vertical};openDreamTowerLesson();setDreamLessonStep(3);`);
 const split=run('dreamFinaleSplitAt(dreamLinkLesson)');assert(split>1.25&&split<16);
 const state=run('JSON.stringify({time,dream,dreamScenario,player,party})');
 for(const at of [0,1.3,split-.001,split,split+.5]){
  run(`dreamLinkLesson.elapsed=${at};floorDraws=[];drawnActors=[];drawDreamFinaleLesson()`);
  assert.equal(run('floorDraws[0]'),at<split?'blue':'platforms');
  if(at>=split)assert(run('drawnActors.every(p=>dist(p,dreamFinaleSafe(dreamLinkLesson,p.role))<.001)'));
 }
 assert.equal(run('JSON.stringify({time,dream,dreamScenario,player,party})'),state);tests++;
}
// Group members start 0.25 s after the player, at normal speed; final dodge has the same stagger.
for(const step of [2,3,4]){
 run(`setDreamLessonStep(${step});dreamLinkLesson.elapsed=1.3;drawnActors=[];drawDreamFinaleLesson()`);
 assert(run(`drawnActors.every(p=>{const route=dreamFinaleRoute(dreamLinkLesson,p.role,${step}),travel=Math.min(dist(route.start,route.end),(p.role===selectedRole?.3:.05)*PLAYER_MOVE_SPEED);return Math.abs(dist(p,route.start)-travel)<.00001;})`));tests++;
}
run('drawDreamArenaFloor=savedFloor;drawDreamPlatforms=savedPlatforms;playerDot=savedDot');
console.log('Passed '+tests+' finale animation checks.');
