'use strict';
// Timeline in seconds after Replication begins; dimensions are calibrated training approximations.
// Seconds after Replication II completes. See TIMING.md for measured intervals and approximations.
const COMBAT={lock:16.5,firefallTell:16.6,jump:22.3,landing:22.5,rays:23.1,defams:24.5,stack:30,cones:31.8,kickTell:30.6,kickMove:31.92,kick:35.6,reenact:42.8,reenactEnd:45.8,netherTell:49,netherEnd:54,replayLanding:54,replayRays:55.9,replayCone1:59.9,replayCone3:67.9,wave0:55.2,wave1:59.2,wave2:63.6,wave3:67.2,end:69.2};
const GEOMETRY={landing:5*21.25,rayHalf:Math.PI/36,defam:20*21.25,stack:5*21.25,nether:6*21.25,coneHalf:Math.PI/8,range:50*21.25,player:0};
function freshResolution(){return {locked:false,links:{},boss:{x:0,y:0},bossHeading:0,cleave:null,jump:null,rayTargets:[],raySlots:{},farTarget:null,cloneMemories:{},activeWave:null,netherVariant:null,events:[],effects:[],failures:[]}}
let resolution=freshResolution();
function resetCombat(){resolution=freshResolution()}
function cloneData(value){return JSON.parse(JSON.stringify(value))}
function lockAssignments(){if(resolution.locked)return;resolution.locked=true;for(const p of party)resolution.links[p.role]=ownedBy(p.role).map(s=>({id:s.id,type:s.type}));toast('Liens figés : place-toi selon le lien reçu. Stacks et cônes au nord.')}
function lockedTypes(role){return resolution.locked?(resolution.links[role]||[]).map(s=>s.type):ownedBy(role).map(s=>s.type)}
function hasMechanic(role,type){return lockedTypes(role).includes(type)}
function mechanicFor(role){const assigned=lockedTypes(role);return ['boss','defam','stack','cone'].find(t=>assigned.includes(t))||'none'}
function groupOf(role){return priorityFor(party.find(p=>p.role===role).clock).group}
function resolutionTarget(p,s=getStage()){
 const extended=extendedTarget(p);if(extended)return extended;
 const type=mechanicFor(p.role),sign=groupOf(p.role)==='green'?1:-1;
 if(s<4){if(type==='boss')return{x:0,y:-210,r:32};if(type==='none')return{x:0,y:410,r:32};if(type==='defam')return{x:sign*385,y:110,r:32};const x=sign*(type==='cone'?55:155);return{x,y:-Math.sqrt(410*410-x*x),r:28}}
 const center={x:sign*125,y:-135};
 if(type==='cone')return{x:sign*75,y:-135,r:24};if(type==='stack')return{...center,r:30};if(type==='defam')return{x:sign*145,y:-115,r:28};return{x:sign*115,y:-165,r:28};
}
function combatBossPosition(){if(!resolution.jump)return {...resolution.boss,lift:0};const jump=resolution.jump,f=Math.max(0,Math.min(1,(phaseTime()-COMBAT.jump)/(COMBAT.landing-COMBAT.jump)));return{x:jump.from.x+(jump.to.x-jump.from.x)*f,y:jump.from.y+(jump.to.y-jump.from.y)*f,lift:Math.sin(f*Math.PI)*55}}
function bound(role){if(isCandyActive())return false;return resolution.jump?.role===role&&phaseTime()>=COMBAT.jump&&phaseTime()<COMBAT.rays}
function facingToward(a,b){return Math.atan2(-(b.x-a.x),-(b.y-a.y))}
function inCone(point,origin,angle,half=GEOMETRY.coneHalf,range=GEOMETRY.range){const d=dist(point,origin);if(d>range+GEOMETRY.player)return false;if(d<=GEOMETRY.player)return true;const direction=facingToward(origin,point),difference=Math.abs(Math.atan2(Math.sin(direction-angle),Math.cos(direction-angle)));return difference<=half+Math.asin(Math.min(1,GEOMETRY.player/d))}
function safeConeAt(role,position){const others=party.filter(p=>p.role!==role).map(p=>actor(p.role));let best={a:0,hits:Infinity};for(const a of [0,Math.PI,...Array.from({length:96},(_,i)=>i*TAU/96)]){const hits=others.filter(p=>inCone(p,position,a)).length;if(hits<best.hits)best={a,hits};if(!hits)break}return best}
function updateConeBots(dt){if(!resolution.locked||phaseTime()<COMBAT.stack-1||phaseTime()>COMBAT.cones)return;for(const p of party){if(p.role===selectedRole||!hasMechanic(p.role,'cone'))continue;let safe=safeConeAt(p.role,p);if(safe.hits&&phaseTime()>COMBAT.stack){const center={x:(groupOf(p.role)==='green'?1:-1)*125,y:-135};const alternatives=Array.from({length:16},(_,i)=>({...pt(i*TAU/16,60)})).map(v=>({x:center.x+v.x,y:center.y+v.y})).filter(v=>party.every(other=>other.role===p.role||dist(v,actor(other.role))>27));const position=alternatives.map(v=>({...v,safe:safeConeAt(p.role,v)})).sort((a,b)=>a.safe.hits-b.safe.hits||dist(a,p)-dist(b,p))[0];if(position){advanceToward(p,position,PLAYER_MOVE_SPEED*dt);safe=safeConeAt(p.role,p)}}p.a=safe.a}}
function combatError(roles,message){resolution.failures.push({at:time,roles:[...new Set(roles)],message})}
function validateStackGroup(members,expected,count,report,label){
 const missing=expected.filter(r=>!members.includes(r)),wrong=members.filter(r=>!expected.includes(r));
 if(missing.length)report(missing,label+' : tu n’as pas rejoint ton stack attribué.');
 if(wrong.length)report(wrong,label+' : tu as rejoint le mauvais stack.');
 if(members.length!==count)report([...new Set([...members,...expected])],`${label} : partage à ${count} requis (${members.length} présents).`);
}
function effect(kind,origin,properties={},life=1){resolution.effects.push({kind,x:origin.x,y:origin.y,at:time,until:time+life,...properties})}
function eventResult(key,label,before,data={}){const errors=resolution.failures.slice(before),mine=errors.find(f=>f.roles.includes(selectedRole));resolution.events.push({key,label,at:time,errors:cloneData(errors),...data});checks[(rep2At(COMBAT[key])).toFixed(2)]={ok:!mine,reason:mine?mine.message:label+' : résolu.'};toast(mine?'✕ '+mine.message:'✓ '+label+' résolu.');if(!['jump','kickTell','netherTell','reenact'].includes(key))recordSuccessfulCheckpoint(label,!mine);}
function fireCombatEvent(key){const before=resolution.failures.length;if(fireExtendedEvent(key,before))return;
 if(key==='jump'){
  const source=sources.find(s=>s.id==='boss'),role=source?.owner;if(!role){combatError(roles,'Le boss n’a pas de cible de saut.');eventResult(key,'Firefall Splash',before);return}
  const target=actor(role);resolution.jump={role,from:{...resolution.boss},to:{x:target.x,y:target.y}};eventResult(key,'Saut du boss',before,{target:role});return;
 }
 if(key==='landing'){
  if(!resolution.jump)return;resolution.boss={...resolution.jump.to};const role=resolution.jump.role;effect('landing',resolution.boss,{radius:GEOMETRY.landing,owner:role},.8);
  const clipped=party.filter(p=>p.role!==role&&dist(actor(p.role),resolution.boss)<=GEOMETRY.landing+GEOMETRY.player).map(p=>p.role);if(clipped.length)combatError([role,...clipped],'Firefall Splash : un autre joueur a été touché par le saut.');eventResult(key,'Impact de Firefall Splash',before,{target:role,clipped});return;
 }
 if(key==='rays'){
  if(!resolution.jump)return;const origin={...resolution.boss},candidates=party.filter(p=>p.role!==resolution.jump.role).sort((a,b)=>dist(actor(a.role),origin)-dist(actor(b.role),origin)||roles.indexOf(a.role)-roles.indexOf(b.role));
  const targets=candidates.slice(0,4).map(p=>p.role);resolution.rayTargets=targets;const leftToRight=[...targets].sort((a,b)=>actor(a).x-actor(b).x);resolution.raySlots=Object.fromEntries(leftToRight.map((role,i)=>{const x=[-155,-55,55,155][i];return [role,{x,y:-Math.sqrt(410*410-x*x)}]}));resolution.farTarget=candidates.at(-1)?.role??null;
  const hitCount=Object.fromEntries(roles.map(r=>[r,0]));
  for(const role of targets){const angle=facingToward(origin,actor(role));effect('ray',origin,{angle,half:GEOMETRY.rayHalf,range:GEOMETRY.range,owner:role},1.1);for(const p of party)if(p.role!==resolution.jump.role&&inCone(actor(p.role),origin,angle,GEOMETRY.rayHalf))hitCount[p.role]++;
   const clipped=roles.filter(r=>r!==role&&r!==resolution.jump.role&&inCone(actor(r),origin,angle,GEOMETRY.rayHalf));if(clipped.length)combatError([role,...clipped],`Scalding Waves de ${role} : le rayon touche un autre joueur.`);
   if(!hasMechanic(role,'stack')&&!hasMechanic(role,'cone'))combatError([role],'Scalding Waves : tu as attiré un rayon à la place d’un stack ou d’un cône.');}
  for(const p of party){if(hitCount[p.role]>(targets.includes(p.role)?1:0)&&p.role!==resolution.jump.role)combatError([p.role],'Scalding Waves : touché par un rayon supplémentaire.');if((hasMechanic(p.role,'stack')||hasMechanic(p.role,'cone'))&&!targets.includes(p.role))combatError([p.role],'Scalding Waves : trop loin pour attirer ton rayon.');}
  eventResult(key,'Scalding Waves',before,{targets,farTarget:resolution.farTarget,hitCount});return;
 }
 if(key==='defams'){
  const targets=[];for(const p of party)for(const type of lockedTypes(p.role))if(type==='defam')targets.push(p.role);if(resolution.farTarget)targets.push(resolution.farTarget);
  for(const role of targets){const origin=actor(role);effect('defam',origin,{radius:GEOMETRY.defam,owner:role},1.1);const clipped=party.filter(p=>p.role!==role&&dist(actor(p.role),origin)<=GEOMETRY.defam+GEOMETRY.player).map(p=>p.role);if(clipped.length)combatError([role,...clipped],`Mana Burst de ${role} : défamation trop proche du groupe.`)}
  for(const role of new Set(targets))if(targets.filter(r=>r===role).length>1)combatError([role],'Mana Burst : deux défamations ont ciblé le même joueur.');eventResult(key,'Trois défamations',before,{targets});return;
 }
 if(key==='stack'){
  const stacks=[];for(const carrier of party.filter(p=>hasMechanic(p.role,'stack'))){const center=actor(carrier.role),members=party.filter(p=>dist(actor(p.role),center)<=GEOMETRY.stack).map(p=>p.role),expected=party.filter(p=>groupOf(p.role)===groupOf(carrier.role)).map(p=>p.role);effect('stack',center,{radius:GEOMETRY.stack,owner:carrier.role,group:groupOf(carrier.role)},.75);stacks.push({owner:carrier.role,members,group:groupOf(carrier.role)});
   validateStackGroup(members,expected,4,combatError,`Heavy Slam · groupe ${groupOf(carrier.role)==='green'?'A':'B'}`);
  }if(stacks.length!==2)combatError(roles,'Heavy Slam : les deux stacks n’ont pas été répartis correctement.');eventResult(key,'Stacks A / B',before,{stacks});return;
 }
 if(key==='cones'){
  const cones=[];for(const caster of party.filter(p=>hasMechanic(p.role,'cone'))){const origin=actor(caster.role);if(caster.role!==selectedRole)caster.a=safeConeAt(caster.role,origin).a;const angle=caster.role===selectedRole?player.a:caster.a||0,hits=party.filter(p=>p.role!==caster.role&&inCone(actor(p.role),origin,angle)).map(p=>p.role);effect('cone',origin,{angle,half:GEOMETRY.coneHalf,range:GEOMETRY.range,owner:caster.role},1.35);cones.push({owner:caster.role,angle,hits});if(hits.length)combatError([caster.role,...hits],`Hemorrhagic Projection de ${caster.role} : le cône touche un autre joueur.`)}
  eventResult(key,'Hemorrhagic Projection',before,{cones});
 }
}
function simulateCombat(oldTime,newTime){if(mode!=='placement'||!resolution.locked)return;for(const key of ['jump','landing','rays','defams','stack','cones','kickTell','kick','reenact','netherTell','replayLanding','wave0','replayRays','wave1','replayCone1','wave2','wave3','replayCone3']){const at=rep2At(COMBAT[key]);if(oldTime<at&&newTime>=at)fireCombatEvent(key)}}
function drawSector(origin,angle,half,range,fill,stroke){ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.arc(origin.x,origin.y,range,-Math.PI/2-angle-half,-Math.PI/2-angle+half);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
function drawCombat(){if(mode!=='placement'||!resolution.locked)return;ctx.save();ctx.beginPath();ctx.arc(0,0,478,0,TAU);ctx.clip();
 for(const e of resolution.effects){if(time<e.at||time>e.until)continue;const alpha=Math.min(1,(e.until-time)*3);ctx.save();ctx.globalAlpha=alpha;if(e.kind==='ray'||e.kind==='cone'||e.kind==='cleave')drawSector(e,e.angle,e.half,e.range,e.kind==='ray'?'#b82b4180':'#be2c4590','#f1838c');else{circle(e.x,e.y,e.radius,e.kind==='nether'?'#7f49c666':e.kind==='stack'?'#e7bc5c45':'#b52a3d68',e.kind==='nether'?'#d4b0ff':e.kind==='stack'?'#ffdb8c':'#ff9090',2);text(e.kind==='nether'?'PARTAGE À 2':e.kind==='stack'?'STACK':e.kind==='defam'?'MANA BURST':'FIREFALL',e.x,e.y-22,10,e.kind==='stack'?'#ffe4a4':'#ffc1bd','700')}ctx.restore()}
 if(phaseTime()>=COMBAT.defams&&phaseTime()<COMBAT.cones&&guide){for(const green of [true,false]){const x=(green?1:-1)*125;circle(x,-135,GEOMETRY.stack,'#ffffff04',green?'#8fe0ae80':'#ed9da380',1);text(green?'GROUPE A':'GROUPE B',x,-35,10,green?'#a8e8bf':'#f0b3b7')}}
 if(phaseTime()>COMBAT.stack-1.5&&phaseTime()<COMBAT.cones){for(const p of party.filter(p=>hasMechanic(p.role,'cone'))){const a=actor(p.role);drawSector(a,p.role===selectedRole?player.a:p.a||0,GEOMETRY.coneHalf,GEOMETRY.range,p.role===selectedRole?'#e4bd5018':null,p.role===selectedRole?'#ffe09d88':'#d7a97a33')}}
 ctx.restore();
}
