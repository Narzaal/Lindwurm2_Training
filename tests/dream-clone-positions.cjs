const assert = require('node:assert/strict');
const { test } = require('node:test');
const { create } = require('./trainer-harness.cjs');

test('Idyllic waymarks keep their positions at each separation and reunion', () => {
  const { run } = create();
  run(`trainingExercise='dream';reset(true);
    const label = text, waymarks = drawWaymarks;
    let tracing = false, positions = [];
    text = (s,x,y,...rest) => {
      if (tracing) positions.push([s,x,y]);
      label(s,x,y,...rest);
    };
    drawWaymarks = (...args) => { tracing=true; waymarks(...args); tracing=false; };
  `);
  const at = t => JSON.parse(run(`positions=[];time=${t};drawDream();JSON.stringify(positions)`));
  const full = at(70);
  assert.deepEqual(full.map(p => p[0]), ['A','1','B','2','C','3','D','4']);
  for (const t of [84,101,132,168,184,191]) assert.deepEqual(at(t),full);
});

test('Snaking Kick hits at the FFLogs offset in both cone patterns', () => {
  const { run } = create();
  for (const [north,x,z,hit] of [[true,7,-7,false],[false,9,7,true]]) {
    run(`trainingExercise='dream';selectedRole='MT';reset(true);
      dreamScenario.verticalNorth=${north};time=DREAM.stored;
      Object.assign(player,dp(${x},${z}));dreamFireEvent('stored')`);
    assert.equal(run("dream.failures.some(f=>f.roles.includes('MT'))"),hit);
    const effects = JSON.parse(run('JSON.stringify(dream.effects.map(e=>[e.type,e.x/DS,e.y/DS]))'));
    assert.deepEqual(effects,[['double',0,-12],['double',0,12],['circle',0,4.5]]);
  }
});
