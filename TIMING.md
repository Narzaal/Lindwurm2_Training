# Replication II timing calibration

Verified 2026-11-06 against:
- BossMod state machine: https://github.com/awgil/ffxiv_bossmod/blob/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm/RM12S2TheLindwurmStates.cs (file blob af395944c2b852f9e8f7e6b53a61cbed26e71fbb).
- Cast durations: https://github.com/awgil/ffxiv_bossmod/blob/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm/RM12S2TheLindwurmEnums.cs.
- Rounded encounter timeline and ordering: https://thaliak.com/raids/m12s2/.

All COMBAT times are relative to the end of Replication II, represented by mechanic tether appearance in this training. STAGING adds six seconds for identifying the eight already-present player clones. This is a pedagogical window; the omitted pair-by-pair spawning is not replayed. BossMod places all player assignments 6.3 seconds before the end of Replication (3.3-second delay + 3-second cast).

| Event | Seconds after Replication II |
| --- | ---: |
| Tethers lock | 16.5 |
| Firefall cast | 16.6–22.3 |
| Firefall impact | 22.5 |
| Scalding Waves | 23.1 |
| Mana Burst | 24.5 |
| Heavy Slam | 30.0 |
| Snaking Kick cast | 30.6–35.6 |
| Hemorrhagic Projection | 31.8 |
| Reenactment cast | 42.8–45.8 |
| Netherwrath cast | 49.0–54.0 |
| Netherwrath shared hits / first replay pair | 55.2 |
| Following replay pairs | 59.2 / 63.2 / 67.2 |

Derived intervals follow the state-machine delays: 16.5 + 0.1 + 5.9 to Firefall impact; then +0.6, +1.4, +5.5, +1.8, +3.8. Reenactment begins 7.2 seconds after the cleave and casts for 3 seconds. Netherwrath starts 3.2 seconds later, casts for 5 seconds, and shared damage follows 1.2 seconds later.

The cleave starts casting during the stack/cone sequence. Its heading freezes then, but training targets do not move behind it until the cones resolve (31.92 includes a 0.12-second movement buffer). This keeps all mechanics in order while displaying the actual overlapping cast.

Simplifications: clone activations are four seconds apart, but real impact delays vary with the copied mechanic. This simulator retains one combined resolution per pair, including simultaneous first-pair rays and Netherwrath as requested. Jump interpolation, geometry, movement buffers and the two-second end display remain training approximations. No video frame-by-frame timing measurement was performed.

# Replication I · Static (7bz)

Added 2026-11-07. Primary references:
- BossMod `Replication1.cs`, blob `0ff0673bde3b054c982e5203adac8d6bd249ade1`: https://github.com/awgil/ffxiv_bossmod/blob/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm/Replication1.cs
- Static/JP positions: https://github.com/PunishXIV/Splatoon/blob/main/SplatoonScripts/Duties/Dawntrail/M12S%20P2%20Clones%201.cs
- State-machine timings as linked above; the user's supplied diagrams select the role-pair prepositions, relative-SW outer fire stack and MT invulnerability at A.

Time zero represents the initial four cardinal clones after the Replication I cast. Fire chooses the closest player (two-person stack); each dark clone chooses the closest two. Both attack circles have a 5-yalm radius. Winged Scourge is a double 50-yalm cone with 15-degree half-angle; cone collisions use the player's center rather than inflating the visual pastille. Vulnerabilities are obtained from actual AoE hits, not prescribed by role. Dark vulnerability requires fire next; fire/no vulnerability requires dark next.

| Event | Seconds |
| --- | ---: |
| First fire / cones / dark | 11.6 / 12.4 / 12.7 |
| First Snaking Kick cast / hit | 12.3–17.3 |
| Second fire / cones / dark | 33.1 / 33.9 / 34.2 |
| Double Sobat cast starts / first hit | 36.6 / 42.2 |
| Second frontal hit | 46.8 |
| Two 10-yalm tank circles | 49.3 |
| End / combined exercise transition | 52.0 |

Scale: 21.25 canvas units per yalm (arena radius 425 = 20 yalms). Static bait coordinates are taken from the linked implementation: with new north NE, outer dark at (0,-13.65)/(13.65,0), outer fire (-13.65,0), inner fire (1.365,-1.365), inner dark (-6.825,-1.365)/(1.365,6.825). Positions rotate in quarter-turns. Waymarks: cardinals at radius 13.65, numbered marks at diagonal offsets ±6.825. Colors and square/circle shapes follow the user's references.

Approximations explicitly retained: first role-pair offsets from screenshots; clone radii 14 and 7.5 yalms (outer dark is consistent with recorded approximately ±9.9 diagonal coordinates, inner radius inferred from the screenshots and safe floor-tile lanes); split at 20s, element jumps at 24s, cone jumps at 26.7s; jump animation duration; rotation animation at 42.4s. These animation timestamps were not measured frame by frame. First cone orientation is tangential to its cardinal clone pair (E/W clones cast N/S, N/S clones cast E/W) and is retained after their jump. The two valid cone axes occur across the four initial elemental layouts.

MT's invulnerability is automatic for the first Double Sobat at A. No HP or mitigation model is added. The second cleave can keep its facing or rotate by any quarter-turn; both tanks subsequently move well apart in front. The combined exercise removes inter-mechanic downtime and starts the existing six-second identification window at 52s. Its total training duration is 127.2s; it is not the full encounter's clock.

The guided Replication II frontal overlay is now hidden until `COMBAT.cones`; actual Snaking Kick cast and facing lock remain at 30.6s. Browser preview infrastructure was unavailable for this update; VM simulation tests cover input, rendered drawing calls, role/pattern resolution, replay and the combined timeline. No video replay was watched directly.

# Candy Crush · Blood Mana

Added 2026-11-08. Checked against public FFLogs report `PcyCvGAFRqzrXJBj`, fight 30, and BossMod `BloodMana.cs`, `RM12S2TheLindwurmStates.cs`, and ability definitions. FFLogs events were read server-side for research; no API credentials are included in this static site.

Time zero is the Mutating Cells cast start (181.674 seconds in the reference fight). Values are rounded to tenths of a second:

| Event | Training time |
| --- | ---: |
| Alpha/beta attribution | 4.8 |
| Blood Mana cast | 6.2–9.2 |
| Eight shapes spawn | 13.1 |
| First debuffs expire / neutral transition | 21.8 |
| Opposite debuffs apply | 23.8 |
| Blood Wakening cast | 33.4–36.4 |
| First / second AoE wave | 38.2 / 43.3 |
| Netherworld Near/Far cast | 42.6–47.6 |
| Four-player stack impact | 48.9 |
| Second debuffs expire | 51.8 |
| Raidwide cast / impact | 50.8–55.7 |
| Double Sobat cast / first hit | 60.0 / 65.5 |
| Second halfroom hit | 70.1 |
| Two tank circles | 72.6 |
| End of exercise | 75.0 |

The observed status durations were 16.975 seconds, then 2.004 seconds of Mutating Cells, then 28.031 seconds for the opposite statuses. The reference party's beta players (status 4771) took the candies successfully. The descriptive alpha/beta bullet points on Thaliak currently contradict its own beta-soaking advice; the implementation follows the user's requested semantics, the successful combat events and BossMod's exclusion of alpha from the final stack.

Geometry from BossMod: holes at (-10,0)/(10,0) yalms; Bloody Burst radius 5; orb radius 8; donut safe interior radius 5 (outer radius 60); double cones range 40 and **120-degree full angle**; Netherworld radius 6, closest/farthest actual player, four-person share; tank circles radius 10.

Implemented strategy: first beta tank takes northern shape alone, first beta healer and two DPS share southern shape. Initial assignments randomize one tank, one healer and any two DPS. A valid initial close pair is donut/orange or orb/blue. The same pair is staggered on the opposite side. Actual contact triggers damage and a single three-second delay for candies within the burst; repeat contacts can damage again without adding another delay. Absorption times determine the two waves per hole. An incorrect interruption can therefore remove the safe zone. Bots wait until absorption is over before moving into the first donut. The controlled tank uses E / Provoquer; NPC tanks swap automatically. OT uses automatic invulnerability for the final solo Double Sobat at A.

Training approximations: candy corner offsets, outward animation, constant travel speed, collision grace and re-trigger cooldown; equal-side radius 11 yalms and close radius 7.75; a contact explosion is delayed 0.2 seconds. The three non-tanks must share with at least three players; there is no HP/healing/mitigation model. Autos are sampled every three seconds to exercise the enmity/debuff constraint, rather than reproducing the boss's full auto-attack schedule. First-wave movement guidance starts at 30 seconds to avoid contact with remaining shapes. Halfroom orientation uses the tank position at the first cast, and an independently selected cardinal for its repeat. As in Replication I, tank invulnerability is automatic.

Standalone Candy Crush lasts 75 seconds. The new full sequence preserves the old Replication I/II exercises, includes 6.1 seconds between their old end and Mutating Cells, and lasts 208.3 seconds. This is a practice timeline with shortened earlier downtime, not the full encounter clock. Replay saves mutable candies, damage tracking, enmity, waves and bot departure state.

Browser QA was attempted but the managed preview relay is unavailable (`sites-preview start/status`: missing relay socket). VM tests exercise keyboard input, the eight roles, both near/far variants, delayed and continuous bots, invalid damage and targets, absorption outcomes, UI changes, replay and the full sequence. No browser screenshot is claimed.

## Double Sobat correction · 2026-11-08

The second heading now equals the heading locked for the solo tankbuster plus 0, 90, 180 or 270 degrees. It stays fixed through Esoteric Finisher. Previously, Candy Crush resumed tracking the current aggro target 0.6 seconds after the second cleave, so the tanks' movement rotated the boss and moved their own front/back target positions. The corrected sequence matches the preceding exercise: solo OT under invulnerability, quarter-turn rotation, everyone behind for the halfroom cleave, then both tanks move far in front to separate their circles.

Rechecked the current upstream BossMod `BloodMana.cs` and action definitions: `ThunderFire = new(40, 60.Degrees())`, with action IDs 46339 and 46340 explicitly labelled as 120-degree cones. Both the drawn sectors and collision geometry remain 60-degree half-angles. The extracted game Action sheet confirms both IDs, names and range 40 but does not expose the cone angle (Omen=0); no independent in-game angular measurement is claimed. Regression coverage checks 50-degree hits and 65-degree safe points, relative rotation from a non-cardinal initial facing, and all four rotations × eight roles × two bot rhythms through the complete buster sequence.

## Idyllic Dream · Caro Uptime · 2026-11-08

Standalone exercise: 210 seconds from the first Idyllic Dream cast. New “Séquence complète → Idyllic Dream” preserves the existing 208.3-second Rep 1 → Rep 2 → Candies option, adds 8.8 seconds of downtime, then Idyllic (427.1 seconds total). The exercise ends after Idyllic's closing raidwide; the subsequent final buster and Arcadian Hell enrage are outside this exercise.

Sources read: upstream BossMod `IdyllicDream.cs`, `IdyllicDreamTowers.cs`, `StagingAssignment.cs`, action enums and state machine; Splatoon's `M12S P2 Idyllic Dream Tired.cs` and explicitly verified **EU Hector Uptime Caro (Defams NW/NE)** preset; the user's arena/tower screenshots. The older generic Caro raidplan's unverified near/far preset was not used. No new FFLogs timing extraction or video playback is claimed for this module.

- https://github.com/awgil/ffxiv_bossmod/tree/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm
- https://github.com/PunishXIV/Splatoon/blob/main/Presets/Dawntrail/Raids/The%20Arcadion%2012%20Savage%20Phase%202.md
- https://wtfdig.info/74/m12s#modified::::caroUptime

| Event | Seconds from cast start |
| --- | ---: |
| Personal clone attribution | 16.6 |
| First blue reality / three clones | 26.4 / 32.5 |
| Red reality / boss tethers | 45.0 / 51.2 |
| Tether lock / blue return | 70.6 / 70.7 |
| Stored AOEs | 75.1 |
| First islands / visible meteors | 83.2 / 85.4 |
| Arcadian Arcanum light vulnerability | 92.8 |
| Red return | 100.8 |
| Four boss-clone pairs | 106 / 111 / 116 / 121 (+1.2 for defam impact) |
| Islands return / towers resolve | 131.4 / 134.5 |
| Earth puddles / proximity cones | 140.2 / 145.2 |
| Temporal Curtain cast end / illustrative jump | 153.6 / 157.0 |
| Red return / first player-clone replay | 167.5 / 176.0 |
| Islands / stored island attacks | 182.8 / 186.0 |
| Red return / second replay | 190.3 / 196.9 |
| Absorbed clone's stored attack / ending raidwide | 201.7 / 207.7 |

Caro pickups indexed by personal clone A,1,B,2,C,3,D,4: defam1, stack1, stack2, defam2, defam3, stack3, stack4, defam4. Each symbol is counted clockwise from north. The sources in the northern/eastern half form the east group, southern/western sources the west group for the first stack/defam sequence. Reenactment groups use fixed role parties: MT/H1/M1/R1 west (D or3), OT/H2/M2/R2 east (B or1). Stack soakers stand 1.5 yalms outward of the clone center to avoid the 20-yalm defam edges.

Tower prepositions match the supplied screenshot. Per island, dark and wind are diagonal; supports or DPS receive the light vulnerability. Players keep melee/ranged depth and swap north/south if their original tower is incompatible. Geometry: full arena radius20; island centers±14, radius10; tower offsets±4.243 and radius3; chariot10; defam20; stack5; Arcanum6; earth puddle4; dark beam width10/range50; wind displacement23.5; proximity cones30° full width; stored double cones90° full width. All values are yalms, rendered at19.5px/yalm to fit the wider islands.

Caro proximity positions relative to center on west island: wind(-8,-7), dark(-8.5,-1.5), earth(-10.5,-1.5), fire(-8,7); mirror on east. Wind changes island, so its side follows the landing. Earth receives near; fire receives far from the opposite island. Wind/dark wait until the earth puddle resolves before entering their proximity positions. Actual closest/farthest targets are evaluated at resolution. Tower soaks, beam direction, wind landing, Hot Blooded movement, clone stacks/defams and stored AOEs use actual positions. Falling records failure and returns the player to the nearest island edge to let the exercise continue.

Training approximations: clone spawn animation between staging and attribution; decorative tower/meteor rendering; jump animation timing; status countdown displayed to the simulated resolution; source contact tolerances; no HP model, manual Esuna or invulnerability input. Esuna occurs automatically two seconds after the dark tower. A light-vulnerability player in a light tower fails; assigning a non-vulnerable player to a non-light tower is reported as a Caro assignment error. Invalid tethers are retained and recorded, not repaired by the answer key.

Validation: 64 continuous full Idyllic runs (8 roles ×8 pattern combinations), both bot rhythms, both formation orders, both initial symbols, initial cone orientations and portal side choices; randomized tower layouts and light-vulnerability groups. Negative cases exercise wrong/multiple links, invalid towers, fire movement, stored-circle damage, replay state/check restoration, hidden guidance, per-phase canvas calls, keyboard movement and the complete-sequence transition. All seven earlier regression suites pass. Browser QA attempted with `sites-preview start` and `status`; both report missing preview relay socket, so browser rendering remains unverified.

### Idyllic telegraph visibility · v0.19

Danger telegraphs now use amber fills, a dark keyline and bright yellow contours. Removed the extra 0.35 alpha multiplier from the initial clone-reading display (the previous double-cone fill was effectively ~7.5% opaque). Sources and direction badges are drawn over that display, and attack overlays are clipped to the current floor. Stack purple, visibility windows, non-guided memory rules, timings and collision geometry are unchanged. The existing Idyllic suite passes, including both orientations and guided/unguided phase-render smoke checks. Browser visual review remains unavailable due to the previously diagnosed preview relay failure.

### Island transitions and floor · v0.20

The delayed-bot latest departure for `returnTowers` now uses the island appearance at 131.4, not tower resolution at 134.5. The final safe-island transition likewise uses platform appearance at 182.8 rather than attack resolution at 186.0. The first island entry already used its correct separation at 83.2. A 0.7-second travel margin applies to delayed departures; the player does not gate the clock or NPC arrival. Fixed tower parties are explicitly G1 west (MT/H1/M1/R1) and G2 east (OT/H2/M2/R2). The final safe-island mechanic still sends everyone to the surviving cone clone's island.

Removed all original-clone hazard previews during both tower visits, including their guide-only orientation badges. Initial telegraph memorization remains visible in both modes; actual stored attacks remain visible at resolution. The final island preview stops after its attack instead of lingering into the following transition.

Added `assets/idyllic-platforms.svg`, a code-native blue/gray circuit-tile floor based on the supplied arena reference. It replaces clipping the original wooden circular arena (which brought a pink wall onto the island floor). Island geometry is unchanged. The new SVG was parsed, rasterized with Inkscape and visually inspected independently; full browser QA remains unavailable due to the preview relay limitation.

Regression: 64 complete Idyllic simulations pass. Added all eight controlled roles ×both rhythms ×three separations with actors deliberately on the opposite island and an idle selected player. Every bot is inside its required platform before separation, with no subsequent bot fall. Render checks confirm no stale clone hazard overlays during tower phases, while initial non-guided memory telegraphs still appear.

### Final Reenactment visuals · v0.21

Fixed object-spread ordering that replaced the circle renderer discriminator with the clone's `stack` / `defam` mechanic type. Both guided replay areas and actual impact effects were affected; collisions were already evaluated correctly. The same issue affected earth-puddle impact drawing and is also fixed. Mechanics received by clones still determine replay behavior; successful Caro assignments remain defam, stack, stack, defam, defam, stack, stack, defam clockwise from A.

Only the active replay formation displays stack/defam markers (in both guidance modes). Guided pre-impact circles show its two 5-yalm stacks and two 20-yalm defamations. Actual impact circles draw in both modes. Each replay stage now includes its one-second visual resolution; the damage deadline remains at 176.0 / 196.9, so delayed bots must still arrive before impact. The first replay's subsequent island hazard preview waits until the blue reality returns at 181.5. The last stored cone's preview cannot precede the second replay's animation end. Existing island-arrival deadlines and the uninterrupted combat clock are preserved.

Validation: the full Idyllic suite passes, including the 64 simulated runs and all-role island deadline regressions. New render-capture tests check clockwise stored assignments, both cardinal/intercardinal orders, exactly two stack and two defamation circles/markers, actual impacts with guidance disabled, and absence of next-step cones during replay resolution. Browser visual QA remains unavailable because of the previously diagnosed preview relay limitation.

### Telegraph and impact colors · v0.22

Idyllic Dream retains amber telegraphs, with red fills and borders for actual circle, cone and beam impacts. Stack markers remain visible, but no stack circle is previewed (initial pair assignments or final replays); the area appears only on impact. Damage timing, radius and targeting are unchanged.

### Readable initial clone waves · v0.23

Player clones now use the existing dragon silhouette at size 40 on a dark, outlined base instead of a radius-12 dot. Each quartet receives a brief expanding arrival flash in both modes. The first four still appear at 11.8 seconds and the remaining four at 14.2, with either cardinal or intercardinal order. Flashes expire without permanent wave labels; clone links and mechanics retain their timings.


### Full encounter, geometry and mitigation demonstration · v0.24

This audit supersedes the older shortened “all” timing above. The full encounter now starts at pull and ends after the fatal enrage (555.5 seconds). Individual exercises retain their local practice clocks. `dist/encounter.js` contains the pull-relative reference timeline and the in-app “Chronologie et tailles” table. This is a reconstruction from the upstream BossMod state machine, rounded to tenths of a second; it is not a new frame-by-frame FFLogs audit or a promise of identical timestamps on every pull. Existing animation timing and travel interpolations remain illustrative.

| Reference event | Pull time (seconds) |
| --- | ---: |
| Opening Arcadia Aflame | 15.2 |
| Replication I cast end | 27.7 |
| Player clone attribution | 99.1 |
| Replication II cast end | 105.4 |
| Mutating Cells cast start | 180.7 |
| Arcadia Aflame after Candies | 236.4 |
| Idyllic Dream cast start / damage | 264.5 / 269.5 |
| Lindwurm’s Meteor | 343.7 |
| Idyllic Dream ending raidwide | 472.2 |
| Last Double Sobat / cleave / tank circles | 481.0 / 485.6 / 488.1 |
| Arcadian Hell I (boss + 4 clones) | 515.0 |
| Arcadian Hell II (boss + 8 clones) | 531.3 |
| Arcadian Hell III (boss + 16 clones, fatal) | 554.2 |

Rep 2 reenactment now separates each clone's activation from its damage: landing at activation, defamation +1.2 s, stack +1.6 s, rays or cone +1.9 s. Activations remain four seconds apart, in A/C, 1/3, B/D, 2/4 order. Movement holds the previous bait until its actual ray/cone resolution. The first ray bait positions were widened to avoid the corrected 5-yalm clone landing.

Geometry audit (yalms, player center used for collision): playable circular floor radius 20; defamations radius 20 (Rep 2 previously rendered 17.4); Heavy Slam and Firefall radius 5; Netherwrath radius 6; Scalding Waves 10° total; Hemorrhagic Projection 45° total in the implementation; Candy cones 120° total, orb radius 8, donut inner radius 5 and outer radius 60; tank circles radius 10. One upstream enum comment calls the initial Projection 50°, whereas the active component and replay enum use 45°; the simulator uses the component value and discloses this conflict in the geometry panel. No claim of direct pixel measurement is made. The lethal border is visible and enterable beyond radius 20; its displayed outer edge at 22.5 is illustrative, not independently measured. Attack drawings extend into this visible border. Island geometry remains radius 10, centers ±14, with the corresponding smaller display scale.

All modules now share cardinal letter circles and intercardinal numbered squares, with red/yellow/blue/purple colors and Candy's marker coordinates. Final Idyllic clone memory symbols are guide-only; real impacts still render without guidance. Dark tower prepositions are constrained within 19.6 yalms until the island floor opens, preventing an automatic approach from clipping the lethal border.

Mitigation demonstration uses the read-only snapshot of “Ikuya Mitty (M12S)”, Phase 2: Lindwurm, B6:Y40, plus Tank Mitigation (All Comps), read on 2026-11-09. The spreadsheet was not edited. Job and role select the relevant instructions; generic Party Mit is resolved to that job's action. DPS jobs incompatible with the role's Feint/Addle/Party Mit are explicitly flagged. A full plan table preserves original instructions. “Everything”, “Use Personals!” and blanket shielding remain instructions, not invented ability casts.

Mitigation activation offsets are proposed, not supplied exact casts: usually 3 seconds before impact, Early/Blood Mana 10 seconds before; selected 15-second effects on Meteor and Seraph are placed late to cover follow-up hits. Sacred Soil covering both Hell volleys relies on the last tick's lingering effect and is explicitly conditional. Cooldowns are computed from the reference clock, including seek backwards, and cannot restart for an unavailable planned use. Dependent actions (Divine Caress / Sun Sign) require a valid preceding use; shared cooldowns share their ready time. Tank plans include solo invulnerability, remaining large tank circles, and alpha tank assistance on beta. PLD saves Hallowed Ground for the last buster because its cooldown cannot cover both first and last. Effects, shields, healing amounts, resources, damage reduction stacking and survival are not simulated. Official level-100 PvE job guides supply action cooldowns and durations.

Primary source audit:
- https://github.com/awgil/ffxiv_bossmod/tree/master/BossMod.Modules/Dawntrail/Savage/RM12S2TheLindwurm — state-machine blob af395944c2b852f9e8f7e6b53a61cbed26e71fbb; Replication2 component blob 77294cd0f6045337ea79d96e01419824e7a2b437.
- https://docs.google.com/spreadsheets/d/1FmG8NL2DybieW9FuZrPF7w6iABFtGVEzwwoFPCjslZc/edit#gid=1324709415 — mitigation instructions; timing anchors adjusted to the reference combat clock.
- https://na.finalfantasyxiv.com/jobguide/battle/ — official job action reference.

Validation: eight complete role demonstrations through enrage with no mechanic failures, all 21 job schedules checked for impossible cooldown reuse, dependent actions, late Seraph, conditional Soil and PLD invulnerability; backwards replay/CD display; lethal-border detection. Existing combat, decisions, simulation, Rep 1, Rep 2, Candies, tankbuster and Idyllic suites pass (including 64 Idyllic scenarios). Browser visual QA was attempted but unavailable: managed preview relay socket missing. Canvas/DOM smoke checks do not replace visual browser review.


### In-arena action icons · v0.25

Moved the live mitigation display out of the right sidebar into the arena panel, adjacent to the cast and playback controls. The responsive action bar displays a numeric cooldown with radial shading, a separate green remaining-effect timer, upcoming-use emphasis and conditional-action states. Tapping an icon shows its action name and nominal cooldown/effect duration without opening a second panel. Plan and timing tables remain available from the same bar. Stable action buttons preserve touch/focus while counters update. Demo mode hides unnecessary movement controls.

All 46 mitigation action icons are bundled locally from the official PvE job guides. Exact action/source mappings are recorded in `dist/assets/actions/sources.json`; `scripts/fetch-action-icons.py` reproduces the download. Compound plan entries use Deployment Tactics and Zoe icons respectively, with the full instruction retained in details.

In demonstration mode, each successful scheduled use shows an activation flash and a glowing action icon following the selected caster until its nominal effect expires. Multiple active effects occupy separate slots. The animation uses the encounter clock rather than wall time, so pause, playback speed and replay seeking remain consistent. Practice mode retains theoretical plan counters but does not display fake cast activations. Only the selected job/role is animated; other party jobs are not inferred. Failed, condition-blocked and already-covered entries do not trigger another cast. Shared cooldowns remain shared without displaying one action's effect on another icon.

Validation: action icon coverage and PNG signatures, stable HUD nodes, independent CD/effect clocks, activation/expiry, replay rewind, all job mappings and practice/demo behavior. Complete eight-role encounter regression passes. Browser preview was attempted again but the managed relay socket is unavailable, so responsive layout and browser appearance remain visually unverified.


### Twisted Vision “Everything” · v0.26

Re-read the mitigation spreadsheet's Phase 2 row 28 on 2026-11-10: Twisted Vision at 6:12 carries the healer “Everything” instruction, previously displayed as text only. It now expands to the selected healer job's tracked cooldowns in either H1 or H2. Available actions are proposed at half-second intervals starting three seconds before the 370.5-second reference anchor; unavailable/condition-blocked actions are skipped without resetting their cooldown. This stagger is a simulator proposal, not an exact cast order supplied by the spreadsheet. Other heals and resource costs remain outside this simulator.

For SCH with the current preceding plan: Deployment Tactics (prepared Adlo shield) at 367.5, Expedient at 368.5, Seraph at 369.0, Seraphism at 369.5. Fey Illumination and Sacred Soil are still on cooldown and are not forced. Buff icons, activation effects, expiry, cooldown returns and replay use the same schedule. Earlier notes stating that Everything is text-only are superseded.

Validation: all four healers in both H1/H2, no unavailable/shared CD reuse, exact SCH action set, active arena HUD at the mechanic, disappearance on rewind, and later Hell Soil coverage retained. Existing icon/HUD tests pass. No geometry, movement or encounter timing changed.


### Idyllic status readability and meteor impact · v0.27

Distance debuffs now read PROCHE / LOIN explicitly in the main status banner, party list and actor badges, in both guided and unguided modes. The local actor's badge includes a large countdown; other actors use compact labels. Doom/automatic Esuna remains described separately so it does not obscure PROCHE.

Fire meteors use a vivid orange flame and pale core with a FEU label; earth uses a muted, angular faceted rock with TERRE. Element names remain visible without guidance because this is visible meteor information, not a hidden assignment. The meteor descends over the final 0.9 seconds before tower resolution and produces a brief 0.85-second impact flash, ring and fragments at all eight tower centers. Impact rendering is derived from combat time, so pauses and replay seeking cannot desynchronize it from resolution. Animation duration is illustrative; the damage/status snapshot remains unchanged at Dream local 134.5.

Hot Blooded's existing 5-second immobilization now has a dedicated large numeric timer (tenths of a second), a bar and an on-player countdown. The movement check and countdown use the same duration constant. The display never rounds to zero early; at expiration it switches briefly to FEU TERMINÉ / Tu peux bouger. This is a release notice, not an extra debuff. It works outside guided mode and rewinds with the encounter. Near/far labels clear at their actual bait resolution instead of persisting with a negative timer.

Validation: 64 Idyllic scenarios, island arrival and hidden-guidance regressions, explicit near/far labels, fire movement at the exact expiry boundary, rewind, meteor descent, all eight simultaneous impacts and effect cleanup. Mitigation HUD regression also passes. Browser visual verification remains unavailable due to the already diagnosed preview relay failure. No attack geometry or damage timing changed.


### Consistent viewport and status display · v0.28

The canvas now uses one fixed square viewport and a common display scale of 19.5 pixels per yalm. Existing mechanics retain their simulation coordinates: other modules receive a camera transform of 19.5/21.25; Idyllic remains at 1.0. The safe circular radius is therefore 390 canvas pixels throughout, while Idyllic still changes to its real two-island geometry without zooming. Waymark sizes and personal status badges compensate for the camera transform. Pointer hit testing applies the inverse transform. No collision sizes, movement rules or damage timing changed.

The personal status banner is now absolutely positioned at the top of the viewport, outside document flow. Rep 1 vulnerabilities, Candy alpha/beta/inversion and Idyllic light/near/far/fire use one common label/description/timer renderer and consistent actor badges. No duration is invented for Rep 1 vulnerability. The fire-expiry notice reads FEU TERMINÉ rather than giving a movement instruction. Status names announce accessibly; per-frame countdowns do not sit inside an aria-live region.

Removed the Rep 2 movement-history trail while retaining history for replay. Removed automatically displayed phase titles, lower instruction toasts and chapter labels. The castbar now shows only actual casts and reserves its space while idle; it no longer falls back to “return to towers” or any other stage name. Removed the synthetic preparation/resolution and finisher bars; Double Sobat's visible boss cast lasts 5 seconds, while its later cleave/finisher resolve without invented boss casts (source enums/state machine). Rep 1's combined clone spell titles no longer impersonate the boss's castbar. Optional guide-only visuals remain controlled by the existing guide toggle; the objective sidebar and explanatory legends are hidden without guidance, as are Rep 2's stored-clone mechanic icons. Mitigation reminders remain in demonstration mode.

Validation: fixed physical-to-screen radius across five exercises/interludes, inverse-camera pointer selection, no trace from stored replay samples, common status fields and timers, real-cast/idle behavior, balanced HTML and overlay containment. Idyllic's 64 cases, Rep 1, Candies, decisions, simulation and mitigation HUD regressions pass. Managed preview is still unavailable (missing relay socket); mobile/desktop browser geometry could not be visually measured.


### Remove mitigation tooling · v0.29

Removed the job picker, mitigation plan/cooldown engine, icon bar, activation effects, spreadsheet snapshot, action-icon assets and download script at the user's request. Demonstration mode continues to automate positioning and the existing mechanic actions; its label now describes movement only. The timing/dimensions reference remains available as a compact Timings button with the other simulation controls. Personal debuffs and their countdowns are independent from the deleted mitigation system.

Validation: layout/status regression, eight-role full encounter through enrage and 64 Idyllic scenarios. All source references to the deleted module, assets and job picker have been removed. Browser appearance remains unverified because of the previously diagnosed managed preview limitation.


### Protected border and live results · v0.30

Walking input now stops at the safe floor edge (20 yalms, with only a 0.01 simulation-pixel epsilon). The visible border, display scale, collision radii and all AOE sizes are unchanged. The same input protection applies to island edges when the player starts on a valid island; scripted wind jumps remain free to cross the void. Being wrongly positioned when islands appear remains a mechanic error. Border contact itself no longer records failure.

Added a persistent, timestamped personal result journal below playback and a fixed-height latest-result line below the arena. All distinct errors affecting the selected role are retained, including multiple errors in one mechanic. Checkpoint duplicates are collapsed; successful resolutions display a green check. Cast announcements and setup/inversion events are not labelled as successful resolutions. The journal persists across exercise modules, filters future entries while seeking backwards, trims future results when branching replay and clears on restart. No future positioning instructions are added.

Validation: circular and island boundary constraints, unchanged geometry, wind-jump exemption, keyboard movement against the wall, multi-error logging, success feedback, cross-module persistence, replay filtering/branching and reset. Full eight-role demonstration and Idyllic regression retained. Browser visual QA remains unavailable due to the previously diagnosed managed preview limitation.

### Idyllic Dream clone positions from FFLogs

At the first completed self-casts, Snaking Kick (46353) is at world (100, 104.5). The two Power Gusher clones (46351 and 46352) occupy (100, 88) and (100, 112) in either orientation. Arena center is (100, 100), and increasing Z points south. These readings use the casting clone’s own coordinates. All ten pulls below agree. In the five ranked clears, the same Snaking Kick instance also retains that position for its first visual (46357) and the departure of its island jump (46297).

| Report | Fights |
| --- | --- |
| [PcyCvGAFRqzrXJBj](https://www.fflogs.com/reports/PcyCvGAFRqzrXJBj#fight=30&type=replay) | 25, 26, 28, 30, 34 |
| [8AraVqC7GFwkmzLf](https://www.fflogs.com/reports/8AraVqC7GFwkmzLf#fight=14&type=replay) | 14 |
| [mgAnZqbryGJXFKcw](https://www.fflogs.com/reports/mgAnZqbryGJXFKcw#fight=14&type=replay) | 14 |
| [3b6CKFVhPZANngyH](https://www.fflogs.com/reports/3b6CKFVhPZANngyH#fight=7&type=replay) | 7 |
| [2gn8H6WabrxK3AB1](https://www.fflogs.com/reports/2gn8H6WabrxK3AB1#fight=15&type=replay) | 15 |
| [LXapYDv3NzxRVPbf](https://www.fflogs.com/reports/LXapYDv3NzxRVPbf#fight=21&type=replay) | 21 |
