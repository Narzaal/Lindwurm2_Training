'use strict';
function applyTrainingRange(){
 trainingExercise='all';
 mode='placement';
 const first=trainingPhases[rangeStart],last=trainingPhases[rangeEnd];
 $('mechanicStart').value=first.id;$('mechanicEnd').value=last.id;
 [...$('mechanicEnd').options].forEach((option,i)=>option.disabled=i<rangeStart);
 $('modeLabel').textContent=rangeStart===rangeEnd?first.name:first.name+' → '+last.name;
 $('rangeHint').textContent=rangeStart===rangeEnd?'Une mécanique ciblée · '+fmt(last.end-first.start):'Séquence continue · '+fmt(last.end-first.start)+' · transitions incluses';
 $('fullFight').classList.toggle('selected',rangeStart===0&&rangeEnd===5);
 reset(false);
}
for(const id of ['mechanicStart','mechanicEnd'])$(id).innerHTML=trainingPhases.map(p=>`<option value="${p.id}">${p.name}</option>`).join('');
$('mechanicStart').onchange=e=>{rangeStart=trainingPhases.findIndex(p=>p.id===e.target.value);if(rangeEnd<rangeStart)rangeEnd=rangeStart;applyTrainingRange()};
$('mechanicEnd').onchange=e=>{rangeEnd=Math.max(rangeStart,trainingPhases.findIndex(p=>p.id===e.target.value));applyTrainingRange()};
$('fullFight').onclick=()=>{rangeStart=0;rangeEnd=5;applyTrainingRange()};
applyTrainingRange();

const rngControls={rngRep2:'rep2',rngDream:'dream',rngFire:'fire',rngNorth:'north',rngBeta:'beta',rngMeteor:'meteor'};
loadTrainingPreferences();
$('guide').checked=guide;$('playMode').value=demoMode?'demo':'practice';$('partnerRhythm').value=partnerRhythm;
$('stopOnError').checked=stopOnError;$('callMode').checked=callMode;$('defamMarkers').checked=defamMarkers;
for(const [id,key] of Object.entries(rngControls)){
 $(id).value=fixedRng[key];$(id).onchange=()=>{fixedRng[key]=$(id).value;reset(true);saveTrainingPreferences();};
}
for(const [id,set] of [['stopOnError',v=>stopOnError=v],['callMode',v=>callMode=v],['defamMarkers',v=>defamMarkers=v]])$(id).onchange=e=>{set(e.target.checked);updateUI();saveTrainingPreferences();};
$('randomRng').onclick=()=>{for(const [id,key] of Object.entries(rngControls)){$(id).value='auto';fixedRng[key]='auto';}reset(true);saveTrainingPreferences();};
$('continueTraining').onclick=()=>{if(dreamTowerPractice?.done){startDreamTowerPractice(false,dreamTowerPractice.stage);return;}closeFailure();play();};
$('rewindTraining').onclick=resumePreviousSuccess;
$('retryMechanic').onclick=()=>{if(dreamTowerPractice){startDreamTowerPractice(false,dreamTowerPractice.stage);return;}const phase=activeFailure?.phase??currentTrainingPhase();closeFailure();reset(false,phase.start);play();};
$('retryTraining').onclick=()=>{if(dreamTowerPractice){startDreamTowerPractice(false,firstDreamWorkshopStage(dreamTowerPractice.stage));return;}closeFailure();reset(false);play();};
$('errorDialog').addEventListener('cancel',e=>e.preventDefault());
$('explainDreamError').onclick=openDreamLinkLesson;
$('closeDreamLesson').onclick=returnFromDreamLesson;
$('dreamLessonPrevious').onclick=()=>setDreamLessonStep((dreamLinkLesson?.step??0)-1);
$('dreamLessonNext').onclick=()=>setDreamLessonStep((dreamLinkLesson?.step??0)+1);
$('repeatDreamLesson').onclick=restartDreamLesson;
$('restartLessonTraining').onclick=restartTrainingFromLesson;
$('practiceDreamLinks').onclick=startDreamLinkPractice;
$('anotherDreamPractice').onclick=startDreamLinkPractice;
$('restartPracticeTraining').onclick=restartTrainingFromLesson;
$('dreamPracticeDialog').addEventListener('cancel',e=>e.preventDefault());
$('settingsBtn').onclick=openPreparation;$('mobileSetup').onclick=openPreparation;
$('confirmPreparation').onclick=confirmPreparation;
$('preparationDialog').addEventListener('cancel',e=>e.preventDefault());
$('mobilePlay').onclick=()=>play();$('mobileRetry').onclick=()=>{$('restartBtn').onclick();};$('mobileShuffle').onclick=()=>{$('shuffle').onclick();};
$('timeline').oninput=e=>{
 if(!started)return;const max=history.at(-1)?.t??time,target=Math.min(Number(e.target.value),max),h=[...history].reverse().find(h=>h.t<=target+.001)??history[0];
 if(h){restoreTrainingSnapshot(h);updateUI();toast('Replay en pause · Espace pour reprendre.');}
};
document.addEventListener('change',saveTrainingPreferences);
document.addEventListener('click',e=>{if(e.target.closest('[data-role],[data-speed],#fullFight,#decisionHelp'))saveTrainingPreferences();});
trainerReady=true;
applyTrainingRange();
document.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('selected',Number(b.dataset.speed)===speed));
function syncDesktopArena(){
 const desktop=typeof window.matchMedia==='function'&&window.matchMedia('(min-width: 701px) and (pointer: fine)').matches;
 const mobile=typeof window.matchMedia==='function'&&window.matchMedia('(max-width: 700px)').matches;
 const nearArena=desktop&&window.matchMedia('(min-width: 1100px) and (min-height: 800px)').matches;
 document.body.classList.toggle('calls-near-arena',nearArena);
 const chat=$('callChat'),feedback=$('liveFeedback');
 if(mobile)$('arenaViewport').appendChild(chat);
 else if(nearArena)$('arenaWrap').appendChild(chat);
 else document.querySelector('.simulation').insertBefore(chat,document.querySelector('.playback'));
 if(desktop){
  document.querySelector('.sim-top').insertBefore(feedback,$('stateChip'));
 }else{
  $('arenaWrap').insertBefore(feedback,document.querySelector('.touch-controls'));
 }
}
syncDesktopArena();window.addEventListener('resize',syncDesktopArena);
openPreparation();

initDreamTowerWorkshop();

initDreamResume();

initDreamWorkshops();
