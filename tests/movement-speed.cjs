const assert = require('node:assert/strict');
const { test } = require('node:test');
const { create } = require('./trainer-harness.cjs');

for (const [exercise, scale] of [['rep2', 'REP1_SCALE'], ['dream', 'DS']]) {
  test(`keyboard movement covers six yalms in one second of ${exercise}`, () => {
    const { run } = create();
    const yalms = run(`
      trainingExercise = '${exercise}';
      reset(true);
      demoMode = false;
      running = true;
      speed = 1;
      lastFrame = 0;
      keys.add('right');
      Object.assign(player, {x: 0, y: 0});
      for (let frame = 1; frame <= 60; frame++) tick(frame * 1000 / 60);
      player.x / ${scale};
    `);
    assert.ok(Math.abs(yalms - 6) < 1e-7, `Measured ${yalms} yalms`);
  });
}
