/* Edzésterv készítése a gyakorlatokból. */
(function () {
  const D = window.GYT_DATA;
  const byId = Object.fromEntries(D.exercises.map(e => [e.id, e]));
  const POS_ORDER = { supine: 0, side: 1, quad: 2, prone: 3, kneel: 4 };
  const CHARS_PER_SEC = 13;

  function speechSec(t) { return t ? t.length / CHARS_PER_SEC + 0.3 : 0; }

  function availableEquip(settings) {
    const set = new Set();
    for (const k in D.equipment) if (D.equipment[k].household) set.add(k);
    if (settings.equipMode === 'with') for (const k of settings.equip || []) set.add(k);
    return set;
  }

  function usable(ex, avail) { return ex.equipment.every(e => avail.has(e)); }
  function needsRealEquip(ex) { return ex.equipment.some(e => !D.equipment[e].household); }

  /* Ismétlések az intenzitás szerint */
  function adjReps(ex, level, phase) {
    const r = Object.assign({}, ex.reps);
    if (phase === 'warmup' && ex.id === 'e01') { r.sets = 1; r.count = 8; }
    if (level === 'gentle') {
      r.sets = 1;
      if (r.unit !== 'breath') r.count = Math.max(r.unit === 'round' ? 2 : 3, Math.ceil(r.count * 0.6));
    }
    return r;
  }

  function repsText(ex, r) {
    if (r.sets === ex.reps.sets && r.count === ex.reps.count) return ex.repsText;
    const unit = { rep: 'db', round: 'kör', breath: 'légzés', cycle: 'ciklus' }[r.unit] || 'db';
    const per = r.sides === 'none' ? '' : ' oldalanként';
    return (r.sets > 1 ? r.sets + ' × ' : '') + r.count + ' ' + unit + per;
  }

  /* Becsült időtartam másodpercben */
  function estimate(ex, r, restSec) {
    let rep = 0;
    for (const it of ex.seq) {
      if (it.once) continue;
      rep += Math.max(it.t || 0, it.nw ? 0 : speechSec(it.cue)) + (it.hold || 0);
    }
    rep += 1.2; // ismétlésszám bemondása
    const sides = r.sides === 'none' ? 1 : 2;
    let total = rep * r.count * sides * r.sets;
    total += (ex.prep || []).concat(ex.post || []).reduce((a, it) => a + Math.max(it.t || 0, speechSec(it.cue)), 0) * sides * r.sets;
    total += speechSec(ex.setup) + speechSec(ex.sayName) + 9; // bevezetés + felkészülés
    total += ex.steps.reduce((a, s) => a + speechSec(s), 0) * 0.6; // részletes leírás az első ismétlésnél
    total += (r.sets - 1) * (restSec || 25);
    if (r.sides === 'each') total += 6;
    return Math.round(total);
  }

  function item(ex, phase, settings) {
    const r = adjReps(ex, settings.level, phase);
    return { id: ex.id, phase, reps: r, repsText: repsText(ex, r), est: estimate(ex, r, settings.rest) };
  }

  const WARMUP = { 15: ['w02', 'w04'], 25: ['w01', 'w02', 'w03', 'w04'], 40: ['w01', 'w02', 'w03', 'w04', 'e01'] };
  const COOLDOWN = { 15: ['e16', 'c01'], 25: ['e16', 'c01', 'c03', 'w01'], 40: ['e16', 'e02', 'c01', 'c02', 'c03', 'w01'] };

  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function sortMain(items) {
    return items.sort((a, b) => {
      const ea = byId[a.id], eb = byId[b.id];
      return (POS_ORDER[ea.position] - POS_ORDER[eb.position]) || (ea.num - eb.num);
    });
  }

  function build(settings) {
    const avail = availableEquip(settings);
    const dur = settings.duration || 25;
    const warmup = (WARMUP[dur] || WARMUP[25]).map(id => byId[id]).filter(ex => usable(ex, avail)).map(ex => item(ex, 'warmup', settings));
    const cooldown = (COOLDOWN[dur] || COOLDOWN[25]).map(id => byId[id]).filter(ex => usable(ex, avail)).map(ex => item(ex, 'cooldown', settings));
    const used = new Set(warmup.concat(cooldown).map(i => i.id));

    const focus = settings.focus || [];
    let pool = D.exercises.filter(ex => ex.phases.includes('main') && !used.has(ex.id) && usable(ex, avail));
    // pontozás: fókusz egyezés + eszközös módban az eszközös gyakorlatok előnyben + véletlen
    const scored = shuffle(pool.slice()).map(ex => {
      let s = Math.random() * 1.5;
      if (focus.length) s += ex.focus.filter(f => focus.includes(f)).length * 2 - (ex.focus.some(f => focus.includes(f)) ? 0 : 3);
      if (settings.equipMode === 'with' && needsRealEquip(ex)) s += 2;
      return { ex, s };
    }).sort((a, b) => b.s - a.s);

    const totalBudget = dur * 60;
    const fixed = warmup.concat(cooldown).reduce((a, i) => a + i.est + 4, 0);
    let budget = Math.max(totalBudget - fixed, 240);
    const main = [];
    const posCount = {};
    for (const { ex } of scored) {
      const it = item(ex, 'main', settings);
      if (it.est > budget + 60) continue;
      // ne legyen túl sok azonos csoportból (pl. döglött bogár) – változatosság
      const g = ex.group;
      posCount[g] = (posCount[g] || 0) + 1;
      if (posCount[g] > (dur >= 40 ? 4 : 3)) continue;
      main.push(it);
      budget -= it.est + 4;
      if (budget < 45) break;
    }
    return { warmup, main: sortMain(main), cooldown, settings: Object.assign({}, settings), created: Date.now() };
  }

  /* Egy gyakorlat cseréje egy másik, még nem használt, megfelelő gyakorlatra */
  function swap(plan, phase, index) {
    const avail = availableEquip(plan.settings);
    const used = new Set(['warmup', 'main', 'cooldown'].flatMap(p => plan[p].map(i => i.id)));
    const cur = byId[plan[phase][index].id];
    const cands = D.exercises.filter(ex => ex.phases.includes(phase) && !used.has(ex.id) && usable(ex, avail));
    if (!cands.length) return false;
    const same = cands.filter(ex => ex.position === cur.position);
    const pick = shuffle(same.length ? same : cands)[0];
    plan[phase][index] = item(pick, phase, plan.settings);
    if (phase === 'main') sortMain(plan.main);
    return true;
  }

  function add(plan, phase, id) {
    plan[phase].push(item(byId[id], phase, plan.settings));
    if (phase === 'main') sortMain(plan.main);
  }

  function total(plan) {
    return ['warmup', 'main', 'cooldown'].reduce((a, p) => a + plan[p].reduce((b, i) => b + i.est + 4, 0), 0);
  }

  window.GYTPlanner = { build, swap, add, total, estimate, availableEquip, usable, byId, item };
})();
