'use strict';
// Training rhythm is independent of the visual guidance option.
let partnerRhythm='first';
function freshDecisions(){return {done:[],active:null,status:'idle',settle:0,readyFor:0,lastPosition:null}}
let decisions=freshDecisions();
function decisionPoints(){if(mode==='staging')return [];const points=[{id:'links',at:rep2At(),deadline:rep2At(mode==='links'?24:COMBAT.lock),label:'Choisis ton lien'}];if(mode==='links')return points;return points.concat([
 {id:'firefall',deadline:rep2At(COMBAT.jump),at:rep2At(COMBAT.lock),label:'Place-toi pour Firefall Splash'},
 {id:'parties',deadline:rep2At(COMBAT.stack),at:rep2At(COMBAT.defams)+.12,label:'Place-toi pour le stack de ta light party'},
 {id:'cones',deadline:rep2At(COMBAT.cones),at:rep2At(COMBAT.stack)+.12,label:'Prépare la direction des cônes'},
 {id:'cleave',deadline:rep2At(COMBAT.kick),at:rep2At(COMBAT.kickMove),label:'Place-toi pour le cleave frontal'},
 {id:'replay',deadline:rep2At(COMBAT.netherTell),at:rep2At(COMBAT.reenact),label:'Prépare la Reconstitution'},
 {id:'nether',deadline:rep2At(COMBAT.wave0),at:rep2At(COMBAT.netherTell),label:'Place-toi pour les rayons et Netherwrath'},
 {id:'pair1',deadline:rep2At(COMBAT.wave1),at:rep2At(COMBAT.replayRays)+.12,label:'Prépare la paire 1 / 3'},
 {id:'pair2',deadline:rep2At(COMBAT.wave2),at:rep2At(COMBAT.replayCone1)+.12,label:'Place-toi pour les stacks B / D'},
 {id:'pair3',deadline:rep2At(COMBAT.wave3),at:rep2At(COMBAT.wave2)+.12,label:'Prépare la dernière paire 2 / 4'}
 ])}
function tetherNow(){return time}
function firstRhythm(){return !demoMode&&partnerRhythm==='first'&&mode!=='staging'}
function botsWaiting(){return firstRhythm()&&(staging()||decisions.status==='choosing')}
function beginDecision(point){if(decisions.active&&!decisions.done.includes(decisions.active.id))decisions.done.push(decisions.active.id);decisions.active={...point};decisions.status='choosing';decisions.settle=0;decisions.readyFor=0;decisions.lastPosition={x:player.x,y:player.y}}
function playerReady(){
 if(decisions.active.id==='links'){const source=sources.find(s=>s.id===plannedSources[selectedRole]);return source?source.owner===selectedRole:ownedBy().length===0||Math.hypot(player.x,player.y)>280;}
 if(decisions.active.id==='cleave')return !inCone(player,resolution.boss,resolution.cleave?.angle??0,Math.PI/2);
 if(decisions.active.id==='cones'&&hasMechanic(selectedRole,'cone'))return party.every(p=>p.role===selectedRole||!inCone(actor(p.role),player,player.a));
 const target=resolutionTarget(me());return dist(player,target)<(target.r??28)+16;
}
function latestPartnerDeparture(){
 const travel=party.filter(p=>p.role!==selectedRole).map(p=>{const target=resolution.locked?resolutionTarget(p):sources.find(s=>s.id===plannedSources[p.role])??pt(p.clock*TAU/8,355);return dist(p,target)/190});
 return Math.max(decisions.active.at,decisions.active.deadline-Math.max(0,...travel)-.25);
}
function updateAutomaticDecision(dt){
 if(!firstRhythm()||decisions.status!=='choosing')return;
 const stopped=!decisions.lastPosition||dist(player,decisions.lastPosition)<.5;
 decisions.readyFor=playerReady()&&stopped?decisions.readyFor+dt:0;decisions.lastPosition={x:player.x,y:player.y};
 if(decisions.readyFor<.7&&time<latestPartnerDeparture())return;
 decisions.status='joining';decisions.settle=0;
}
function partnersReady(){return party.filter(p=>p.role!==selectedRole).every(p=>{if(!resolution.locked){const s=sources.find(s=>s.id===plannedSources[p.role]);return s?dist(p,s)<12&&s.owner===p.role:dist(p,pt(p.clock*TAU/8,355))<12}return bound(p.role)||dist(p,resolutionTarget(p))<15})}
function updateDecisionJoin(dt){if(!firstRhythm()||decisions.status!=='joining')return;decisions.settle+=dt;if(partnersReady()||decisions.settle>=6){decisions.done.push(decisions.active.id);decisions.active=null;decisions.status='idle'}}
function updateDecisionUI(){$('decisionPanel').hidden=false;$('decisionTitle').textContent='';$('decisionTitle').hidden=true;$('decisionCopy').textContent='';$('decisionCopy').hidden=true;$('decisionHelp').hidden=!started||time>=duration();$('decisionHelp').disabled=!running;$('decisionHelp').textContent=guide?'Masquer l’aide':'Afficher une aide';}
