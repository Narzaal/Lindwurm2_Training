'use strict';
let dreamWorkshopConfig=null,workshopWasRunning=false,workshopLessonFilter=null;
const DREAM_WORKSHOPS={links:'Liens de clones',read:'Plateformes et choix de tour',pairs:'Défamations et stacks',elements:'Effets des tours et baits',finale:'Portail et reconstitutions'};
function firstDreamWorkshopStage(stage){return ['pairs','elements','finale'].includes(stage)?stage:'read';}
function openDreamWorkshops(){
 workshopLessonFilter=null;
 workshopWasRunning=running;running=false;keys.clear();resetStick();
 $('workshopRole').value=selectedRole;updateDreamWorkshopForm();$('dreamWorkshopDialog').showModal();updateUI();
}
function closeDreamWorkshops(){ $('dreamWorkshopDialog').close();if(dreamLinkLesson){renderDreamLinkLesson();render();}if(workshopWasRunning&&!document.querySelector('dialog[open]')&&!dreamLinkLesson)play(); }
function updateDreamWorkshopForm(){
 const kind=$('workshopKind').value||'links',specific=$('workshopDraw').value==='specific';
 $('workshopConfig').hidden=!specific;$('workshopLinks').hidden=kind!=='links';$('workshopTowers').hidden=!['read','elements'].includes(kind);$('workshopFinale').hidden=kind!=='finale';$('workshopPairs').hidden=kind!=='pairs';
 $('workshopDescription').textContent={links:'Prendre le bon lien au contact, puis le conserver jusqu’au verrouillage.',read:'Lire sa tour, puis la retrouver au retour des plateformes.',pairs:'Résoudre les quatre vagues de mécaniques : s’isoler pour sa défamation et rejoindre le bon stack.',elements:'Orienter vent et ténèbres, résoudre feu et terre, puis placer proche / loin.',finale:'Lire le portail et les cônes, rejoindre les deux stacks et éviter le dernier clone.'}[kind];
 filterDreamWorkshopFields();
}
function readDreamWorkshopConfig(){
 const kind=$('workshopKind').value,specific=$('workshopDraw').value==='specific';
 return {kind,clock:specific?$(kind==='pairs'?'workshopPairClock':'workshopClock').value:'auto',pairFirst:specific?$('workshopPairFirst').value:'auto',symbol:specific?$('workshopSymbol').value:'auto',meteor:specific?$('workshopMeteor').value:'auto',hemisphere:specific?$('workshopHemisphere').value:'auto',first:specific?$('workshopFirst').value:'auto',absorbed:specific?$('workshopAbsorbed').value:'auto',island:specific?$('workshopIsland').value:'auto',axis:specific?$('workshopAxis').value:'auto'};
}
function applyDreamWorkshopConfig(kind){
 const c=dreamWorkshopConfig;if(!c||c.kind!==kind)return;
 if(['links','pairs'].includes(kind)){
  constrainClock(dreamScenario.clocks,roles.indexOf(selectedRole),c.clock);
  if(kind==='pairs'&&c.pairFirst!=='auto')dreamScenario.cardinalDefam=c.pairFirst==='defam';
  if(kind==='links'&&c.symbol!=='auto')dreamScenario.cardinalDefam=(dreamClock(selectedRole)%2===0)===(c.symbol==='defam');
 }
 if(['read','elements'].includes(kind)){
  if(c.meteor!=='auto')dreamScenario.lightSupports=(kindOfWorkshopRole()!=='dps')===['fire','earth'].includes(c.meteor);
  const side=dreamWest(selectedRole)?0:1,original=[...dreamScenario.layouts[side]];let found=false;
  for(let rotation=0;rotation<4&&!found;rotation++)for(const swap of [false,true]){
   dreamScenario.layouts[side]=original.map((_,i)=>{const type=original[(i+rotation)%4];return swap?(type==='fire'?'earth':type==='earth'?'fire':type):type;});
   const tower=dreamTower(selectedRole);
   if((c.meteor==='auto'||tower.type===c.meteor)&&(c.hemisphere==='auto'||(tower.y<0)===(c.hemisphere==='north'))){found=true;break;}
  }
 }
 if(kind==='finale'){
  if(c.first!=='auto')dreamScenario.cardinalFirst=c.first==='cardinal';
  if(c.absorbed!=='auto')dreamScenario.absorbedNorth=c.absorbed==='north';
  if(c.island!=='auto')dreamScenario.coneEast=c.island==='east';
  if(c.axis!=='auto')dreamScenario.verticalNorth=(c.axis==='vertical')!==dreamScenario.absorbedNorth;
 }
 dreamReset();dreamEnter();
}
function kindOfWorkshopRole(){return kind(selectedRole);}
function launchDreamWorkshop(learn){
 const previous=dreamLinkLesson?{kind:dreamLessonKind(),step:dreamLinkLesson.step}:null;
 const config=readDreamWorkshopConfig(),role=$('workshopRole').value;
 $('dreamWorkshopDialog').close();if($('preparationDialog').open)confirmPreparation();closeDreamWorkshopSurfaces();
 selectedRole=role;dreamWorkshopConfig=config;
 // Workshop choices are local to the exercise, independent from saved full-run RNG settings.
 const prior={...fixedRng};try{
  fixedRng.dream='auto';fixedRng.meteor='auto';
  if(config.kind==='links')startDreamLinkPractice();else startDreamTowerPractice(true,config.kind);
 }finally{fixedRng=prior;}
 if(learn){$('workshopBriefDialog').close();running=false;if(config.kind==='links')openDreamLinkLesson(dreamCurrentLinkContext(true));else openDreamTowerLesson(dreamTowerContext(null,config.kind==='read'?null:config.kind));}
 else {running=false;if(!$('workshopBriefDialog').open)openDreamWorkshopBrief();}
 if(learn&&previous?.kind===config.kind)setDreamLessonStep(previous.step);
}
function openDreamWorkshopBrief(){
 const stage=dreamTowerPractice?.stage??'links',tower=dreamTower(selectedRole);
 $('workshopBriefTitle').textContent=DREAM_WORKSHOPS[stage]??DREAM_WORKSHOPS.read;
 $('workshopBriefCopy').textContent=stage==='links'?`Tu joues ${selectedRole}. Ton clone est en ${marks[dreamClock(selectedRole)]}. Les liens apparaîtront dans 4 secondes : utilise le plan des symboles pour choisir le bon lien.`:stage==='read'?`Tu joues ${selectedRole}, groupe ${dreamRoleGroup(selectedRole)} : plateforme de ${dreamWest(selectedRole)?'gauche':'droite'}, tours ${rep1Melee(selectedRole)?'intérieures':'extérieures'}. Lis le débuff et les météores lorsqu’ils apparaissent, puis mémorise ta tour.`:stage==='pairs'?`Tu joues ${selectedRole}, groupe de clones ${dreamGroup(selectedRole)?'B (droite)':'A (gauche)'}. Ton clone est en ${marks[dreamClock(selectedRole)]} : ta mécanique est ${DREAM_PICKUPS[dreamClock(selectedRole)][0]==='defam'?'une défamation':'un stack'}. Ordre des vagues : ${[0,1,2,3].map(i=>dream.sources[i].type==='defam'?'défamation':'stack').join(' → ')}. Défamations au nord-ouest / nord-est ; stacks A à l’ouest et B à l’est du boss.`:stage==='elements'?`Tu joues ${selectedRole}. Ta tour est ${DREAM_ELEMENTS[tower.type].name.toLowerCase()}, au ${tower.y<0?'nord':'sud'} ${rep1Melee(selectedRole)?'intérieur':'extérieur'} de la plateforme de ${dreamWest(selectedRole)?'gauche':'droite'}. L’absorption a lieu dans 4 secondes.`:`Tu joues ${selectedRole}, groupe ${dreamRoleGroup(selectedRole)} pour les stacks. Les ${dreamScenario.cardinalFirst?'cardinaux':'intercardinaux'} sont apparus en premier. Mémoire des clones : celui du nord a des cônes ${dreamScenario.verticalNorth?'nord/sud':'est/ouest'}, celui du sud ${dreamScenario.verticalNorth?'est/ouest':'nord/sud'}. Observe le portail, puis le saut des clones pour mémoriser l’îlot sûr et ses cônes.`;
 $('workshopBriefDialog').showModal();
}
function initDreamWorkshops(){
 $('workshopsNav').onclick=openDreamWorkshops;$('prepareWorkshops').onclick=openDreamWorkshops;$('allDreamWorkshops').onclick=openDreamWorkshops;$('linkDreamWorkshops').onclick=openDreamWorkshops;
 $('closeWorkshops').onclick=closeDreamWorkshops;$('workshopKind').onchange=updateDreamWorkshopForm;$('workshopDraw').onchange=updateDreamWorkshopForm;
 $('learnWorkshop').onclick=()=>launchDreamWorkshop(true);$('trainWorkshop').onclick=()=>launchDreamWorkshop(false);
 $('startWorkshopBrief').onclick=()=>{$('workshopBriefDialog').close();play();};$('learnWorkshopBrief').onclick=()=>{$('workshopBriefDialog').close();if(dreamLinkPractice)openDreamLinkLesson(dreamCurrentLinkContext(true));else openDreamTowerLesson();};
 $('configureDreamLesson').onclick=()=>{running=false;openDreamWorkshops();workshopLessonFilter={kind:dreamLessonKind(),step:dreamLinkLesson.step};selectCurrentDreamExample();};
 $('nextDreamExample').onclick=nextDreamLessonExample;
 $('dreamWorkshopDialog').addEventListener('cancel',e=>{e.preventDefault();closeDreamWorkshops();});$('workshopBriefDialog').addEventListener('cancel',e=>e.preventDefault());
}

function dreamTeachingCopy(rule,example,error=null){
 return `<span class="lesson-rule-label">La règle</span>${rule}<div class="lesson-example"><span class="lesson-example-label">Dans cet exemple · ${dreamLinkLesson.role}</span>${example}</div>${error?`<div class="lesson-mistake"><b>Ton erreur</b><p>${error}</p></div>`:''}`;
}
function dreamLessonKind(c=dreamLinkLesson){return c?.kind==='towers'?(c.variant??'read'):'links';}
function selectCurrentDreamExample(){
 const c=dreamLinkLesson;if(!c)return;
 const kind=dreamLessonKind(c),scenario=c.scenario;
 $('workshopKind').value=kind;$('workshopRole').value=c.role;$('workshopDraw').value='specific';
 $('workshopClock').value=String(c.clock);$('workshopPairClock').value=String(c.clock);
 $('workshopSymbol').value=c.sources[c.clock].type;$('workshopPairFirst').value=c.sources[0].type;
 if(c.target){$('workshopMeteor').value=c.target.type;$('workshopHemisphere').value=c.target.y<0?'north':'south';}
 $('workshopFirst').value=scenario.cardinalFirst?'cardinal':'intercardinal';$('workshopAbsorbed').value=scenario.absorbedNorth?'north':'south';
 $('workshopIsland').value=scenario.coneEast?'east':'west';$('workshopAxis').value=scenario.verticalNorth!==scenario.absorbedNorth?'vertical':'horizontal';
 updateDreamWorkshopForm();
}
function nextDreamLessonExample(){
 const c=dreamLinkLesson;if(!c)return;
 selectCurrentDreamExample();
 const kind=dreamLessonKind(c);
 // Enumerate meaningful alternatives, so repeated clicks really explore the cases.
 if(kind==='links'||kind==='pairs'){
  const first=c.sources[0].type==='defam',sourceFirst=kind==='pairs'?c.step===0:c.step===2;
  const n=((sourceFirst?c.clock*2+(first?0:1):(first?0:8)+c.clock)+1)%16,clock=sourceFirst?Math.floor(n/2):n%8,cardinalDefam=sourceFirst?n%2===0:n<8;
  $('workshopClock').value=String(clock);$('workshopPairClock').value=String(clock);
  $('workshopSymbol').value=(clock%2===0)===cardinalDefam?'defam':'stack';$('workshopPairFirst').value=cardinalDefam?'defam':'stack';
 }else if(kind==='read'||kind==='elements'){
  const elements=['fire','earth','wind','dark'],n=(roles.indexOf(c.role)*8+elements.indexOf(c.target.type)*2+(c.target.y<0?0:1)+1)%64;
  $('workshopRole').value=roles[Math.floor(n/8)];$('workshopMeteor').value=elements[Math.floor(n/2)%4];$('workshopHemisphere').value=n%2?'south':'north';
 }else{
  const sc=c.scenario,formationFirst=[0,2,4].includes(c.step),vertical=sc.verticalNorth!==sc.absorbedNorth;
  const bits=(formationFirst?(vertical?0:8):(sc.cardinalFirst?0:8))+(sc.absorbedNorth?0:4)+(sc.coneEast?2:0)+(formationFirst?(sc.cardinalFirst?0:1):(vertical?0:1));
  const n=(roles.indexOf(c.role)*16+bits+1)%128;
  $('workshopRole').value=roles[Math.floor(n/16)];$('workshopFirst').value=n&(formationFirst?1:8)?'intercardinal':'cardinal';$('workshopAbsorbed').value=n&4?'south':'north';$('workshopIsland').value=n&2?'east':'west';$('workshopAxis').value=n&(formationFirst?8:1)?'horizontal':'vertical';
 }
 launchDreamWorkshop(true);
}

function syncDreamLessonActions(){
 const c=dreamLinkLesson,kind=dreamLessonKind(c),demo=c.step===dreamLessonDemoStep(c);
 $('dreamLessonUtilities').hidden=$('dreamLessonActions').hidden;
 $('retryTowerLesson').classList.toggle('primary',demo);$('retryTowerLesson').classList.toggle('secondary',!demo);
 $('practiceDreamLinks').classList.remove('primary');$('practiceDreamLinks').classList.add('secondary');
 $('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('practiceDreamLinks').textContent='M’entraîner · nouveau tirage';
 $('dreamConfigHint').textContent={links:'Choisis ton clone et son symbole',read:'Choisis ton rôle, ta tour et son côté',pairs:'Choisis ton clone et la première vague',elements:'Choisis l’élément et le côté de ta tour',finale:'Choisis l’ordre, le portail et les cônes'}[kind];
 const fields=dreamWorkshopStepFields(kind,c.step),labels={workshopClock:'position du clone',workshopSymbol:'symbole du clone',workshopPairClock:'clone et mécanique',workshopPairFirst:'première vague',workshopMeteor:'élément de la tour',workshopHemisphere:'nord / sud',workshopFirst:'première formation',workshopAbsorbed:'clone absorbé',workshopIsland:'îlot sûr',workshopAxis:'orientation des cônes'};
 if(fields)$('dreamConfigHint').textContent=fields.length?fields.map(id=>labels[id]).join(' · '):'Change de rôle pour comparer les groupes';

}

function dreamWorkshopStepFields(kind,step){
 if(step===dreamLessonDemoStep({kind:kind==='links'?undefined:'towers',variant:kind==='read'?null:kind}))return null;
 return ({links:[['workshopClock'],['workshopClock'],['workshopClock','workshopSymbol']],pairs:[['workshopPairFirst'],['workshopPairClock'],['workshopPairClock'],['workshopPairClock']],read:[[],['workshopMeteor'],['workshopMeteor','workshopHemisphere'],['workshopMeteor','workshopHemisphere']],elements:[['workshopMeteor','workshopHemisphere'],['workshopMeteor','workshopHemisphere'],['workshopMeteor','workshopHemisphere']],finale:[['workshopFirst'],['workshopAbsorbed','workshopIsland','workshopAxis'],['workshopFirst'],['workshopIsland','workshopAxis'],['workshopFirst','workshopAbsorbed','workshopAxis']]}[kind]??[])[step]??null;
}
function filterDreamWorkshopFields(){
 const scoped=workshopLessonFilter&&workshopLessonFilter.kind===$('workshopKind').value;
 const fields=scoped?dreamWorkshopStepFields(workshopLessonFilter.kind,workshopLessonFilter.step):null;
 $('dreamWorkshopDialog').classList.toggle('lesson-config-context',!!scoped);
 for(const id of ['workshopKind','workshopDraw','workshopClock','workshopSymbol','workshopPairClock','workshopPairFirst','workshopMeteor','workshopHemisphere','workshopFirst','workshopAbsorbed','workshopIsland','workshopAxis']){
  const hidden=!!scoped&&(['workshopKind','workshopDraw'].includes(id)||fields!==null&&!fields.includes(id));
  $(id).hidden=hidden;const label=document.querySelector(`label[for="${id}"]`);if(label)label.hidden=hidden;
 }
 $('workshopPickerTitle').textContent=scoped?'Configurer cette étape':'Choisir un atelier';
 if(scoped)$('workshopDescription').textContent='Choisis le cas à observer pour cette étape. Les autres conditions de l’exemple restent fixées.';
}
