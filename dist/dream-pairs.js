'use strict';
function dreamPairsGroup(c,role){return c.scenario.clocks[roles.indexOf(role)]<4?1:0;}
function dreamPairsSource(c,role){const [type,n]=DREAM_PICKUPS[c.scenario.clocks[roles.indexOf(role)]];return c.sources.filter(s=>s.type===type)[n];}
function dreamPairsTarget(c,role,wave){
 const i=roles.indexOf(role),group=dreamPairsGroup(c,role),side=group?1:-1,source=dreamPairsSource(c,role),defam=c.sources[wave].type==='defam';
 if(defam)return source.id%4===wave?dp(side*13.5,-13.5):dp((i%4-1.5)*.25,5.9+Math.floor(i/4)*.3);
 return dreamPairStackTarget(role,group);
}
function renderDreamPairsLesson(){
 if(dreamLinkLesson.step===dreamLessonDemoStep(dreamLinkLesson)){renderDreamDemoLesson();return;}
 const c=dreamLinkLesson,s=c.step,source=c.expected,group=dreamPairsGroup(c,c.role)?'B':'A',side=group==='A'?'gauche':'droite',first=c.sources[0].type==='defam',ordinal=c.sources.filter(p=>p.type===source.type).findIndex(p=>p.id===source.id),label=(ordinal%2+1)+group;
 document.body.classList.toggle('dream-lesson-final',s===3);$('closeDreamLesson').setAttribute('aria-label',c.error?'Revenir à l’erreur':'Revenir à l’arène');$('restartLessonTraining').textContent='Recommencer Idyllic Dream';
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · DÉFAMATIONS ET STACKS · ${s+1} / 5`;$('dreamLessonTitle').textContent=['Lire l’ordre des vagues','Ton clone détermine ta mécanique','Résoudre les défamations','Rejoindre le bon stack'][s];
 const order=[0,1,2,3].map(i=>c.sources[i].type==='defam'?'Défam':'Stack').join(' → ');
 const copy=[
  dreamTeachingCopy(
   '<p>Les mécaniques affichées sur les clones en <b>A et C</b> donnent la première vague. Les paires opposées se résolvent dans l’ordre <b>A/C → 1/3 → B/D → 2/4</b>, en alternant défamation et stack.</p>',
   `<p>En A/C, on voit ${first?'une <b>défamation</b>':'un <b>stack</b>'}. Ce tirage commence donc par ${first?'défamation':'stack'} :</p><p class="lesson-sequence">${order}</p>`),
  dreamTeachingCopy(
   '<p>Les joueurs ont pris leurs mécaniques pour reproduire ce plan :</p><p><b>A/C : premières défamations · 2/4 : deuxièmes.<br>1/3 : premiers stacks · B/D : deuxièmes.</b></p><p>Groupe de clones <b>A = C/3/D/4</b> ; <b>B = A/1/B/2</b>. Le groupe reste le même pour les quatre vagues.</p>',
   `<p>Ton clone est en <b>${marks[c.clock]}</b>. À cette position, le plan indique <b>${source.type==='defam'?'la '+(ordinal%2===0?'première':'deuxième')+' défamation':'le '+(ordinal%2===0?'premier':'deuxième')+' stack'}</b>.</p><p>Tu es dans le <b>groupe ${group}</b> : stacks à <b>${group==='A'?'l’ouest':'l’est'}</b> et défamations au <b>${group==='A'?'nord-ouest':'nord-est'}</b>.</p>`),
  dreamTeachingCopy(
   '<p>À chaque vague de défamations, seuls les deux joueurs concernés s’isolent : <b>A au nord-ouest, B au nord-est</b>. Les six autres attendent <b>au sud, près du boss</b>.</p><p>Après ta défamation, reviens rejoindre les autres. Ne traverse pas la défamation d’un autre joueur.</p>',
   `<p>${source.type==='defam'?`Tu as la <b>${ordinal%2===0?'première':'deuxième'} défamation</b> du groupe ${group}. Isole-toi au <b>${group==='A'?'nord-ouest':'nord-est'}</b> à ce passage ; attends au sud pendant l’autre.`:'Ton clone te donne un <b>stack</b> : tu attends au sud pendant les deux passages de défamations.'}</p>`),
  dreamTeachingCopy(
   '<p>À <b>chaque</b> vague de stacks, les quatre joueurs de chaque groupe partagent : <b>A à l’ouest du boss, B à l’est</b>.</p><p>Tout le monde participe aux deux stacks, y compris les joueurs avec une défamation. Ne manque pas ton stack et ne rejoins pas l’autre groupe.</p>',
   `<p>Tu es du <b>groupe ${group}</b> : rejoins <b>${group==='A'?'l’ouest':'l’est'} du boss</b> aux deux passages de stacks.</p>`,c.error)
 ];
 $('dreamLessonCopy').innerHTML=copy[s];$('dreamLessonPrevious').disabled=s===0;$('dreamLessonNext').hidden=false;$('dreamLessonNext').textContent=s===3?'Démonstration →':'Suite →';$('repeatDreamLesson').textContent='Revoir l’animation';$('dreamLessonActions').hidden=s!==3;
 $('practiceDreamLinks').textContent='M’entraîner · nouveau tirage';$('practiceDreamLinks').onclick=()=>startDreamTowerPractice(true,'pairs');$('retryTowerLesson').hidden=false;$('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('retryTowerLesson').onclick=()=>startDreamTowerPractice(false,'pairs');
 $('dreamLessonPracticeHint').textContent='Départ au retour rouge · clone et ordre rappelés · quatre vagues.';$('stateChip').textContent='EXPLICATION';$('simTitle').textContent='Idyllic Dream · défamations et stacks';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Explication ${s+1} : ${$('dreamLessonTitle').textContent}. ${c.role}, groupe ${group}, ${label}.`);
}
function drawDreamPairsLesson(){
 const c=dreamLinkLesson,s=c.step;
 if(s>=2){drawDreamPairsDemo(c);if(s===3&&c.error){circle(c.position.x,c.position.y,24,null,'#ff8e99',3);text('TON PLACEMENT',c.position.x,c.position.y+38,12,'#ffb3be','700');}text(s===2?'DEUX PASSAGES DE DÉFAMATIONS · STACKS ENTRE LES DEUX':'QUATRE JOUEURS PAR STACK',0,-410,16,'#c9e8df','700');return;}
 drawDreamArenaFloor(false);if(s===1)drawDreamGroupHalves(true);drawWaymarks(DS);dragon(0,0,55,true);
 if(s===1){text('GROUPE A',-155,-65,17,'#a6ffe3','700');text('GROUPE B',155,-65,17,'#a6ffe3','700');}
 if(s<2){
  for(const p of c.sources){const pos=dreamClonePos(p.id);dragon(pos.x,pos.y,31);icon(s===1?DREAM_PICKUPS[p.id][0]:p.type,pos.x,pos.y+38,21);if(s===1)text((DREAM_PICKUPS[p.id][1]%2+1)+(p.id<4?'B':'A'),pos.x+35,pos.y+40,17,'#e0f7ef','700');if(s===0&&[0,4].includes(p.id)||s===1&&p.id===c.clock)circle(pos.x,pos.y,43,null,'#a6ffe3',3);}
  if(s===1){const pos=dreamClonePos(c.clock);text('TON CLONE',pos.x,pos.y-52,15,'#a6ffe3','700');}
 }
 text(['A / C DONNENT LA PREMIÈRE VAGUE','ORDRE DU PLAN · TON CLONE','S’ISOLER À SON TOUR','QUATRE JOUEURS PAR STACK'][s],0,-375,16,'#c9e8df','700');
 if(s===3&&c.error){circle(c.position.x,c.position.y,24,null,'#ff8e99',3);text('TON PLACEMENT',c.position.x,c.position.y+38,12,'#ffb3be','700');}
}
