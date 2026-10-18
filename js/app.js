/* Alkalmazás: nézetek, beállítások, terv, edzés, gyakorlatkönyvtár. */
(function () {
  const D = window.GYT_DATA;
  const Planner = window.GYTPlanner;
  const byId = Planner.byId;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtMin = (sec) => Math.max(1, Math.round(sec / 60)) + ' perc';
  const PHASE_NAMES = { warmup: 'Bemelegítés', main: 'Fő rész', cooldown: 'Lenyújtás', done: 'Kész' };

  // ---------- tárolás (hibatűrő) ----------
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* privát mód */ } }
  };

  const defaults = {
    equipMode: 'none', equip: [], duration: 25, level: 'normal', focus: [], rest: 25,
    engine: 'auto', voiceURI: '', rate: 1, volume: 1, beeps: true, detail: 'first', prep: 6
  };
  const S = Object.assign({}, defaults, store.get('gyt.settings', {}));
  const save = () => store.set('gyt.settings', S);

  // ---------- motorok ----------
  const stage = new window.GYTStage($('#workoutStageHost'));
  const voice = new window.GYTVoice();
  voice.configure(S);
  let plan = store.get('gyt.plan', null);
  if (plan && !['warmup', 'main', 'cooldown'].every(p => Array.isArray(plan[p]) && plan[p].every(i => byId[i.id]))) plan = null;

  // ---------- nézetváltás ----------
  let view = 'plan';
  function show(v) {
    view = v;
    $$('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === v));
    $$('.view').forEach(s => s.classList.toggle('active', s.id === 'view-' + v));
    if (v === 'workout') { stopPreview(); stage.attach($('#workoutStageHost')); if (!runner.running && runner.items.length) stage.setExercise(runner.items[runner.index].id, 'L', { instant: true, instantCam: true }); }
    if (v === 'library') { stage.attach($('#libStageHost')); if (runner.running && !runner.paused) runner.pause(); selectLib(libSel || D.exercises[0].id); }
    if (v === 'settings') renderVoiceStatus();
    window.scrollTo(0, 0);
  }
  $$('.tab').forEach(t => t.addEventListener('click', () => show(t.dataset.view)));

  // ---------- szegmentált kapcsolók ----------
  function seg(id, key, conv, onChange) {
    const el = $('#' + id);
    const sync = () => el.querySelectorAll('button').forEach(b => b.classList.toggle('on', String(S[key]) === b.dataset.v));
    el.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      S[key] = conv ? conv(b.dataset.v) : b.dataset.v;
      save(); sync(); onChange && onChange();
    });
    sync();
  }

  // ---------- TERV ----------
  function renderEquip() {
    const box = $('#equipList');
    box.hidden = S.equipMode !== 'with';
    $('#equipHint').textContent = S.equipMode === 'with'
      ? 'Jelöld be, mi van otthon. A tervben előnyt kapnak az eszközös gyakorlatok.'
      : 'Csak matrac kell. A csúszkás gyakorlatokhoz zokni vagy papírlap is jó.';
    box.innerHTML = Object.entries(D.equipment).filter(([, e]) => !e.household).map(([k, e]) =>
      `<label class="check"><input type="checkbox" value="${k}" ${S.equip.includes(k) ? 'checked' : ''}> ${esc(e.name)}</label>`).join('');
  }
  $('#equipList').addEventListener('change', () => {
    S.equip = $$('#equipList input:checked').map(i => i.value);
    save();
  });
  seg('equipMode', 'equipMode', null, renderEquip);
  seg('duration', 'duration', Number);
  seg('level', 'level');
  renderEquip();

  $('#focus').innerHTML = Object.entries(D.focus).map(([k, n]) => `<button class="chip" data-v="${k}">${esc(n)}</button>`).join('');
  const syncFocus = () => $$('#focus .chip').forEach(c => c.classList.toggle('on', S.focus.includes(c.dataset.v)));
  $('#focus').addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    const v = c.dataset.v;
    S.focus = S.focus.includes(v) ? S.focus.filter(x => x !== v) : S.focus.concat(v);
    save(); syncFocus();
  });
  syncFocus();

  $('#rest').value = S.rest; $('#restVal').textContent = S.rest;
  $('#rest').addEventListener('input', (e) => { S.rest = +e.target.value; $('#restVal').textContent = S.rest; save(); });

  function buildPlan() {
    plan = Planner.build(S);
    store.set('gyt.plan', plan);
    renderPlan();
    loadRunner();
  }
  $('#btnBuild').addEventListener('click', buildPlan);
  $('#btnRebuild').addEventListener('click', buildPlan);

  function equipTags(ex) {
    return ex.equipment.map(e => `<span class="tag eq">${esc(D.equipment[e].name.split(' (')[0])}</span>`).join(' ');
  }
  function numBadge(ex) { return ex.num ? `<div class="ex-num">${ex.num}.</div>` : `<div class="ex-num added" title="Kiegészítő gyakorlat">+</div>`; }

  function renderPlan() {
    $('#planEmpty').hidden = !!plan;
    $('#planView').hidden = !plan;
    if (!plan) return;
    const total = Planner.total(plan);
    const eqMode = plan.settings.equipMode === 'with' ? 'eszközökkel' : 'eszköz nélkül';
    const n = plan.warmup.length + plan.main.length + plan.cooldown.length;
    $('#planMeta').textContent = `${n} gyakorlat · kb. ${fmtMin(total)} · ${eqMode} · ${plan.settings.level === 'gentle' ? 'kímélő' : 'normál'} intenzitás`;
    $('#planPhases').innerHTML = ['warmup', 'main', 'cooldown'].map(ph => {
      const items = plan[ph];
      const sec = items.reduce((a, i) => a + i.est, 0);
      return `<div class="phase"><h3 class="phase-title">${PHASE_NAMES[ph]} <span class="muted">${items.length} gyakorlat · ~${fmtMin(sec)}</span></h3>` +
        items.map((it, idx) => {
          const ex = byId[it.id];
          return `<div class="ex-card">
            ${numBadge(ex)}
            <div><div class="ex-title">${esc(ex.name)}</div>
              <div class="ex-meta"><span>${esc(it.repsText)}</span><span>${esc(D.positions[ex.position])}</span><span>~${fmtMin(it.est)}</span>${equipTags(ex)}${ex.source === 'added' ? '<span class="tag">Kiegészítő</span>' : ''}</div></div>
            <div class="ex-actions">
              <button data-act="view" data-id="${ex.id}" title="Megtekintés a bábon">👁</button>
              <button data-act="swap" data-ph="${ph}" data-i="${idx}" title="Csere másik gyakorlatra">⇄</button>
              <button data-act="del" data-ph="${ph}" data-i="${idx}" title="Eltávolítás">✕</button>
            </div></div>`;
        }).join('') + `</div>`;
    }).join('');
  }
  $('#planPhases').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]'); if (!b) return;
    const { act, ph } = b.dataset; const i = +b.dataset.i;
    if (act === 'view') { libSel = b.dataset.id; show('library'); return; }
    if (act === 'swap' && !Planner.swap(plan, ph, i)) { b.title = 'Nincs több megfelelő gyakorlat'; return; }
    if (act === 'del') plan[ph].splice(i, 1);
    store.set('gyt.plan', plan);
    renderPlan();
    loadRunner();
  });
  $('#btnStart').addEventListener('click', () => { show('workout'); });

  // ---------- EDZÉS ----------
  let captionTimer = null;
  voice.onCaption = (text) => {
    const el = view === 'library' ? $('#libCaption') : $('#wCaption');
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(captionTimer);
    captionTimer = setTimeout(() => el.classList.remove('show'), 1500 + text.length * 70);
  };

  const runner = new window.GYTRunner(stage, voice, {
    update: renderWorkoutState,
    step: (idx) => $$('#wSteps li').forEach((li, i) => li.classList.toggle('on', idx.includes(i))),
    hold: (s, total, label) => {
      const box = $('#wHold');
      if (s == null) { box.hidden = true; return; }
      box.hidden = false;
      $('#wHoldNum').textContent = s;
      $('#wHoldLabel').textContent = label || '';
      const C = 327;
      $('#wRing').style.strokeDashoffset = String(C * (1 - (s - 1) / Math.max(1, total)));
    },
    finished: () => {
      $('#wStartOverlay').hidden = false;
      $('#wStartTitle').textContent = 'Szép munka! 🎉';
      $('#wStartText').textContent = 'Az edzés véget ért. Készíthetsz új tervet, vagy kezdheted elölről.';
      $('#wEquipNeeded').innerHTML = '';
      $('#wGo').textContent = '↺ Újra';
      $('#cPlay').textContent = '▶';
      releaseWake();
    }
  });
  runner.settings = S;

  function loadRunner() {
    if (runner.running) runner.stop();
    if (!plan) return;
    runner.load(plan);
    $('#wStartOverlay').hidden = false;
    $('#wStartTitle').textContent = 'Készen állsz?';
    $('#wStartText').textContent = `${runner.items.length} gyakorlat, kb. ${fmtMin(Planner.total(plan))}. Teríts le egy matracot. A hang az indítás gombra kattintva indul.`;
    const eq = new Set(runner.items.flatMap(i => byId[i.id].equipment));
    $('#wEquipNeeded').innerHTML = ['Matrac'].concat([...eq].map(e => D.equipment[e].name)).map(n => `<li>${esc(n)}</li>`).join('');
    $('#wGo').textContent = '▶ Indítás';
    renderWorkoutState({ index: 0, exId: runner.items[0] && runner.items[0].id, phase: runner.items[0] && runner.items[0].phase, rep: 0 });
    if (runner.items[0]) stage.setExercise(runner.items[0].id, 'L', { instant: true, instantCam: true });
  }

  let lastExId = null;
  function renderWorkoutState(st) {
    const items = runner.items;
    if (!items.length) return;
    const ex = st.exId ? byId[st.exId] : null;
    $('#wPhase').textContent = PHASE_NAMES[st.phase] || '—';
    $('#wName').textContent = ex ? ex.name : 'Kész';
    $('#wProgress').style.width = (st.phase === 'done' ? 100 : Math.round(100 * (st.index || 0) / items.length)) + '%';
    if (ex && ex.id !== lastExId) {
      lastExId = ex.id;
      $('#wSetup').textContent = ex.setup;
      $('#wSteps').innerHTML = ex.steps.map(s => `<li>${esc(s)}</li>`).join('');
      const it = items[st.index || 0];
      $('#wReps').textContent = 'Ismétlés: ' + (it ? it.repsText : ex.repsText) + (ex.equipment.length ? ' · Eszköz: ' + ex.equipment.map(e => D.equipment[e].name).join(', ') : '');
    }
    const counter = $('#wCounter');
    counter.hidden = !(ex && st.rep > 0);
    if (ex && st.rep > 0) {
      $('#wRep').textContent = st.rep;
      $('#wCount').textContent = st.count;
      const unit = { rep: 'ismétlés', round: 'kör', breath: 'légzés', cycle: 'ciklus' }[st.unit] || '';
      const side = st.side ? (st.side === 'L' ? 'bal oldal' : 'jobb oldal') : '';
      $('#wSub').textContent = [unit, st.sets > 1 ? `${st.set}/${st.sets}. sorozat` : '', side].filter(Boolean).join(' · ');
    }
    // sor
    let html = '', lastPh = null;
    items.forEach((it, i) => {
      if (it.phase !== lastPh) { html += `<li class="qphase">${PHASE_NAMES[it.phase]}</li>`; lastPh = it.phase; }
      const cls = i === st.index && st.phase !== 'done' ? 'cur' : (i < st.index || st.phase === 'done' ? 'done' : '');
      html += `<li class="${cls}" data-i="${i}">${esc(byId[it.id].name)}</li>`;
    });
    $('#wQueue').innerHTML = html;
    $('#cPlay').textContent = st.paused || !runner.running ? '▶' : '⏸';
  }

  $('#wQueue').addEventListener('click', (e) => {
    const li = e.target.closest('li[data-i]'); if (!li) return;
    if (!runner.running) startWorkout(+li.dataset.i); else runner.jump(+li.dataset.i);
  });

  let wakeLock = null;
  async function requestWake() { try { if (navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen'); } catch (e) { wakeLock = null; } }
  function releaseWake() { try { wakeLock && wakeLock.release(); } catch (e) { /* ok */ } wakeLock = null; }

  function startWorkout(from) {
    if (!plan) { show('plan'); return; }
    if (!runner.items.length) loadRunner();
    voice.unlock();
    $('#wStartOverlay').hidden = true;
    requestWake();
    runner.start(from || 0);
  }
  let goFrom = 0;
  $('#wGo').addEventListener('click', () => { const f = goFrom; goFrom = 0; startWorkout(f); });
  $('#cPlay').addEventListener('click', () => { if (!runner.running) startWorkout(runner.index); else runner.toggle(); });
  $('#cNext').addEventListener('click', () => runner.running ? runner.next() : null);
  $('#cPrev').addEventListener('click', () => runner.running ? runner.prev() : null);
  $('#cRestart').addEventListener('click', () => runner.running ? runner.restart() : null);
  $('#cStop').addEventListener('click', () => {
    runner.stop(); releaseWake();
    $('#wStartOverlay').hidden = false;
    $('#wStartTitle').textContent = 'Edzés leállítva';
    $('#wStartText').textContent = 'Folytathatod onnan, ahol abbahagytad, vagy kattints a listában egy gyakorlatra.';
    $('#wGo').textContent = '▶ Folytatás';
    goFrom = runner.index;
    $('#cPlay').textContent = '▶';
    $('#wHold').hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (view !== 'workout' || /input|select|textarea/i.test(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); if (runner.running) runner.toggle(); else startWorkout(runner.index); }
    if (e.code === 'ArrowRight' && runner.running) runner.next();
    if (e.code === 'ArrowLeft' && runner.running) runner.prev();
  });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && runner.running) requestWake(); });

  // ---------- GYAKORLATOK ----------
  let libSel = null, libSide = 'L', previewTok = 0;
  const posSel = $('#libPos');
  posSel.innerHTML += Object.entries(D.positions).map(([k, n]) => `<option value="${k}">${esc(n)}</option>`).join('');
  function renderLibList() {
    const pos = posSel.value, eq = $('#libEq').value;
    let html = '', lastG = null;
    for (const ex of D.exercises) {
      if (pos && ex.position !== pos) continue;
      if (eq === 'none' && ex.equipment.some(e => !D.equipment[e].household)) continue;
      if (eq === 'with' && !ex.equipment.length) continue;
      if (ex.group !== lastG) { html += `<div class="lib-group">${esc(ex.group)}</div>`; lastG = ex.group; }
      html += `<div class="lib-item ${ex.id === libSel ? 'on' : ''}" data-id="${ex.id}">${numBadge(ex)}<span>${esc(ex.name)}</span></div>`;
    }
    $('#libItems').innerHTML = html || '<p class="muted">Nincs találat.</p>';
  }
  posSel.addEventListener('change', renderLibList);
  $('#libEq').addEventListener('change', renderLibList);
  $('#libItems').addEventListener('click', (e) => { const it = e.target.closest('.lib-item'); if (it) selectLib(it.dataset.id); });

  function selectLib(id) {
    libSel = id;
    libSide = 'L';
    const ex = byId[id];
    renderLibList();
    $('#libName').textContent = ex.name;
    $('#libPosPill').textContent = D.positions[ex.position];
    $('#libSetup').textContent = ex.setup;
    $('#libSteps').innerHTML = ex.steps.map(s => `<li>${esc(s)}</li>`).join('');
    $('#libReps').textContent = 'Ismétlésszám a leírás szerint: ' + ex.repsText;
    $('#libChips').innerHTML = [`<span class="tag">${esc(D.positions[ex.position])}</span>`]
      .concat(ex.equipment.length ? ex.equipment.map(e => `<span class="tag eq">${esc(D.equipment[e].name)}</span>`) : ['<span class="tag">Eszköz nélkül</span>'])
      .concat(ex.focus.map(f => `<span class="tag">${esc(D.focus[f])}</span>`))
      .concat(ex.source === 'added' ? ['<span class="tag">Kiegészítő (nem a fájlból)</span>'] : [`<span class="tag">Fájl: ${ex.num}. gyakorlat</span>`]).join(' ');
    $('#libSide').textContent = 'Oldal: bal';
    $('#libSide').hidden = ex.reps.sides === 'none';
    startPreview(false);
  }

  function stopPreview() { previewTok++; voice.stop(); }

  /* Előnézet: a mozdulatsor ismétlése; withVoice esetén egy ismétlés teljes leírással */
  async function startPreview(withVoice) {
    const tok = ++previewTok;
    voice.stop();
    const ex = byId[libSel];
    stage.setExercise(ex.id, libSide, { instant: true, instantCam: true });
    const wait = (s) => new Promise(r => setTimeout(r, s * 1000));
    const alive = () => tok === previewTok && view === 'library';
    const steps = (it) => it.st == null ? [] : [].concat(it.st);
    $$('#libSteps li').forEach(li => li.classList.remove('on'));
    try {
      if (withVoice) { await voice.speak(ex.sayName); if (!alive()) return; await voice.speak(ex.setup); }
      let round = 0;
      while (alive()) {
        round++;
        const side = ex.reps.sides === 'alternate' ? (round % 2 ? 'L' : 'R') : libSide;
        stage.setSideState(side);
        const seq = (ex.prep || []).concat(ex.seq, ex.post || []);
        const spoken = new Set();
        for (const it of seq) {
          if (!alive()) return;
          const st = steps(it);
          if (st.length) $$('#libSteps li').forEach((li, i) => li.classList.toggle('on', st.includes(i)));
          const p = it.pose ? stage.to(it.pose, it.t || 1, side) : null;
          let sp = null;
          if (withVoice && round === 1) {
            const texts = st.filter(s => !spoken.has(s)).map(s => { spoken.add(s); return ex.steps[s]; });
            if (!texts.length && it.cue) texts.push(it.cue);
            sp = (async () => { for (const t of texts) await voice.speak(t); })();
          }
          await Promise.all([p, wait(it.t || 0.3), it.nw ? null : sp]);
          if (it.hold) await wait(Math.min(it.hold, 4));
        }
        if (withVoice && round === 1) withVoice = false;
        await wait(0.6);
      }
    } finally { /* nincs teendő */ }
  }
  $('#libVoice').addEventListener('click', () => { voice.unlock(); startPreview(true); });
  $('#libSide').addEventListener('click', () => {
    libSide = libSide === 'L' ? 'R' : 'L';
    $('#libSide').textContent = 'Oldal: ' + (libSide === 'L' ? 'bal' : 'jobb');
    startPreview(false);
  });

  // ---------- BEÁLLÍTÁSOK ----------
  function renderVoiceStatus() {
    const info = voice.engineInfo();
    const lines = [];
    if (info.clips && S.engine === 'auto') lines.push(`<span class="ok">✓ Élethű neurális hang aktív</span> – ${info.clips} előre generált hangfájl (${esc(info.clipVoice)}).`);
    else if (info.clips) lines.push(`${info.clips} élethű hangfájl elérhető, de most a böngésző hangja van kiválasztva.`);
    else lines.push('<span class="warn">Nincsenek előre generált hangfájlok.</span> Futtasd a <code>tools/generate_audio.py</code> szkriptet az élethű hanghoz (lásd README).');
    lines.push(info.browserVoice
      ? `Böngészős tartalék hang: <b>${esc(info.browserVoice)}</b>${info.browserNatural ? ' (természetes hang)' : ' – ez gépies lehet; Edge-ben elérhető a természetes „Noémi” hang.'}`
      : 'A böngésző nem kínál magyar hangot.');
    $('#voiceStatus').innerHTML = lines.map(l => `<p>${l}</p>`).join('');
    const sel = $('#voiceSel');
    const hu = voice.huVoices();
    sel.innerHTML = '<option value="">Automatikus (legjobb elérhető)</option>' + hu.map(v => `<option value="${esc(v.voiceURI)}">${esc(v.name)}</option>`).join('');
    sel.value = S.voiceURI || '';
  }
  voice.onVoices = () => { if (view === 'settings') renderVoiceStatus(); };
  seg('engine', 'engine', null, () => { voice.configure(S); renderVoiceStatus(); });
  seg('detail', 'detail');
  $('#voiceSel').addEventListener('change', (e) => { S.voiceURI = e.target.value; save(); voice.configure(S); renderVoiceStatus(); });
  const range = (id, key, fmt) => {
    const el = $('#' + id), out = $('#' + id + 'Val');
    el.value = S[key];
    if (out) out.textContent = fmt ? fmt(S[key]) : S[key];
    el.addEventListener('input', () => { S[key] = +el.value; if (out) out.textContent = fmt ? fmt(S[key]) : S[key]; save(); voice.configure(S); });
  };
  range('rate', 'rate', v => v.toFixed(2));
  range('volume', 'volume');
  range('prep', 'prep');
  $('#beeps').checked = S.beeps;
  $('#beeps').addEventListener('change', (e) => { S.beeps = e.target.checked; save(); voice.configure(S); });
  $('#btnTestVoice').addEventListener('click', () => { voice.unlock(); voice.stop(); voice.speak(D.phrases.voice_test); });

  // ---------- indulás ----------
  renderPlan();
  if (plan) loadRunner();
  else stage.setExercise('e18', 'L', { instant: true, instantCam: true });
  window.GYT_APP = { stage, voice, runner, get plan() { return plan; } };
})();
