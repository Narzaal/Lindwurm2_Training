
'use strict';
function closeDreamWorkshopSurfaces(){
 leaveDreamLessonSurface();closeFailure();$('dreamPracticeDialog').close();$('dreamTowerResultDialog').close();$('workshopBriefDialog').close();
}
function restartDreamSequence(){
 const scenario=cloneData(dreamScenario),savedSeed=seed;
 closeDreamWorkshopSurfaces();dreamTowerPractice=null;dreamLinkPractice=null;
 rangeStart=rangeEnd=4;trainingExercise='all';mode='placement';applyTrainingRange();
 dreamScenario=scenario;seed=savedSeed;dreamReset();dreamEnter();$('seed').textContent='#'+seed;
 history=[];record();updateUI();render();play();
}
function initDreamResume(){
 $('restartPracticeTraining').onclick=restartDreamSequence;$('restartTowerTraining').onclick=restartDreamSequence;
 $('restartLessonTraining').onclick=restartDreamSequence;$('restartDreamFromError').onclick=restartDreamSequence;
}
