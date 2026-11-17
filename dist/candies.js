'use strict';
// Seconds from Mutating Cells cast start, calibrated against FFLogs fight 30 / PcyCvGAFRqzrXJBj.
const CANDY={assign:4.8,bloodTell:6.2,bloodEnd:9.2,spawn:13.1,move:15.2,swap:21.8,invert:23.8,wakeTell:33.4,wakeEnd:36.4,wave1:38.2,wave2:43.3,netherTell:42.6,netherEnd:47.6,nether:48.9,expire:51.8,raidTell:50.8,raid:55.7,sobatTell:60,sobat:65.5,turn:65.7,repeat:70.1,finishers:72.6,end:75};
const CANDY_SCALE=21.25,CANDY_BURST=5*CANDY_SCALE,CANDY_NAMES={donut:'Donut',orb:'Sphère pleine',orange:'Orange · est/ouest',blue:'Bleu · nord/sud'};
let candyScenario=null,candy=null;
function isCandyExercise(){return trainingExercise==='candy'||['full','all'].includes(trainingExercise)}
function candyOffset(){return trainingExercise==='all'?180.7:trainingExercise==='full'?REP1.end+STAGING+COMBAT.end+6.1:0}
function candyTime(){return time-candyOffset()}
function isCandyActive(){return isCandyExercise()&&time>=candyOffset()&&(trainingExercise!=='all'||time<264.5)&&!isDreamActive()}
function candyRandomize(){
 const beta=[shuffle(['MT','OT'])[0],shuffle(['H1','H2'])[0],...shuffle(['M1','M2','R1','R2']).slice(0,2)];
 const closePair=Math.random()<.5?['donut','orange']:['orb','blue'];
 const other=['donut','orange','orb','blue'].filter(s=>!closePair.includes(s));
 const layouts=[0,1].map(()=>{const d=Math.random()<.5?0:1,a=shuffle([...closePair]),b=shuffle([...other]),list=[];list[d]=a[0];list[(d+2)%4]=a[1];list[(d+1)%4]=b[0];list[(d+3)%4]=b[1];return list});
 candyScenario={beta,closeSide:Math.random()<.5?0:1,closePair,layouts,variant:Math.random()<.5?'near':'far',turns:Math.floor(Math.random()*4)};
}
function candyHole(side){return{x:(side?1:-1)*10*CANDY_SCALE,y:0}}
function candyReset(){
 if(!candyScenario)candyRandomize();
 candy={entered:false,debuffs:Object.fromEntries(roles.map(r=>[r,'none'])),received:{},aggro:'MT',heading:0,sobatHeading:0,phase:0,events:[],effects:[],failures:[],stage:null,departed:false,readyFor:0,lastPosition:null,nextAuto:CANDY.assign+2,objects:[],waves:[[],[]],swapChecked:false};
 for(let side=0;side<2;side++)for(let slot=0;slot<4;slot++){
  const type=candyScenario.layouts[side][slot],close=side===candyScenario.closeSide&&candyScenario.closePair.includes(type),hole=candyHole(side),len=(close?7.75:11)*CANDY_SCALE;
  const vector={x:slot===0||slot===3?-0.45:0.45,y:slot<2?-0.893:0.893},n=Math.hypot(vector.x,vector.y);
  candy.objects.push({id:side+'-'+slot,side,slot,type,close,hole,origin:{x:hole.x+vector.x/n*len,y:hole.y+vector.y/n*len},x:hole.x,y:hole.y,length:len,progress:0,slowed:false,pauseUntil:0,cooldown:0,absorbedAt:null,order:null,contact:null});
 }
}
function candyEnter(){candy.entered=true;linksActive=false;resolution=freshResolution();decisions=freshDecisions();objectiveCache='';toast('Candy Crush · lis ton débuff alpha ou bêta.');}
function candyBetaTank(phase=candy.phase){return ['MT','OT'].find(r=>phase===2?!candyScenario.beta.includes(r):candyScenario.beta.includes(r))}
function candyDesiredAggro(){return candyTime()>=CANDY.raid?'OT':candyBetaTank(candyTime()>=CANDY.swap?2:1)}
function candyProvoke(){if(!isCandyActive()||!running||kind(selectedRole)!=='tank')return;candy.aggro=selectedRole;candy.events.push({key:'provoke',at:time,role:selectedRole});toast('Provoquer : '+selectedRole+' prend l’agro.');}
function candyError(affected,message){const list=[...new Set(affected)];if(!list.length)return;candy.failures.push({at:time,roles:list,message});if(list.includes(selectedRole))toast('✕ '+message)}
function candyResult(key,label,before,data={}){const errors=candy.failures.slice(before),mine=errors.find(e=>e.roles.includes(selectedRole));candy.events.push({key,at:time,errors:cloneData(errors),...data});checks[time.toFixed(3)]={ok:!mine,reason:mine?mine.message:label+' : résolu.'};if(!mine)toast('✓ '+label);if(key!=='auto')recordSuccessfulCheckpoint(label,!mine);}
function candyDamage(affected,label){for(const r of affected){if(candy.debuffs[r]==='alpha')candyError([r],`Alpha : dégâts reçus (${label}).`);if(candy.debuffs[r]==='beta')candy.received[r]=true}}
function candyCheckDebuffs(){for(const r of roles)if(candy.debuffs[r]==='beta'&&!candy.received[r])candyError([r],'Bêta : aucun dégât reçu avant la fin du débuff.');}
function candyObjectFor(role){const list=candy.objects.filter(c=>c.side!==candyScenario.closeSide&&candyScenario.closePair.includes(c.type));return list.find(c=>kind(role)==='tank'?c.slot<2:c.slot>=2)}
function candyAssembly(c){const dx=-c.origin.x,dy=-c.origin.y,n=Math.hypot(dx,dy);return{x:c.x+dx/n*65,y:c.y+dy/n*65}}
function candySoakReady(c){const group=candyScenario.beta.filter(r=>kind(r)!=='tank');return group.every(r=>dist(actor(r),c)<100)}
function candyFirstDonutSide(){return candyScenario.closePair.includes('donut')?candyScenario.closeSide:1-candyScenario.closeSide}
function candyStep(){
 const t=candyTime(),at=n=>candyOffset()+n;if(trainingExercise==='all'&&t>=CANDY.end)return{id:'dreamTransition',name:'Transition vers Idyllic Dream',start:at(CANDY.end),end:dreamOffset(),deadline:dreamOffset(),hint:'Reviens au centre. La prochaine mécanique alterne entre deux réalités.'};
 const rows=[
 ['assign','Mutating Cells · attribution',0,CANDY.spawn,CANDY.spawn,'Lis ton débuff : alpha évite les dégâts, bêta doit en recevoir. Le tank bêta prend l’agro avec Provoquer (E).'],
 ['soak','Blood Mana · ralentir les candies',CANDY.spawn,CANDY.swap,18.2,'Repère les deux candies proches, puis touche les mêmes sur l’autre côté : tank bêta au nord, les trois autres bêta en partage au sud.'],
 ['swap','Mutating Cells · inversion',CANDY.swap,CANDY.invert,CANDY.invert,'Les débuffs vont s’inverser. L’autre tank prend l’agro ; quitte les candies après leur explosion.'],
 ['absorb','Blood Mana · absorption',CANDY.invert,30,30,'Reste à distance des candies pendant leur absorption. Mémorise le côté qui absorbe le donut en premier.'],
 ['wave1','Blood Wakening · premier donut',30,CANDY.wave1+.12,CANDY.wave1,'Rejoins le trou noir qui a absorbé le donut en premier. Reste dans le donut, au nord ou au sud pour éviter les cônes est/ouest.'],
 ['wave2','Blood Wakening · traversée',CANDY.wave1+.12,CANDY.wave2+.12,CANDY.wave2,'La première vague est passée : traverse vers l’autre trou noir et retrouve la petite zone sûre au nord ou au sud du donut.'],
 ['nether','Netherworld '+(candyScenario.variant==='near'?'Near · proche':'Far · éloigné'),CANDY.wave2+.12,CANDY.nether+.12,CANDY.nether,candyScenario.variant==='near'?'Bêta : regroupez-vous près du boss pour partager les dégâts. Alpha : éloignez-vous du partage.':'Alpha : restez près du boss. Bêta : regroupez-vous plus loin pour attirer et partager les dégâts.'],
 ['expiry','Mutating Cells · résolution',CANDY.nether+.12,CANDY.expire+.12,CANDY.expire,'Garde ton placement jusqu’à la fin des débuffs.'],
 ['raid','Arcadia Aflame · raidwide',CANDY.expire+.12,CANDY.raid+.12,CANDY.raid,'Les débuffs sont terminés. Regroupe-toi pour le raidwide.'],
 ['sobat','Double Sobat · OT sous invulnérabilité',CANDY.raid+.12,CANDY.sobat+.12,CANDY.sobatTell-.2,'OT : provoque (E) et prends le tankbuster seul en A, sous invulnérabilité automatique. Les autres vont derrière le boss.'],
 ['repeat','Double Sobat · cleave',CANDY.sobat+.12,CANDY.repeat+.12,CANDY.repeat,'Le boss tourne de 0°, 90°, 180° ou 270° depuis sa direction précédente. Tout le monde passe derrière ; attends le cleave avant de ressortir.'],
 ['finishers','Esoteric Finisher · tanks écartés',CANDY.repeat+.12,CANDY.finishers+.12,CANDY.finishers,'Les tanks vont loin devant, chacun de son côté ; les autres reculent derrière.'],
 ['end','Candy Crush · terminée',CANDY.finishers+.12,CANDY.end,CANDY.end,'Séquence terminée. Rejoue pour changer les débuffs, les candies ou le near/far.']
 ];const r=rows.find(r=>t<r[3])??rows.at(-1);return{id:r[0],name:r[1],start:at(r[2]),end:at(r[3]),deadline:at(r[4]),hint:r[5]};
}
function candyTarget(role){
 const s=candyStep(),i=roles.indexOf(role),t=candyTime(),small={x:(i%4-1.5)*12,y:Math.floor(i/4)*12};
 if(s.id==='assign')return {x:kind(role)==='tank'?(role==='MT'?-35:35):small.x,y:kind(role)==='tank'?-90:65+small.y,r:22};
 if(s.id==='soak'){
  if(!candyScenario.beta.includes(role))return{x:small.x,y:small.y,r:22};
  const c=candyObjectFor(role);if(c.slowed)return{x:small.x,y:small.y,r:22};
  const p=kind(role)==='tank'||candySoakReady(c)?c:candyAssembly(c);return{x:p.x,y:p.y,r:22};
 }
 if(['swap','absorb'].includes(s.id))return{x:small.x,y:small.y,r:22};
 if(['wave1','wave2'].includes(s.id)){
  const side=s.id==='wave2'?1-candyFirstDonutSide():candyFirstDonutSide(),hole=candyHole(side),upper=i%2===0;
  return{x:hole.x+(Math.floor(i/2)-1.5)*10,y:(upper?-1:1)*(60+(i%2)*5),r:14};
 }
 if(s.id==='nether'||s.id==='expiry'){
  const beta=!candyScenario.beta.includes(role),close=candyScenario.variant==='near'?beta:!beta,side=1-candyFirstDonutSide(),sign=side?1:-1;
  return{x:sign*(close?45:270)+small.x,y:small.y-6,r:20};
 }
 if(s.id==='sobat')return role==='OT'?{x:0,y:-135,r:22}:rep1Behind(candy.heading,role,130);
 if(s.id==='repeat')return rep1Behind(candy.heading,role,125);
 if(s.id==='finishers')return kind(role)==='tank'?{...rep1Rotate({x:role==='MT'?-180:180,y:-250},-candy.heading),r:22}:rep1Behind(candy.heading,role,195);
 return{x:small.x,y:90+small.y,r:25};
}
function candyBurst(c,target){
 const before=candy.failures.length,t=candyTime(),center={x:target.x,y:target.y};
 const members=roles.filter(r=>dist(actor(r),center)<=CANDY_BURST);
 candyDamage(members,'Bloody Burst');
 const expected=kind(target.role)==='tank'?[target.role]:roles.filter(r=>kind(r)!=='tank'&&candy.debuffs[r]==='beta');
 validateStackGroup(members,expected,kind(target.role)==='tank'?1:3,candyError,kind(target.role)==='tank'?'Bloody Burst · tank seul':'Bloody Burst · trois bêta');
 if(members.length===1&&kind(members[0])!=='tank')candyError(members,'Seul un tank peut prendre ce candy en solo.');
 const touched=[];
 for(const o of candy.objects)if(o.absorbedAt===null&&dist(o,center)<=CANDY_BURST&&!o.slowed){o.slowed=true;o.pauseUntil=t+3;o.order=1;touched.push(o.id)}
 c.cooldown=t+2;c.contact=null;
 candy.effects.push({kind:'burst',...center,r:CANDY_BURST,at:time,life:.9});
 candyResult('burst','Bloody Burst',before,{members,objects:touched,target:target.role});
}
function candyAdvanceObjects(dt){
 const t=candyTime();if(t<CANDY.spawn)return;
 for(const c of candy.objects){
  if(c.absorbedAt!==null)continue;
  if(t<CANDY.move){const f=Math.min(1,(t-CANDY.spawn)/.8);c.x=c.hole.x+(c.origin.x-c.hole.x)*f;c.y=c.hole.y+(c.origin.y-c.hole.y)*f;continue}
  if(t>=c.pauseUntil)c.progress=Math.min(c.length,c.progress+1.08333*CANDY_SCALE*dt);
  const f=1-c.progress/c.length;c.x=c.hole.x+(c.origin.x-c.hole.x)*f;c.y=c.hole.y+(c.origin.y-c.hole.y)*f;
  if(c.progress>=c.length-1){c.absorbedAt=t;c.x=c.hole.x;c.y=c.hole.y;continue}
  if(t<c.cooldown)continue;
  const contact=roles.map(r=>actor(r)).find(p=>dist(p,c)<=22);
  if(contact&&!c.contact)c.contact={role:contact.role,at:t};
  if(c.contact&&t>=c.contact.at+.2){const target=actor(c.contact.role);if(dist(target,c)<=35)candyBurst(c,target);else c.contact=null}
 }
}
function candyStoreWaves(){
 candy.waves=[[],[]];
 for(const side of [0,1]){
  const list=candy.objects.filter(c=>c.side===side),earliest=Math.min(...list.map(c=>c.absorbedAt??Infinity));
  for(const c of list){c.order=c.absorbedAt!==null&&c.absorbedAt<=earliest+.65?0:1;candy.waves[c.order].push({type:c.type,side:c.side,...c.hole})}
 }
}
function candyInShape(p,s){const d=dist(p,s);if(s.type==='donut')return d>=5*CANDY_SCALE&&d<=60*CANDY_SCALE;if(s.type==='orb')return d<=8*CANDY_SCALE;
 const a=facingToward(s,p),axis=s.type==='orange'?Math.PI/2:0;return d<=40*CANDY_SCALE&&[axis,axis+Math.PI].some(v=>Math.abs(Math.atan2(Math.sin(a-v),Math.cos(a-v)))<=Math.PI/3);
}
function candyResolveWave(index){const shapes=candy.waves[index],hits=roles.filter(r=>shapes.some(s=>candyInShape(actor(r),s)));candyDamage(hits,'Blood Wakening');candyError(hits,'Blood Wakening : touché par une explosion de candy.');for(const s of shapes)candy.effects.push({kind:'shape',shape:{...s},at:time,life:.75});return{shapes:cloneData(shapes),hits}}
function candyFireEvent(key){
 const before=candy.failures.length;let data={},label='';
 if(key==='assign'){candy.phase=1;candy.debuffs=Object.fromEntries(roles.map(r=>[r,candyScenario.beta.includes(r)?'beta':'alpha']));candy.received={};return}
 if(key==='swap'){candyCheckDebuffs();label='Premiers débuffs';candy.phase=0;candy.debuffs=Object.fromEntries(roles.map(r=>[r,'changing']));}
 else if(key==='invert'){candy.phase=2;candy.debuffs=Object.fromEntries(roles.map(r=>[r,candyScenario.beta.includes(r)?'alpha':'beta']));candy.received={};return}
 else if(key==='wakeTell'){candyStoreWaves();return}
 else if(key==='wave1'||key==='wave2'){data=candyResolveWave(key==='wave1'?0:1);label=key==='wave1'?'Première vague':'Deuxième vague'}
 else if(key==='nether'){
  const ordered=roles.map(r=>actor(r)).sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y)||roles.indexOf(a.role)-roles.indexOf(b.role));
  const target=candyScenario.variant==='near'?ordered[0]:ordered.at(-1),members=roles.filter(r=>dist(actor(r),target)<=6*CANDY_SCALE);
  candyDamage(members,'Netherworld');if(members.length!==4)candyError(members,`Netherworld : partage à quatre requis (${members.length} présents).`);
  for(const r of roles)if(candy.debuffs[r]==='beta'&&!members.includes(r))candyError([r],'Netherworld : tu dois partager les dégâts avec les quatre bêta.');
  candy.effects.push({kind:'nether',x:target.x,y:target.y,r:6*CANDY_SCALE,at:time,life:1});data={target:target.role,members,variant:candyScenario.variant};label='Netherworld '+candyScenario.variant;
 }else if(key==='expire'){candyCheckDebuffs();label='Débuffs inversés';candy.phase=0;candy.debuffs=Object.fromEntries(roles.map(r=>[r,'none']));}
 else if(key==='raid'){candy.effects.push({kind:'raid',x:0,y:0,r:478.125,at:time,life:.5});label='Arcadia Aflame';}
 else if(key==='sobatTell'){candy.heading=facingToward({x:0,y:0},actor(candy.aggro));candy.sobatHeading=candy.heading;return}
 else if(key==='turn'){candy.heading=candy.sobatHeading+candyScenario.turns*Math.PI/2;candy.departed=partnerRhythm!=='first';candy.readyFor=0;return}
 else if(key==='sobat'||key==='repeat'){
  const hits=roles.filter(r=>inCone(actor(r),{x:0,y:0},candy.heading,Math.PI/2,40*CANDY_SCALE));
  candyError(key==='sobat'?hits.filter(r=>r!=='OT'):hits,key==='sobat'?'Double Sobat : seul OT sous invulnérabilité reste devant.':'Double Sobat : rejoins le dos du boss.');
  if(key==='sobat'&&(candy.aggro!=='OT'||!hits.includes('OT')))candyError(['OT'],'OT : provoque et prends le tankbuster devant sous invulnérabilité.');
  candy.effects.push({kind:'cleave',angle:candy.heading,at:time,life:.6});data={hits,heading:candy.heading,invulnerable:key==='sobat'?['OT']:[]};label='Double Sobat';
 }else if(key==='finishers'){
  for(const r of ['MT','OT']){const p=actor(r),hits=roles.filter(v=>v!==r&&dist(actor(v),p)<=10*CANDY_SCALE);if(hits.length)candyError([r,...hits],`Tankbuster de ${r} : éloigne-toi du groupe et de l’autre tank.`);candy.effects.push({kind:'buster',x:p.x,y:p.y,r:10*CANDY_SCALE,at:time,life:1})}label='Esoteric Finisher';
 }
 if(label)candyResult(key,label,before,data);
}
function candyUpdate(old,dt){
 if(!candy.entered)candyEnter();const t=candyTime(),s=candyStep();
 const desired=candyDesiredAggro();if(t>=CANDY.assign&&desired!==selectedRole)candy.aggro=desired;
 if(s.id!==candy.stage){candy.stage=s.id;candy.readyFor=0;candy.departed=partnerRhythm!=='first';candy.lastPosition={...player}}
 if(!candy.departed){const target=candyTarget(selectedRole),still=dist(player,candy.lastPosition)<.5;candy.readyFor=still&&dist(player,target)<32?candy.readyFor+dt:0;candy.lastPosition={...player};const travel=Math.max(...party.filter(p=>p.role!==selectedRole).map(p=>dist(p,candyTarget(p.role))/190));if(candy.readyFor>=.7||time>=s.deadline-travel-1)candy.departed=true}
 if(candy.departed)for(const p of party)if(p.role!==selectedRole)advanceToward(p,candyTarget(p.role),190*dt);
 candyAdvanceObjects(dt);
 for(const key of ['assign','swap','invert','wakeTell','wave1','wave2','nether','expire','raid','sobatTell','sobat','turn','repeat','finishers'])if(old<candyOffset()+CANDY[key]&&time>=candyOffset()+CANDY[key])candyFireEvent(key);
 if(t>=candy.nextAuto&&t<CANDY.expire){const before=candy.failures.length;candyDamage([candy.aggro],'auto-attaque du boss');if(candy.failures.length>before)candyResult('auto','Agro',before);candy.nextAuto+=3}
 // Keep the second cleave's facing fixed through both tank AoEs.
 if(t<CANDY.sobatTell)candy.heading=facingToward({x:0,y:0},actor(candy.aggro));
}
function candyCast(){const t=candyTime(),casts=[['Mutating Cells',0,3],['Blood Mana',CANDY.bloodTell,CANDY.bloodEnd],['Blood Wakening',CANDY.wakeTell,CANDY.wakeEnd],['Netherworld '+(candyScenario.variant==='near'?'Near · proche':'Far · éloigné'),CANDY.netherTell,CANDY.netherEnd],['Arcadia Aflame',CANDY.raidTell,CANDY.raid],['Double Sobat',CANDY.sobatTell,CANDY.sobatTell+5]];const c=casts.find(([,a,b])=>t>=a&&t<b);return c?{name:c[0],start:candyOffset()+c[1],end:candyOffset()+c[2]}:null}
function candyDebuffRemaining(){const t=candyTime();return Math.max(0,(t<CANDY.swap?CANDY.swap:t<CANDY.invert?CANDY.invert:CANDY.expire)-t)}
function candyObjective(){const s=candyStep(),d=candy.debuffs[selectedRole],name=d==='alpha'?'ALPHA · zéro dégât':d==='beta'?'BÊTA · prendre des dégâts':d==='changing'?'INVERSION EN COURS':'En attente';
 $('objectiveTitle').textContent=s.name;$('cloneLabel').textContent='Candy Crush · Blood Mana';$('assignmentTitle').textContent='TON DÉBUFF';$('assignmentIcon').innerHTML=`<span class="element-icon ${d}">${d==='alpha'?'α':d==='beta'?'β':d==='changing'?'↔':'—'}</span>`;$('assignmentName').textContent=name;$('assignmentHint').textContent=d==='beta'?(candy.received[selectedRole]?'Dégâts reçus · évite les autres attaques.':'Prends les dégâts prévus avant l’expiration.'):d==='alpha'?'Évite aussi les auto-attaques et les partages.':'Les débuffs restent visibles sans le mode guidé.';$('objectiveCopy').textContent=guide?s.hint:'Lis les débuffs, les candies et les casts pour choisir ton placement.';$('priorityRule').className='priority-rule';$('priorityRule').textContent=guide&&s.id==='soak'?`À ralentir : ${candyScenario.closePair.map(c=>CANDY_NAMES[c]).join(' + ')} · côté ${candyScenario.closeSide?'D / ouest':'B / est'}`:'Tank bêta au nord · trois autres bêta au sud';$('currentTether').textContent=name;$('tetherTitle').textContent='Ton débuff';$('proximity').textContent='Agro : '+candy.aggro+(kind(selectedRole)==='tank'?' · Provoquer avec E':'');
}
function updateCandyPanel(){
 const active=isCandyActive();$('provokeBtn').hidden=!active||kind(selectedRole)!=='tank';$('provokeBtn').disabled=!running;$('candyLegend').hidden=!active;
 if(!active)return;
 const d=candy.debuffs[selectedRole],remaining=Math.ceil(candyDebuffRemaining()),symbol=d==='alpha'?'α':d==='beta'?'β':d==='changing'?'↔':'—';
 $('debuffPanel').hidden=false;$('debuffRule').textContent='α : zéro dégât · β : prendre des dégâts';$('rep2Legend').hidden=true;$('simTitle').textContent='Candy Crush';$('strategyChip').innerHTML='<span>◈</span> Blood Mana <b>α / β</b>';

 $('debuffGrid').innerHTML=roles.map(r=>{const b=candy.debuffs[r];return `<div class="debuff-row ${r===selectedRole?'is-you':''}"><b style="color:${colors[kind(r)]}">${r}${candy.aggro===r?' ◆':''}</b><span class="debuff ${b}">${b==='alpha'?'α':b==='beta'?'β':b==='changing'?'↔':'—'} ${b==='none'?'':remaining+' s'}${b==='beta'&&candy.received[r]?' ✓':''}</span></div>`}).join('');
}
function drawCandySymbol(type,x,y,size=24){
 const col={donut:'#52f6b6',orb:'#65e5ff',orange:'#ffb252',blue:'#9292ff'}[type];ctx.save();ctx.shadowColor=col;ctx.shadowBlur=12;
 if(type==='donut'){circle(x,y,size,null,'#092f2b',10);circle(x,y,size,null,col,5);circle(x,y,size-6,null,'#d0ffec',1)}
 else if(type==='orb'){circle(x,y,size,'#087caa',col,2);circle(x-5,y-6,size*.48,'#a6f7ff80');circle(x,y,size*.75,null,'#d8fbff',1)}
 else{ctx.translate(x,y);if(type==='blue')ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(-size,-size*.55);ctx.lineTo(-size,size*.55);ctx.lineTo(size,-size*.55);ctx.lineTo(size,size*.55);ctx.closePath();ctx.fillStyle=type==='blue'?'#5850af':'#a64d18';ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=3;ctx.stroke();circle(0,0,4,col)}ctx.restore();
}
function drawCandyShape(s,preview=false){const fill=preview?'25':'55';if(s.type==='donut'){ctx.beginPath();ctx.arc(s.x,s.y,60*CANDY_SCALE,0,TAU);ctx.arc(s.x,s.y,5*CANDY_SCALE,0,TAU,true);ctx.fillStyle='#50cb91'+fill;ctx.fill('evenodd');circle(s.x,s.y,5*CANDY_SCALE,null,'#88f4be',2)}else if(s.type==='orb')circle(s.x,s.y,8*CANDY_SCALE,'#40b8ec'+fill,'#85ddff',2);else for(const a of [s.type==='orange'?Math.PI/2:0,(s.type==='orange'?Math.PI/2:0)+Math.PI])drawSector(s,a,Math.PI/3,40*CANDY_SCALE,(s.type==='orange'?'#eb8d37':'#8176ef')+fill,s.type==='orange'?'#ffb26c88':'#b1a4ff88')}
function drawCandy(){
 const t=candyTime(),s=candyStep();ctx.save();ctx.beginPath();ctx.arc(0,0,478.125,0,TAU);ctx.clip();
 if(guide&&t>=CANDY.wakeTell&&t<CANDY.wave1)for(const shape of candy.waves[0])drawCandyShape(shape,true);
 if(guide&&t>=CANDY.wave1+.8&&t<CANDY.wave2)for(const shape of candy.waves[1])drawCandyShape(shape,true);
 if(guide&&((t>=CANDY.sobatTell&&t<CANDY.sobat)||(t>=CANDY.turn&&t<CANDY.repeat)))drawSector({x:0,y:0},candy.heading,Math.PI/2,850,'#cf364c30','#ef7c9166');
 if(guide&&s.id==='finishers')for(const r of ['MT','OT']){const p=actor(r);circle(p.x,p.y,10*CANDY_SCALE,'#9d4de322','#d49bff',1)}
 for(const e of candy.effects.filter(e=>time>=e.at&&time<e.at+e.life)){if(e.kind==='shape')drawCandyShape(e.shape);else if(e.kind==='cleave')drawSector({x:0,y:0},e.angle,Math.PI/2,850,'#d92e4655','#ff7e8b');else circle(e.x,e.y,e.r,e.kind==='burst'?'#9258cf66':e.kind==='nether'?'#79b8ed55':'#d9687844',e.kind==='burst'?'#d49bff':'#ffc8d9',2)}
 ctx.restore();
 if(t>=CANDY.bloodEnd&&t<CANDY.raid){for(const side of [0,1]){const h=candyHole(side);circle(h.x,h.y,28,'#070a11','#f7d699',3);circle(h.x,h.y,19,'#090b13','#d7c7a0',1);ctx.save();ctx.translate(h.x,h.y);ctx.scale(1.6,.45);circle(0,0,28,null,'#ffe8b6',3);ctx.restore();if(guide&&t>=CANDY.wakeTell&&t<CANDY.wave2){const wave=t<CANDY.wave1?0:1;const list=candy.waves[wave].filter(c=>c.side===side);for(let i=0;i<list.length;i++)drawCandySymbol(list[i].type,h.x+(i-(list.length-1)/2)*45,h.y-55,15)}}}
 if(t>=CANDY.spawn&&t<CANDY.wakeTell)for(const c of candy.objects)if(c.absorbedAt===null){drawCandySymbol(c.type,c.x,c.y);if(c.slowed){circle(c.x,c.y,31,null,'#d4b4ff',2);text('RALENTI',c.x,c.y+40,9,'#e4c9ff','700')}if(guide&&candy.debuffs[selectedRole]==='beta'&&c.id===candyObjectFor(selectedRole)?.id&&!c.slowed){circle(c.x,c.y,35,null,'#c3ffe3',2);text(kind(selectedRole)==='tank'?'SOLO TANK':'PARTAGE À 3',c.x,c.y-45,10,'#c3ffe3','700')}}
 circle(0,0,70,'#5d212c22','#ebbbb5',2);ctx.save();ctx.rotate(-candy.heading);dragon(0,0,65,true);ctx.beginPath();ctx.moveTo(0,-90);ctx.lineTo(-10,-74);ctx.lineTo(10,-74);ctx.closePath();ctx.fillStyle='#fff4e7';ctx.fill();ctx.restore();text('AGRO : '+candy.aggro,0,83,11,'#ffdda5','700');
 if(guide&&started){const p=candyTarget(selectedRole);ctx.setLineDash([5,6]);circle(p.x,p.y,p.r,'#85e7d21a','#aafce2',2);ctx.setLineDash([]);text('TA POSITION',p.x,p.y+p.r+16,10,'#c2ffeb')}
 for(const role of roles){const p=actor(role);if(showParty||role===selectedRole)playerDot(p,role===selectedRole?15:11);else circle(p.x,p.y,8,colors[kind(role)],'#101820',2);if(role!==selectedRole)drawPersonalStatus(p,role);if(role==='OT'&&s.id==='sobat'){circle(p.x,p.y,25,null,'#a2dfff',2);text('INVUL',p.x,p.y-42,10,'#c6eaff')}}
 drawPersonalStatus(player,selectedRole);
}
function candyStrategy(){openModal('Candy Crush · Blood Mana',`<p>Chaque attribution comporte un tank, un heal et deux DPS par débuff. <b>Alpha : aucun dégât. Bêta : au moins un dégât avant expiration.</b> Les auto-attaques comptent : le tank bêta prend l’agro. Pour ton tank, utilise <kbd>E</kbd> ou « Provoquer » ; les tanks simulés provoquent automatiquement.</p><p>Première attribution : 17 secondes. Après 2 secondes d’inversion, les débuffs opposés durent 28 secondes.</p><p>Repère le côté où deux candies sont plus proches. Sur l’autre côté, ralentis ces mêmes formes : <b>tank bêta seul au nord, les trois autres bêta ensemble au sud</b>. Le contact provoque un Bloody Burst de rayon 5 yalms ; il ralentit une seule fois les candies touchés. Quitte-les après le partage pour ne pas déclencher une deuxième explosion.</p><p>Les formes sont toujours visibles : donut vert, sphère cyan, nœud orange est/ouest et nœud bleu nord/sud. Le mode guidé ajoute les cibles et zones de danger. Le déplacement et l’ordre d’absorption sont réellement simulés : une mauvaise interception change les explosions.</p><p>Rejoins le côté qui absorbe le donut en premier, au nord ou au sud du trou noir, puis traverse après la première vague. Donut : intérieur sûr de 5 yalms ; sphère pleine : rayon 8 ; cônes : ouverture 120°. Les vagues sont espacées de 5,1 secondes.</p><p>Netherworld cible le joueur le plus proche ou le plus éloigné et se partage entre les quatre bêta (rayon 6 yalms). Les alpha évitent ce partage. Après la fin des débuffs et le raidwide, OT provoque et prend Double Sobat seul en A, avec invulnérabilité automatique. Le boss tourne de 0°, 90°, 180° ou 270° depuis sa direction précédente. Tout le monde passe derrière pour le second cleave ; une fois le cleave passé, les deux tanks s’écartent ensuite loin devant pour les AoE de rayon 10 yalms.</p><p>Les animations et vitesses des candies sont adaptées à l’entraînement. Les timings des attaques suivent <a target="_blank" rel="noreferrer" href="https://www.fflogs.com/reports/PcyCvGAFRqzrXJBj?fight=30&type=replay">ce combat FFLogs</a> ; les rayons suivent <a target="_blank" rel="noreferrer" href="https://github.com/awgil/ffxiv_bossmod/blob/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm/BloodMana.cs">BossMod</a>. Les HP, soins et mitigations ne sont pas calculés.</p>`)}
