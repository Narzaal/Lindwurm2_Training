const assert=require('assert'),{create}=require('./trainer-harness.cjs');const {run,el,canvasText}=create();el('confirmPreparation').onclick();let n=0;
for(const kind of ['links','read','pairs','elements','finale']){
 el('workshopKind').value=kind;el('workshopRole').value='MT';el('workshopDraw').value='random';run('launchDreamWorkshop(true)');
 const max=run('dreamLessonDemoStep(dreamLinkLesson)');
 for(let step=0;step<=max;step++){
  run(`setDreamLessonStep(${step})`);el('configureDreamLesson').onclick();
  assert.equal(el('workshopPickerTitle').textContent,'Configurer cette étape');assert(el('workshopKind').hidden);assert(el('workshopDraw').hidden);
  const fields=run(`dreamWorkshopStepFields('${kind}',${step})`);
  if(fields)for(const field of fields)assert(!el(field).hidden,kind+' / '+step+' / '+field);
  el('closeWorkshops').onclick();n++;
 }
 run('setDreamLessonStep(99)');const before=run('JSON.stringify({time,dream,dreamScenario,party,player})');
 canvasText.length=0;run('dreamLinkLesson.elapsed=1.75;render()');const first=[...canvasText];
 canvasText.length=0;run('dreamLinkLesson.elapsed=dreamDemoDuration(dreamLinkLesson)+1.75;render()');assert.deepEqual(canvasText,first,kind+' restarts demo');
 assert.equal(run('JSON.stringify({time,dream,dreamScenario,party,player})'),before);n++;
 run('openDreamWorkshops()');assert(!el('workshopKind').hidden);assert(!el('workshopDraw').hidden);el('closeWorkshops').onclick();
}
for(let clock=0;clock<8;clock++)for(const first of ['defam','stack']){
 run(`dreamWorkshopConfig={kind:'pairs',clock:'${clock}',pairFirst:'${first}'};startDreamTowerPractice(true,'pairs');openDreamTowerLesson(dreamTowerContext(null,'pairs'));var splitCalls=0,originalSplit=drawDreamGroupHalves;drawDreamGroupHalves=()=>splitCalls++`);
 for(let step=0;step<5;step++){run(`splitCalls=0;setDreamLessonStep(${step})`);assert.equal(run('splitCalls'),step===1?1:0);}
 run('drawDreamGroupHalves=originalSplit;setDreamLessonStep(2)');
 const label=run("(DREAM_PICKUPS[dreamLinkLesson.clock][1]%2+1)+(dreamLinkLesson.clock<4?'B':'A')");
 for(const wave of [0,1,2,3]){
  canvasText.length=0;run(`dreamLinkLesson.elapsed=dreamPairDemoFrame(dreamLinkLesson,0).at[${wave}];render()`);assert(canvasText.includes(label));
 }
 n++;
}
console.log('Passed '+n+' scoped configuration, repeat animation and clone group marker checks.');
