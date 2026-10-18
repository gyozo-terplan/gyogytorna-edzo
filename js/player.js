/* Edzés lejátszó: végigvezet a terven, hanggal és bábanimációval. */
(function () {
  const D = window.GYT_DATA;
  const PH = D.phrases;
  const byId = Object.fromEntries(D.exercises.map(e => [e.id, e]));
  const ABORT = { abort: true };
  const UNIT_KEY = { rep: 'rep', round: 'round', breath: 'breath', cycle: 'cycle' };

  class Runner {
    constructor(stage, voice, ui) {
      this.stage = stage;
      this.voice = voice;
      this.ui = ui;          // callbackek: update(state), step(indices), hold(sec|null), finished()
      this.items = [];
      this.index = 0;
      this.token = 0;
      this.paused = false;
      this.running = false;
      this.settings = { detail: 'first', prep: 6, rest: 25 };
      this.state = {};
      this._resumeWaiters = [];
    }

    load(plan) {
      this.items = [];
      for (const phase of ['warmup', 'main', 'cooldown']) for (const it of plan[phase]) this.items.push(Object.assign({ phase }, it));
      this.plan = plan;
      this.index = 0;
    }

    // ---------- vezérlés ----------
    start(from) {
      this.running = true;
      this.paused = false;
      this.stage.paused = false;
      this.run(from || 0);
    }
    pause() {
      if (!this.running || this.paused) return;
      this.paused = true;
      this.stage.paused = true;
      this.voice.stop();
      this.emit({ paused: true });
    }
    resume() {
      if (!this.paused) return;
      this.paused = false;
      this.stage.paused = false;
      const w = this._resumeWaiters.splice(0);
      w.forEach(f => f());
      this.emit({ paused: false });
    }
    toggle() { this.paused ? this.resume() : this.pause(); }
    jump(i) {
      if (i < 0 || i >= this.items.length) return;
      this.voice.stop();
      this.paused = false;
      this.stage.paused = false;
      this.run(i);
    }
    next() { this.jump(this.index + 1); }
    prev() { this.jump(Math.max(0, this.index - 1)); }
    restart() { this.jump(this.index); }
    stop() {
      this.token++;
      this.running = false;
      this.paused = false;
      this.stage.paused = false;
      this.voice.stop();
      this.ui.hold && this.ui.hold(null);
    }

    emit(patch) {
      Object.assign(this.state, patch);
      this.ui.update && this.ui.update(this.state);
    }

    // ---------- időzítés ----------
    check(tok) { if (tok !== this.token) throw ABORT; }

    waitResume() { return this.paused ? new Promise(r => this._resumeWaiters.push(r)) : Promise.resolve(); }

    /* Szüneteltethető várakozás */
    delay(sec, tok) {
      return new Promise((resolve, reject) => {
        let left = sec * 1000;
        let last = performance.now();
        const tick = () => {
          if (tok !== this.token) { reject(ABORT); return; }
          const now = performance.now();
          if (!this.paused) left -= now - last;
          last = now;
          if (left <= 0) resolve();
          else setTimeout(tick, Math.min(100, Math.max(10, left)));
        };
        tick();
      });
    }

    async say(text, tok) {
      if (!text) return;
      for (;;) {
        this.check(tok);
        await this.waitResume();
        this.check(tok);
        const r = await this.voice.speak(text);
        this.check(tok);
        if (r === 'stopped' && this.paused) { await this.waitResume(); continue; }
        return;
      }
    }

    async countdown(sec, tok, opts) {
      opts = opts || {};
      for (let s = sec; s > 0; s--) {
        this.ui.hold && this.ui.hold(s, sec, opts.label);
        if (s <= (opts.speakFrom || 3) && this.voice.idle && PH.num[s - 1]) this.voice.speak(PH.num[s - 1]);
        else if (s <= 3) this.voice.beep(660, 0.1);
        await this.delay(1, tok);
      }
      this.ui.hold && this.ui.hold(null);
    }

    // ---------- fő ciklus ----------
    async run(from) {
      const tok = ++this.token;
      this.voice.stop();
      try {
        for (let i = from; i < this.items.length; i++) {
          this.index = i;
          await this.runItem(this.items[i], i, tok);
        }
        this.emit({ phase: 'done', exId: null, rep: 0 });
        this.stage.to('start', 2);
        await this.say(PH.workout_end, tok);
        this.voice.gong();
        this.running = false;
        this.ui.finished && this.ui.finished();
      } catch (e) {
        if (e !== ABORT) { console.error(e); this.running = false; }
      }
    }

    async runItem(item, i, tok) {
      const ex = byId[item.id];
      const r = item.reps;
      this.spoken = new Set();
      const prevPhase = i > 0 ? this.items[i - 1].phase : null;
      this.emit({ index: i, total: this.items.length, phase: item.phase, exId: ex.id, set: 1, sets: r.sets, rep: 0, count: r.count, side: r.sides === 'none' ? null : 'L', unit: r.unit, stepIdx: [], paused: false });
      this.ui.step && this.ui.step([]);
      this.stage.setExercise(ex.id, 'L', { pose: 'start', dur: 1.8 });

      if (i === 0) await this.say(PH.workout_start, tok);
      if (item.phase !== prevPhase) await this.say(PH['phase_' + item.phase], tok);
      await this.say(PH.next_exercise, tok);
      await this.say(ex.sayName, tok);
      await this.say(PH.start_position, tok);
      await this.say(ex.setup, tok);
      if (r.sides === 'each' && ex.sideText) await this.say(ex.sideText[0], tok);

      // felkészülés
      await this.countdown(this.settings.prep || 6, tok, { label: 'Készülj' });
      await this.say(PH.go, tok);

      const sides = r.sides === 'each' ? ['L', 'R'] : ['L'];
      const unitKey = UNIT_KEY[r.unit] || 'rep';
      for (let set = 1; set <= r.sets; set++) {
        this.emit({ set });
        if (r.sets > 1) await this.say(PH.set[set - 1], tok);
        for (let si = 0; si < sides.length; si++) {
          const side = sides[si];
          if (r.sides === 'each') {
            this.emit({ side });
            if (si > 0) {
              await this.say(PH.switch_side, tok);
              this.stage.setExercise(ex.id, side, { pose: 'start', dur: 2 });
              if (ex.sideText) await this.say(ex.sideText[1], tok);
              else await this.say(PH.right, tok);
              await this.delay(2.5, tok);
            } else if (set > 1) {
              this.stage.setExercise(ex.id, side, { pose: 'start', dur: 2 });
              if (ex.sideText) await this.say(ex.sideText[0], tok); else await this.say(PH.left, tok);
              await this.delay(2, tok);
            } else if (!ex.sideText) {
              await this.say(PH.left, tok);
            }
          }
          for (const it of ex.prep || []) await this.doItem(ex, it, side, 0, tok);
          for (let rep = 1; rep <= r.count; rep++) {
            this.emit({ rep });
            const last = rep === r.count && r.count > 1;
            const label = last ? (r.unit === 'round' ? PH.last_round : (r.unit === 'rep' ? PH.last_rep : PH[unitKey][rep - 1])) : (PH[unitKey][rep - 1] || '');
            await this.say(label, tok);
            if (r.sides === 'alternate') {
              for (const s of ['L', 'R']) {
                this.emit({ side: s });
                this.stage.setSideState(s);
                await this.say(s === 'L' ? PH.left_short : PH.right_short, tok);
                await this.runSeq(ex, s, rep, tok);
              }
            } else {
              await this.runSeq(ex, side, rep, tok);
            }
          }
          for (const it of ex.post || []) await this.doItem(ex, it, side, 0, tok);
        }
        if (set < r.sets) {
          this.stage.to('start', 1.5);
          await this.say(PH.rest_sets, tok);
          await this.countdown(Math.max(5, (this.settings.rest || 25) - 4), tok, { label: 'Pihenő' });
          await this.say(PH.continue, tok);
          if (r.sides === 'each') this.stage.setExercise(ex.id, 'L', { pose: 'start', dur: 1.5 });
        }
      }
      this.ui.step && this.ui.step([]);
      this.stage.to('start', 1.5);
      this.voice.gong();
      await this.say(PH.well_done, tok);
      await this.delay(1.5, tok);
    }

    async runSeq(ex, side, rep, tok) {
      for (const it of ex.seq) {
        if (it.once && (rep > 1 || this.spoken.has('once:' + ex.seq.indexOf(it)))) continue;
        if (it.once) this.spoken.add('once:' + ex.seq.indexOf(it));
        await this.doItem(ex, it, side, rep, tok);
      }
    }

    async doItem(ex, it, side, rep, tok) {
      this.check(tok);
      await this.waitResume();
      const st = it.st == null ? null : [].concat(it.st);
      if (st) { this.emit({ stepIdx: st }); this.ui.step && this.ui.step(st); }
      const mode = this.settings.detail;
      let texts = [];
      if (st && (mode === 'all' || (mode === 'first' && st.some(s => !this.spoken.has(s))))) {
        texts = st.map(s => ex.steps[s]);
        st.forEach(s => this.spoken.add(s));
      } else if (it.cue) texts = [it.cue];
      const full = texts.length && texts[0] !== it.cue;

      const anim = it.pose ? this.stage.to(it.pose, it.t || 1, side) : null;
      const speech = (async () => { for (const t of texts) await this.say(t, tok); })();
      speech.catch(() => {});

      if (it.hold) {
        const t0 = performance.now();
        if (anim) await this.delay(it.t || 1, tok); // nem a renderelésre várunk (háttérfülön az nem fut)
        await speech;
        const elapsed = (performance.now() - t0) / 1000;
        const left = Math.max(2, Math.round(it.hold - (full ? 0 : elapsed)));
        this.voice.beep(988, 0.12);
        await this.countdown(left, tok, { label: 'Tartsd', speakFrom: Math.min(5, left) });
        return;
      }
      const waits = [this.delay(it.t || 0, tok)];
      if (!it.nw || full) waits.push(speech);
      await Promise.all(waits);
      this.check(tok);
    }
  }

  window.GYTRunner = Runner;
})();
