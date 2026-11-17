'use strict';
// Replication I: source-backed hit intervals; all distances use 425 px / 20 yalms.
const REP1={fire1:11.6,cones1:12.4,dark1:12.7,kickTell:12.3,kick:17.3,split:20,jump:24,conesJump:26.7,fire2:33.1,cones2:33.9,dark2:34.2,sobatTell:36.6,sobat:42.2,turn:42.4,repeat:46.8,finishers:49.3,end:52};
const REP1_SCALE=21.25,REP1_AOE=5*REP1_SCALE;
let trainingExercise='placement',rep1Scenario=null,rep1=null,rep1UICache='';
function isRep1Exercise(){return trainingExercise==='rep1'||trainingExercise==='sequence'||['full','all'].includes(trainingExercise)}
function rep1Offset(){return trainingExercise==='all'?27.7:0}
function rep1Time(){return time-rep1Offset()}
function isRep1Active(){return isRep1Exercise()&&rep1Time()>=0&&rep1Time()<REP1.end}
function rep2Offset(){return trainingExercise==='all'?99.1:['sequence','full'].includes(trainingExercise)?REP1.end:0}
function rep2At(t=0){return (trainingExercise==='all'?105.4:rep2Offset()+STAGING)+t}
function rep1Rotate(p,a){return {x:p.x*Math.cos(a)-p.y*Math.sin(a),y:p.x*Math.sin(a)+p.y*Math.cos(a)}}
function rep1Randomize(){rep1Scenario={fireCardinal:Math.floor(Math.random()*4),north:Math.floor(Math.random()*4),horizontal:false,kickRole:roles[Math.floor(Math.random()*8)],turns:Math.floor(Math.random()*4)};rep1Scenario.horizontal=rep1Scenario.fireCardinal%2===1}
function rep1Reset(){if(!rep1Scenario)rep1Randomize();rep1={debuffs:Object.fromEntries(roles.map(r=>[r,'none'])),events:[],effects:[],failures:[],heading:0,cleave:null,fireJumps:[],firstFireTarget:null,stage:null,waitUntil:0,readyFor:0,departed:false,lastPosition:null};if(isRep1Exercise())for(const [i,p] of party.entries()){const pos=pt(i*Math.PI/4,70);Object.assign(p,pos);if(p.role===selectedRole)Object.assign(player,pos)}}
function rep1Initial(role){const p={MT:[-120,-116],OT:[-112,-116],H1:[-173.5,115.5],H2:[-115.5,173.5],M1:[112,116],M2:[120,116],R1:[173.5,-115.5],R2:[115.5,-173.5]}[role];return {x:p[0],y:p[1],r:18}}
function rep1Melee(role){return role==='MT'||role==='OT'||role[0]==='M'}
function rep1InitialGroup(role){return roles.filter(r=>kind(r)===kind(role)&&rep1Melee(r)===rep1Melee(role))}
function rep1Left(role){return role==='MT'||role.endsWith('1')}
function rep1Static(role){
 // Base layout has new north NE. Coordinates from Static/JP's floor-tile positions.
 const fire=rep1.debuffs[role]==='dark',melee=rep1Melee(role),left=rep1Left(role);let p;
 if(fire)p=melee?{x:1.365,y:-1.365}:{x:-13.65,y:0};
 else p=melee?(left?{x:-6.825,y:-1.365}:{x:1.365,y:6.825}):(left?{x:0,y:-13.65}:{x:13.65,y:0});
 const v=rep1Rotate({x:p.x*REP1_SCALE,y:p.y*REP1_SCALE},rep1Scenario.north*Math.PI/2);
 return {...v,r:melee?16:23};
}
function rep1Behind(heading,role,r=115){const i=roles.indexOf(role);return {...rep1Rotate({x:(i%4-1.5)*16,y:r+Math.floor(i/4)*17},-heading),r:22}}
function rep1Step(t=rep1Time()){
 if(t<REP1.dark1+.12)return {id:'first',name:'Replication 1 · premiers baits',start:0,end:REP1.dark1+.12,deadline:REP1.fire1,hint:'Tanks en 4, ranged en 1, heals en 3, mêlées en 2. Heals et ranged : coins des marqueurs.'};
 if(t<REP1.kick+.12)return {id:'kick',name:'Snaking Kick · derrière le boss',start:REP1.dark1+.12,end:REP1.kick+.12,deadline:REP1.kick,hint:'Passe derrière le boss. Sa direction est figée pendant le cast.'};
 if(t<REP1.jump)return {id:'split',name:t<REP1.split?'Replication 1 · division imminente':'Replication 1 · division des clones',start:REP1.kick+.12,end:REP1.jump,deadline:REP1.jump,hint:'Mémorise tes vulnérabilités. Les clones se divisent puis sautent vers les intercardinaux.'};
 if(t<REP1.dark2+.12)return {id:'static',name:'Static · nouveau nord',start:REP1.jump,end:REP1.dark2+.12,deadline:REP1.fire2,hint:'Le clone ténèbres extérieur est le nouveau nord. Vulnérabilité ténèbres : prends le feu ; sinon, attire les ténèbres. Heals/ranged à l’extérieur, tanks/mêlées à l’intérieur.'};
 if(t<REP1.sobat+.12)return {id:'sobat',name:'Double Sobat · invulnérabilité en A',start:REP1.dark2+.12,end:REP1.sobat+.12,deadline:REP1.sobat,hint:selectedRole==='MT'?'Prends le premier tankbuster seul côté A. L’invulnérabilité est automatique dans cet exercice.':'Laisse le MT prendre le tankbuster côté A. Place-toi derrière le boss, côté C.'};
 if(t<REP1.repeat+.12)return {id:'repeat',name:'Double Sobat · second cleave',start:REP1.sobat+.12,end:REP1.repeat+.12,deadline:REP1.repeat,hint:'Lis la nouvelle orientation du boss : il peut tourner de 0°, 90°, 180° ou 270°. Rejoins son dos.'};
 if(t<REP1.finishers+.12)return {id:'finishers',name:'Esoteric Finisher · écarter les tanks',start:REP1.repeat+.12,end:REP1.finishers+.12,deadline:REP1.finishers,hint:kind(selectedRole)==='tank'?'Va loin devant le boss : MT à gauche, OT à droite en regardant dans sa direction. Les deux tankbusters sont de grande taille.':'Recule derrière le boss pour laisser les deux grands tankbusters devant.'};
 return {id:'end',name:trainingExercise==='sequence'?'Transition vers Replication 2':'Replication 1 · terminée',start:REP1.finishers+.12,end:REP1.end,deadline:REP1.end,hint:trainingExercise==='sequence'?'Reviens au centre. Les huit liens d’attribution apparaissent ensuite.':'La séquence est terminée. Tu peux revoir tes déplacements avec le replay.'};
}
function rep1Target(role){const s=rep1Step();if(s.id==='first')return rep1Initial(role);if(s.id==='kick'||s.id==='split')return rep1Behind(rep1.cleave?.angle??0,role);if(s.id==='static')return rep1Static(role);if(s.id==='sobat')return role==='MT'?{x:0,y:-125,r:22}:rep1Behind(0,role);if(s.id==='repeat')return rep1Behind(rep1.heading,role);if(s.id==='finishers'){if(kind(role)==='tank')return {...rep1Rotate({x:role==='MT'?-180:180,y:-250},-rep1.heading),r:22};return rep1Behind(rep1.heading,role,190)}return {...pt(roles.indexOf(role)*Math.PI/4,108),r:25}}
function rep1Clones(t=rep1Time()){
 const north=Math.PI/4+rep1Scenario.north*Math.PI/2;
 const original=Array.from({length:4},(_,i)=>({id:'c'+i,type:i===rep1Scenario.fireCardinal?'fire':i===(rep1Scenario.fireCardinal+2)%4?'dark':'cone',...pt(i*Math.PI/2,14*REP1_SCALE)}));
 if(t<REP1.split)return original;
 const result=[];for(const c of original)for(let j=0;j<2;j++){
  
  let dest;
  if(c.type==='dark')dest=pt(north+(j?Math.PI:0),(j?7.5:14)*REP1_SCALE);
  else if(c.type==='fire')dest=pt(north+(j?Math.PI:0),(j?14:7.5)*REP1_SCALE);
  else {const coneIndex=original.filter(o=>o.type==='cone').findIndex(o=>o.id===c.id);dest=pt(north+(coneIndex?3:1)*Math.PI/2,(j?14:7.5)*REP1_SCALE)}
  const origin=c.type==='fire'&&rep1.firstFireTarget?rep1.firstFireTarget:c;const start={x:origin.x+(j?1:-1)*36,y:origin.y};const jumpAt=c.type==='cone'?REP1.conesJump:REP1.jump;
  const f=Math.min(1,Math.max(0,(t-jumpAt)/.65));result.push({id:c.id+'-'+j,type:c.type,x:start.x+(dest.x-start.x)*f,y:start.y+(dest.y-start.y)*f,home:dest,lift:Math.sin(f*Math.PI)*42});
 }return result;
}
function rep1Error(affected,message){rep1.failures.push({at:rep1Time(),roles:[...new Set(affected)],message})}
function rep1Result(key,label,before,data={}){const errors=rep1.failures.slice(before),mine=errors.find(e=>e.roles.includes(selectedRole));rep1.events.push({key,at:rep1Time(),errors:cloneData(errors),...data});checks[(rep1Offset()+REP1[key]).toFixed(2)]={ok:!mine,reason:mine?mine.message:label+' : résolu.'};toast((mine?'✕ ':'✓ ')+(mine?mine.message:label+' résolu.'));recordSuccessfulCheckpoint(label,!mine)}
function rep1InCone(p,source,angle){const a=facingToward(source,p);return dist(p,source)<=50*REP1_SCALE&&Math.abs(Math.atan2(Math.sin(a-angle),Math.cos(a-angle)))<=Math.PI/12}
function rep1Nearest(source,n){return roles.map(r=>actor(r)).sort((a,b)=>dist(a,source)-dist(b,source)||roles.indexOf(a.role)-roles.indexOf(b.role)).slice(0,n)}
function rep1Effect(type,p,extra={},life=.9){rep1.effects.push({type,x:p.x,y:p.y,...extra,at:rep1Time(),life})}
function rep1ResolveElement(element,second){
 const clones=rep1Clones().filter(c=>c.type===element),targets=clones.map(c=>({clone:c,targets:rep1Nearest(c,element==='fire'?1:2).map(p=>({...p}))}));
 const prior={...rep1.debuffs},hits=[];
 for(const entry of targets)for(const target of entry.targets){
  const members=roles.filter(r=>dist(actor(r),target)<=REP1_AOE);hits.push({source:entry.clone.id,target:target.role,members});rep1Effect(element,target,{radius:REP1_AOE},1.1);
  if(element==='fire'){
   rep1.fireJumps.push({source:entry.clone.id,from:{x:entry.clone.x,y:entry.clone.y},to:{x:target.x,y:target.y},at:rep1Time()});
   if(!second)rep1.firstFireTarget={x:target.x,y:target.y};
   if(members.length!==2)rep1Error(members,`Feu : le saut sur ${target.role} doit être partagé à deux (${members.length} joueurs).`);
   if(!second)validateStackGroup(members,rep1InitialGroup(target.role),2,rep1Error,'Premier feu');
   else {const wrong=members.filter(r=>rep1Melee(r)!==rep1Melee(target.role));if(wrong.length)rep1Error([target.role,...wrong],'Feu cloné : mauvais partage intérieur / extérieur.');}
  }
  if(element==='dark'){
   if(second){const clipped=members.filter(r=>r!==target.role);if(clipped.length)rep1Error([target.role,...clipped],`Ténèbres de ${target.role} : la zone touche un autre joueur.`);}
   else {const expected=rep1InitialGroup(target.role),missing=expected.filter(r=>!members.includes(r)),wrong=members.filter(r=>!expected.includes(r));
    if(missing.length)rep1Error(missing,'Premières ténèbres : rejoins ton partenaire pour recevoir la même zone.');
    if(wrong.length)rep1Error([target.role,...wrong],'Premières ténèbres : la zone touche un autre groupe.');
   }
  }
  for(const r of members){if(second&&prior[r]===element)rep1Error([r],`${element==='fire'?'Feu':'Ténèbres'} : tu as repris l’élément de ta vulnérabilité.`);if(!second)rep1.debuffs[r]=element}
 }
 if(element==='dark'){for(const r of roles){const count=hits.filter(h=>h.members.includes(r)).length;if(count>1)rep1Error([r],`Ténèbres : ${count} zones te touchent en même temps.`)}}
 if(second){const seen=new Set(hits.flatMap(h=>h.members));for(const r of roles){const expected=prior[r]==='dark'?'fire':'dark';if(expected===element&&!seen.has(r))rep1Error([r],`Bait de proximité : tu n’as pas reçu ${element==='fire'?'le feu':'les ténèbres'} attendu.`)}}
 return {targets:hits};
}
function rep1FireEvent(key){const before=rep1.failures.length;let data={};
 if(key==='fire1'||key==='fire2')data=rep1ResolveElement('fire',key==='fire2');
 else if(key==='dark1'||key==='dark2')data=rep1ResolveElement('dark',key==='dark2');
 else if(key==='cones1'||key==='cones2'){
  const hits=new Set();for(const c of rep1Clones().filter(c=>c.type==='cone'))for(const a of [rep1Scenario.horizontal?Math.PI/2:0,(rep1Scenario.horizontal?Math.PI/2:0)+Math.PI]){rep1Effect('cone',c,{angle:a,half:Math.PI/12},.9);for(const r of roles)if(rep1InCone(actor(r),c,a))hits.add(r)}
  if(hits.size)rep1Error([...hits],'Winged Scourge : tu as été touché par un cône.');data={hits:[...hits]};
 }else if(key==='kickTell'){rep1.heading=facingToward({x:0,y:0},actor(rep1Scenario.kickRole));rep1.cleave={angle:rep1.heading,target:rep1Scenario.kickRole};return}
 else if(key==='sobatTell'){rep1.heading=0;return}
 else if(key==='turn'){rep1.heading=rep1Scenario.turns*Math.PI/2;rep1.readyFor=0;rep1.departed=partnerRhythm!=='first';return}
 else if(['kick','sobat','repeat'].includes(key)){
  const hits=roles.filter(r=>inCone(actor(r),{x:0,y:0},rep1.heading,Math.PI/2,40*REP1_SCALE));rep1Effect('cleave',{x:0,y:0},{angle:rep1.heading,half:Math.PI/2},.55);
  const unsafe=key==='sobat'?hits.filter(r=>r!=='MT'):hits;
  if(unsafe.length)rep1Error(unsafe,key==='sobat'?'Double Sobat : seul le MT sous invulnérabilité reste devant.':'Cleave : passe derrière le boss.');
  if(key==='sobat'&&!hits.includes('MT'))rep1Error(['MT'],'Double Sobat : le MT doit prendre le tankbuster côté A.');data={hits,invulnerable:key==='sobat'?['MT']:[]};
 }else if(key==='finishers'){
  const targets=['MT','OT'].map(r=>({...actor(r)}));for(const p of targets){rep1Effect('tankbuster',p,{radius:10*REP1_SCALE},1.3);const hits=roles.filter(r=>r!==p.role&&dist(actor(r),p)<=10*REP1_SCALE);if(hits.length)rep1Error([p.role,...hits],`Tankbuster de ${p.role} : écarte-toi davantage du groupe et de l’autre tank.`)}data={targets};
 }
 const label={fire1:'Premier feu',dark1:'Premières ténèbres',cones1:'Premiers cônes',fire2:'Feux clonés',dark2:'Ténèbres clonées',cones2:'Cônes clonés',kick:'Snaking Kick',sobat:'Double Sobat · invulnérabilité',repeat:'Double Sobat · cleave',finishers:'Esoteric Finisher'}[key];
 if(label)rep1Result(key,label,before,data);
}
function rep1Update(old,dt){
 old-=rep1Offset();
 const s=rep1Step();if(rep1.stage!==s.id){rep1.stage=s.id;rep1.readyFor=0;rep1.departed=partnerRhythm!=='first';rep1.lastPosition={...player}}
 if(!rep1.departed){const stopped=dist(player,rep1.lastPosition)<.5;rep1.readyFor=stopped&&dist(player,rep1Target(selectedRole))<28?rep1.readyFor+dt:0;rep1.lastPosition={...player};const travel=Math.max(...party.filter(p=>p.role!==selectedRole).map(p=>dist(p,rep1Target(p.role))/190));if(rep1.readyFor>=.7||rep1Time()>=s.deadline-travel-.3)rep1.departed=true}
 if(rep1.departed)for(const p of party)if(p.role!==selectedRole){const target=rep1Target(p.role);advanceToward(p,target,190*dt)}
 // Snapshot proximity when the casts resolve, not when the exercise assigns a role.
 for(const key of ['fire1','kickTell','cones1','dark1','kick','fire2','cones2','dark2','sobatTell','sobat','turn','repeat','finishers'])if(old<REP1[key]&&rep1Time()>=REP1[key])rep1FireEvent(key);
}
function rep1Cast(){const casts=[['Snaking Kick',REP1.kickTell,REP1.kick],['Double Sobat',REP1.sobatTell,REP1.sobatTell+5]];const c=casts.find(([,a,b])=>rep1Time()>=a&&rep1Time()<b);return c?{name:c[0],start:c[1]+rep1Offset(),end:c[2]+rep1Offset()}:null}
function rep1Objective(){
 const s=rep1Step(),debuff=rep1.debuffs[selectedRole],label=debuff==='fire'?'Vulnérabilité feu':debuff==='dark'?'Vulnérabilité ténèbres':'Aucune vulnérabilité',revealed=rep1Time()>=REP1.fire1;
 $('objectiveTitle').textContent=s.name;$('cloneLabel').textContent='Replication 1 · Static (7bz)';$('assignmentTitle').textContent='TON DÉBUFF';$('assignmentIcon').innerHTML=`<span class="element-icon ${debuff}">${debuff==='fire'?'♨':debuff==='dark'?'◉':'—'}</span>`;$('assignmentName').textContent=revealed?label:'En attente des premiers baits';$('assignmentHint').textContent=rep1Time()>REP1.dark2+1?'Première attribution mémorisée':debuff==='dark'?'Évite une seconde attaque de ténèbres.':debuff==='fire'?'Évite une seconde attaque de feu.':'Lis l’attribution à la résolution des attaques.';$('objectiveCopy').textContent=guide?s.hint:'Lis les clones, tes débuffs et les casts pour choisir ton placement.';$('priorityRule').className='priority-rule';$('priorityRule').textContent=guide&&rep1Time()>=REP1.jump&&rep1Time()<REP1.dark2+.12?`Nouveau nord : ${marks[1+rep1Scenario.north*2]} · ${rep1Melee(selectedRole)?'clone intérieur':'clone extérieur'} · ${debuff==='dark'?'feu':'ténèbres'}`:'Static · H/R à l’extérieur · M/T à l’intérieur';$('currentTether').textContent=label;$('tetherTitle').textContent='Ton débuff';$('proximity').textContent=s.id==='sobat'?'MT : invulnérabilité automatique côté A':'Les baits utilisent les distances réelles.';
}
function updateRep1Panel(){if(isCandyActive()||isDreamActive()){rep1UICache='';return}const active=isRep1Active(),cache=[active,selectedRole,rep1Time()>=REP1.fire1,rep1Time()>REP1.dark2+1,JSON.stringify(rep1?.debuffs)].join('|');if(cache===rep1UICache)return;rep1UICache=cache;$('debuffPanel').hidden=!active;$('rep2Legend').hidden=active;$('simTitle').textContent=active?'Replication 1':'Replication 2';$('strategyChip').innerHTML=active?'<span>◈</span> Static <b>7bz</b>':'<span>◈</span> Clone Zone / Caro <b>CJ4</b>';if(active){$('debuffRule').textContent='Ténèbres → feu · Feu ou aucun → ténèbres';$('debuffGrid').innerHTML=roles.map(r=>{const d=rep1.debuffs[r],clear=rep1Time()>REP1.dark2+1;return `<div class="debuff-row ${r===selectedRole?'is-you':''}"><b style="color:${colors[kind(r)]}">${r}</b><span class="debuff ${clear?'none':d}">${clear?'Résolu':rep1Time()<REP1.fire1?'En attente':d==='fire'?'♨ Feu':d==='dark'?'◉ Ténèbres':'— Aucun'}</span></div>`}).join('')}else{$('assignmentTitle').textContent='LIEN À RÉCUPÉRER';$('tetherTitle').textContent='Ton lien actuel'}}
function drawRep1Debuff(p,role){drawPersonalStatus(p,role)}

function drawRep1(){
 ctx.save();ctx.beginPath();ctx.arc(0,0,478.125,0,Math.PI*2);ctx.clip();
 const s=rep1Step();const cleave=guide&&((rep1Time()>=REP1.dark1+.12&&rep1Time()<REP1.kick)||(rep1Time()>=REP1.sobatTell&&rep1Time()<REP1.sobat)||(rep1Time()>=REP1.turn&&rep1Time()<REP1.repeat));
 if(cleave)drawSector({x:0,y:0},rep1.heading,Math.PI/2,850,'#cf364c30','#ef7c9166');
 if(guide&&s.id==='finishers')for(const r of ['MT','OT']){const p=actor(r);circle(p.x,p.y,10*REP1_SCALE,'#8b44ce30','#c38eef99',2)}
 const coneWindow=rep1Time()>=5.6&&rep1Time()<REP1.cones1||rep1Time()>=REP1.conesJump+.65&&rep1Time()<REP1.cones2;
 if(guide&&coneWindow)for(const c of rep1Clones().filter(c=>c.type==='cone'))for(const a of [rep1Scenario.horizontal?Math.PI/2:0,(rep1Scenario.horizontal?Math.PI/2:0)+Math.PI])drawSector(c,a,Math.PI/12,1062,'#e9ad4e16','#e9ad4e55');
 for(const e of rep1.effects.filter(e=>rep1Time()>=e.at&&rep1Time()<e.at+e.life)){if(e.type==='cone'||e.type==='cleave')drawSector(e,e.angle,e.half,1062,'#d92e4655','#ff7e8b');else circle(e.x,e.y,e.radius,e.type==='fire'?'#f3543f66':'#9d4de366',e.type==='fire'?'#ffae7b':'#d49bff',2)}
 ctx.restore();
 if(rep1Time()<REP1.dark2+1)for(const c of rep1Clones()){
  let p={...c},lift=c.lift||0;const jump=rep1.fireJumps.filter(j=>j.source===c.id).at(-1);
  if(jump){const f=Math.max(0,Math.min(1,(rep1Time()-jump.at)/.45));p.x=jump.from.x+(jump.to.x-jump.from.x)*f;p.y=jump.from.y+(jump.to.y-jump.from.y)*f;lift=Math.sin(f*Math.PI)*48}
  dragon(p.x,p.y-lift,39);if(guide&&rep1Time()>=5.6){circle(p.x,p.y+25,15,c.type==='fire'?'#a44420':c.type==='dark'?'#572d82':'#79622d','#e8c398',1);text(c.type==='fire'?'♨':c.type==='dark'?'◉':rep1Scenario.horizontal?'↔':'↕',p.x,p.y+25,20,'#fff1d5')}
 }
 if(guide&&rep1Time()>=REP1.jump&&rep1Time()<REP1.dark2){const p=pt(Math.PI/4+rep1Scenario.north*Math.PI/2,370);text('NOUVEAU NORD',p.x,p.y,13,'#ffdbf7','700')}
 const heading=rep1.heading;circle(0,0,70,'#5d212c22','#ebbbb5',2);ctx.save();ctx.rotate(-heading);dragon(0,0,68,true);ctx.beginPath();ctx.moveTo(0,-90);ctx.lineTo(-11,-73);ctx.lineTo(11,-73);ctx.closePath();ctx.fillStyle='#fff4e7';ctx.fill();ctx.restore();
 if(guide&&started){const p=rep1Target(selectedRole);ctx.setLineDash([5,6]);circle(p.x,p.y,p.r,'#85e7d21a','#aafce2',2);ctx.setLineDash([]);text('TA POSITION',p.x,p.y+p.r+15,10,'#c2ffeb')}
 for(const p of party){const a=actor(p.role);if(showParty||p.role===selectedRole)playerDot(a,p.role===selectedRole?15:11);else circle(a.x,a.y,8,colors[kind(a.role)],'#101820',2);if(p.role!==selectedRole)drawRep1Debuff(a,p.role);if(p.role==='MT'&&s.id==='sobat'){circle(a.x,a.y,24,null,'#8fd8ff',2);text('INVUL',a.x,a.y-35,10,'#abeaff')}}
 drawRep1Debuff(player,selectedRole);
}
function rep1Strategy(){openModal('Replication 1 · Static (7bz)',`<p>Prépositionnement : tanks en 4, ranged en 1, heals en 3, mêlées en 2. Heals et ranged occupent les coins des marqueurs pour attirer le feu ou les ténèbres.</p><p>Le feu saute sur le joueur le plus proche et se partage à deux. Les premières ténèbres ciblent les deux joueurs les plus proches : chaque zone se prend avec son partenaire de rôle (tanks, mêlées, healers ou distances) pour recevoir la même vulnérabilité. Au second passage, les ténèbres se prennent écartés. Les cônes sont doubles et gardent leur orientation horizontale ou verticale.</p><p>Après le premier Snaking Kick, le clone ténèbres extérieur définit le nouveau nord. Le pattern entier peut tourner de 90°.</p><table><tr><th>Débuff</th><th>Attaque à prendre</th></tr><tr><td>Ténèbres</td><td>Feu, en duo</td></tr><tr><td>Feu ou aucun</td><td>Ténèbres, écartés</td></tr></table><p>H/R prennent les clones extérieurs, M/T les intérieurs. Pour les ténèbres, H1/R1 et MT/M1 vont à gauche, H2/R2 et OT/M2 à droite du nouveau nord. Le feu extérieur se partage au sud-ouest relatif ; le feu intérieur sur la ligne nord de la case centrale.</p><p>Double Sobat : MT seul sous invulnérabilité en A, les autres au dos. Lis la rotation du second cleave puis rejoins son dos. Ensuite les deux tanks s’écartent loin devant, MT à gauche et OT à droite ; les autres reculent derrière.</p><p>Le chrono continue dans tous les rythmes. L’enchaînement vers Replication 2 raccourcit le temps mort entre les deux exercices.</p><p><a target="_blank" rel="noreferrer" href="https://github.com/PunishXIV/Splatoon/blob/main/SplatoonScripts/Duties/Dawntrail/M12S%20P2%20Clones%201.cs">Coordonnées Static/JP</a> · <a target="_blank" rel="noreferrer" href="https://github.com/awgil/ffxiv_bossmod/blob/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm/Replication1.cs">Ciblage et rayons des attaques</a></p>`)}
