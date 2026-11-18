'use strict';
// Element lessons reuse the failed draw; illustrations never mutate live combat state.
function dreamElementTower(c,role){
 const inner=rep1Melee(role),light=(kind(role)!=='dps')===c.scenario.lightSupports;
 return c.towers.find(t=>(t.side<0)===dreamWest(role)&&(Math.abs(t.x)<14*DS)===inner&&['fire','earth'].includes(t.type)===light);
}
function dreamElementPosition(c,role){
 const t=dreamElementTower(c,role),p={x:t.x,y:t.y};
 if(t.type==='wind')p.x-=t.side*1.5*DS;
 if(t.type==='dark'){if(rep1Melee(role))p.y+=Math.sign(t.y)*1.5*DS;else p.x+=t.side*1.5*DS;}
 return p;
}
function dreamElementBait(c,role){
 const t=dreamElementTower(c,role),side=t.side*(t.type==='wind'?-1:1);
 return t.type==='wind'?dp(side*8,-7):t.type==='dark'?dp(side*8.5,-1.5):t.type==='earth'?dp(side*10.5,-1.5):dp(side*8,7);
}
function dreamElementAfter(c,role){
 const t=dreamElementTower(c,role),p=dreamElementPosition(c,role);
 if(t.type==='wind')return{x:p.x-t.side*23.5*DS,y:p.y};
 return p;
}
function dreamElementFrame(c,role,elapsed){
 const t=dreamElementTower(c,role),p=dreamElementPosition(c,role),impact=1;
 if(c.step===0)return dreamLessonMove(t,p,elapsed-(role===c.role?1:c.demoPlayback?1.25:6));
 if(c.step===1){
  if(t.type==='wind'){const end=dreamElementAfter(c,role),f=Math.min(1,Math.max(0,(elapsed-impact)/1.2));return{x:p.x+(end.x-p.x)*f,y:p.y+(end.y-p.y)*f};}
  if(t.type==='earth')return dreamLessonMove(p,dp(t.side*14,0),elapsed-impact);
  return p;
 }
 const start=t.type==='earth'?dp(t.side*14,0):dreamElementAfter(c,role);
 return dreamLessonMove(start,dreamElementBait(c,role),elapsed-(role===c.role?1:c.demoPlayback?1.25:6));
}
function renderDreamElementLesson(){
 if(dreamLinkLesson.step===dreamLessonDemoStep(dreamLinkLesson)){renderDreamDemoLesson();return;}
 const c=dreamLinkLesson,s=c.step,type=c.target.type,side=c.target.side<0?'gauche':'droite';
 const orientation={fire:'Absorbe ta tour, puis reste immobile pendant les <b>5 secondes</b> du débuff feu. Attends la fin du décompte avant de partir.',earth:'Absorbe ta tour, puis <b>quitte la flaque</b> avant son explosion. Tu peux rejoindre le centre de ta plateforme.',wind:'Dans ta tour, décale-toi <b>horizontalement du côté du vide central</b>. Le saut part du centre du météore vers toi : il doit t’envoyer sur <b>l’autre plateforme</b>.',dark:`Dans ta tour, décale-toi <b>${c.inner?'vers le nord ou le sud, côté bord':'horizontalement vers le bord extérieur'}</b>. Le rayon part du météore vers toi : dirige-le hors des autres joueurs.`};
 const bait={fire:'Après la fin du feu, rejoins le <b>sud intérieur</b> de ta plateforme. Tu dois être le <b>plus loin</b> du joueur vent situé sur l’autre plateforme.',earth:'Place-toi <b>juste à l’extérieur du joueur ténèbres</b> de ta plateforme. Tu dois être son joueur <b>le plus proche</b>.',wind:'Après le saut, rejoins le <b>nord intérieur de ta nouvelle plateforme</b>. Ton cône doit viser le <b>feu de l’autre plateforme</b>, le plus éloigné de toi.',dark:'Rejoins le <b>centre intérieur</b> de ta plateforme. Le joueur <b>terre</b> se place juste à ton extérieur pour recevoir ton cône proche.'};
 document.body.classList.toggle('dream-lesson-final',s===2);
 $('closeDreamLesson').setAttribute('aria-label',c.error?'Revenir à l’erreur':'Revenir à l’arène');$('restartLessonTraining').textContent='Recommencer Idyllic Dream';
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · EFFETS DES TOURS · ${s+1} / 4`;
 $('dreamLessonTitle').textContent=['Préparer ton élément','À l’absorption des tours','Placer les cônes proche / loin'][s];
 const intro=`Tu joues <b>${c.role}</b>, ta tour est <b>${DREAM_ELEMENTS[type].name.toLowerCase()}</b>, sur la plateforme de <b>${side}</b>.`;
 const rules=[
  '<p>Chaque élément demande une réaction différente. Le <b>vent</b> projette du centre de la tour vers le joueur ; les <b>ténèbres</b> tirent un rayon dans cette direction. Le <b>feu</b> impose l’immobilité ; la <b>terre</b> laisse une flaque à quitter.</p>',
  '<p><b>Feu : reste immobile 5 s.</b><br><b>Terre : quitte la flaque.</b><br><b>Vent : rejoins l’autre plateforme par le saut.</b><br><b>Ténèbres : dirige le rayon vers le bord.</b> Esuna est automatique.</p>',
  '<p>Le joueur <b>ténèbres</b> vise le joueur le plus proche : c’est <b>terre</b>. Le joueur <b>vent</b> vise le plus éloigné : c’est <b>feu sur l’autre plateforme</b>.</p><p>Terre se place juste à l’extérieur de ténèbres ; vent au nord intérieur et feu au sud intérieur. Les cônes doivent éviter les autres joueurs.</p>'
 ];
 $('dreamLessonCopy').innerHTML=dreamTeachingCopy(rules[s],`<p>${intro}</p><p>${s===2?bait[type]:orientation[type]}</p>`,s===2?c.error:null);
 $('dreamLessonPrevious').disabled=s===0;$('dreamLessonNext').hidden=false;$('dreamLessonNext').textContent=s===2?'Démonstration →':'Suite →';$('repeatDreamLesson').textContent='Revoir l’animation';$('dreamLessonActions').hidden=s!==2;
 $('practiceDreamLinks').textContent='M’entraîner · nouveau tirage';$('practiceDreamLinks').onclick=()=>startDreamTowerPractice(true,'elements');
 $('retryTowerLesson').hidden=false;$('retryTowerLesson').textContent='M’entraîner sur cet exemple';$('retryTowerLesson').onclick=()=>startDreamTowerPractice(false,'elements');
 $('dreamLessonPracticeHint').textContent='Près de ta tour · 4 s avant l’absorption · jusqu’aux cônes proche / loin.';
 $('stateChip').textContent='EXPLICATION';$('simTitle').textContent='Idyllic Dream · effets des tours';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Explication ${s+1} : ${$('dreamLessonTitle').textContent}. ${c.role}, élément ${DREAM_ELEMENTS[type].name}.`);
}
function drawDreamElementLesson(){
 const c=dreamLinkLesson,s=c.step,t=c.elapsed%15;
 drawDreamPlatforms();drawWaymarks(DS);dragon(0,0,55,true);
 const positions=Object.fromEntries(roles.map(r=>[r,dreamElementFrame(c,r,t)]));
 for(const tower of c.towers){
  if(s===0){circle(tower.x,tower.y,3*DS,'#bee8ff08',DREAM_ELEMENTS[tower.type].color,2);drawDreamMeteor(tower,75,.65);}
  if(s===1&&t>=1&&tower.type==='earth')circle(tower.x,tower.y,4*DS,'#c6ba9b33','#c6ba9b',2);
 }
 for(const r of roles){
  const tower=dreamElementTower(c,r),p=positions[r],mine=r===c.role;
  if(s===0&&mine){const end=dreamElementPosition(c,r);line(tower,end,'#a6ffe3',3,[7,6]);circle(end.x,end.y,22,null,'#a6ffe3',2);}
  if(s===1&&tower.type==='dark'&&t>=1&&t<2.2){const dx=p.x-tower.x,dy=p.y-tower.y,n=Math.hypot(dx,dy)||1;line(tower,{x:tower.x+dx/n*260,y:tower.y+dy/n*260},'#c09aff',10);}
  if(s===1&&tower.type==='fire'&&t>=1&&t<6){circle(p.x,p.y,24,null,'#ff8a3d',3);text((6-t).toFixed(1)+' s',p.x,p.y-32,14,'#ffc599','700');}
  if(s===2){const dest=dreamElementBait(c,r);if(mine){line(p,dest,'#a6ffe3',3,[7,6]);circle(dest.x,dest.y,23,null,'#a6ffe3',2);}
   if(t>=10&&['dark','wind'].includes(tower.type)){const sorted=roles.filter(k=>k!==r).sort((a,b)=>dist(positions[a],p)-dist(positions[b],p)),target=tower.type==='dark'?sorted[0]:sorted.at(-1),end=positions[target];ctx.save();ctx.beginPath();for(const side of [-1,1]){ctx.moveTo((side*14+10)*DS,0);ctx.arc(side*14*DS,0,10*DS,0,TAU);}ctx.clip();drawSector(p,-Math.atan2(end.x-p.x,-(end.y-p.y)),Math.PI/12,60*DS,tower.type==='dark'?'#c09aff45':'#9adfa745');ctx.restore();line(p,end,DREAM_ELEMENTS[tower.type].color,3);}
  }
 }
 for(const r of roles){const p=positions[r],tower=dreamElementTower(c,r);playerDot({...p,role:r,a:0},r===c.role?15:11);text(DREAM_ELEMENTS[tower.type].name,p.x,p.y+30,12,DREAM_ELEMENTS[tower.type].color,'700');}
 text(['SE PLACER DANS SA TOUR','RÉSOUDRE SON ÉLÉMENT','TERRE PROCHE · FEU LOIN'][s],0,-350,17,'#c9e8df','700');
 if(s===2&&c.error){circle(c.position.x,c.position.y,24,null,'#ff8e99',3);text('TON PLACEMENT',c.position.x,c.position.y+38,12,'#ffb3be','700');}
}
