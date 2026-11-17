'use strict';
function dreamLessonDemoStep(c){return c.variant==='finale'?5:c.kind==='towers'&&c.variant!=='elements'?4:3;}
function drawDreamGroupHalves(clones=false){
 // Clone A includes south and west; B includes north and east.
 const radius=20.4*DS,angle=clones?-Math.PI/8:0;
 ctx.save();ctx.rotate(angle);
 for(const [start,color] of [[Math.PI/2,'#e65d6938'],[-Math.PI/2,'#70dca038']]){
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,radius,start,start+Math.PI);ctx.closePath();ctx.fillStyle=color;ctx.fill();
 }
 ctx.beginPath();ctx.moveTo(0,-radius);ctx.lineTo(0,radius);ctx.strokeStyle='#e4f8ed90';ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function renderDreamDemoLesson(){
 const c=dreamLinkLesson,kind=dreamLessonKind(c),total=dreamLessonDemoStep(c)+1;
 // Reuse the exercise actions of the previous step.
 c.step--;renderDreamLinkLesson();c.step++;
 document.body.classList.add('dream-lesson-final');
 $('dreamLessonStep').textContent=`IDYLLIC DREAM · ${DREAM_WORKSHOPS[kind].toUpperCase()} · ${total} / ${total}`;
 $('dreamLessonTitle').textContent='Démonstration';
 const copy={links:'Observe le joueur repérer son clone, puis récupérer le bon lien. Les autres joueurs prennent ensuite leurs liens au contact.',read:'Observe le choix de la plateforme, la lecture du débuff et des tours, puis le retour à la tour mémorisée. La séquence intermédiaire est passée après la mémorisation.',pairs:'Les quatre vagues s’enchaînent dans l’ordre du tirage. Regarde les joueurs rejoindre les stacks entre les deux passages de défamations.',elements:'Observe le placement dans les tours, la résolution des éléments, puis les cônes proche et loin.',finale:'Observe le portail, les deux passages de stacks et le retour sur l’îlot sûr, jusqu’au dernier cône.'};
 $('dreamLessonCopy').innerHTML=`<p>${copy[kind]}</p><p>Ton personnage <b>${c.role}</b> est mis en évidence. La séquence se rejoue en boucle ; tu peux ensuite essayer ce même tirage.</p>`;
 $('dreamLessonNext').hidden=true;$('dreamLessonPrevious').disabled=false;$('dreamLessonActions').hidden=false;
 $('repeatDreamLesson').textContent='Revoir la démonstration';$('stateChip').textContent='DÉMONSTRATION';
 syncDreamLessonActions();
 canvas.setAttribute('aria-label',`Démonstration complète : ${DREAM_WORKSHOPS[kind]}. Joueur ${c.role}.`);
}
function dreamPairDemoFrame(c,elapsed){
 const at=[0,1,2,3].map(i=>6+i*5+(c.sources[i].type==='defam'?1.2:0));
 const end=at[3]+2,t=Math.min(Math.max(0,elapsed),end),wave=Math.min(3,at.filter(x=>t>x+.4).length);
 const positions={};
 for(const role of roles){
  let p=dp((roles.indexOf(role)%4-1.5)*1.1,4+Math.floor(roles.indexOf(role)/4));
  for(let i=0;i<=wave;i++){
   const start=i===0?1:at[i-1]+.4,finish=Math.min(t,i<wave?at[i]+.4:t);
   p=dreamLessonMove(p,dreamPairsTarget(c,role,i),finish-start-(role===c.role?0:.25));
  }
  positions[role]=p;
 }
 return {t,wave,at,positions,done:elapsed>=end};
}
function drawDreamPairsDemo(c){
 const f=dreamPairDemoFrame(c,c.elapsed%dreamDemoDuration(c)),defam=c.sources[f.wave].type==='defam';
 drawDreamArenaFloor(false);drawWaymarks(DS);dragon(0,0,55,true);
 text('GROUPE A',-155,-65,17,'#ffb9c0','700');text('GROUPE B',155,-65,17,'#b4f5ca','700');
 for(let i=0;i<4;i++){
  const type=c.sources[i].type,n=c.sources.slice(0,i+1).filter(s=>s.type===type).length;
  text(`${i+1}. ${type==='defam'?'Défam':'Stack'} ${n}`,-270+i*180,-360,17,i===f.wave?'#bcffec':'#91a5b4',i===f.wave?'700':'400');
 }
 const resolving=Math.abs(f.t-f.at[f.wave])<.4;
 if(resolving)for(const role of roles){
  if(dreamPairsSource(c,role).id%4!==f.wave)continue;
  const p=f.positions[role];circle(p.x,p.y,(defam?20:5)*DS,defam?'#ed29392b':'#85e7d240',defam?'#ff8e99':'#85e7d2',3);
 }
 for(const role of roles){const p=f.positions[role];if(role===c.role)circle(p.x,p.y,24,null,'#bcffec',3);playerDot({...p,role,a:0},role===c.role?15:11);if(role===c.role)drawDreamPersonalMechanic(c,p);}
 text(f.done?'DÉMONSTRATION TERMINÉE':resolving?'RÉSOLUTION':`VAGUE ${f.wave+1} · ${defam?'DÉFAMATIONS':'STACKS'}`,0,360,18,'#c9e8df','700');
}
function drawDreamDemoLesson(){
 const c=dreamLinkLesson,kind=dreamLessonKind(c);if(kind==='pairs'){drawDreamPairsDemo(c);return;}
 const saved={step:c.step,elapsed:c.elapsed},t=c.elapsed%dreamDemoDuration(c);
 c.demoPlayback=true;
 try{
  // The explanatory scenes become a single chronological sequence, repeated after a short pause.
  if(kind==='links'){
   c.step=t<4?1:2;c.elapsed=t<4?t:Math.min(t-4,13.2);drawDreamLinkLesson();
  }else if(kind==='read')drawDreamTowerDemo(c,t);
  else if(kind==='elements'){
   c.step=t<4?0:t<12?1:2;c.elapsed=t<4?t:t<12?t-4:Math.min(t-12,12);drawDreamElementLesson();
  }else{
   const starts=[0,5,13,21,29];c.step=t<5?0:t<13?1:t<21?2:t<29?3:4;
   c.elapsed=Math.min(t-starts[c.step],c.step===4?14:15);drawDreamFinaleLesson();
  }
 }finally{c.step=saved.step;c.elapsed=saved.elapsed;delete c.demoPlayback;}
}
function drawDreamTowerDemo(c,t){
 const returning=t>=16,split=t>=4&&t<16||t>=20;
 if(split)drawDreamPlatforms();else {drawDreamArenaFloor(true);drawDreamGroupHalves(false);}
 if(!split)drawWaymarks(DS);dragon(0,0,55,true);
 if(t>=4)for(const tower of c.towers){circle(tower.x,tower.y,3*DS,'#bee8ff08',DREAM_ELEMENTS[tower.type].color,2);drawDreamMeteor(tower,75,.65);}
 if(t>=3&&t<16)drawDreamLessonArcanum(c,t-2,Object.fromEntries(roles.map(role=>[role,t<7?dreamLessonMove(dp((roles.indexOf(role)%4-1.5)*1.1,4+Math.floor(roles.indexOf(role)/4)),c.towers[dreamPreTower(role)],t-1-(role===c.role?0:.25)):dreamLessonMove(c.towers[dreamPreTower(role)],dreamElementTower(c,role),t-7-(role===c.role?0:.25))])));
 for(const [i,role] of roles.entries()){
  const pre=c.towers[dreamPreTower(role)],target=dreamElementTower(c,role),center=dp((i%4-1.5)*1.1,4+Math.floor(i/4));
  const p=t<7?dreamLessonMove(center,pre,t-1-(role===c.role?0:.25)):returning?dreamLessonMove(center,target,t-17-(role===c.role?0:.25)):dreamLessonMove(pre,target,t-7-(role===c.role?0:.25));
  if(role===c.role)circle(p.x,p.y,24,null,'#bcffec',3);playerDot({...p,role,a:0},role===c.role?15:11);
 }
 text(t<4?'REJOINDRE SA PLATEFORME':t<7?'LIRE LE DÉBUFF ET LES TOURS':t<16?'CHOISIR ET MÉMORISER SA TOUR':t<20?'APRÈS LES DÉFAMATIONS ET STACKS · RETOUR':t<24?'RETROUVER SA TOUR':'DÉMONSTRATION TERMINÉE',0,-350,16,'#c9e8df','700');
 if(t>=3&&t<16)text(t<6.6?'ARCADIAN ARCANUM · AOE DE LUMIÈRE':c.light?'VULNÉRABILITÉ → FEU / TERRE':'SANS VULNÉRABILITÉ → VENT / TÉNÈBRES',0,320,17,'#f8eaba','700');
}

function dreamDemoDuration(c){
 const kind=dreamLessonKind(c);
 return kind==='pairs'?dreamPairDemoFrame(c,100).at[3]+4:({links:20,read:28,elements:28,finale:47}[kind]??28);
}
function drawDreamPersonalMechanic(c,p){
 const clock=c.scenario.clocks[roles.indexOf(c.role)],[type,n]=DREAM_PICKUPS[clock],label=(n%2+1)+(clock<4?'B':'A');
 icon(type,p.x,p.y-48,19);text(label,p.x+32,p.y-47,20,'#d8fff1','700');
}
