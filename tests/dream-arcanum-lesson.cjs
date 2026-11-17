const assert=require('assert'),{create}=require('./trainer-harness.cjs');const {run,el,canvasText}=create();el('confirmPreparation').onclick();let count=0;
for(const supports of [true,false])for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2']){
 run(`selectedRole='${role}';startDreamTowerPractice(true,'read');dreamScenario.lightSupports=${supports};dreamReset();dreamEnter();openDreamTowerLesson(dreamTowerContext());setDreamLessonStep(1)`);
 const snapshot=run('JSON.stringify({dreamScenario,dream,player,party,time})');
 assert.equal(run('dreamLessonArcanumFrame(dreamLinkLesson,3).targets.join()'),run('roles.filter(dreamLightVuln).join()'));
 for(const [time,phase] of [[0,'waiting'],[2,'telegraph'],[4.2,'impact'],[6,'debuff']]){
  run('var originalCircle=circle,aoes=[];circle=(x,y,r,...rest)=>{if(r===6*DS)aoes.push({x,y});originalCircle(x,y,r,...rest)}');canvasText.length=0;
  run(`dreamLinkLesson.elapsed=${time};drawDreamLessonArcanum(dreamLinkLesson,${time},Object.fromEntries(roles.map(role=>[role,dreamLinkLesson.towers[dreamPreTower(role)]])));circle=originalCircle`);
  assert.equal(run(`dreamLessonArcanumFrame(dreamLinkLesson,${time}).phase`),phase);
  assert.equal(run('aoes.length'),phase==='telegraph'||phase==='impact'?4:0);
  assert.equal(canvasText.filter(x=>x==='✦').length,phase==='debuff'?4:0);
  assert.equal(canvasText.includes('VULNÉRABILITÉ LUMIÈRE'),phase==='debuff'&&run('dreamLightVuln(selectedRole)'));run('render()');
 }
 assert.equal(run('JSON.stringify({dreamScenario,dream,player,party,time})'),snapshot);count++;
}
console.log('Passed '+count+' Arcadian Arcanum lesson target / AoE / debuff sequence checks.');
