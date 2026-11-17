'use strict';
// A bounded two-part workshop. Both parts keep the same draw and reveal combat clues normally.
let dreamTowerPractice=null;
const DREAM_TOWER_CHOICE=DREAM.red2-.2;
function dreamRoleGroup(role){return dreamWest(role)?1:2;}
function dreamTowerPartner(role){return roles.find(r=>r!==role&&dreamWest(r)===dreamWest(role)&&rep1Melee(r)===rep1Melee(role));}
function dreamTowerOrigin(){return dreamLinkLesson?.kind==='towers'?dreamLinkLesson.origin:dreamTowerPractice?.origin??{rangeStart,rangeEnd};}
function resetDreamTowerPractice(){dreamTowerPractice=null;$('dreamTowerResultDialog').close();}
function dreamTowerContext(error=null,variant=null){
 const role=selectedRole,pre=dreamTowerPositions()[dreamPreTower(role)];
 return {kind:'towers',variant:variant??(['pairs','elements','finale'].includes(dreamTowerPractice?.stage)?dreamTowerPractice.stage:null),role,clock:dreamClock(role),sources:cloneData(dream.sources),expected:{...dreamSource(role)},origin:{...dreamTowerOrigin()},scenario:cloneData(dreamScenario),assignments:cloneData(dream.assignments),towers:cloneData(dreamTowerPositions()),target:{...dreamTower(role)},pre:{...pre},light:dreamLightVuln(role),group:dreamRoleGroup(role),partner:dreamTowerPartner(role),inner:rep1Melee(role),seed,error:error?.message??null,position:{x:player.x,y:player.y},practiceStage:dreamTowerPractice?.stage??'read',fromResult:!!dreamTowerPractice?.done};
}
function dreamTowerFailureContext(error){
 if(!isDreamActive())return null;
 const t=error.at-dreamOffset();
 if(t>=DREAM.red2&&t<DREAM.blue3)return dreamTowerContext(error,'pairs');
 if(t>=DREAM.portal-4&&t<=DREAM.storedFinal+.2)return dreamTowerContext(error,'finale');
 if(t>=DREAM.towers-.01&&t<=DREAM.baits+.2&&(t>DREAM.towers+.2||/Vent|Ténèbres|Rayon|Hot Blooded|proximité/.test(error.message)))return dreamTowerContext(error,'elements');
 if(!(t>=DREAM.stored+.15&&t<DREAM.red2||t>=DREAM.blue3-4&&t<=DREAM.towers+.2))return null;
 return dreamTowerContext(error);
}
function dreamResolveTowerChoice(returning){
 for(const role of roles){
  const tower=dreamTower(role),p=actor(role);
  if(dist(p,tower)>3*DS){
   const actual=dreamTowerPositions().find(t=>dist(p,t)<=3*DS),side=tower.side<0?'gauche':'droite';
   let reason;
   if(dist(p,dp(tower.side*14,0))>10*DS)reason=`Mauvaise plateforme : groupe ${dreamRoleGroup(role)}, rejoins celle de ${side}.`;
   else if(actual)reason=`Mauvaise tour : ${DREAM_ELEMENTS[actual.type].name.toLowerCase()} au lieu de ${DREAM_ELEMENTS[tower.type].name.toLowerCase()}. ${rep1Melee(role)?'Reste à l’intérieur, côté boss.':'Reste à l’extérieur, côté bord.'}`;
   else reason=returning?'Tu n’as pas rejoint ta tour mémorisée.':'Place-toi dans ta tour pour confirmer ton choix avant le changement d’arène.';
   dreamError([role],reason);
  }else if(returning)dream.towerRoles[role]=tower.type;
 }
 // Stop at the endpoint even when the normal stop-on-error preference is disabled.
 if(dreamTowerPractice){dreamTowerPractice.done=true;dreamTowerPractice.passed=!dream.failures.some(f=>f.roles.includes(selectedRole));}
}
function startDreamTowerPractice(newDraw=true,stage='read'){
 const origin={...dreamTowerOrigin()},preserved=cloneData(dreamScenario),preservedSeed=seed;
 const sourceLesson=dreamLinkLesson?.kind==='towers'?dreamLinkLesson:null;
 const scenario=sourceLesson?.scenario??preserved,drawSeed=sourceLesson?.seed??preservedSeed;
 if($('preparationDialog').open)confirmPreparation();
 leaveDreamLessonSurface();closeFailure();$('dreamTowerResultDialog').close();
 rangeStart=rangeEnd=4;trainingExercise='all';mode='placement';applyTrainingRange();
 const savedRng={...fixedRng};try{if(newDraw&&dreamWorkshopConfig?.kind===(stage==='return'?'read':stage)){fixedRng.dream='auto';fixedRng.meteor='auto';}reset(newDraw,dreamOffset()+(stage==='pairs'?DREAM.red2+.1:stage==='finale'?DREAM.portal-4:stage==='elements'?DREAM.towers-4:stage==='read'?DREAM.islands1-6:DREAM.blue3-4));}finally{fixedRng=savedRng;}
 if(!newDraw){dreamScenario=cloneData(scenario);seed=drawSeed;dreamReset();dreamEnter();$('seed').textContent='#'+seed;}
 if(newDraw)applyDreamWorkshopConfig(stage==='return'?'read':stage);
 // Prior links have already been resolved before this workshop begins.
 for(const role of roles){dreamSource(role).owner=role;dream.assignments[role]=DREAM_PICKUPS[dreamClock(role)][0];}
 dreamTowerPractice={stage,done:false,passed:false,origin};demoMode=false;$('playMode').value='practice';
 for(const [i,role] of roles.entries())Object.assign(role===selectedRole?player:party.find(p=>p.role===role),dp((i%4-1.5)*1.1,4+Math.floor(i/4)));
 if(stage==='pairs'){for(const role of roles)Object.assign(role===selectedRole?player:party.find(p=>p.role===role),dreamTowerTarget(role));}
 if(stage==='elements'){for(const role of roles)Object.assign(role===selectedRole?player:party.find(p=>p.role===role),dreamTower(role));toast('Tour '+DREAM_ELEMENTS[dreamTower(selectedRole).type].name+' · absorption dans 4 secondes.');}
 if(stage==='finale'){for(const role of roles){dream.towerRoles[role]=dreamTower(role).type;Object.assign(role===selectedRole?player:party.find(p=>p.role===role),dreamBaitTarget(role));}}
 history=[];record();updateUI();render();if(['pairs','finale'].includes(stage))openDreamWorkshopBrief();else play();
}
function showDreamTowerResult(){
 const p=dreamTowerPractice;if(!p?.done)return;
 const reading=p.stage==='read',elements=p.stage==='elements',finale=p.stage==='finale',pairs=p.stage==='pairs';
 $('dreamTowerResultEyebrow').textContent=pairs?'IDYLLIC DREAM · DÉFAMATIONS ET STACKS':finale?'IDYLLIC DREAM · PORTAIL ET RECONSTITUTIONS':elements?'IDYLLIC DREAM · EFFETS DES TOURS':'IDYLLIC DREAM · PLATEFORMES ET TOURS';
 $('nextDreamElements').hidden=!p.passed||p.stage!=='return';
 $('dreamTowerResultTitle').textContent=!p.passed?'Atelier terminé · à reprendre':reading?'Tour choisie !':pairs?'Défamations et stacks réussis !':finale?'Reconstitutions réussies !':elements?'Effets des tours réussis !':'Bonne tour retrouvée !';
 $('dreamTowerResultCopy').textContent=!p.passed?'Une erreur a été relevée pendant cet essai. Revois l’explication ou réessaie ce tirage.':reading?'Mémorise ta tour. La prochaine partie reprend avant le retour des plateformes, avec les mêmes météores et le même débuff. Les défamations et stacks intermédiaires sont sautés dans cet atelier.':pairs?'Tu as résolu les quatre vagues de mécaniques en évitant les défamations et en rejoignant ton stack attribué.':finale?'Tu as rejoint les deux stacks, retrouvé l’îlot sûr et évité le dernier clone. Tu peux recommencer Idyllic Dream ou travailler une autre configuration.':elements?'Tu as résolu ton élément et les cônes proche / loin. Tu peux réessayer ce tirage ou en travailler un nouveau.':'Tu as rejoint la bonne plateforme et retrouvé la bonne tour. Tu peux maintenant travailler les effets des tours dans l’atelier suivant.';
 $('returnDreamTowers').hidden=!reading||!p.passed;$('newDreamTowers').classList.toggle('primary',!reading);
 $('dreamTowerResultDialog').showModal();
}
function updateDreamTowerWorkshop(){
 if(!dreamTowerPractice)return;
 const p=dreamTowerPractice;
 $('simTitle').textContent=p.stage==='pairs'?'Idyllic Dream · défamations et stacks':p.stage==='finale'?'Idyllic Dream · portail et reconstitutions':p.stage==='elements'?'Idyllic Dream · effets des tours':'Atelier · plateformes et tours';
 if(p.done&&running){running=false;keys.clear();resetStick();updateUI();showDreamTowerResult();}
}
function exitDreamTowerWorkshop(){restartDreamSequence();}
function replayCurrentTraining(newDraw){if(dreamTowerPractice){startDreamTowerPractice(newDraw,newDraw?firstDreamWorkshopStage(dreamTowerPractice.stage):dreamTowerPractice.stage);return;}reset(newDraw);play();}
function openDreamTowerLesson(context=null){
 if($('preparationDialog').open)confirmPreparation();
 if(!context)context=dreamTowerContext(dreamTowerPractice?.done&&!dreamTowerPractice.passed?dream.failures.find(f=>f.roles.includes(selectedRole)):null);
 dreamLinkLesson={...cloneData(context),step:0,elapsed:0,startedAt:performance.now()};
 running=false;keys.clear();resetStick();$('errorDialog').close();$('dreamTowerResultDialog').close();
 document.body.classList.add('dream-lesson-active');$('dreamLessonDialog').hidden=false;
 document.querySelectorAll('.training-range,header nav,.mobile-toolbar,.simulation .playback,.arena-wrap .touch-controls').forEach(node=>node.inert=true);
 renderDreamTowerLesson();render();$('closeDreamLesson').focus({preventScroll:true});
 if(window.matchMedia?.('(max-width: 700px)').matches)document.querySelector('.simulation').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderDreamTowerLesson(){
 if(dreamLinkLesson.step===dreamLessonDemoStep(dreamLinkLesson)){renderDreamDemoLesson();return;}
 if(dreamLinkLesson.variant==='pairs'){renderDreamPairsLesson();return;}
 if(dreamLinkLesson.variant==='finale'){renderDreamFinaleLesson();return;}
 if(dreamLinkLesson.variant==='elements'){renderDreamElementLesson();return;}
 const c=dreamLinkLesson,s=c.step,t=c.target,side=c.group===1?'gauche':'droite',position=c.inner?'intérieures, côté boss':'extérieures, côté bord';
 document.body.classList.toggle('dream-lesson-final',s===3);
 $('closeDreamLesson').setAttribute('aria-label',c.error?'Revenir à l’erreur':'Revenir à l’arène');$('restartLessonTraining').textContent='Recommencer Idyllic Dream';
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · PLATEFORMES ET TOURS · ${s+1} / 5`;
 $('dreamLessonTitle').textContent=['Ton groupe et ta plateforme','Ta position et ton débuff','Choisir entre tes deux tours','Mémoriser, puis revenir'][s];
 const copy=[
  dreamTeachingCopy(
   '<p>Les plateformes utilisent les <b>groupes de rôles 1/2</b>, indépendants des groupes de clones A/B.</p><p><b>Groupe 1 : MT, H1, M1, R1 → gauche.<br>Groupe 2 : OT, H2, M2, R2 → droite.</b></p>',
   `<p>Tu joues <b>${c.role}</b> : tu rejoins la plateforme de <b>${side}</b> avec le <b>groupe ${c.group}</b>.</p>`),
  dreamTeachingCopy(
   '<p><b>Tanks et mêlées : tours intérieures</b>, côté boss. <b>Healers et distances : tours extérieures</b>, côté bord. Reste écarté pour Arcadian Arcanum.</p><p>Les AoE de lumière frappent les <b>quatre supports</b> ou les <b>quatre DPS</b>. Elles donnent la vulnérabilité lumière aux joueurs touchés : attends leur résolution avant de choisir ta tour.</p><p><b>Vulnérabilité lumière → feu ou terre.<br>Sans vulnérabilité → vent ou ténèbres.</b></p>',
   `<p>Au départ : <b>${c.pre.y<0?'nord':'sud'} ${c.inner?'intérieur':'extérieur'}</b>. Ici, tu ${c.light?'as la vulnérabilité lumière : cherche <b>feu ou terre</b>':'n’as pas la vulnérabilité : cherche <b>vent ou ténèbres</b>'}.</p>`),
  dreamTeachingCopy(
   '<p>Compare les <b>deux tours nord/sud</b> de ta ligne. Garde celle compatible avec ton débuff. Si nécessaire, échange nord/sud avec ton partenaire, sans changer de plateforme ni de ligne intérieure/extérieure.</p>',
   `<p>Parmi les tours <b>${position}</b>, prends <b>${DREAM_ELEMENTS[t.type].name.toLowerCase()}, au ${t.y<0?'nord':'sud'}</b>.</p><p>${c.pre.id===t.id?'Ta tour de départ convient : reste de ce côté.':`Échange nord/sud avec <b>${c.partner}</b>.`}</p>`),
  dreamTeachingCopy(
   '<p>Mémorise <b>la plateforme, le côté nord/sud et la ligne intérieure/extérieure</b>. Après les défamations et stacks, retrouve exactement cette tour au retour des plateformes. Une mauvaise plateforme ou une mauvaise tour compte comme une erreur.</p>',
   `<p>À retenir ici : <b>${side} · ${t.y<0?'nord':'sud'} ${c.inner?'intérieur':'extérieur'} · ${DREAM_ELEMENTS[t.type].name.toLowerCase()}</b>.</p><p>L’exercice permet de lire les indices, puis de tester ce retour sur le même tirage.</p>`,c.error)
 ];
 $('dreamLessonCopy').innerHTML=copy[s];$('dreamLessonPrevious').disabled=s===0;$('dreamLessonNext').hidden=false;$('dreamLessonNext').textContent=s===3?'Démonstration →':'Suite →';$('repeatDreamLesson').textContent='Revoir l’animation';$('dreamLessonActions').hidden=s!==3;
 $('practiceDreamLinks').textContent='M’entraîner · nouveau tirage';$('practiceDreamLinks').onclick=()=>startDreamTowerPractice(true);
 $('dreamLessonPracticeHint').textContent='Départ 6 s avant la séparation · débuff et météores à lire.';
 $('retryTowerLesson').hidden=false;$('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('retryTowerLesson').onclick=()=>startDreamTowerPractice(false,c.practiceStage);
 $('stateChip').textContent='EXPLICATION';$('simTitle').textContent='Idyllic Dream · plateformes et tours';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Explication ${s+1} : ${$('dreamLessonTitle').textContent}. ${c.role}, groupe ${c.group}, plateforme de ${side}.`);
}
function drawDreamTowerLesson(){
 if(dreamLinkLesson.variant==='pairs'){drawDreamPairsLesson();return;}
 if(dreamLinkLesson.variant==='finale'){drawDreamFinaleLesson();return;}
 if(dreamLinkLesson.variant==='elements'){drawDreamElementLesson();return;}
 const c=dreamLinkLesson,s=c.step,elapsed=c.elapsed%13,pulse=1+Math.sin(c.elapsed*4)*.08;
 const split=s===1||s===2||elapsed>=10;
 if(split)drawDreamPlatforms();else {drawDreamArenaFloor(true);drawDreamGroupHalves(false);}
 drawWaymarks(DS,true);dragon(0,0,55,true);
 for(const side of [-1,1]){const x=side*14*DS;circle(x,0,10*DS-8,null,(side<0?1:2)===c.group?'#9ffff0':'#6f8497',3);text('GROUPE '+(side<0?1:2),x,-255,20,(side<0?1:2)===c.group?'#b5ffe9':'#9eacba','700');}
 if(s>0)for(const t of c.towers){
  circle(t.x,t.y,3*DS,'#bee8ff08','#b0c9db',1.5);drawDreamMeteor(t,75,.72);
  text(DREAM_ELEMENTS[t.type].name,t.x,t.y+75,14,DREAM_ELEMENTS[t.type].color,'700');
  if(s>=2&&t.side===c.target.side&&(Math.abs(t.x)<14*DS)===c.inner)circle(t.x,t.y,3*DS+6,null,t.id===c.target.id?'#9ffff0':'#e8c98d',t.id===c.target.id?3:1.5);
 }
 if(s===1)drawDreamLessonArcanum(c,elapsed,Object.fromEntries(roles.map(role=>[role,c.towers[dreamPreTower(role)]])));
 if(s===2)drawDreamLessonArcanum(c,5,Object.fromEntries(roles.map(role=>[role,dreamLessonMove(c.towers[dreamPreTower(role)],dreamElementTower(c,role),elapsed-(role===c.role?1:6))])));
 for(const [i,role] of roles.entries()){
  const pre=c.towers[dreamPreTower(role)],inner=rep1Melee(role),light=(kind(role)!=='dps')===c.scenario.lightSupports;
  const target=c.towers.find(t=>(t.side<0)===dreamWest(role)&&(Math.abs(t.x)<14*DS)===inner&&['fire','earth'].includes(t.type)===light);
  const initial=dp((i%4-1.5)*1.1,4+Math.floor(i/4)),start=s===0||s===3?initial:pre,end=s<2?pre:target;
  const p={role,...dreamLessonMove(start,end,elapsed-(role===c.role?1:6)),a:0};
  if(role===c.role){line(start,end,'#a6ffe3',3,[7,6]);circle(end.x,end.y,25*pulse,null,'#b5ffe9',3);}
  playerDot(p,role===c.role?15:11);
 }
 if(s===1)text(elapsed<4.6?'ATTENDS LA RÉSOLUTION DES AOE':c.light?'VULNÉRABILITÉ LUMIÈRE → FEU / TERRE':'SANS VULNÉRABILITÉ → VENT / TÉNÈBRES',0,310,19,'#f8eaba','700');
 if(s===3&&c.error){circle(c.position.x,c.position.y,24,null,'#ff8e99',3);text('TON PLACEMENT',c.position.x,c.position.y+35,12,'#ffb3be','700');}
 text(['REJOINDRE SON GROUPE','LIRE SON DÉBUFF','CHOISIR SA TOUR','RETROUVER SA TOUR'][s],0,-350,17,'#c9e8df','700');
}
function initDreamTowerWorkshop(){
 $('returnDreamTowers').onclick=()=>startDreamTowerPractice(false,'return');$('newDreamTowers').onclick=()=>replayCurrentTraining(true);
 $('nextDreamElements').onclick=()=>openDreamTowerLesson(dreamTowerContext(null,'elements'));
 $('retryDreamTowers').onclick=()=>startDreamTowerPractice(false,dreamTowerPractice?.stage??'read');$('explainTowerResult').onclick=()=>openDreamTowerLesson();
 $('newTowerError').onclick=()=>replayCurrentTraining(true);$('dreamTowerResultDialog').addEventListener('cancel',e=>e.preventDefault());
 $('restartBtn').onclick=()=>replayCurrentTraining(false);$('shuffle').onclick=()=>replayCurrentTraining(true);
 updateDreamTowerWorkshop();
}

// Same four targets and six-yalm radius as Arcadian Arcanum in the simulation.
function dreamLessonArcanumFrame(c,elapsed){
 const phase=elapsed<1?'waiting':elapsed<4?'telegraph':elapsed<4.6?'impact':'debuff';
 return {phase,targets:roles.filter(role=>(kind(role)!=='dps')===c.scenario.lightSupports)};
}
function drawDreamLessonArcanum(c,elapsed,positions){
 const frame=dreamLessonArcanumFrame(c,elapsed);if(frame.phase==='waiting')return;
 for(const role of frame.targets){
  const p=positions[role];
  if(frame.phase==='telegraph'||frame.phase==='impact'){
   const hit=frame.phase==='impact';
   circle(p.x,p.y,6*DS,hit?'#fff0ac70':'#edba5338',hit?'#fff5c2':'#f4ce78',hit?4:2);
   circle(p.x,p.y,9,'#ffe7a5');
  }else{
   text('✦',p.x,p.y-31,25,'#ffe8a4','700');
   if(role===c.role)text('VULNÉRABILITÉ LUMIÈRE',0,-300,20,'#ffe8a4','700');
  }
 }
 if(frame.phase==='telegraph'||frame.phase==='impact')text(frame.phase==='impact'?'IMPACT · VULNÉRABILITÉ LUMIÈRE':'ARCADIAN ARCANUM · RESTE ÉCARTÉ',0,-300,19,'#ffe8a4','700');
}
