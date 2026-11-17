'use strict';
// Idyllic Dream: BossMod cast sequence; Caro Uptime NW/NE / Splatoon verified preset.
const DREAM={entry:5,clone:16.6,blue1:26.4,memory:32.5,red1:45,links:51.2,lock:70.6,blue2:70.7,stored:75.1,islands1:83.2,tellTowers:85.4,arcanum:92.8,red2:100.8,pair0:106,pair1:111,pair2:116,pair3:121,blue3:130.1,islands2:131.4,towers:134.5,earth:140.2,baits:145.2,portal:153.6,jump:157,red3:167.5,replay1:176,blue4:181.5,islands3:182.8,safe:186,red4:190.3,replay2:196.9,storedFinal:201.7,raid:207.7,end:210};
const DREAM_FIRE_DURATION=5;
const DS=19.5, DREAM_PICKUPS=[['defam',0],['stack',0],['stack',1],['defam',1],['defam',2],['stack',2],['stack',3],['defam',3]];
const DREAM_ELEMENTS={fire:{name:'FEU',symbol:'FEU',color:'#ff8a3d'},earth:{name:'TERRE',symbol:'◇',color:'#c6ba9b'},dark:{name:'Ténèbres',symbol:'✺',color:'#c09aff'},wind:{name:'Vent',symbol:'≋',color:'#9adfa7'}};
let dreamScenario=null,dream=null;
const dreamPlatformTexture=new Image();dreamPlatformTexture.src='assets/idyllic-platforms.svg';
const dreamRedFloor=new Image();dreamRedFloor.src='assets/idyllic-red-floor.png';
const dreamBlueFloor=new Image();dreamBlueFloor.src='assets/idyllic-blue-floor.png';
function drawDreamArenaFloor(blue=false){
 const texture=blue?dreamBlueFloor:dreamRedFloor;
 ctx.fillStyle=blue?'#0b1125':'#071b17';ctx.fillRect(-500,-500,1000,1000);
 // Keep the arena's existing rim; the reconstructed textures contain only the empty floor.
 ctx.save();circle(0,0,22.5*DS);ctx.clip();
 if(background.complete&&background.naturalWidth)ctx.drawImage(background,-22.5*DS,-22.5*DS,45*DS,45*DS);
 ctx.save();circle(0,0,20.4*DS);ctx.clip();
 if(texture.complete&&texture.naturalWidth)ctx.drawImage(texture,-20.4*DS,-20.4*DS,40.8*DS,40.8*DS);
 ctx.restore();ctx.restore();
}
const DREAM_GROUPS=[['MT','H1','M1','R1'],['OT','H2','M2','R2']];
const dp=(x,y,r=1)=>({x:x*DS,y:y*DS,r:r*DS});
function isDreamExercise(){return ['dream','all'].includes(trainingExercise)}
function dreamOffset(){return trainingExercise==='all'?264.5:0}
function dreamTime(){return time-dreamOffset()}
function isDreamActive(){return isDreamExercise()&&time>=dreamOffset()&&(trainingExercise!=='all'||time<472.9)}
function dreamRandomize(){
 const layouts=[0,1].map(()=>{const a=Math.floor(Math.random()*4),v=Array(4),others=shuffle(['earth','fire']);v[a]='dark';v[(a+2)%4]='wind';v[(a+1)%4]=others[0];v[(a+3)%4]=others[1];return v});
 dreamScenario={clocks:shuffle([...Array(8).keys()]),cardinalFirst:Math.random()<.5,cardinalDefam:Math.random()<.5,verticalNorth:Math.random()<.5,lightSupports:Math.random()<.5,layouts,absorbedNorth:Math.random()<.5,coneEast:Math.random()<.5,initialOwners:shuffle([...roles])};
}
function dreamReset(){if(!dreamScenario)dreamRandomize();dream={entered:false,events:[],failures:[],effects:[],sources:[],assignments:{},towerRoles:{},debuffs:{},jumps:{},fireAnchors:{},stage:null,departed:false,readyFor:0,falling:[],hotFailed:[],lastPosition:null};
 for(let i=0;i<8;i++)dream.sources.push({id:i,...dreamClonePos(i),type:(i%2===0)===dreamScenario.cardinalDefam?'defam':'stack',owner:dreamScenario.initialOwners[i],contacts:[],lastTransfer:-100});
}
function dreamEnter(){dream.entered=true;linksActive=false;resolution=freshResolution();decisions=freshDecisions();objectiveCache='';toast('Idyllic Dream · mémorise ton clone et les deux réalités.');}
function dreamClock(role){return dreamScenario.clocks[roles.indexOf(role)]}
function dreamClonePos(clock){return clock%2?dp(Math.sign(Math.sin(clock*Math.PI/4))*10,-Math.sign(Math.cos(clock*Math.PI/4))*10):pt(clock*Math.PI/4,14*DS)}
function dreamCloneWaitingPos(clock){const p=dreamClonePos(clock);return{x:p.x*2/3,y:p.y*2/3,r:24};}
function dreamSource(role){const [type,ordinal]=DREAM_PICKUPS[dreamClock(role)];return dream.sources.filter(s=>s.type===type)[ordinal]}
function dreamOwn(role){return dream.sources.filter(s=>s.owner===role)}
function dreamGroup(role){return dreamClock(role)<4?1:0}
function dreamWest(role){return DREAM_GROUPS[0].includes(role)}
function dreamTowerPositions(){return [-1,1].flatMap((side,s)=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y],slot)=>({id:s*4+slot,side,slot,type:dreamScenario.layouts[s][slot],...dp(side*14+x*4.243,y*4.243,3)})))}
function dreamPreTower(role){return {H1:0,MT:1,M1:2,R1:3,M2:4,R2:5,H2:6,OT:7}[role]}
function dreamLightVuln(role){return (kind(role)!=='dps')===dreamScenario.lightSupports}
function dreamTower(role){const melee=rep1Melee(role),light=!dreamLightVuln(role);return dreamTowerPositions().find(t=>(t.side<0)===dreamWest(role)&&(Math.abs(t.x)<14*DS)===melee&&['wind','dark'].includes(t.type)===light)}
function dreamTowerTarget(role){const t=dreamTower(role),p={...t,r:15};if(t.type==='wind')p.x-=t.side*1.5*DS;if(t.type==='dark'){if(rep1Melee(role))p.y+=Math.sign(t.y)*1.5*DS;else p.x+=t.side*1.5*DS}const d=Math.hypot(p.x,p.y);if(!dreamIslands()&&d>19.6*DS){p.x*=19.6*DS/d;p.y*=19.6*DS/d}return p}
function dreamIslands(t=dreamTime()){return t>=DREAM.islands1&&t<DREAM.red2||t>=DREAM.islands2&&t<DREAM.red3||t>=DREAM.islands3&&t<DREAM.red4}
function dreamBlue(t=dreamTime()){return t>=DREAM.blue1&&t<DREAM.red1||t>=DREAM.blue2&&t<DREAM.red2||t>=DREAM.blue3&&t<DREAM.red3||t>=DREAM.blue4&&t<DREAM.red4}
function dreamOnFloor(p){return dreamIslands()?[-1,1].some(s=>dist(p,dp(s*14,0))<=10*DS):Math.hypot(p.x,p.y)<=20*DS}
function dreamResolvePlatform(final=false){
 for(const role of roles){
  const side=final?(dreamScenario.coneEast?1:-1):(dreamWest(role)?-1:1);
  if(dist(actor(role),dp(side*14,0))<=10*DS)continue;
  const direction=side<0?'gauche':'droite';
  dreamError([role],final?`Mauvaise plateforme : rejoins celle de ${direction}, où se trouve le clone à cônes.`:`Mauvaise plateforme : groupe ${dreamWest(role)?'1':'2'}, rejoins celle de ${direction}.`);
 }
}
function dreamPairIndex(t=dreamTime()){return Math.max(0,Math.min(3,Math.floor((t-DREAM.pair0-.15)/5)+1))}
function dreamPair(i){return [[0,4],[1,5],[2,6],[3,7]][i]}
function dreamPairAt(i){return DREAM.pair0+i*5+(dream.sources[dreamPair(i)[0]].type==='defam'?1.2:0)}
function dreamStep(){const t=dreamTime();const rows=[
 ['start',DREAM.clone,'Idyllic Dream · Staging','Observe l’ordre d’apparition des clones, puis attends les liens personnels avant de rejoindre le tien.'],
 ['identify',DREAM.blue1,'Staging · ton clone','Repère ton clone grâce au lien personnel. Son repère détermine le lien à prendre.'],
 ['memory',DREAM.red1,'Replication · trois clones','Mémorise le côté nord ou sud avec les cônes nord/sud : ce sera le côté sûr au retour.'],
 ['links',DREAM.blue2,'Replication · liens Caro','Depuis A, compte chaque symbole dans le sens horaire : A/2/C/4 prennent les défams 1/2/3/4 ; 1/B/3/D les stacks 1/2/3/4.'],
 ['stored',DREAM.stored+.15,'Attaques mémorisées','Rejoins le côté mémorisé, hors du cercle central et entre les deux cônes.'],
 ['platforms',DREAM.tellTowers,'Lindwurm’s Meteor · deux îlots','Avant la séparation : groupe 1 à gauche (MT/H1/M1/R1), groupe 2 à droite (OT/H2/M2/R2). Rejoins ta position de tour.'],
 ['spread',DREAM.arcanum+.15,'Arcadian Arcanum · écartez-vous','Reste sur ta position de départ. Les quatre supports ou les quatre DPS reçoivent la vulnérabilité lumière.'],
 ['readTowers',DREAM.red2,'Downfall · mémorise ta tour','Vulnérabilité lumière : feu ou terre. Sans vulnérabilité : vent ou ténèbres. Échange nord/sud avec ton partenaire de même distance au boss si nécessaire.'],
 ...[0,1,2,3].map(i=>['pair'+i,dreamPairAt(i)+.15,'Liens · '+marks[dreamPair(i)[0]]+' / '+marks[dreamPair(i)[1]],'Défamations au nord-ouest/nord-est ; les six autres restent au sud près du boss. Stacks en deux groupes à l’ouest et à l’est du boss.']),
 ['returnTowers',DREAM.towers+.15,'Retour sur les tours','Rejoins ton îlot avant sa séparation : groupe 1 à gauche, groupe 2 à droite. Puis reprends ta tour : vent vers l’autre îlot, rayon ténèbres vers l’extérieur.'],
 ['towerEffects',DREAM.earth+.15,'Tours · feu, terre, vent, ténèbres','Feu : immobilise-toi 5 secondes. Terre : quitte la flaque. Vent : traverse en sautant. Ténèbres : Doom est dissipé automatiquement.'],
 ['baits',DREAM.baits+.15,'Lindwurm’s Portent · proche / loin','Ténèbres attire le plus proche : terre à côté. Vent attire le plus loin : feu au sud sur l’îlot opposé.'],
 ['portal',DREAM.red3,'Temporal Curtain · mémorise','Suis le clone absorbé et le saut des deux autres. Mémorise l’îlot avec les cônes et leur orientation.'],
 ['replay1',DREAM.replay1+1,'Reconstitution · première formation','Rejoue la formation apparue en premier : groupe 1 sur le stack ouest, groupe 2 sur le stack est.'],
 ['safeIsland',DREAM.safe+.15,'Retour bleu · îlot sûr','Rejoins l’îlot du clone à cônes : dedans si nord/sud, au nord ou sud de l’îlot si est/ouest.'],
 ['returnRed',DREAM.red4,'Twisted Vision · retour aux clones','Garde la zone sûre jusqu’au changement d’arène.'],
 ['replay2',DREAM.replay2+1,'Reconstitution · seconde formation','Rejoins le second stack de ton groupe en évitant les deux défamations.'],
 ['finalCone',DREAM.storedFinal+.15,'Temporal Curtain · attaque stockée','Le clone absorbé revient au nord : évite ses cônes mémorisés.'],
 ['end',DREAM.end,'Idyllic Dream · raidwide final','Regroupe-toi. La mécanique est terminée.']
 ];let start=0;for(const [id,end,name,hint] of rows){if(t<end||id==='end')return{id,name,hint,start:dreamOffset()+start,end:dreamOffset()+end,deadline:dreamOffset()+(id==='platforms'?DREAM.islands1:id==='returnTowers'?DREAM.islands2:id==='safeIsland'?DREAM.islands3:id==='replay1'?DREAM.replay1:id==='replay2'?DREAM.replay2:end-.15)};start=end}}
function dreamReplayWave(t=dreamTime()){return t>=DREAM.red3&&t<DREAM.replay1+1?1:t>=DREAM.red4&&t<DREAM.replay2+1?2:0}
function dreamReplayClones(wave){const parity=(dreamScenario.cardinalFirst?0:1)^(wave===2?1:0);return roles.filter(r=>dreamClock(r)%2===parity).map(role=>({role,clock:dreamClock(role),...dreamClonePos(dreamClock(role)),type:dream.assignments[role]??DREAM_PICKUPS[dreamClock(role)][0]}))}
function dreamBaitTarget(role){const type=dream.towerRoles[role]??dreamTower(role).type,side=(dreamWest(role)?-1:1)*(type==='wind'?-1:1);return type==='wind'?dp(side*8,-7,.55):type==='dark'?dp(side*8.5,-1.5,.55):type==='earth'?dp(side*10.5,-1.5,.55):dp(side*8,7,.55)}
function dreamSafeIsland(role){const side=dreamScenario.coneEast?1:-1,vertical=dreamScenario.verticalNorth!==dreamScenario.absorbedNorth,i=roles.indexOf(role);return vertical?dp(side*(8+(i%2)*.55),(Math.floor(i/2)-1.5)*.5,.6):dp(side*(14+(i%2)*.5),-6.5-Math.floor(i/2)*.5,.6)}
function dreamPairStackTarget(role,group){const i=roles.indexOf(role);return dp((group?1:-1)*8+(i%2-.5)*.35,(Math.floor(i/2)%2-.5)*.35,.6);}
function dreamTarget(role){const step=dreamStep().id,i=roles.indexOf(role),loose=dp((i%4-1.5)*.5,3+Math.floor(i/4)*.6,.8);
 if(step==='start'){const p=actor(role);return{x:p.x,y:p.y,r:24};}
 if(step==='identify'||step==='memory')return dreamCloneWaitingPos(dreamClock(role));
 if(step==='links')return dreamTime()<DREAM.links?dreamCloneWaitingPos(dreamClock(role)):{...dreamSource(role),r:16};
 if(step==='stored')return dp(dreamWest(role)?-10:10,dreamScenario.verticalNorth?-10:10,1);
 if(step==='platforms'||step==='spread')return {...dreamTowerPositions()[dreamPreTower(role)],r:16};
 if(step==='readTowers'||step==='returnTowers')return dreamTowerTarget(role);
 if(step.startsWith('pair')){const n=Number(step.slice(4)),pair=dreamPair(n),src=dream.sources.find(s=>s.owner===role),defam=dream.sources[pair[0]].type==='defam',group=dreamGroup(role),side=group?1:-1;
  if(defam)return src&&pair.includes(src.id)?dp(side*13.5,-13.5,.6):dp((i%4-1.5)*.25,5.9+Math.floor(i/4)*.3,.6);
  return dreamPairStackTarget(role,group);
 }
 if(step==='towerEffects'){const type=dream.towerRoles[role]??dreamTower(role).type;if(type==='fire')return dream.fireAnchors[role]??dreamTowerTarget(role);if(type==='earth'||type==='wind')return dp((dreamWest(role)?-1:1)*(type==='wind'?-1:1)*14,0,.7);return dreamTowerTarget(role)}
 if(step==='baits'||step==='portal')return dreamBaitTarget(role);
 if(step==='replay1'||step==='replay2'){const wave=step==='replay1'?1:2,c=dreamReplayClones(wave).find(c=>c.type==='stack'&&(c.x<0)===dreamWest(role));return c?{...c,x:c.x*1.11,y:c.y*1.11,r:18}:loose}
 if(step==='safeIsland'||step==='returnRed')return dreamSafeIsland(role);
 if(step==='finalCone'){const vertical=dreamScenario.verticalNorth===dreamScenario.absorbedNorth;return vertical?dp(dreamWest(role)?-12:12,-7.5,.8):dp((i%4-1.5)*.4,4+Math.floor(i/4)*.5,.8)}
 return loose;
}
function dreamError(rolesHit,message){if(!rolesHit.length)return;dream.failures.push({at:time,roles:[...new Set(rolesHit)],message});if(rolesHit.includes(selectedRole))toast('✕ '+message)}
function dreamCheck(key,label,fn){const before=dream.failures.length;fn();const errors=dream.failures.slice(before);dream.events.push({key,at:time,errors:cloneData(errors)});const mine=errors.find(e=>e.roles.includes(selectedRole));checks[time.toFixed(3)]={ok:!mine,reason:mine?.message??label+' : résolu.'};if(!mine)toast('✓ '+label);recordSuccessfulCheckpoint(label,!mine)}
function dreamConeHit(p,c,axis,half=Math.PI/4){const a=Math.atan2(p.x-c.x,-(p.y-c.y));return Math.abs(Math.atan2(Math.sin(a-axis),Math.cos(a-axis)))<half}
function dreamDoubleConeHit(p,c,vertical){return dreamConeHit(p,c,vertical?0:Math.PI/2)||dreamConeHit(p,c,vertical?Math.PI:Math.PI*1.5)}
function dreamConeEffect(c,vertical){dream.effects.push({type:'double',...c,vertical,at:time})}
function dreamStoredHit(final=false){for(const r of roles){const p=actor(r);let hit;if(final){const c=dp(0,-7.5);hit=dreamDoubleConeHit(p,c,dreamScenario.verticalNorth===dreamScenario.absorbedNorth)}else hit=dist(p,dp(0,0))<10*DS||dreamDoubleConeHit(p,dp(0,-14),dreamScenario.verticalNorth)||dreamDoubleConeHit(p,dp(0,14),!dreamScenario.verticalNorth);if(hit)dreamError([r],'Attaque mémorisée : mauvaise zone sûre.')}if(final)dreamConeEffect(dp(0,-7.5),dreamScenario.verticalNorth===dreamScenario.absorbedNorth);else{dreamConeEffect(dp(0,-14),dreamScenario.verticalNorth);dreamConeEffect(dp(0,14),!dreamScenario.verticalNorth);dream.effects.push({type:'circle',...dp(0,0,10),at:time})}}
function dreamResolvePair(n){
 for(const id of dreamPair(n)){
  const s=dream.sources[id];if(!s.owner){dreamError(roles,'Lien non attribué.');continue;}
  const p=actor(s.owner),hit=roles.filter(r=>dist(actor(r),p)<(s.type==='defam'?20:5)*DS);
  if(s.type==='defam'){
   const clipped=hit.filter(r=>r!==s.owner);
   if(clipped.length)dreamError([s.owner,...clipped],`Défamation de ${s.owner} : elle touche un autre joueur.`);
  }else{
   const group=s.id<4?1:0,expected=roles.filter(r=>dreamGroup(r)===group);
   validateStackGroup(hit,expected,4,dreamError,'Heavy Slam · groupe '+(group?'B':'A'));
  }
  dream.assignments[s.owner]=s.type;
  dream.effects.push({type:'circle',x:p.x,y:p.y,r:(s.type==='defam'?20:5)*DS,stack:s.type==='stack',at:time});
 }
}
function dreamResolveTowers(){const towers=dreamTowerPositions();for(const t of towers){const members=roles.filter(r=>dist(actor(r),t)<=3*DS);if(members.length!==1){dreamError(members.length?members:roles,`Tour ${DREAM_ELEMENTS[t.type].name} : un seul joueur requis.`);continue}const role=members[0],p=actor(role);dream.towerRoles[role]=t.type;if(['dark','wind'].includes(t.type)&&dreamLightVuln(role))dreamError([role],'Tour lumière avec vulnérabilité lumière.');if(!['dark','wind'].includes(t.type)&&!dreamLightVuln(role))dreamError([role],'Attribution Caro : prends une tour vent ou ténèbres sans vulnérabilité.');
  if(t.type==='fire')dream.fireAnchors[role]={x:p.x,y:p.y};
  if(t.type==='dark'){const dx=p.x-t.x,dy=p.y-t.y,len=Math.hypot(dx,dy);if(len<.1)dreamError([role],'Ténèbres : décale-toi pour orienter le rayon.');else{const hit=roles.filter(r=>{if(r===role)return false;const v=actor(r),x=v.x-t.x,y=v.y-t.y;return (x*dx+y*dy)/len>=0&&Math.abs(x*dy-y*dx)/len<5*DS});if(hit.length)dreamError([role,...hit],`Rayon ténèbres de ${role} : touche un autre joueur.`);dream.effects.push({type:'beam',x:t.x,y:t.y,angle:Math.atan2(-dx,-dy),at:time})}}
  if(t.type==='wind'){const dx=p.x-t.x,dy=p.y-t.y,len=Math.hypot(dx,dy)||1;const end={x:p.x+dx/len*23.5*DS,y:p.y+dy/len*23.5*DS};dream.jumps[role]={from:{x:p.x,y:p.y},to:end,start:time,end:time+1.2};if(dist(end,dp(-t.side*14,0))>=10*DS)dreamError([role],'Vent : le saut manque l’autre îlot.');}
 }
}
function dreamResolveBaits(){const rays=[];for(const r of roles){const type=dream.towerRoles[r];if(!['dark','wind'].includes(type))continue;const src=actor(r),targets=roles.filter(k=>k!==r).sort((a,b)=>dist(actor(a),src)-dist(actor(b),src)),target=type==='dark'?targets[0]:targets.at(-1),p=actor(target),a=Math.atan2(p.x-src.x,-(p.y-src.y)),hit=roles.filter(k=>k!==r&&dreamConeHit(actor(k),src,a,Math.PI/12));if(dream.towerRoles[target]!== (type==='dark'?'earth':'fire'))dreamError([r,target],'Mauvais bait de proximité : terre proche, feu loin.');const clipped=hit.filter(k=>k!==target);if(clipped.length)dreamError([r,target,...clipped],`Cône de proximité de ${r} vers ${target} : le rayon traverse un autre joueur.`);rays.push({source:r,target,hit});dream.effects.push({type:'cone',x:src.x,y:src.y,angle:-a,at:time})}dream.baits=rays}
function dreamResolveReplay(wave){
 const cs=dreamReplayClones(wave);
 for(const c of cs){
  if(c.type==='defam')dreamError(roles.filter(r=>dist(actor(r),c)<20*DS),'Défamation du clone joueur.');
  else{
   const hit=roles.filter(r=>dist(actor(r),c)<5*DS),left=c.x<0,expected=roles.filter(r=>dreamWest(r)===left);
   validateStackGroup(hit,expected,4,dreamError,'Stack cloné · groupe '+(left?'1':'2'));
  }
  dream.effects.push({...c,type:'circle',r:(c.type==='defam'?20:5)*DS,stack:c.type==='stack',at:time});
 }
}
function transferDreamTethers(pool,position,at,canTake){
 for(const s of pool){
  const owner=position(s.owner),candidates=[],contacts=[];
  for(const r of roles){
   if(r===s.owner||!canTake(r))continue;
   const p=position(r),d=dist(p,s),hit=pointSegment(p,s,owner),atSource=d<24&&d+3<dist(owner,s);
   if(atSource||hit.distance<11&&hit.t>.08&&hit.t<.92){contacts.push(r);if(atSource||!s.contacts.includes(r))candidates.push({r,d});}
  }
  s.contacts=contacts;
  if(candidates.length&&at-s.lastTransfer>.45){candidates.sort((a,b)=>a.d-b.d);s.owner=candidates[0].r;s.lastTransfer=at;s.contacts=[];}
 }
}
function dreamUpdateTethers(){
 if(dreamTime()<DREAM.links||dreamTime()>=DREAM.lock)return;
 transferDreamTethers(dream.sources,actor,time,r=>r===selectedRole||dream.departed);
}
function dreamLinkBotsWait(){return !demoMode&&(partnerRhythm==='first'||!!dreamLinkPractice&&!dreamLinkPractice.done);}
function dreamFireEvent(key){const t=dreamTime();
 if(['islands1','islands2','islands3'].includes(key))dreamCheck(key,key==='islands3'?'Plateforme du clone à cônes':key==='islands2'?'Retour sur la plateforme du groupe':'Plateforme du groupe',()=>dreamResolvePlatform(key==='islands3'));
 if(key==='lock')dreamCheck(key,'Liens verrouillés',()=>{for(const r of roles){const own=dreamOwn(r);if(own.length!==1||own[0].id!==dreamSource(r).id)dreamError([r],'Lien incorrect : respecte le type et le rang depuis A.');if(own.length)dream.assignments[r]=own[0].type}});
 if(key==='stored')dreamCheck(key,'Attaques mémorisées',()=>dreamStoredHit());
 if(key==='arcanum')dreamCheck(key,'Arcadian Arcanum',()=>{for(const r of roles.filter(dreamLightVuln)){const p=actor(r);const clipped=roles.filter(k=>k!==r&&dist(actor(k),p)<6*DS);if(clipped.length)dreamError([r,...clipped],`Arcadian Arcanum de ${r} : le spread touche un autre joueur.`);dream.effects.push({type:'circle',x:p.x,y:p.y,r:6*DS,at:time})}});
 if(key.startsWith('pair')){const n=Number(key.slice(4)),pair=dreamPair(n),label=(dream.sources[pair[0]].type==='defam'?'Défamation':'Heavy Slam')+' · '+pair.map(i=>marks[i]).join(' / ');dreamCheck(key,label,()=>dreamResolvePair(n));if(n===3&&dreamTowerPractice?.stage==='pairs'){dreamTowerPractice.done=true;dreamTowerPractice.passed=!dream.failures.some(f=>f.roles.includes(selectedRole));}}
 if(key==='towers'){if(dreamTowerPractice&&!dreamTowerPractice.done&&dreamTowerPractice.stage!=='elements')dreamCheck(key,'Tour mémorisée retrouvée',()=>dreamResolveTowerChoice(true));else dreamCheck(key,'Tours élémentaires',dreamResolveTowers);}
 if(key==='earth')dreamCheck(key,'Feu / terre',()=>{for(const tower of dreamTowerPositions().filter(c=>c.type==='earth')){dreamError(roles.filter(r=>dist(actor(r),tower)<4*DS),'Flaque de terre : quitte la tour après absorption.');dream.effects.push({...tower,type:'circle',r:4*DS,at:time})}for(const r of dream.hotFailed)dreamError([r],'Feu : déplacement pendant Hot Blooded.');});
 if(key==='baits'){dreamCheck(key,'Baits proche / loin',dreamResolveBaits);if(dreamTowerPractice?.stage==='elements'){dreamTowerPractice.done=true;dreamTowerPractice.passed=!dream.failures.some(f=>f.roles.includes(selectedRole));}}
 if(key==='replay1'||key==='replay2')dreamCheck(key,'Reconstitution '+key.slice(-1),()=>dreamResolveReplay(Number(key.slice(-1))));
 if(key==='safe')dreamCheck(key,'Îlot sûr',()=>{const c=dp(dreamScenario.coneEast?14:-14,0),orb=dp(-c.x/DS,0),vertical=dreamScenario.verticalNorth!==dreamScenario.absorbedNorth;dreamError(roles.filter(r=>dist(actor(r),orb)<10*DS||dreamDoubleConeHit(actor(r),c,vertical)),'Mauvais îlot ou mauvais côté du clone à cônes.');dreamConeEffect(c,vertical);dream.effects.push({type:'circle',...orb,r:10*DS,at:time})});
 if(key==='storedFinal'){dreamCheck(key,'Dernier clone stocké',()=>dreamStoredHit(true));if(dreamTowerPractice?.stage==='finale'){dreamTowerPractice.done=true;dreamTowerPractice.passed=!dream.failures.some(f=>f.roles.includes(selectedRole));}}
}
function dreamUpdate(old,dt){if(!dream.entered)dreamEnter();const t=dreamTime(),s=dreamStep();if(dream.stage!==s.id){dream.stage=s.id;dream.departed=s.id==='links'?!dreamLinkBotsWait():partnerRhythm!=='first'||s.id==='memory';dream.readyFor=0;}
 if(!dream.departed){const ready=s.id==='links'?t>=DREAM.links+(dreamLinkPractice&&!dreamLinkPractice.done?4:0)&&dist(player,dreamSource(selectedRole))<32&&dreamSource(selectedRole).owner===selectedRole:dist(player,dreamTarget(selectedRole))<28||s.id==='identify'&&dist(player,dreamClonePos(dreamClock(selectedRole)))<48;dream.readyFor=ready?dream.readyFor+dt:0;const travel=Math.max(...party.filter(p=>p.role!==selectedRole).map(p=>dist(p,dreamTarget(p.role))/190));if(dream.readyFor>=.7||time>=s.deadline-travel-.7)dream.departed=true;}
 for(const r of roles){const p=r===selectedRole?player:party.find(p=>p.role===r),jump=dream.jumps[r];if(jump&&time<jump.end){const f=Math.min(1,(time-jump.start)/(jump.end-jump.start));p.x=jump.from.x+(jump.to.x-jump.from.x)*f;p.y=jump.from.y+(jump.to.y-jump.from.y)*f;continue}if(jump&&!jump.landed){Object.assign(p,jump.to);jump.landed=true}if(r!==selectedRole&&dream.departed)advanceToward(p,dreamTarget(r),190*dt);
  if(t>=DREAM.towers&&t<DREAM.towers+DREAM_FIRE_DURATION&&dream.fireAnchors[r]&&dist(p,dream.fireAnchors[r])>2&&!dream.hotFailed.includes(r)){dream.hotFailed.push(r);if(r===selectedRole)toast('✕ Feu : reste immobile pendant Hot Blooded.');}
 }
 // Check the assigned island when the floor splits, before fall recovery moves anyone.
 // Do not enforce the initial group side later: wind legitimately crosses to the other island.
 for(const key of ['islands1','islands2','islands3'])if(old<dreamOffset()+DREAM[key]&&time>=dreamOffset()+DREAM[key])dreamFireEvent(key);
 for(const r of roles){const p=r===selectedRole?player:party.find(p=>p.role===r);if(dream.jumps[r]&&time<dream.jumps[r].end)continue;
  if(dreamIslands()&&!dreamOnFloor(p)){if(!dream.falling.includes(r)){dream.falling.push(r);dreamError([r],'Chute : reste sur un îlot.');if(r===selectedRole)checks[time.toFixed(3)]={ok:false,reason:'Chute entre les îlots.'};}const side=p.x>=0?1:-1,c=dp(side*14,0),d=dist(p,c);p.x=c.x+(p.x-c.x)/d*9.7*DS;p.y=c.y+(p.y-c.y)/d*9.7*DS;}else dream.falling=dream.falling.filter(a=>a!==r);
 }
 if(dreamTowerPractice&&!dreamTowerPractice.done&&dreamTowerPractice.stage==='read'&&old<dreamOffset()+DREAM_TOWER_CHOICE&&time>=dreamOffset()+DREAM_TOWER_CHOICE)dreamCheck('towerChoice','Choix de la tour',()=>dreamResolveTowerChoice(false));
 dreamUpdateTethers();const events=['lock','stored','arcanum','towers','earth','baits','replay1','safe','replay2','storedFinal'].map(k=>[k,DREAM[k]]).concat([0,1,2,3].map(i=>['pair'+i,dreamPairAt(i)]));for(const [k,at] of events)if(old<dreamOffset()+at&&time>=dreamOffset()+at)dreamFireEvent(k);
}
function dreamCast(){const t=dreamTime(),casts=[['Idyllic Dream',0,DREAM.entry],['Staging',8.2,11.2],['Replication',29.5,32.5],['Replication',48.2,51.2],['Lindwurm’s Meteor',74.2,79.2],['Downfall',82.3,85.4],['Arcadian Arcanum',88.5,91.5],['Temporal Curtain',150.6,153.6],['Reconstitution',169.4,172.4],['Idyllic Dream',202.7,207.7],...[DREAM.blue1,DREAM.red1,DREAM.blue2,DREAM.red2-1.2,DREAM.blue3,DREAM.red3-1.2,DREAM.blue4,DREAM.red4-1.2].map(e=>['Twisted Vision',e-4,e])];const c=casts.find(([,a,b])=>t>=a&&t<b);return c?{name:c[0],start:dreamOffset()+c[1],end:dreamOffset()+c[2]}:null}
function dreamDebuff(role){
 const t=dreamTime(),type=dream.towerRoles[role],fireEnd=DREAM.towers+DREAM_FIRE_DURATION;
 if(t>=DREAM.towers&&t<DREAM.baits){
  if(type==='fire'&&t<fireEnd)return{label:'FEU · IMMOBILE',short:'IMMOBILE',symbol:'FEU',remaining:fireEnd-t,type:'fire',hint:'Attends la fin du décompte avant de bouger.'};
  if(type==='fire'&&t<fireEnd+1.3)return{label:'FEU TERMINÉ',short:'BOUGE',symbol:'✓',remaining:null,type:'release',hint:'Tu peux bouger.'};
  if(type==='dark')return{label:'PROCHE',short:'PROCHE',symbol:'PROCHE',remaining:DREAM.baits-t,type:'dark',hint:t<DREAM.towers+2?'Doom · Esuna automatique en cours.':'Le cône vise le joueur le plus proche.'};
  if(type==='wind')return{label:'LOIN',short:'LOIN',symbol:'LOIN',remaining:DREAM.baits-t,type:'wind',hint:'Le cône vise le joueur le plus éloigné.'};
 }
 if(t>=DREAM.arcanum&&t<DREAM.towers&&dreamLightVuln(role))return{label:'VULNÉRABILITÉ LUMIÈRE',short:'LUMIÈRE',symbol:'✦',remaining:DREAM.towers-t,type:'light'};
 return null;
}
function dreamDebuffTimer(d){if(d.remaining===null)return '';return d.type==='fire'?(Math.ceil(Math.max(0,d.remaining)*10)/10).toFixed(1)+' s':Math.max(0,Math.ceil(d.remaining))+' s'}

function dreamObjective(){const s=dreamStep(),clock=dreamClock(selectedRole),[type,n]=DREAM_PICKUPS[clock],t=dreamTime(),known=t>=DREAM.clone&&(guide||t<DREAM.blue1);
 $('objectiveTitle').textContent=s.name;$('cloneLabel').textContent=known?'Ton clone : '+marks[clock]:t<DREAM.clone?'En attente des liens personnels':'Mémorise le repère de ton clone';$('assignmentTitle').textContent='IDYLLIC DREAM · CARO UPTIME';$('assignmentIcon').innerHTML=guide&&known?symbolHTML(type):'<span class="symbol boss">?</span>';$('assignmentName').textContent=guide&&known?types[type].name+' '+(n+1):t<DREAM.clone?'Attribution en attente':'Lecture personnelle';$('assignmentHint').textContent='A/2/C/4 : défam 1/2/3/4 · 1/B/3/D : stack 1/2/3/4';$('objectiveCopy').textContent=s.hint;$('priorityRule').className='priority-rule';$('priorityRule').textContent=['platforms','spread','readTowers','returnTowers'].includes(s.id)?(dreamWest(selectedRole)?'GROUPE 1 · ÎLOT GAUCHE':'GROUPE 2 · ÎLOT DROIT'):guide&&s.id==='links'&&t>=DREAM.links?'Source : '+marks[dreamSource(selectedRole).id]:'Défams NO / NE · lecture horaire depuis A';$('currentTether').textContent=t>=DREAM.links&&t<DREAM.lock?dreamOwn(selectedRole).map(c=>types[c.type].name).join(' + ')||'Aucun':'—';$('proximity').textContent=guide&&['readTowers','returnTowers'].includes(s.id)?'Ta tour : '+DREAM_ELEMENTS[dreamTower(selectedRole).type].name:'Deux réalités · les attaques attendent ton retour';
}
function updateDreamPanel(){
 if(!isDreamActive())return;
 $('simTitle').textContent='Idyllic Dream';$('strategyChip').innerHTML='<span>◈</span> Caro Uptime <b>NO / NE</b>';$('rep2Legend').hidden=true;$('candyLegend').hidden=true;$('provokeBtn').hidden=true;$('debuffPanel').hidden=false;$('debuffRule').textContent='Lumière : feu/terre · sans lumière : vent/ténèbres';
 $('debuffGrid').innerHTML=roles.map(r=>{const b=dreamDebuff(r);return `<div class="debuff-row ${r===selectedRole?'is-you':''}"><b style="color:${colors[kind(r)]}">${r}</b><span class="debuff dream-${b?.type??'none'}">${b?b.short+' '+dreamDebuffTimer(b):'—'}</span></div>`}).join('');
}
function drawDreamMeteor(t,lift=100,scale=1){
 const el=DREAM_ELEMENTS[t.type];ctx.save();ctx.translate(t.x,t.y-lift);ctx.scale(scale,scale);
 ctx.beginPath();
 if(t.type==='earth'){ctx.moveTo(-21,-21);ctx.lineTo(4,-32);ctx.lineTo(25,-9);ctx.lineTo(29,17);ctx.lineTo(9,30);ctx.lineTo(-24,20);ctx.lineTo(-28,-5)}
 else{ctx.moveTo(0,-36);ctx.bezierCurveTo(-22,-30,-29,13,-19,23);ctx.bezierCurveTo(-8,33,20,31,22,14);ctx.bezierCurveTo(25,-7,14,-36,0,-36)}
 ctx.closePath();ctx.fillStyle=t.type==='fire'?'#bd3214':t.type==='earth'?'#514b3f':'#242344';ctx.fill();ctx.strokeStyle=el.color;ctx.lineWidth=3;ctx.stroke();ctx.save();ctx.clip();
 if(['dark','wind'].includes(t.type)){ctx.fillStyle='#e6eef7';ctx.fillRect(-28,-36,56,16);ctx.fillStyle=t.type==='dark'?'#573070':'#3c7251';ctx.fillRect(-28,-10,56,28);ctx.fillStyle='#334b82';ctx.fillRect(-28,18,56,20)}
 else if(t.type==='fire'){
  // Bright flame silhouette and a white-hot core, unlike the angular earth rock.
  ctx.beginPath();ctx.moveTo(-12,20);ctx.bezierCurveTo(-27,4,-4,-10,-6,-27);ctx.bezierCurveTo(7,-16,12,-8,8,0);ctx.lineTo(19,-9);ctx.bezierCurveTo(24,7,17,25,3,26);ctx.closePath();ctx.fillStyle='#ffb333';ctx.fill();
  ctx.beginPath();ctx.moveTo(0,22);ctx.bezierCurveTo(-12,11,6,3,3,-8);ctx.bezierCurveTo(17,6,14,20,0,22);ctx.fillStyle='#fff3af';ctx.fill();
 }else{ctx.beginPath();ctx.moveTo(-22,-21);ctx.lineTo(-4,1);ctx.lineTo(4,-32);ctx.moveTo(-4,1);ctx.lineTo(25,-9);ctx.moveTo(-4,1);ctx.lineTo(9,30);ctx.moveTo(-4,1);ctx.lineTo(-24,20);ctx.strokeStyle='#aa9c7b';ctx.lineWidth=2;ctx.stroke()}
 ctx.restore();
 if(t.type!=='fire')text(el.symbol,0,3,23,el.color,'700');
 if(['dark','wind'].includes(t.type)){text('✦',0,-25,12,'#fff');text('ϟ',0,24,13,'#bfd8ff')}
 // Element names are physical visual information, visible with or without guidance.
 if(['fire','earth'].includes(t.type)){ctx.fillStyle='#131820ed';ctx.fillRect(-34,34,68,24);text(el.name,0,46,18,el.color,'700')}
 ctx.restore();
}
function drawDreamTower(t){
 const until=DREAM.towers-dreamTime(),fall=until<=.9?Math.max(0,1-until/.9):0,lift=100*(1-fall*fall);
 circle(t.x,t.y,3*DS,'#bee8ff08','#d5f6ffac',1.5);
 if(!fall)line({x:t.x,y:t.y-130},{x:t.x,y:t.y},'#d2f1ff65',1);
 if(fall){const c=DREAM_ELEMENTS[t.type].color;line({x:t.x,y:t.y-lift-65},{x:t.x,y:t.y-lift},c+'99',5);line({x:t.x-10,y:t.y-lift-38},{x:t.x-10,y:t.y-lift-4},c+'55',3);}
 drawDreamMeteor(t,lift);
 if(guide&&['dark','wind'].includes(t.type))text(DREAM_ELEMENTS[t.type].name,t.x,t.y+3*DS+15,11,DREAM_ELEMENTS[t.type].color);
}
function drawDreamMeteorImpacts(){
 const age=dreamTime()-DREAM.towers;if(age<0||age>=.85)return;
 for(const t of dreamTowerPositions()){
  const color=DREAM_ELEMENTS[t.type].color,fade=1-age/.85;ctx.save();ctx.globalAlpha=fade;
  circle(t.x,t.y,3*DS,'#ff452b35','#ffb6a3',2);circle(t.x,t.y,9+age*70,null,color,4);
  if(age<.16)drawDreamMeteor(t,0,1-age*3);
  circle(t.x,t.y,Math.max(0,24-age*90),'#fff3dccc');
  for(let i=0;i<8;i++){const a=i*TAU/8,r=16+age*65,x=t.x+Math.cos(a)*r,y=t.y+Math.sin(a)*r;ctx.fillStyle=color;ctx.fillRect(x-3,y-3,6,6)}
  ctx.restore();
 }
}
function drawDreamDebuff(p,role,lift=0){drawPersonalStatus(p,role,lift)}
// Amber previews become red on resolution; stack areas appear only on impact.
function dreamTelegraphSector(e,angle,half){
 drawSector(e,angle,half,60*DS,e.impact?'#ed293970':'#ffc13d60');
 ctx.strokeStyle=e.impact?'#600e1ae6':'#352309e6';ctx.lineWidth=7;ctx.stroke();
 ctx.strokeStyle=e.impact?'#ff6874':'#ffe995';ctx.lineWidth=3;ctx.stroke();
}
function drawDreamShape(e){
 if(e.stack&&!e.impact)return;
 ctx.save();
 // Keep the danger overlay on the floor, so the void remains visually distinct.
 ctx.beginPath();
 if(dreamIslands())for(const side of [-1,1]){ctx.moveTo((side*14+10)*DS,0);ctx.arc(side*14*DS,0,10*DS,0,TAU)}
 else ctx.arc(0,0,22.5*DS,0,TAU);
 ctx.clip();
 if(e.type==='circle'){
  circle(e.x,e.y,e.r,e.impact?'#ed293970':'#ffc13d50',e.impact?'#600e1ae6':'#352309e6',7);
  circle(e.x,e.y,e.r,null,e.impact?'#ff6874':'#ffe995',3);
 }
 if(e.type==='double')for(const a of [e.vertical?0:Math.PI/2,(e.vertical?0:Math.PI/2)+Math.PI])dreamTelegraphSector(e,a,Math.PI/4);
 if(e.type==='cone')dreamTelegraphSector(e,e.angle,Math.PI/12);
 if(e.type==='beam'){
  ctx.translate(e.x,e.y);ctx.rotate(-e.angle);ctx.fillStyle=e.impact?'#ed293970':'#ffc13d60';ctx.fillRect(-5*DS,-50*DS,10*DS,50*DS);
  ctx.strokeStyle=e.impact?'#600e1ae6':'#352309e6';ctx.lineWidth=7;ctx.strokeRect(-5*DS,-50*DS,10*DS,50*DS);
  ctx.strokeStyle=e.impact?'#ff6874':'#ffe995';ctx.lineWidth=3;ctx.strokeRect(-5*DS,-50*DS,10*DS,50*DS);
 }
 ctx.restore();
}
function drawDreamPlatforms(){
  ctx.fillStyle='#282c33';ctx.fillRect(-500,-500,1000,1000);
  for(const side of [-1,1]){
   ctx.save();circle(side*14*DS,0,10*DS);ctx.clip();
   ctx.fillStyle='#263549';ctx.fillRect(-500,-500,1000,1000);
   if(dreamPlatformTexture.complete&&dreamPlatformTexture.naturalWidth)ctx.drawImage(dreamPlatformTexture,-500,-500,1000,1000);
   ctx.restore();circle(side*14*DS,0,10*DS,null,'#090f1bd9',4);circle(side*14*DS,0,10*DS-3,null,'#a1badc42',1.5);
  }

}
function drawDream(){const t=dreamTime(),blue=dreamBlue(),islands=dreamIslands(),step=dreamStep().id;ctx.save();
 if(islands){drawDreamPlatforms(); }else{
  if(t<DREAM.entry){if(background.complete&&background.naturalWidth)ctx.drawImage(background,-22.5*DS,-22.5*DS,45*DS,45*DS);}
  else drawDreamArenaFloor(blue);
  circle(0,0,20*DS,null,'#d49eba',2);
 }
 drawWaymarks(DS,islands);
 if(!islands)drawDeathRing(DS);
 if(islands)text('DEUX PLATEFORMES',0,-414,12,'#c9d5df','700');
 else if(t>=DREAM.entry)text(blue?'RÉALITÉ BLEUE':'RÉALITÉ ROUGE',0,-414,12,blue?'#a6d5ff':'#f4b5bc','700');
 circle(0,0,8*DS,'#5b23301a','#e8c2b680',2);dragon(0,0,72,true);
 if(t<DREAM.blue1||!blue&&t<DREAM.replay2+.8){
  for(const r of roles){
   const clock=dreamClock(r),p=dreamClonePos(clock),first=clock%2===(dreamScenario.cardinalFirst?0:1),spawnAt=first?11.8:14.2;
   if(t<spawnAt)continue;
   const mine=r===selectedRole,age=t-spawnAt,arrival=Math.min(1,age/.35);
   if(t>=DREAM.clone&&t<DREAM.blue1)line(actor(r),p,'#bcffec',2);
   // Each quartet visibly materializes; the flash expires so players still remember its order.
   if(age<1.25){ctx.save();ctx.globalAlpha=1-age/1.25;circle(p.x,p.y,38+age*30,'#c4e8ff20','#d8efff',3);ctx.restore()}
   circle(p.x,p.y,35,'#101a2bd9',mine&&guide&&t>=DREAM.clone?'#baffea':'#a2b2cd',mine&&guide&&t>=DREAM.clone?3:1.5);
   dragon(p.x,p.y,32+8*arrival);
   if(guide&&mine&&t>=DREAM.clone)text('TON CLONE',p.x,p.y-49,10,'#baffea','700');
  }
 }
 if(t>=DREAM.memory&&t<DREAM.red1||t>=DREAM.blue2&&t<DREAM.stored+.7||t>=DREAM.islands1&&t<DREAM.red2||t>=DREAM.islands2&&t<DREAM.portal){
  if(t>=DREAM.memory&&t<DREAM.red1||guide&&t>=DREAM.blue2&&t<DREAM.stored){
   drawDreamShape({type:'double',...dp(0,-14),vertical:dreamScenario.verticalNorth});
   drawDreamShape({type:'double',...dp(0,14),vertical:!dreamScenario.verticalNorth});
   drawDreamShape({type:'circle',...dp(0,0,10)});
  }
  // Redraw the sources over their telegraphs; orientation must stay legible.
  for(const y of [-14,0,14]){
   const p=dp(0,y);dragon(p.x,p.y,38);
   if(t<DREAM.red1||guide&&!islands){
    if(y===0)circle(p.x,p.y,20,null,'#ffe995',3);
    else{circle(p.x,p.y+34,19,'#191b22eb','#ffe995',2);text((y<0?dreamScenario.verticalNorth:!dreamScenario.verticalNorth)?'↕':'↔',p.x,p.y+34,28,'#fff1b8','700')}
   }
  }
 }
 if(t>=DREAM.links&&t<DREAM.blue2||step.startsWith('pair')){for(const s of dream.sources){dragon(s.x,s.y-18,31);if(t<DREAM.lock){icon(s.type,s.x,s.y+8,19);line(s,actor(s.owner),'#ffdb9c',2.5)}else if(guide)icon(s.type,s.x,s.y+8,17)}}
 if(islands&&t<DREAM.towers)for(const tower of dreamTowerPositions())if(t>=DREAM.tellTowers)drawDreamTower(tower);
 if(t>=DREAM.portal&&t<DREAM.red3){const f=Math.min(1,Math.max(0,(t-DREAM.jump)/1.1)),coneFrom=dp(0,dreamScenario.absorbedNorth?14:-14),coneTo=dp(dreamScenario.coneEast?14:-14,0),orbTo=dp(-coneTo.x/DS,0),p={x:coneFrom.x+(coneTo.x-coneFrom.x)*f,y:coneFrom.y+(coneTo.y-coneFrom.y)*f};circle(0,(dreamScenario.absorbedNorth?-14:14)*DS,36,'#060912','#b399ec',3);dragon(p.x,p.y,38);dragon(orbTo.x*f,0,38);if(guide||dreamTowerPractice?.stage==='finale'){text(dreamScenario.verticalNorth!==dreamScenario.absorbedNorth?'↕':'↔',p.x,p.y+38,25,'#ffe6bd');circle(orbTo.x*f,0,24,null,'#e0b7a7',2)}}
 if(['safeIsland','returnRed'].includes(step)){dragon((dreamScenario.coneEast?14:-14)*DS,0,38);dragon((dreamScenario.coneEast?-14:14)*DS,0,38)}
 if(step==='finalCone')dragon(0,-7.5*DS,38);
 if(guide&&step==='safeIsland'&&t>=DREAM.blue4&&t<DREAM.safe){const c=dp(dreamScenario.coneEast?14:-14,0);drawDreamShape({type:'double',...c,vertical:dreamScenario.verticalNorth!==dreamScenario.absorbedNorth});drawDreamShape({type:'circle',...dp(-c.x/DS,0,10)})}
 if(guide&&dreamReplayWave()&&t<DREAM['replay'+dreamReplayWave()])for(const c of dreamReplayClones(dreamReplayWave()).filter(c=>c.type==='defam'))drawDreamShape({...c,type:'circle',r:(c.type==='defam'?20:5)*DS,stack:c.type==='stack'});
 if(guide&&step.startsWith('pair')){for(const id of dreamPair(Number(step.slice(4)))){const s=dream.sources[id],p=actor(s.owner);if(s.type==='stack')continue;drawDreamShape({type:'circle',...p,r:(s.type==='defam'?20:5)*DS,stack:s.type==='stack'})}}
 if(guide&&step==='finalCone')drawDreamShape({type:'double',...dp(0,-7.5),vertical:dreamScenario.verticalNorth===dreamScenario.absorbedNorth});
 for(const e of dream.effects)if(time>=e.at&&time-e.at<.9)drawDreamShape({...e,impact:true});
 drawDreamMeteorImpacts();
 // Only the currently reenacting formation shows its mechanic markers.
 if(guide&&dreamReplayWave())for(const c of dreamReplayClones(dreamReplayWave())){icon(c.type,c.x,c.y,23);text(c.type==='stack'?'STACK':'DÉFAM.',c.x,c.y+39,10,c.type==='stack'?'#e4d4ff':'#ffe995','700')}
 if(guide&&t>=DREAM.clone){const target=dreamTarget(selectedRole);ctx.setLineDash([5,6]);circle(target.x,target.y,target.r??20,'#93f3ca1c','#b4ffe4',2);ctx.setLineDash([]);text('TA POSITION',target.x,target.y+(target.r??20)+16,9,'#c5ffee');}
 for(const r of roles){const p=actor(r),jump=dream.jumps[r],f=jump?Math.min(1,(time-jump.start)/(jump.end-jump.start)):1,lift=jump&&f<1?Math.sin(f*Math.PI)*75:0;if(showParty||r===selectedRole)playerDot({...p,y:p.y-lift},r===selectedRole?15:11);else circle(p.x,p.y-lift,8,colors[kind(r)],'#101820',2);if(r!==selectedRole)drawDreamDebuff(p,r,lift)}
 drawTrainingMarkers();
 const mineJump=dream.jumps[selectedRole],mineF=mineJump?Math.min(1,(time-mineJump.start)/(mineJump.end-mineJump.start)):1;drawDreamDebuff(actor(selectedRole),selectedRole,mineJump&&mineF<1?Math.sin(mineF*Math.PI)*75:0);
 ctx.restore();}
function dreamStrategy(){openModal('Idyllic Dream · Caro Uptime',`<p>Les deux réalités alternent. Les attaques et les tours restent en attente lorsque leur arène disparaît.</p><h3>Liens : mémoire du clone joueur</h3><table><tr><th>Clone</th><th>Lien depuis A, horaire</th></tr>${DREAM_PICKUPS.map(([type,n],i)=>`<tr><td>${marks[i]}</td><td>${types[type].name} ${n+1}</td></tr>`).join('')}</table><p>Groupes de clones : A = C/3/D/4 (gauche et sud), B = A/1/B/2 (droite et nord). Ils sont distincts des groupes de rôles 1 et 2. Les défams vont NO/NE, les autres restent au sud en mêlée. Les stacks vont à l’ouest et à l’est du boss.</p><h3>Tours</h3><p>Plateformes : groupe 1 à gauche (MT/H1/M1/R1), groupe 2 à droite (OT/H2/M2/R2). Être sur la mauvaise plateforme à la séparation compte comme une erreur.</p><p>Ouest : H1/MT au nord, R1/M1 au sud. Est : M2/R2 au nord, OT/H2 au sud. Vulnérabilité lumière : feu/terre ; sans vulnérabilité : vent/ténèbres. Conserve ta distance au boss et échange nord/sud avec ton partenaire si nécessaire.</p><p>Feu : immobile 5 s. Terre : sortir après absorption. Vent : viser horizontalement l’autre îlot. Ténèbres : rayon vers le bord, vertical pour les mêlées, horizontal pour les ranged. Esuna est automatique.</p><h3>Baits Caro</h3><p>Sur chaque îlot : vent au nord intérieur, ténèbres au centre intérieur, terre juste à l’extérieur de ténèbres, feu au sud intérieur. Terre reçoit le proche ; feu reçoit le lointain venant de l’autre îlot.</p><h3>Fin</h3><p>Retenir quel clone entre dans le portail et sur quel îlot saute le clone à cônes. Les clones joueurs rejouent dans leur ordre d’apparition : Groupe 1 stack D puis 3 (ou l’inverse), groupe 2 B puis 1. Entre les deux : îlot du clone à cônes, dedans pour nord/sud, nord/sud de l’îlot pour est/ouest. Éviter enfin le clone stocké revenu au nord.</p><p>Timings issus de BossMod ; affectations et baits du preset Caro Uptime NO/NE. Déplacements, animations et apparence des météores sont reconstitués. HP, mitigations et soins ne sont pas calculés.</p><p><a href="https://wtfdig.info/74/m12s#modified::::caroUptime" target="_blank" rel="noreferrer">Caro Uptime ↗</a> · <a href="https://github.com/awgil/ffxiv_bossmod/tree/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm" target="_blank" rel="noreferrer">Mécaniques et timings ↗</a></p>`)}
