'use strict';
// Trainer preferences are browser-local; scenarios and combat snapshots remain per pull.
const TRAINER_KEY='pull-lab-settings-v1';
let trainerReady=false,stopOnError=true,callMode=true,defamMarkers=false;
let fixedRng={rep2:'auto',dream:'auto',fire:'auto',north:'auto',beta:'auto',meteor:'auto'};
let acknowledgedErrors=new Set(),activeFailure=null,preparationHomes=null;
function trainerReset(){acknowledgedErrors.clear();activeFailure=null;resetDreamLesson();if($('errorDialog')?.open)$('errorDialog').close();}
function constrainClock(list,index,value){if(value==='auto')return;const at=list.indexOf(Number(value));if(at>=0)[list[index],list[at]]=[list[at],list[index]];}
function applyRngConstraints(){
 const index=roles.indexOf(selectedRole);
 if(fixedRng.rep2!=='auto'){const peer=party.find(p=>p.clock===Number(fixedRng.rep2)),mine=party[index];if(peer)[peer.clock,mine.clock]=[mine.clock,peer.clock];}
 constrainClock(dreamScenario.clocks,index,fixedRng.dream);
 if(fixedRng.fire!=='auto'){rep1Scenario.fireCardinal=Number(fixedRng.fire);rep1Scenario.horizontal=rep1Scenario.fireCardinal%2===1;}
 if(fixedRng.north!=='auto')rep1Scenario.north=Number(fixedRng.north);
 if(fixedRng.beta!=='auto'){
  const wantsBeta=fixedRng.beta==='beta',hasBeta=candyScenario.beta.includes(selectedRole);
  if(wantsBeta!==hasBeta){const peer=roles.find(r=>r!==selectedRole&&kind(r)===kind(selectedRole)&&candyScenario.beta.includes(r)===wantsBeta);if(peer)candyScenario.beta=candyScenario.beta.map(r=>r===(hasBeta?selectedRole:peer)?(hasBeta?peer:selectedRole):r);}
 }
 if(fixedRng.meteor!=='auto'){
  const desired=fixedRng.meteor,side=dreamWest(selectedRole)?0:1;
  dreamScenario.lightSupports=(kind(selectedRole)!=='dps')===['fire','earth'].includes(desired);
  const original=[...dreamScenario.layouts[side]];let found=false;
  for(let rotation=0;rotation<4&&!found;rotation++)for(const swap of [false,true]){
   dreamScenario.layouts[side]=original.map((_,i)=>{let type=original[(i+rotation)%4];return swap?(type==='fire'?'earth':type==='earth'?'fire':type):type;});
   if(dreamTower(selectedRole).type===desired){found=true;break;}
  }
 }
}
function errorKey(e){return e.at.toFixed(3)+'|'+e.message;}
function currentTrainingPhase(at=time){return [...trainingPhases].reverse().find(p=>at>=p.start-.001)??trainingPhases[rangeStart];}
function recordSuccessfulCheckpoint(label,ok){
 if(ok&&trainerReady&&!demoMode)record(label);
}
function previousSuccessfulCheckpoint(before=time){
 return [...history].reverse().find(h=>h.successfulCheckpoint&&h.t<before-.001)??null;
}
function trainerCheckError(entries){
 if(!trainerReady||(!stopOnError&&!dreamLinkPractice&&!dreamTowerPractice)||demoMode||!running||$('errorDialog').open)return;
 const error=entries.find(e=>!e.ok&&!acknowledgedErrors.has(errorKey(e)));if(!error)return;
 for(const e of entries.filter(e=>!e.ok))acknowledgedErrors.add(errorKey(e));
 activeFailure={...error,phase:currentTrainingPhase(),checkpoint:previousSuccessfulCheckpoint(error.at)};running=false;keys.clear();resetStick();
 activeFailure.dreamLinks=dreamLinkFailureContext(error);activeFailure.dreamTowers=dreamTowerFailureContext(error);$('explainDreamError').hidden=!activeFailure.dreamLinks&&!activeFailure.dreamTowers;$('newTowerError').hidden=!dreamTowerPractice;$('continueTraining').textContent=dreamTowerPractice?.done?'Réessayer cet atelier':'Continuer';$('restartDreamFromError').hidden=!isDreamActive();
 $('errorMessage').textContent=error.message;$('errorPhase').textContent=activeFailure.phase.name+' · '+fmt(time-trainingStartTime());
 $('retryMechanic').textContent=dreamTowerPractice?'Recommencer cette étape':'Recommencer '+activeFailure.phase.name;$('retryTraining').textContent=dreamTowerPractice?'Recommencer l’atelier':'Recommencer l’entraînement';
 $('retryMechanic').hidden=!activeFailure.checkpoint;
 if(isDreamActive()){
  $('restartDreamFromError').hidden=false;
  $('retryMechanic').hidden=!dreamTowerPractice;
  $('retryTraining').hidden=dreamTowerPractice?dreamTowerPractice.stage!=='return':!!dreamLinkPractice||trainingStartTime()>=dreamOffset();
  if(dreamTowerPractice)$('retryMechanic').textContent=dreamTowerPractice.stage==='return'?'Réessayer cette étape':'Réessayer cet atelier';
 }else{$('retryTraining').hidden=false;}

 $('rewindTraining').textContent=activeFailure.checkpoint?'Reprendre après '+activeFailure.checkpoint.successfulCheckpoint:'Reprendre au début · '+(dreamTowerPractice?'atelier':activeFailure.phase.name);
 $('rewindTraining').title=activeFailure.checkpoint?'Restaurer le dernier état réussi, avec le même tirage':'Aucun point de contrôle réussi pour le moment';
 $('errorDialog').showModal();
}
function restoreTrainingSnapshot(h){
 time=h.t;player={x:h.x,y:h.y,a:h.a};held=h.held;selectedClock=h.selectedClock??null;linksActive=h.linksActive;
 party=cloneData(h.party);sources=cloneData(h.sources);resolution=cloneData(h.resolution);decisions=cloneData(h.decisions);rep1=cloneData(h.rep1);candy=cloneData(h.candy);dream=cloneData(h.dream);dreamTowerPractice=cloneData(h.dreamTowerPractice??null);encounter=cloneData(h.encounter);
 checks=cloneData(h.checks??{});fx=cloneData(h.fx??[]);lastGoodTime=h.lastGoodTime??null;
 feedback=feedback.filter(e=>e.at<=time+.001);feedbackSignature='';feedbackMarkup='';objectiveCache='';rep1UICache='';stage=-1;saved=false;started=true;running=false;keys.clear();resetStick();
 history=history.filter(s=>s.t<=time+.001);acknowledgedErrors=new Set(feedback.filter(e=>!e.ok).map(errorKey));
}
function resumePreviousSuccess(){
 const checkpoint=activeFailure?.checkpoint??previousSuccessfulCheckpoint(activeFailure?.at??time),phase=activeFailure?.phase??currentTrainingPhase();
 if(!checkpoint&&dreamTowerPractice){startDreamTowerPractice(false,dreamTowerPractice.stage);return;}
 closeFailure();
 if(checkpoint)restoreTrainingSnapshot(checkpoint);
 else reset(false,phase.start);
 play();
}
function closeFailure(){if($('errorDialog').open)$('errorDialog').close();activeFailure=null;}
function updateTrainerUI(){
 if(!trainerReady)return;
 $('mobilePlay').textContent=running?'Ⅱ Pause':started?'▶ Reprendre':'▶ Démarrer';
 $('mobilePlay').setAttribute('aria-label',$('startBtn').textContent);
 $('mobileSetup').textContent=selectedRole+' · '+(rangeStart===rangeEnd?trainingPhases[rangeStart].name:trainingPhases[rangeStart].name+' → '+trainingPhases[rangeEnd].name)+' · Réglages';
 updateTrainingCalls();
 updateDreamLinkPractice();
 updateDreamTowerWorkshop();
}
function updateTrainingCalls(){
 const box=$('callChat'),enabled=callMode&&isDreamActive()&&!dreamTowerPractice;box.hidden=!enabled;document.body.classList.toggle('with-calls',enabled);if(!enabled)return;
 const t=dreamTime(),calls=[];
 if(t>=11.8)calls.push(['11.8',dreamScenario.cardinalFirst?'Cardinaux en premier':'Intercardinaux en premier']);
 if(t>=DREAM.memory)calls.push(['32.5','Côté safe : '+(dreamScenario.verticalNorth?'nord':'sud')]);
 if(t>=DREAM.links)calls.push(['51.2',(dream.sources[0].type==='defam'?'Défamation':'Stack')+' en premier']);
 $('callLog').textContent=calls.length?calls.slice(-3).map(([,call])=>call).join('\n'):'En attente des indices…';
}
function trainingDefamMarker(role){
 const clock=dreamClock(role),[type,ordinal]=DREAM_PICKUPS[clock];
 if(!defamMarkers||time<dreamOffset()+DREAM.clone||type!=='defam')return null;
 const source=dreamSource(role),resolutionAt=dreamPairAt(source.id%4);
 if(time>=dreamOffset()+resolutionAt)return null;
 const p=actor(role),jump=dream.jumps[role],f=jump?Math.min(1,(time-jump.start)/(jump.end-jump.start)):1,lift=jump&&f<1?Math.sin(f*Math.PI)*75:0;
 return {role,left:dreamGroup(role)===0,number:ordinal%2+1,x:p.x+48,y:p.y-lift+28,resolutionAt};
}
function drawTrainingMarkers(){
 for(const role of roles){
  const marker=trainingDefamMarker(role);if(!marker)continue;
  const {left,number,x,y}=marker;
  ctx.save();ctx.translate(x,y);ctx.fillStyle='#0c1425f2';ctx.fillRect(-35,-15,70,30);ctx.strokeStyle=left?'#a8dcff':'#ff9da9';ctx.lineWidth=2;
  if(left){for(const dx of [-6,3]){ctx.beginPath();ctx.ellipse(dx,-1,7,4,-.65,0,TAU);ctx.stroke();}}
  else{ctx.beginPath();ctx.arc(-3,-1,9,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(-9,5);ctx.lineTo(3,-7);ctx.stroke();}
  text(String(number),20,0,18,left?'#c9eaff':'#ffd0d6','700');ctx.restore();
 }
}
function saveTrainingPreferences(){
 if(!trainerReady)return;
 const data={version:1,role:selectedRole,start:trainingPhases[rangeStart].id,end:trainingPhases[rangeEnd].id,speed,guide,guideSettingVersion:2,demoMode,partnerRhythm,stopOnError,callMode,defamMarkers,fixedRng};
 try{localStorage.setItem(TRAINER_KEY,JSON.stringify(data));$('storageHint').textContent='Réglages mémorisés sur ce navigateur.';}catch{$('storageHint').textContent='Le navigateur empêche la mémorisation. Les réglages restent actifs pour cette session.';}
}
function loadTrainingPreferences(){
 let data;try{data=JSON.parse(localStorage.getItem(TRAINER_KEY));}catch{}if(!data||data.version!==1)return;
 if(roles.includes(data.role))selectedRole=data.role;
 const a=trainingPhases.findIndex(p=>p.id===data.start),b=trainingPhases.findIndex(p=>p.id===data.end);if(a>=0&&b>=a){rangeStart=a;rangeEnd=b;}
 if([.5,.75,1].includes(data.speed))speed=data.speed;
 for(const key of ['rep2','dream'])if(['auto',...Array.from({length:8},(_,i)=>String(i))].includes(data.fixedRng?.[key]))fixedRng[key]=data.fixedRng[key];
 for(const key of ['fire','north'])if(['auto','0','1','2','3'].includes(data.fixedRng?.[key]))fixedRng[key]=data.fixedRng[key];
 if(['auto','alpha','beta'].includes(data.fixedRng?.beta))fixedRng.beta=data.fixedRng.beta;
 if(['auto','fire','earth','dark','wind'].includes(data.fixedRng?.meteor))fixedRng.meteor=data.fixedRng.meteor;
 if(['first','live'].includes(data.partnerRhythm))partnerRhythm=data.partnerRhythm;
 if(data.guideSettingVersion===2&&typeof data.guide==='boolean')guide=data.guide;
 if(typeof data.demoMode==='boolean')demoMode=data.demoMode;
 if(typeof data.stopOnError==='boolean')stopOnError=data.stopOnError;
 if(typeof data.callMode==='boolean')callMode=data.callMode;if(typeof data.defamMarkers==='boolean')defamMarkers=data.defamMarkers;
}
function openPreparation(){
 if($('preparationDialog').open)return;running=false;keys.clear();resetStick();updateUI();
 const range=document.querySelector('.training-range'),setup=document.querySelector('.setup');
 preparationHomes=[range,setup].map(node=>({node,parent:node.parentNode,next:node.nextSibling}));
 document.querySelector('.more-options').open=true;$('prepareRange').appendChild(range);$('prepareOptions').appendChild(setup);$('preparationDialog').showModal();
}
function confirmPreparation(){
 $('preparationDialog').close();for(const home of preparationHomes??[])home.parent.insertBefore(home.node,home.next);preparationHomes=null;document.querySelector('.more-options').open=false;saveTrainingPreferences();updateUI();canvas.focus({preventScroll:true});
}
