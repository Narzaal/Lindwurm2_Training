'use strict';
// Pull-relative reference clock, reconstructed from the BossMod state machine.
// Event times are tenths, not a claim of frame-perfect timing for every pull.
const ENCOUNTER={rep1:27.7,rep2:105.4,candy:180.7,dream:264.5,lastSobat:481,lastTurn:481.2,lastCleave:485.6,lastFinisher:488.1,hell1:515,hell2:531.3,enrage:554.2,end:555.5};
const RAIDWIDES=[
 {at:15.2,cast:10.2,name:'Arcadia Aflame · ouverture',count:1},
 {at:236.4,cast:231.4,name:'Arcadia Aflame · après Candies',count:1},
 {at:269.5,cast:264.5,name:'Idyllic Dream · entrée',count:1},
 {at:343.7,cast:338.7,name:"Lindwurm’s Meteor",count:1},
 {at:472.2,cast:467.2,name:'Idyllic Dream · sortie',count:1},
 {at:515,cast:510,name:'Arcadian Hell I · boss + 4 clones',count:5},
 {at:531.3,cast:526.3,name:'Arcadian Hell II · boss + 8 clones',count:9},
 {at:554.2,cast:544.2,name:'Arcadian Hell III · enrage',count:17,enrage:true}
];
let demoMode=false,encounter={heading:0,events:[],effects:[],wall:false};
function encounterReset(){encounter={heading:0,events:[],effects:[],wall:false}}
function encounterClock(){return trainingExercise==='all'?time:isDreamActive()?264.5+dreamTime():isCandyActive()?180.7+candyTime():isRep1Active()?27.7+rep1Time():105.4+time-rep2At()}
function encounterInterlude(){return trainingExercise==='all'&&(time<27.7||time>=79.7&&time<99.1||time>=472.9)}
function encounterStage(){
 const next=RAIDWIDES.find(e=>e.at>=time);
 if(time<27.7)return {name:'Ouverture · Arcadia Aflame',start:0,end:27.7,hint:'Mitige le raidwide, puis prépare les premiers baits.'};
 if(time<99.1)return {name:'Staging · apparition des clones joueurs',start:79.7,end:99.1,hint:'Reviens au centre. Repère ton clone à son apparition.'};
 if(time<481.1)return {name:'Double Sobat · MT seul',start:472.9,end:481.1,hint:'MT devant côté A ; le groupe derrière. Invulnérabilité du MT.'};
 if(time<485.7)return {name:'Double Sobat · direction figée',start:481.1,end:485.7,hint:'Le boss tourne de 0, 90, 180 ou 270°. Passe derrière lui.'};
 if(time<489)return {name:'Esoteric Finisher · deux tanks',start:485.7,end:489,hint:'Les tanks se séparent devant ; les six autres restent derrière.'};
 return {name:next?.name??'Enrage',start:489,end:next?.at??555.5,hint:next?.enrage?'Enrage fatal : le combat doit être terminé avant ce coup.':'Regroupe-toi pour les raidwides du boss et de ses clones.'};
}
function encounterCast(){
 const t=encounterClock(),raid=RAIDWIDES.find(e=>t>=e.cast&&t<e.at);
 if(raid){const shift=time-t;return {name:raid.name.split(' ·')[0],start:raid.cast+shift,end:raid.at+shift}}
 if(!encounterInterlude())return null;
 const c=[['Replication',24.7,27.7],['Staging',88.2,91.2],['Double Sobat',475.4,480.4],['Replication',496.5,501.5]].find(([,a,b])=>time>=a&&time<b);
 return c?{name:c[0],start:c[1],end:c[2]}:null;
}
function encounterTarget(role){
 if(time<27.7)return rep1Initial(role);
 if(time<99.1||time>=489)return {x:(roles.indexOf(role)%4-1.5)*22,y:80+Math.floor(roles.indexOf(role)/4)*25,r:20};
 if(time<481.1)return role==='MT'?{x:0,y:-240,r:20}:rep1Behind(0,role,120);
 if(time<485.7)return rep1Behind(encounter.heading,role,130);
 if(kind(role)==='tank')return {...rep1Rotate({x:role==='MT'?-190:190,y:-225},-encounter.heading),r:20};
 return rep1Behind(encounter.heading,role,170);
}
function encounterObjective(){const s=encounterStage();$('objectiveTitle').textContent=s.name;$('objectiveCopy').textContent=guide?s.hint:'Lis la direction du boss et ses incantations.';$('cloneLabel').textContent='Combat complet · chronologie de référence';$('assignmentName').textContent=time>=489?'Arcadian Hell':'The Lindwurm';$('assignmentIcon').innerHTML='';$('assignmentHint').textContent='Le chrono continue pendant les transitions.';$('priorityRule').textContent=time>=544.2?'Enrage fatal · aucune mitigation ne permet de survivre':'The Lindwurm';}
function encounterUpdate(old,now){
 const offset=encounterClock()-time;
 for(const e of RAIDWIDES)if(old+offset<e.at&&now+offset>=e.at){encounter.events.push({name:e.name,at:now});toast(e.enrage?'Arcadian Hell · enrage fatal':e.name+' · '+e.count+' impact'+(e.count>1?'s':''))}
 if(trainingExercise!=='all')return;
 for(const at of [481,481.2,485.6,488.1])if(old<at&&now>=at){
  if(at===481.2){encounter.heading=(rep1Scenario.turns%4)*Math.PI/2;continue}
  const before=encounter.effects.length;
  if(at===481||at===485.6){const a=at===481?0:encounter.heading;encounter.effects.push({type:'cleave',angle:a,at:now});const hit=roles.filter(r=>inCone(actor(r),{x:0,y:0},a,Math.PI/2));const bad=at===481?hit.filter(r=>r!=='MT'):hit;checks[now.toFixed(3)]={ok:!bad.includes(selectedRole),reason:bad.includes(selectedRole)?'Double Sobat : reste derrière le boss.':'Double Sobat : résolu.'}}
  else for(const r of ['MT','OT']){const p=actor(r);encounter.effects.push({type:'circle',x:p.x,y:p.y,at:now});const bad=roles.filter(k=>k!==r&&dist(actor(k),p)<212.5);const failed=bad.includes(selectedRole)||(selectedRole===r&&bad.length>0);checks[(now+(r==='MT'?0:.001)).toFixed(3)]={ok:!failed,reason:failed?'Esoteric Finisher : tank trop près du groupe.':'Esoteric Finisher : résolu.'}}
  encounter.events.push({at:now,name:at===488.1?'Esoteric Finisher':'Double Sobat',effects:encounter.effects.length-before});
  const passed=!Object.entries(checks).some(([at,c])=>Math.abs(Number(at)-now)<.003&&!c.ok);recordSuccessfulCheckpoint(at===488.1?'Esoteric Finisher':'Double Sobat',passed);
 }
}
function encounterTick(dt){
 const old=time,movementOrigin={x:player.x,y:player.y};demoMove(dt);
 if(!demoMode){let dx=(keys.has('right')?1:0)-(keys.has('left')?1:0),dy=(keys.has('down')?1:0)-(keys.has('up')?1:0);if(!dx&&!dy){dx=stick.x;dy=stick.y}const n=Math.max(1,Math.hypot(dx,dy));player.x+=dx/n*PLAYER_MOVE_SPEED*dt;player.y+=dy/n*PLAYER_MOVE_SPEED*dt;checkDeathWall(movementOrigin)}
 for(const p of party)if(p.role!==selectedRole)advanceToward(p,encounterTarget(p.role),PLAYER_MOVE_SPEED*dt);
 time=Math.min(duration(),time+dt);encounterUpdate(old,time);
 if(old<99.1&&time>=99.1){setupActors();decisions=freshDecisions()}
 if(history.length===0||time-history.at(-1).t>.06)record();if(time>=duration())finish();updateUI();
}
function drawWaymarks(scale){
 const palette=['#df6977','#df6977','#e5c85e','#e5c85e','#73c9dc','#73c9dc','#aa83e4','#aa83e4'];
 const unit=scale/DS;
 for(let i=0;i<8;i++){const p=pt(i*TAU/8,(i%2?Math.SQRT2*6.825:13.65)*scale),c=palette[i];
  if(i%2){ctx.fillStyle=c+'35';ctx.strokeStyle=c;ctx.lineWidth=1.4;ctx.fillRect(p.x-20*unit,p.y-20*unit,40*unit,40*unit);ctx.strokeRect(p.x-20*unit,p.y-20*unit,40*unit,40*unit)}else circle(p.x,p.y,21*unit,c+'35',c,1.4);
  text(marks[i],p.x,p.y,21*unit,c,'700');
 }
}
// Fixed rim labels stay readable even when the floor waymark is covered by a clone.
function drawCardinalLabels(scale,islands=false){
 if(islands)return;
 const unit=scale/DS,palette=['#df6977','#e5c85e','#73c9dc','#aa83e4'];
 ctx.save();ctx.globalAlpha=1;ctx.setLineDash([]);
 for(let n=0;n<4;n++){
  const id=n*2;
  const p=pt(id*TAU/8,23.7*scale),color=palette[n],w=38*unit,h=38*unit;
  ctx.beginPath();ctx.roundRect(p.x-w/2,p.y-h/2,w,h,7*unit);
  ctx.fillStyle='#0b131bf2';ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=2*unit;ctx.stroke();
  text(marks[id],p.x,p.y,21*unit,color,'700');
 }
 ctx.restore();
}
function drawDeathRing(scale){ctx.save();ctx.beginPath();ctx.arc(0,0,22.5*scale,0,TAU);ctx.arc(0,0,20*scale,0,TAU,true);ctx.fillStyle='#b72b8b35';ctx.fill();circle(0,0,20*scale,null,'#ff9cdd8c',2);ctx.restore()}
// Input protection only: floor and AOE geometry stay unchanged.
function checkDeathWall(previous=player){
 let center={x:0,y:0},radius=20*(isDreamActive()?DS:REP1_SCALE)-.01;
 if(isDreamActive()&&dreamIslands()){
  const jump=dream.jumps[selectedRole];if(jump&&time<jump.end)return;
  const centers=[dp(-14,0),dp(14,0)],origin=centers.find(c=>dist(previous,c)<=10*DS);
  // Being outside when the floor changes is still a positioning error.
  if(!origin)return;center=origin;radius=10*DS-.01;
 }
 const d=dist(player,center);if(d>radius){player.x=center.x+(player.x-center.x)*radius/d;player.y=center.y+(player.y-center.y)*radius/d}
 encounter.wall=false;
}

function drawRaidwide(){const t=encounterClock(),e=RAIDWIDES.find(e=>t>=e.at&&t<e.at+1.1);if(!e)return;const scale=isDreamActive()?DS:REP1_SCALE;ctx.save();ctx.globalAlpha=Math.max(0,1-(t-e.at)/1.1);circle(0,0,22.5*scale,e.enrage?'#e4244e90':'#d6264555','#ff768b',4);text(e.enrage?'ENRAGE':e.count>1?'RAIDWIDE ×'+e.count:'RAIDWIDE',0,-70,27,'#ffe4e8','700');ctx.restore()}
function drawEncounter(){
 if(background.complete&&background.naturalWidth)ctx.drawImage(background,-22.5*REP1_SCALE,-22.5*REP1_SCALE,45*REP1_SCALE,45*REP1_SCALE);drawDeathRing(REP1_SCALE);drawWaymarks(REP1_SCALE);
 if(time>=496.5){const n=time<515.8?4:time<532.1?8:16;for(let i=0;i<n;i++){const p=pt(i*TAU/n,330);dragon(p.x,p.y,33)}}
 ctx.save();ctx.rotate(-encounter.heading);dragon(0,0,72,true);ctx.restore();circle(0,0,106.25,null,'#f0c4bc',2);
 if(guide&&time>=481.2&&time<485.6)drawSector({x:0,y:0},encounter.heading,Math.PI/2,850,'#ffc13d40','#ffe995');
 for(const e of encounter.effects)if(time-e.at<1&&time>=e.at){if(e.type==='cleave')drawSector({x:0,y:0},e.angle,Math.PI/2,850,'#ed293970','#ff6874');else circle(e.x,e.y,212.5,'#ed293970','#ff6874',2)}
 if(guide){const p=encounterTarget(selectedRole);circle(p.x,p.y,p.r,'#93f3ca1c','#b4ffe4',2);text('TA POSITION',p.x,p.y+38,10,'#c5ffee')}
 for(const r of roles)playerDot({...actor(r),role:r},r===selectedRole?15:11);
}
function demoMove(dt){
 if(!demoMode)return;let target;
 if(encounterInterlude())target=encounterTarget(selectedRole);
 else if(isDreamActive())target=dreamTarget(selectedRole);
 else if(isCandyActive())target=candyTarget(selectedRole);
 else if(isRep1Active())target=rep1Target(selectedRole);
 else if(staging())target=pt(me().clock*TAU/8,270);
 else if(!resolution.locked)target=sources.find(s=>s.id===plannedSources[selectedRole])??pt(me().clock*TAU/8,355);
 else target=resolutionTarget(me());
 if(target&&!bound(selectedRole)){const a=facingToward(player,target);if(dist(player,target)>1)player.a=a;advanceToward(player,target,movementSpeed()*dt)}
}
function demoPrepare(){
 if(!demoMode)return;
 if(isCandyActive()&&kind(selectedRole)==='tank'&&candy.aggro!==selectedRole&&(candy.debuffs[selectedRole]==='beta'||selectedRole==='OT'&&candyTime()>=CANDY.raid))candyProvoke();
 if(!isDreamActive()&&!isCandyActive()&&!isRep1Active()&&resolution.locked&&hasMechanic(selectedRole,'cone'))player.a=safeConeAt(selectedRole,player).a;
}
function preciseTime(t){return Math.floor(t/60).toString().padStart(2,'0')+':'+(t%60).toFixed(1).padStart(4,'0')}
function encounterTimeline(){
 const out=RAIDWIDES.map(e=>({...e,kind:e.enrage?'Enrage fatal':'Raidwide ×'+e.count}));const add=(at,name,kind='Résolution',cast)=>out.push({at,name,kind,cast});
 for(const [k,n] of Object.entries({fire1:'Rep 1 · feu',cones1:'Rep 1 · cônes',dark1:'Rep 1 · ténèbres',kick:'Snaking Kick',fire2:'Rep 1 · feux clonés',cones2:'Rep 1 · cônes clonés',dark2:'Rep 1 · ténèbres clonées',sobat:'Double Sobat I',repeat:'Cleave I',finishers:'Esoteric Finisher I'}))add(27.7+REP1[k],n);
 add(91.2,'Staging','Cast terminé',88.2);
 for(const [name,start,end] of [['Firefall Splash',122,127.7],['Snaking Kick',136,141],['Reenactment',148.2,151.2],['Netherwrath Near/Far',154.4,159.4],['Mutating Cells',180.7,183.7],['Blood Mana',186.9,189.9],['Blood Wakening',214.1,217.1],['Netherworld Near/Far',223.3,228.3]])add(end,name,'Cast terminé',start);
 for(const [name,start,end] of [['Staging',8.2,11.2],['Replication',29.5,32.5],['Replication',48.2,51.2],['Downfall',82.3,85.4],['Arcadian Arcanum',88.5,91.5],['Temporal Curtain',150.6,153.6],['Reenactment',169.4,172.4],...[DREAM.blue1,DREAM.red1,DREAM.blue2,DREAM.red2-1.2,DREAM.blue3,DREAM.red3-1.2,DREAM.blue4,DREAM.red4-1.2].map(e=>['Twisted Vision',e-4,e])])add(264.5+end,name,'Cast terminé',264.5+start);
 add(27.7,'Replication I','Cast terminé',24.7);add(99.1,'Clones joueurs attribués','Attribution');add(105.4,'Replication II','Cast terminé',102.4);
 for(const [k,n] of Object.entries({landing:'Firefall Splash',rays:'Scalding Waves',defams:'Mana Burst ×3',stack:'Heavy Slam ×2',cones:'Hemorrhagic Projection',kick:'Snaking Kick',replayLanding:'Clone A : Firefall',replayRays:'Clone A : rayons',replayCone1:'Clone 1 : cône',replayCone3:'Clone 4 : cône',wave0:'Clone C : défam + Netherwrath',wave1:'Reconstitution 1/3',wave2:'Reconstitution B/D',wave3:'Reconstitution 2/4'}))add(105.4+COMBAT[k],n);
 for(const [k,n] of Object.entries({assign:'Alpha / bêta',spawn:'Candies : apparition',swap:'Fin des premiers débuffs',invert:'Débuffs inversés',wave1:'Candies : vague 1',wave2:'Candies : vague 2',nether:'Netherworld Near / Far',sobat:'Double Sobat II',repeat:'Cleave II',finishers:'Esoteric Finisher II'}))add(180.7+CANDY[k],n);
 for(const [k,n] of Object.entries({clone:'Idyllic : clones attribués',blue1:'Première réalité bleue',memory:'Trois clones à mémoriser',red1:'Réalité rouge',links:'Liens des clones',lock:'Verrouillage des liens',stored:'Attaques mémorisées',islands1:'Premières plateformes',arcanum:'Arcadian Arcanum',pair0:'Paire 1',pair1:'Paire 2',pair2:'Paire 3',pair3:'Paire 4',islands2:'Retour des plateformes',towers:'Tours élémentaires',earth:'Terre / Hot Blooded',baits:'Baits de proximité',portal:'Temporal Curtain',replay1:'Reconstitution : formation 1',islands3:'Dernières plateformes',safe:'Attaque des clones sur les îlots',replay2:'Reconstitution : formation 2',storedFinal:'Dernier clone stocké'}))add(264.5+(k.startsWith('pair')?dreamPairAt(Number(k.slice(4))):DREAM[k]),n);
 add(481,'Double Sobat III','Tankbuster',475.4);add(485.6,'Cleave III');add(488.1,'Esoteric Finisher III');add(501.5,'Replication · enrage','Cast terminé',496.5);
 return out.sort((a,b)=>a.at-b.at);
}
function timelineModal(){openModal('Chronologie & dimensions',`<p>Horloge depuis le pull de P2, sans raccourcir les transitions en « Combat complet ». Référence au dixième reconstruite depuis BossMod ; les logs peuvent varier légèrement selon le début de pull. Les animations de saut/apparition restent illustratives. Ce n’est pas un relevé image par image d’un nouveau replay.</p><table><tr><th>Début cast</th><th>Impact / événement</th><th>Mécanique</th></tr>${encounterTimeline().map(e=>`<tr><td>${e.cast==null?'—':preciseTime(e.cast)}</td><td>${preciseTime(e.at)}</td><td>${e.name} · ${e.kind}</td></tr>`).join('')}</table><h3>Dimensions vérifiées · yalms</h3><table><tr><th>Zone</th><th>Dimension</th></tr><tr><td>Surface sûre circulaire</td><td>Rayon 20 · diamètre 40</td></tr><tr><td>Couronne mortelle</td><td>Visible et traversable jusqu’au bord du dessin ; entrée = échec. Largeur graphique illustrative, exclue de l’échelle sûre.</td></tr><tr><td>Îlots</td><td>Rayon 10 · centres à ±14</td></tr><tr><td>Mana Burst / défamations</td><td>Rayon 20 (Rep 2 et Idyllic)</td></tr><tr><td>Firefall, Heavy Slam, feu / ténèbres Rep 1</td><td>Rayon 5</td></tr><tr><td>Netherwrath / Netherworld</td><td>Rayon 6</td></tr><tr><td>Esoteric Finisher</td><td>Rayon 10</td></tr><tr><td>Scalding Waves</td><td>Angle total 10° · portée 50</td></tr><tr><td>Winged Scourge</td><td>Angle total 30° · portée 50</td></tr><tr><td>Hemorrhagic Projection</td><td>45° dans le composant BossMod (commentaire action initiale : 50°) · portée 50</td></tr><tr><td>Candies</td><td>Sphère r8 · donut intérieur r5 / extérieur r60 · cônes 120° / portée 40</td></tr><tr><td>Idyllic</td><td>Cônes mémorisés 90° · chariot r10 · tours r3 · terre r4 · rayon ténèbres largeur10</td></tr></table><p><a href="https://github.com/awgil/ffxiv_bossmod/tree/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm" target="_blank" rel="noreferrer">Source : géométries et machine d’états BossMod</a>. Candy Crush garde les intervalles de résolution du rapport FFLogs PcyCvGAFRqzrXJBj, combat 30, déjà étudié.</p>`)}
function initEncounterUI(){$('playMode').onchange=e=>{demoMode=e.target.value==='demo';if(demoMode){partnerRhythm='live';$('partnerRhythm').value='live';reset(false)}else reset(false);updateUI()};$('encounterTimelineBtn').onclick=timelineModal;}

// All personal statuses share one fixed overlay and one actor badge.
function personalStatus(role=selectedRole){
 if(isDreamActive()){
  const d=dreamDebuff(role);if(!d)return null;
  const labels={fire:'FEU',dark:'PROCHE',wind:'LOIN',light:'LUMIÈRE',release:'FEU TERMINÉ'};
  const details={fire:'Immobilité',dark:dreamTime()<DREAM.towers+2?'Doom':'',wind:'',light:'Vulnérabilité',release:''};
  return {label:labels[d.type],symbol:d.type==='fire'?'F':d.symbol,kind:'dream-'+d.type,detail:details[d.type],remaining:d.remaining,precision:d.type==='fire'?1:0,color:d.type==='release'?'#a8ffd4':DREAM_ELEMENTS[d.type]?.color??'#f4e9ad'};
 }
 if(isCandyActive()){
  const d=candy.debuffs[role];if(!d||d==='none')return null;
  return {label:d==='alpha'?'ALPHA':d==='beta'?'BÊTA':'INVERSION',symbol:d==='alpha'?'α':d==='beta'?'β':'↔',kind:d,detail:d==='alpha'?'Zéro dégât':d==='beta'?'Subir des dégâts':'',remaining:candyDebuffRemaining(),precision:0,color:d==='alpha'?'#ff9bac':d==='beta'?'#8dd9ff':'#dcc3ff'};
 }
 if(isRep1Active()&&rep1Time()>=REP1.fire1&&rep1Time()<REP1.dark2+1){
  const d=rep1.debuffs[role];if(d==='none')return null;
  return {label:d==='fire'?'FEU':'TÉNÈBRES',symbol:d==='fire'?'F':'T',kind:d,detail:'Vulnérabilité',remaining:null,color:d==='fire'?'#ffad77':'#d3a5ff'};
 }
 return null;
}
function personalStatusTime(d){if(d.remaining===null)return '';const f=d.precision?10:1;return (Math.ceil(Math.max(0,d.remaining)*f)/f).toFixed(d.precision??0)+' s'}
function updatePersonalStatus(){
 const d=personalStatus();$('personalDebuff').hidden=!d;$('personalDebuff').className='personal-debuff '+(d?.kind??'none');
 $('personalDebuffIcon').textContent=d?.symbol??'';$('personalDebuffLabel').textContent=d?.label??'';
 $('personalDebuffTimer').hidden=!d||d.remaining===null;$('personalDebuffTimer').textContent=d?personalStatusTime(d):'';
 $('personalDebuffHint').hidden=!d?.detail;$('personalDebuffHint').textContent=d?.detail??'';
}
function drawPersonalStatus(p,role,lift=0){
 const d=personalStatus(role);if(!d)return;
 const unit=1/arenaZoom(),mine=role===selectedRole,w=(mine?190:(d.kind==='dream-dark'||d.kind==='dream-wind'?94:52))*unit,h=(mine?54:28)*unit;
 const y=Math.max(-425*unit,p.y-lift-(mine?90:60)*unit),x=Math.max(-465*unit+w/2,Math.min(465*unit-w/2,p.x));
 ctx.save();ctx.fillStyle='#09151bf2';ctx.fillRect(x-w/2,y,w,h);ctx.strokeStyle=d.color;ctx.lineWidth=mine?3:1.5;ctx.strokeRect(x-w/2,y,w,h);
 if(mine){text(d.label,x,y+17*unit,23*unit,d.color,'700');text(personalStatusTime(d)||d.detail,x,y+40*unit,21*unit,'#fff','700')}
 else text(d.symbol,x,y+14*unit,(d.symbol.length>2?16:21)*unit,d.color,'700');
 if(d.kind==='dream-fire'){ctx.fillStyle=d.color;ctx.fillRect(x-w/2,y+h-3,w*d.remaining/DREAM_FIRE_DURATION,3)}
 ctx.restore();
}

// Session feedback persists across modules and follows the replay clock.
let feedback=[],feedbackSignature='',feedbackMarkup='';
function resetFeedback(){feedback=[];feedbackSignature='';feedbackMarkup=''}
function collectFeedback(){
 const sources=[{failures:rep1?.failures??[],offset:rep1Offset()},{failures:resolution?.failures??[],offset:0},{failures:candy?.failures??[],offset:0},{failures:dream?.failures??[],offset:0}];
 const pairs=Object.entries(checks),signature=sources.map(s=>s.failures.length+':'+s.failures.at(-1)?.at).join('|')+'|'+pairs.length+'|'+JSON.stringify(pairs.at(-1));
 if(signature===feedbackSignature)return;feedbackSignature=signature;
 const add=(at,ok,message)=>{if(!Number.isFinite(at)||at>time+.001)return;if(feedback.some(e=>e.ok===ok&&e.message===message&&Math.abs(e.at-at)<.1))return;feedback.push({at,ok,message})};
 for(const source of sources)for(const f of source.failures)if(f.roles.includes(selectedRole))add(f.at+source.offset,false,f.message);
 const announcements=[...(resolution?.events??[]).filter(e=>['kickTell','netherTell','reenact','jump'].includes(e.key)),...(candy?.events??[]).filter(e=>['assign','swap','invert','wakeTell','sobatTell','turn','provoke'].includes(e.key))];
 for(const [at,c] of pairs){if(c.ok&&announcements.some(e=>Math.abs(e.at-Number(at))<.1))continue;add(Number(at),c.ok,c.reason);}
 feedback.sort((a,b)=>a.at-b.at||Number(a.ok)-Number(b.ok));
}
function visibleFeedback(){return feedback.filter(e=>e.at<=time+.001).filter(e=>!e.ok||!feedback.some(f=>!f.ok&&Math.abs(f.at-e.at)<.1&&f.at<=time+.001))}
function updateFeedback(){
 collectFeedback();const entries=visibleFeedback();trainerCheckError(entries);const key=JSON.stringify(entries);if(key===feedbackMarkup)return;feedbackMarkup=key;
 const failures=entries.filter(e=>!e.ok).length;$('feedbackCount').textContent=failures+' erreur'+(failures>1?'s':'');
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('feedbackList').innerHTML=entries.length?[...entries].reverse().map(e=>`<li class="${e.ok?'feedback-ok':'feedback-error'}"><b>${e.ok?'✓':'✕'}</b><time>${preciseTime(e.at)}</time><span>${escape(e.message)}</span></li>`).join(''):'<li class="feedback-empty">Les résultats apparaîtront à la résolution des mécaniques.</li>';
 const latest=entries.at(-1);$('liveFeedback').textContent=latest?(latest.ok?'✓ ':'✕ ')+latest.message:'';$('liveFeedback').className='live-feedback'+(latest?(latest.ok?' feedback-ok':' feedback-error'):'');
}
