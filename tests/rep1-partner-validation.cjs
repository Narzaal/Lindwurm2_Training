const assert=require('assert'),{create}=require('./trainer-harness.cjs');const {run,el}=create();el('confirmPreparation').onclick();let cases=0;
function setup(role,cardinal,north=0){run(`rangeStart=rangeEnd=1;applyTrainingRange();selectedRole='${role}';stopOnError=false;reset(true);rep1Scenario={fireCardinal:${cardinal},north:${north},horizontal:${cardinal}%2===1,kickRole:'MT',turns:0};rep1Reset();party.forEach(p=>Object.assign(p,rep1Initial(p.role)));Object.assign(player,rep1Initial(selectedRole));time=rep1Offset()+REP1.fire1`)}
for(const role of ['MT','OT','H1','H2','M1','M2','R1','R2'])for(let cardinal=0;cardinal<4;cardinal++)for(let north=0;north<4;north++){
 setup(role,cardinal,north);
 run("rep1FireEvent('fire1');time=rep1Offset()+REP1.cones1;rep1FireEvent('cones1');time=rep1Offset()+REP1.dark1;rep1FireEvent('dark1')");
 assert.equal(run('rep1.failures.length'),0,role+' '+cardinal+' '+north+' '+run('JSON.stringify(rep1.failures)'));
 assert.equal(run("Object.values(rep1.debuffs).filter(d=>d==='fire').length"),2);assert.equal(run("Object.values(rep1.debuffs).filter(d=>d==='dark').length"),4);
 run("time=rep1Offset()+REP1.fire2;party.forEach(p=>Object.assign(p,rep1Static(p.role)));Object.assign(player,rep1Static(selectedRole));rep1FireEvent('fire2');time=rep1Offset()+REP1.cones2;rep1FireEvent('cones2');time=rep1Offset()+REP1.dark2;rep1FireEvent('dark2')");
 assert.equal(run('rep1.failures.length'),0,role+' '+cardinal+' '+north+' '+run('JSON.stringify(rep1.failures)'));cases++;
}
// First dark: assigned pairs are valid; missing partner and clipping another pair fail.
setup('MT',1);run("Object.assign(party.find(p=>p.role==='OT'),{x:0,y:400});time=rep1Offset()+REP1.dark1;rep1FireEvent('dark1')");assert(run("rep1.failures.some(f=>f.roles.includes('OT')&&f.message.includes('partenaire'))"));cases++;
setup('MT',1);run("Object.assign(party.find(p=>p.role==='M1'),rep1Initial('MT'));time=rep1Offset()+REP1.dark1;rep1FireEvent('dark1')");assert(run("rep1.failures.some(f=>f.roles.includes('M1')&&f.message.includes('autre groupe'))"));cases++;
// DPS role is split into the melee pair and ranged pair for the initial fire.
setup('MT',0);run("Object.assign(party.find(p=>p.role==='R1'),rep1Initial('M1'));Object.assign(party.find(p=>p.role==='M1'),rep1Initial('R1'));rep1FireEvent('fire1')");assert(run("rep1.failures.some(f=>f.roles.includes('R1')&&f.message.includes('stack attribué'))"));assert(run("rep1.failures.some(f=>f.roles.includes('M1')&&f.message.includes('mauvais stack'))"));cases++;
// Second dark still requires separate baits even for a tank pair.
setup('MT',0);run("rep1FireEvent('fire1');time=rep1Offset()+REP1.dark1;rep1FireEvent('dark1');time=rep1Offset()+REP1.dark2;party.forEach(p=>Object.assign(p,rep1Static(p.role)));Object.assign(player,rep1Static(selectedRole));Object.assign(party.find(p=>p.role==='OT'),rep1Static('MT'));rep1FireEvent('dark2')");assert(run("rep1.failures.some(f=>f.roles.includes('MT')&&f.message.includes('autre joueur'))"));cases++;
// Real movement with both partner rhythms, from preposition through second baits.
for(const role of ['MT','OT','M1','M2'])for(const rhythm of ['first','live'])for(let cardinal=0;cardinal<4;cardinal++){
 setup(role,cardinal);run(`partnerRhythm='${rhythm}';rep1Reset();time=rep1Offset();for(let i=0;i<690;i++){advanceToward(player,rep1Target(selectedRole),PLAYER_MOVE_SPEED*.05);var old=time;time+=.05;rep1Update(old,.05);}`);
 assert.equal(run('rep1.failures.length'),0,role+' '+rhythm+' '+cardinal+' '+run('JSON.stringify(rep1.failures)'));cases++;
}
console.log('Passed '+cases+' Replication 1 initial sharing / later spread / movement regression checks.');
