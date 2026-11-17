'use strict';
// This lesson animates a separate illustration on the existing arena canvas.
// Combat positions, time and the failed scenario stay untouched throughout.
let dreamLinkLesson=null,dreamLinkPractice=null;
const DREAM_LESSON_CYCLE=14;
const DREAM_LESSON_DIRECTIONS=['nord','nord-est','est','sud-est','sud','sud-ouest','ouest','nord-ouest'];
const DREAM_LESSON_COLORS=['#df6977','#e5c85e','#73c9dc','#aa83e4'];
const DREAM_LESSON_COLOR_NAMES=['rouge','jaune','bleu','violet'];
function leaveDreamLessonSurface(){
 dreamLinkLesson=null;$('dreamLessonDialog').hidden=true;
 document.body.classList.remove('dream-lesson-active','dream-lesson-final');
 document.querySelectorAll('.training-range,header nav,.mobile-toolbar,.simulation .playback,.arena-wrap .touch-controls').forEach(node=>node.inert=false);
 canvas.setAttribute('aria-label','Arène. Déplace-toi avec Z Q S D ou les flèches. Les liens sont récupérés automatiquement au contact.');
}
function resetDreamLesson(){
 // At startup canvas is already initialized before the first reset.
 if(dreamLinkLesson)leaveDreamLessonSurface();
 dreamLinkPractice=null;resetDreamTowerPractice();$('dreamLessonDialog').hidden=true;
 if($('dreamPracticeDialog').open)$('dreamPracticeDialog').close();
}
function dreamLinkFailureContext(error){
 if(!isDreamActive())return null;
 const event=dream.events.find(e=>e.key==='lock'&&Math.abs(e.at-error.at)<.1&&e.errors.some(f=>f.roles.includes(selectedRole)));
 if(!event)return null;
 return dreamCurrentLinkContext();
}
function dreamCurrentLinkContext(educational=false){
 return {educational,scenario:cloneData(dreamScenario),clock:dreamClock(selectedRole),clocks:[...dreamScenario.clocks],role:selectedRole,expected:{...dreamSource(selectedRole)},owned:dreamOwn(selectedRole).map(s=>({id:s.id,type:s.type})),sources:dream.sources.map(s=>({id:s.id,type:s.type,initialOwner:dreamScenario.initialOwners[s.id]})),seed,rangeStart:dreamLinkPractice?.origin.rangeStart??rangeStart,rangeEnd:dreamLinkPractice?.origin.rangeEnd??rangeEnd};
}
function openDreamLinkLesson(context=null){
 if(context?.clock===undefined&&activeFailure?.dreamTowers){openDreamTowerLesson(activeFailure.dreamTowers);return;}
 if(context?.clock===undefined)context=activeFailure?.dreamLinks;
 if(!context)return;
 dreamLinkLesson={...cloneData(context),step:0,elapsed:0,startedAt:performance.now()};
 $('errorDialog').close();running=false;keys.clear();resetStick();
 document.body.classList.add('dream-lesson-active');$('dreamLessonDialog').hidden=false;
 document.querySelectorAll('.training-range,header nav,.mobile-toolbar,.simulation .playback,.arena-wrap .touch-controls').forEach(node=>node.inert=true);
 renderDreamLinkLesson();render();$('closeDreamLesson').focus({preventScroll:true});
 if(window.matchMedia?.('(max-width: 700px)').matches)document.querySelector('.simulation').scrollIntoView({block:'start',behavior:'smooth'});
}
function returnFromDreamLesson(){
 leaveDreamLessonSurface();updateUI();render();
 if(activeFailure)$('errorDialog').showModal();else if(dreamTowerPractice?.done)showDreamTowerResult();
}
function dreamLessonDiagnosis(context){
 const {owned,expected}=context;
 if(!owned.length)return 'Tu n’avais aucun lien au verrouillage. Récupère celui du clone indiqué.';
 if(owned.length>1)return 'Tu portais plusieurs liens. Conserve uniquement celui du clone indiqué.';
 const current=owned[0];
 if(current.type!==expected.type)return `Tu portais un lien ${types[current.type].name.toLowerCase()} depuis ${marks[current.id]}. Il te fallait ${expected.type==='defam'?'une défamation':'un stack'} depuis ${marks[expected.id]}.`;
 return `Tu avais le bon symbole, mais le lien venait de ${marks[current.id]}. Il fallait prendre celui de ${marks[expected.id]}.`;
}
function dreamLessonWaymark(id,active=false){
 const color=DREAM_LESSON_COLORS[Math.floor(id/2)];
 return `<span class="lesson-waymark ${id%2?'square':''} ${active?'active':''}" style="--mark-color:${color}">${marks[id]}</span>`;
}
function setDreamLessonStep(step){
 if(!dreamLinkLesson)return;
 dreamLinkLesson.step=Math.max(0,Math.min(dreamLessonDemoStep(dreamLinkLesson),step));dreamLinkLesson.replay=null;dreamLinkLesson.elapsed=0;dreamLinkLesson.startedAt=performance.now();
 renderDreamLinkLesson();render();
 if(window.matchMedia?.('(max-width: 700px)').matches)document.querySelector('.simulation').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderDreamLinkLesson(){
 const c=dreamLinkLesson;if(!c)return;if(c.step===dreamLessonDemoStep(c)){renderDreamDemoLesson();return;}if(c.kind==='towers'){renderDreamTowerLesson();return;}
 $('closeDreamLesson').setAttribute('aria-label',c.educational?'Revenir à l’arène':'Revenir à l’erreur');$('restartLessonTraining').textContent='Recommencer Idyllic Dream';$('practiceDreamLinks').textContent='M’entraîner à prendre les liens';$('practiceDreamLinks').onclick=()=>startDreamLinkPractice();$('dreamLessonPracticeHint').textContent='Nouveau tirage · près de ton clone · 4 s avant les liens.';$('retryTowerLesson').hidden=false;$('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('retryTowerLesson').onclick=()=>startDreamLinkPractice(false);
 const step=c.step,[type,ordinal]=DREAM_PICKUPS[c.clock],pair=ordinal*2,color=DREAM_LESSON_COLOR_NAMES[ordinal],target=c.expected.id;
 document.body.classList.toggle('dream-lesson-final',step===2);
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · LIENS DE CLONES · ${step+1} / 4`;
 $('dreamLessonTitle').textContent=['L’ordre à reproduire','La couleur de ton clone','Le lien à prendre'][step];
 $('dreamLessonPrevious').disabled=step===0;$('dreamLessonNext').hidden=false;$('dreamLessonNext').textContent=step===2?'Démonstration →':'Suite →';$('repeatDreamLesson').textContent='Revoir l’animation';$('dreamLessonActions').hidden=step!==2;
 const badges=dreamLessonWaymark(pair,true)+' '+dreamLessonWaymark(pair+1,true),mechanic=type==='defam'?'la défamation':'le stack';
 const rules=[
  '<p>Chaque joueur mémorise la position de son clone personnel. Le plan ci-contre fixe la mécanique à prendre à chaque position, quel que soit le symbole initial du clone.</p><p><b>A/C : défamation 1 · 2/4 : défamation 2.<br>1/3 : stack 1 · B/D : stack 2.</b></p>',
  '<p>La couleur du marqueur de ton clone donne la paire où chercher : <b>rouge A/1, jaune B/2, bleu C/3, violet D/4</b>.</p><p>Dans cette paire, prends le symbole prévu par le plan. Sa position peut changer selon le tirage.</p>',
  '<p>Attends les liens de mécanique, puis récupère le bon lien <b>au contact</b>. Conserve uniquement ce lien et reste près de sa source jusqu’au verrouillage.</p>'
 ];
 const examples=[
  `<p>Ton clone est en <b>${marks[c.clock]}</b> : le plan te donne <b>${type==='defam'?'une défamation':'un stack'}</b>.</p>`,
  `<p>Ton clone est en <b>${marks[c.clock]}</b>, sur un marqueur <b>${color}</b>. Cherche donc <b>${mechanic}</b> entre ${badges}.</p>`,
  `<p>Dans la paire ${badges}, ${mechanic} est en <b>${marks[target]} · ${DREAM_LESSON_DIRECTIONS[target]}</b>. L’animation montre comment récupérer ce lien.</p>`
 ];
 $('dreamLessonCopy').innerHTML=dreamTeachingCopy(rules[step],examples[step],step===2&&!c.educational?dreamLessonDiagnosis(c):null);
 $('stateChip').textContent='EXPLICATION';$('simTitle').textContent='Idyllic Dream · prise des liens';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Explication animée, étape ${step+1} : ${$('dreamLessonTitle').textContent}. Ton clone est en ${marks[c.clock]}, marqueur ${color}. Lien attendu : ${types[type].name} en ${marks[target]}.`);
 updateDreamLessonAnimation(c.startedAt);
}
function restartDreamLesson(){setDreamLessonStep(dreamLinkLesson?.step===dreamLessonDemoStep(dreamLinkLesson)?dreamLinkLesson.step:0);}
function updateDreamLessonAnimation(now){
 const c=dreamLinkLesson;if(!c)return;c.elapsed=Math.max(0,(now-c.startedAt)/1000);
}
// Match manual movement: constant arena units per second, independent of route length.
function dreamLessonMove(start,end,seconds){
 const distance=dist(start,end),travel=distance?Math.min(1,Math.max(0,seconds)*PLAYER_MOVE_SPEED/distance):1;
 return {x:start.x+(end.x-start.x)*travel,y:start.y+(end.y-start.y)*travel};
}
function dreamLessonFrame(){
 const c=dreamLinkLesson;if(!c)return null;const t=c.elapsed%DREAM_LESSON_CYCLE;
 return {step:c.step,t,cycle:Math.floor(c.elapsed/DREAM_LESSON_CYCLE),focus:Math.min(7,Math.floor((c.elapsed%8)/.7)),linksVisible:c.step===2};
}
function dreamLessonPositions(routes,role,t){
 return routes.map(route=>({role:route.role,...dreamLessonMove(route.start,route.end,t-(route.role===role?2:7))}));
}
function dreamLessonActors(){
 const c=dreamLinkLesson,f=dreamLessonFrame();if(!c||!f)return null;
 // Replaying the same contact rules as the game keeps crossed links and takeovers visible.
 if(!c.replay||c.replay.cycle!==f.cycle||f.t+1e-7<c.replay.at){
  c.replay={cycle:f.cycle,at:0,sources:c.sources.map(s=>({...s,...dreamClonePos(s.id),owner:s.initialOwner,contacts:[],lastTransfer:-100})),routes:roles.map((role,i)=>{
   const clock=c.clocks[i],[type,n]=DREAM_PICKUPS[clock],target=c.sources.filter(s=>s.type===type)[n];
   return {role,start:dreamCloneWaitingPos(clock),end:dreamClonePos(target.id)};
  })};
 }
 const replay=c.replay,goal=Math.floor((f.t+1e-7)*60)/60;
 while(replay.at+1/60<=goal+1e-7){
  replay.at+=1/60;
  const positions=dreamLessonPositions(replay.routes,c.role,replay.at);
  transferDreamTethers(replay.sources,r=>positions[roles.indexOf(r)],replay.at,r=>replay.at>=(r===c.role?2:7));
 }
 return {actors:dreamLessonPositions(replay.routes,c.role,f.t),links:replay.sources.map(s=>({sourceId:s.id,owner:s.owner}))};
}
function drawDreamLinkLesson(){
 if(dreamLinkLesson?.step===dreamLessonDemoStep(dreamLinkLesson)){drawDreamDemoLesson();return;}
 if(dreamLinkLesson?.kind==='towers'){drawDreamTowerLesson();return;}
 const c=dreamLinkLesson,f=dreamLessonFrame();if(!c||!f)return;
 const [type,ordinal]=DREAM_PICKUPS[c.clock],pair=ordinal*2,pulse=1+Math.sin(c.elapsed*4)*.12;
 drawDreamArenaFloor(false);
 circle(0,0,20*DS,'#111b2522');drawDeathRing(DS);drawWaymarks(DS);
 // Use the same dragons, symbols, player dots and waymark coordinates as the game.
 dragon(0,0,58,true);
 for(let i=0;i<8;i++){
  const p=dreamClonePos(i),clone={x:p.x*1.12,y:p.y*1.12},symbol={x:p.x*1.3,y:p.y*1.3};
  const highlight=c.step===0?i===f.focus:c.step===1?i===c.clock:f.linksVisible&&i===c.expected.id;
  dragon(clone.x,clone.y,32);
  if(c.step<2||f.linksVisible)icon(c.step===2?c.sources[i].type:DREAM_PICKUPS[i][0],symbol.x,symbol.y,21);
  if(highlight){circle(clone.x,clone.y,36*pulse,null,'#a6ffe3',3);if(c.step===1)text('TON CLONE',symbol.x,symbol.y+34,12,'#c5ffee','700');if(c.step===2)text('TON LIEN',symbol.x,symbol.y+34,12,'#c5ffee','700');}
 }
 if(c.step===0){
  const a=Math.min(7.8,(c.elapsed%8)/.7)*Math.PI/4;ctx.beginPath();ctx.arc(0,0,392,-Math.PI/2,a-Math.PI/2);ctx.strokeStyle='#a6ffe3';ctx.lineWidth=3;ctx.stroke();const p=pt(a,392);circle(p.x,p.y,6,'#c5ffee');
 }else{
  for(const id of [pair,pair+1]){const p=pt(id*TAU/8,(id%2?Math.SQRT2*6.825:13.65)*DS),color=DREAM_LESSON_COLORS[ordinal];ctx.save();ctx.shadowColor=color;ctx.shadowBlur=20;circle(p.x,p.y,31*pulse,null,color,3);ctx.restore();}
  if(c.step===1){const p=dreamClonePos(c.clock),waiting=dreamCloneWaitingPos(c.clock),ghost=dreamLessonMove({x:0,y:75},waiting,c.elapsed%6);line(ghost,{x:p.x*1.12,y:p.y*1.12},'#bcffec',3,[8,7]);playerDot({...ghost,role:c.role,a:0},15);}
  else{
   const {actors,links}=dreamLessonActors();
   for(const link of links)line(dreamClonePos(link.sourceId),actors.find(p=>p.role===link.owner),link.owner===c.role?'#a6ffe3':'#ffdb9c',3);
   for(const ghost of actors)playerDot({...ghost,a:0},ghost.role===c.role?15:10);
   const mine=links.filter(link=>link.owner===c.role);
   if(f.t>=10&&mine.length===1&&mine[0].sourceId===c.expected.id)text('BON LIEN',0,110,18,'#a6ffe3','700');
  }
 }
 text(c.step===0?'ORDRE ATTENDU':c.step===1?'CLONE PERSONNEL':f.linksVisible?'LIENS DE MÉCANIQUE':'EN ATTENTE DES LIENS',0,-414,12,'#c9e8df','700');
}
function restartTrainingFromLesson(){restartDreamSequence();}
function startDreamLinkPractice(newDraw=true){
 newDraw=newDraw!==false;const example=dreamLinkLesson?cloneData(dreamLinkLesson):null;
 const oldClock=dreamScenario?dreamClock(selectedRole):null,oldFixed=fixedRng.dream;
 const origin=dreamLinkLesson??activeFailure?.dreamLinks??dreamLinkPractice?.origin??{rangeStart,rangeEnd};
 leaveDreamLessonSurface();$('dreamPracticeDialog').close();closeFailure();
 rangeStart=rangeEnd=4;trainingExercise='all';mode='placement';applyTrainingRange();
 // This exercise draws a new personal clone without changing saved RNG preferences.
 try{fixedRng.dream='auto';reset(newDraw,dreamOffset()+DREAM.links-4);}
 finally{fixedRng.dream=oldFixed;}
 if(newDraw&&dreamClock(selectedRole)===oldClock){const i=roles.indexOf(selectedRole),j=(i+1+Math.floor(Math.random()*7))%8;[dreamScenario.clocks[i],dreamScenario.clocks[j]]=[dreamScenario.clocks[j],dreamScenario.clocks[i]];}
 if(!newDraw&&example?.scenario){dreamScenario=cloneData(example.scenario);seed=example.seed;dreamReset();dreamEnter();$('seed').textContent='#'+seed;}
 if(newDraw)applyDreamWorkshopConfig('links');
 for(const [i,role] of roles.entries()){const p=dreamClonePos(dreamClock(role));if(role===selectedRole)Object.assign(player,{x:p.x*.88,y:p.y*.88});else Object.assign(party.find(p=>p.role===role),dreamCloneWaitingPos(dreamClock(role)));}
 dreamLinkPractice={done:false,origin:{rangeStart:origin.rangeStart,rangeEnd:origin.rangeEnd}};demoMode=false;$('playMode').value='practice';
 history=[];record();toast('Exercice liens · ton clone est en '+marks[dreamClock(selectedRole)]+'. Les liens apparaissent dans 4 secondes.');updateUI();render();play();
}
function updateDreamLinkPractice(){
 if(!dreamLinkPractice||dreamLinkPractice.done||!isDreamActive())return;
 const result=dream.events.find(e=>e.key==='lock');if(!result)return;
 dreamLinkPractice.done=true;running=false;keys.clear();resetStick();
 if(result.errors.some(e=>e.roles.includes(selectedRole)))return;
 const source=dreamSource(selectedRole);
 $('dreamPracticeResult').textContent=`Tu as conservé le bon lien : ${types[source.type].name} en ${marks[source.id]} · ${DREAM_LESSON_DIRECTIONS[source.id]}.`;
 updateUI();$('dreamPracticeDialog').showModal();
}
