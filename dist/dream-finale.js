'use strict';
function dreamFinaleClones(c,wave){
 const parity=(c.scenario.cardinalFirst?0:1)^(wave===2?1:0);
 return roles.filter(r=>c.scenario.clocks[roles.indexOf(r)]%2===parity).map(role=>{const clock=c.scenario.clocks[roles.indexOf(role)];return{role,clock,...dreamClonePos(clock),type:c.assignments?.[role]??DREAM_PICKUPS[clock][0]};});
}
function dreamFinaleStack(c,role,wave){const clone=dreamFinaleClones(c,wave).find(p=>p.type==='stack'&&(p.x<0)===dreamWest(role));return clone?{...clone,x:clone.x*1.11,y:clone.y*1.11}:{...dp(dreamWest(role)?-5.5:5.5,8),clock:null,missing:true};}
function dreamFinaleSafe(c,role){const side=c.scenario.coneEast?1:-1,vertical=c.scenario.verticalNorth!==c.scenario.absorbedNorth,i=roles.indexOf(role);return vertical?dp(side*(8+(i%2)*.55),(Math.floor(i/2)-1.5)*.5):dp(side*(14+(i%2)*.5),-6.5-Math.floor(i/2)*.5);}
function dreamFinaleEnd(c,role){return c.scenario.verticalNorth===c.scenario.absorbedNorth?dp(dreamWest(role)?-12:12,-7.5):dp((roles.indexOf(role)%4-1.5)*.4,4+Math.floor(roles.indexOf(role)/4)*.5);}
function renderDreamFinaleLesson(){
 if(dreamLinkLesson.step===dreamLessonDemoStep(dreamLinkLesson)){renderDreamDemoLesson();return;}
 const c=dreamLinkLesson,s=c.step,vertical=c.scenario.verticalNorth!==c.scenario.absorbedNorth,first=dreamFinaleStack(c,c.role,1),second=dreamFinaleStack(c,c.role,2);
 document.body.classList.toggle('dream-lesson-final',s===4);$('closeDreamLesson').setAttribute('aria-label',c.error?'Revenir à l’erreur':'Revenir à l’arène');$('restartLessonTraining').textContent='Recommencer Idyllic Dream';
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · PORTAIL ET RECONSTITUTIONS · ${s+1} / 6`;
 $('dreamLessonTitle').textContent=['Retenir l’ordre des clones','Lire le portail et le saut','Rejoindre le premier stack','Retrouver l’îlot sûr','Second stack et dernier cône'][s];
 const copy=[
  dreamTeachingCopy(
   '<p>La formation apparue en premier au début d’Idyllic Dream se rejoue en premier : <b>cardinaux (A/B/C/D)</b> ou <b>intercardinaux (1/2/3/4)</b>. L’autre formation se rejoue ensuite.</p><p>Stacks en <b>groupes de rôles 1/2</b> : MT/H1/M1/R1 à gauche ; OT/H2/M2/R2 à droite.</p>',
   `<p>Ici : <b>${c.scenario.cardinalFirst?'cardinaux → intercardinaux':'intercardinaux → cardinaux'}</b>. Tu es <b>${c.role}, groupe ${c.group}</b> : stacks à <b>${c.group===1?'gauche':'droite'}</b>.</p>`),
  dreamTeachingCopy(
   '<p>Retire mentalement le clone absorbé par le portail, au nord ou au sud. Mémorise son orientation pour la fin. Après le saut des autres clones, retiens <b>l’îlot du clone à cônes</b> et leur orientation.</p><p><b>Cônes nord/sud → côté intérieur.<br>Cônes est/ouest → nord ou sud de l’îlot.</b></p>',
   `<p>Le portail absorbe le clone au <b>${c.scenario.absorbedNorth?'nord':'sud'}</b>. Le clone à cônes saute à <b>${c.scenario.coneEast?'droite':'gauche'}</b>, avec des cônes <b>${vertical?'nord/sud':'est/ouest'}</b>.</p>`),
  dreamTeachingCopy(
   '<p>Au premier retour rouge, retrouve le <b>clone à stack du côté de ton groupe 1/2</b>, dans la première formation. Les quatre joueurs partagent ce stack et évitent les deux défamations.</p>',
   `<p>Première formation : <b>${c.scenario.cardinalFirst?'cardinale':'intercardinale'}</b>. Groupe <b>${c.group}</b> : rejoins le <b>stack ${first.missing?'absent : les mécaniques prises auparavant sont incorrectes':marks[first.clock]}</b>, à <b>${c.group===1?'gauche':'droite'}</b>.</p>`),
  dreamTeachingCopy(
   '<p>Avant la séparation, rejoins <b>l’îlot mémorisé du clone à cônes</b>. L’autre îlot est dangereux. Sur le bon îlot, évite les cônes selon leur orientation, puis attends le retour rouge.</p>',
   `<p>Ici : îlot de <b>${c.scenario.coneEast?'droite':'gauche'}</b>. ${vertical?'Cônes <b>nord/sud</b> : place-toi <b>à l’intérieur, côté boss</b>.':'Cônes <b>est/ouest</b> : place-toi <b>au nord ou au sud</b> de l’îlot.'}</p>`),
  dreamTeachingCopy(
   '<p>L’autre formation se rejoue : reprends le <b>stack de ton groupe 1/2</b>. Puis le clone absorbé revient au nord avec ses cônes mémorisés.</p><p><b>Cônes nord/sud → écarte-toi à gauche ou à droite.<br>Cônes est/ouest → passe au sud de lui, près du centre.</b></p>',
   `<p>Deuxième stack : <b>${second.missing?'absent : vérifie les mécaniques prises auparavant':marks[second.clock]}</b>, groupe <b>${c.group}</b>. Puis ${c.scenario.verticalNorth===c.scenario.absorbedNorth?'cônes <b>nord/sud</b> : reste sur un côté':'cônes <b>est/ouest</b> : rejoins le sud du clone, près du centre'}.</p>`,c.error)
 ];
 $('dreamLessonCopy').innerHTML=copy[s];$('dreamLessonPrevious').disabled=s===0;$('dreamLessonNext').hidden=false;$('dreamLessonNext').textContent=s===4?'Démonstration →':'Suite →';$('repeatDreamLesson').textContent='Revoir l’animation';$('dreamLessonActions').hidden=s!==4;
 $('practiceDreamLinks').textContent='M’entraîner · nouveau tirage';$('practiceDreamLinks').onclick=()=>startDreamTowerPractice(true,'finale');$('retryTowerLesson').hidden=false;$('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('retryTowerLesson').onclick=()=>startDreamTowerPractice(false,'finale');
 $('dreamLessonPracticeHint').textContent='Départ 4 s avant le portail · ordre initial rappelé · jusqu’au dernier cône.';$('stateChip').textContent='EXPLICATION';$('simTitle').textContent='Idyllic Dream · portail et reconstitutions';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Explication ${s+1} : ${$('dreamLessonTitle').textContent}. ${c.role}, groupe ${c.group}.`);
}
// Group moves keep a short player lead while every dot uses manual movement speed.
function dreamFinaleRoute(c,role,step){
 return {start:step===2?dp(dreamWest(role)?-10:10,4):step===3?dreamFinaleStack(c,role,1):dreamFinaleSafe(c,role),end:step===2?dreamFinaleStack(c,role,1):step===3?dreamFinaleSafe(c,role):dreamFinaleStack(c,role,2)};
}
function dreamFinaleGroupStart(c,role){return role===c.role?1:1.25;}
function dreamFinaleSplitAt(c){
 return Math.max(...roles.map(role=>{const route=dreamFinaleRoute(c,role,3);return dreamFinaleGroupStart(c,role)+dist(route.start,route.end)/DREAM_MOVE_SPEED;}))+.35;
}
function drawDreamFinaleLesson(){
 const c=dreamLinkLesson,s=c.step,t=c.elapsed%16,vertical=c.scenario.verticalNorth!==c.scenario.absorbedNorth;
 const split=s===1||s===3&&t>=dreamFinaleSplitAt(c);
 if(split)drawDreamPlatforms();else drawDreamArenaFloor(s===0||s===3);
 drawWaymarks(DS);dragon(0,0,55,true);
 if(s===0){for(const wave of [1,2])for(const p of dreamFinaleClones(c,wave)){dragon(p.x,p.y,32);icon(p.type,p.x,p.y+45,20);text(wave===1?'1er':'2e',p.x,p.y-42,18,wave===1?'#a6ffe3':'#eacfa8','700');}}
 if(s===1){
  const absorbed=dp(0,c.scenario.absorbedNorth?DREAM_CLONE_Z.north:DREAM_CLONE_Z.south),start=dp(0,c.scenario.absorbedNorth?DREAM_CLONE_Z.south:DREAM_CLONE_Z.north),end=dp(c.scenario.coneEast?14:-14,0),f=Math.min(1,Math.max(0,(t-3)/1.1));
  circle(absorbed.x,absorbed.y,36,'#060912','#b399ec',3);text('PORTAIL',absorbed.x,absorbed.y-45,15,'#d5b7ff','700');dragon(absorbed.x,absorbed.y,32);
  const p={x:start.x+(end.x-start.x)*f,y:start.y+(end.y-start.y)*f};dragon(p.x,p.y,38);text(vertical?'↕':'↔',p.x,p.y+45,30,'#ffe6bd');
  const orb=dp(-end.x/DS*f,DREAM_CLONE_Z.kick*(1-f));dragon(orb.x,orb.y,36);circle(orb.x,orb.y,28,null,'#ffe6bd',3);
 }
 if(s===2||s===4&&t<9){const wave=s===2?1:2;for(const clone of dreamFinaleClones(c,wave)){dragon(clone.x,clone.y,32);icon(clone.type,clone.x,clone.y-40,22);if(clone.type==='defam')circle(clone.x,clone.y,20*DS,'#ed293918','#ff8e99',2);else circle(clone.x,clone.y,5*DS,'#85e7d222','#85e7d2',2);}}
 if(s===3&&split){const p=dp(c.scenario.coneEast?14:-14,0);dragon(p.x,p.y,38);for(const axis of [vertical?0:Math.PI/2,vertical?Math.PI:Math.PI*1.5])drawSector(p,axis,Math.PI/4,16*DS,'#ed293930');circle(-p.x,0,10*DS,'#ed293930','#ff8e99',2);}
 if(s===4&&t>=9){const p=dp(0,-7.5);dragon(p.x,p.y,38);const v=c.scenario.verticalNorth===c.scenario.absorbedNorth;for(const axis of [v?0:Math.PI/2,v?Math.PI:Math.PI*1.5])drawSector(p,axis,Math.PI/4,30*DS,'#ed293930');}
 if(s!==0&&s!==1)for(const role of roles){
  let {start,end}=dreamFinaleRoute(c,role,s),at=t-dreamFinaleGroupStart(c,role);
  if(s===4&&t>=9){start=dreamFinaleStack(c,role,2);end=dreamFinaleEnd(c,role);at=t-9-(role===c.role?0:.25);}
  const p=dreamLessonMove(start,end,at);if(role===c.role){line(start,end,'#a6ffe3',3,[7,6]);circle(end.x,end.y,24,null,'#a6ffe3',2);}playerDot({...p,role,a:0},role===c.role?15:11);
 }
 text(['ORDRE DES FORMATIONS','MÉMORISER LE CLONE À CÔNES','PREMIER STACK','ÎLOT ET ZONE SÛRE','SECOND STACK · DERNIER CÔNE'][s],0,-350,17,'#c9e8df','700');
 if(s===4&&c.error){circle(c.position.x,c.position.y,24,null,'#ff8e99',3);text('TON PLACEMENT',c.position.x,c.position.y+38,12,'#ffb3be','700');}
}
