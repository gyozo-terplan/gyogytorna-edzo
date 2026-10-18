/* Hangmotor.
 * 1) Előre generált neurális hangfájlok (audio/manifest.js → window.GYT_AUDIO = { voice, files: { "szöveg": "fájl.mp3" } })
 * 2) Tartalék: böngésző beszédszintézis, a legjobb elérhető magyar hanggal (pl. Edge: „Microsoft Noémi Online (Natural)”).
 */
(function () {
  const STOPPED = 'stopped';

  function norm(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  class Voice {
    constructor() {
      this.settings = { engine: 'auto', voiceURI: '', rate: 1, volume: 1, beeps: true };
      this.manifest = (window.GYT_AUDIO && window.GYT_AUDIO.files) || {};
      this.clipCount = Object.keys(this.manifest).length;
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.queue = [];
      this.busy = false;
      this.current = null;
      this.voices = [];
      this.onCaption = null;
      this.synth = window.speechSynthesis || null;
      if (this.synth) {
        const load = () => { this.voices = this.synth.getVoices(); if (this.onVoices) this.onVoices(); };
        load();
        this.synth.onvoiceschanged = load;
      }
      this.ctx = null;
    }

    configure(s) { Object.assign(this.settings, s || {}); }

    huVoices() {
      return this.voices.filter(v => /^hu/i.test(v.lang));
    }

    scoreVoice(v) {
      let s = 0;
      if (/natural|neural|online/i.test(v.name)) s += 20;
      if (/google/i.test(v.name)) s += 8;
      if (/noémi|noemi/i.test(v.name)) s += 3;
      if (!v.localService) s += 2;
      return s;
    }

    bestVoice() {
      const hu = this.huVoices();
      if (this.settings.voiceURI) {
        const v = hu.find(x => x.voiceURI === this.settings.voiceURI);
        if (v) return v;
      }
      return hu.sort((a, b) => this.scoreVoice(b) - this.scoreVoice(a))[0] || null;
    }

    clipFor(text) {
      if (this.settings.engine === 'browser') return null;
      return this.manifest[norm(text)] || null;
    }

    engineInfo() {
      const v = this.bestVoice();
      return {
        clips: this.clipCount,
        clipVoice: (window.GYT_AUDIO && window.GYT_AUDIO.voice) || '',
        browserVoice: v ? v.name : '',
        browserNatural: v ? /natural|neural|online|google/i.test(v.name) : false
      };
    }

    /* Szöveg kimondása; Promise → 'done' vagy 'stopped' */
    speak(text) {
      text = norm(text);
      if (!text) return Promise.resolve('done');
      return new Promise((resolve) => {
        this.queue.push({ text, resolve });
        this._pump();
      });
    }

    get idle() { return !this.busy && this.queue.length === 0; }

    _pump() {
      if (this.busy || !this.queue.length) return;
      const item = this.queue.shift();
      this.busy = true;
      this.current = item;
      if (this.onCaption) this.onCaption(item.text);
      const done = (r) => {
        if (this.current !== item) return;
        clearTimeout(item.timer);
        this.current = null;
        this.busy = false;
        item.resolve(r || 'done');
        this._pump();
      };
      item.finish = done;
      // biztonsági időkorlát (ha egy motor nem jelez véget)
      item.timer = setTimeout(() => done('done'), 4000 + item.text.length * 140 / (this.settings.rate || 1));

      const clip = this.clipFor(item.text);
      if (clip) {
        const a = this.audio;
        a.onended = () => done('done');
        a.onerror = () => { this._synth(item, done); };
        a.src = 'audio/' + clip;
        a.playbackRate = this.settings.rate || 1;
        a.volume = this.settings.volume;
        const p = a.play();
        if (p && p.catch) p.catch(() => this._synth(item, done));
      } else {
        this._synth(item, done);
      }
    }

    _synth(item, done) {
      if (!this.synth) { setTimeout(() => done('done'), 300 + item.text.length * 60); return; }
      const u = new SpeechSynthesisUtterance(item.text);
      const v = this.bestVoice();
      if (v) u.voice = v;
      u.lang = v ? v.lang : 'hu-HU';
      u.rate = this.settings.rate || 1;
      u.volume = this.settings.volume;
      u.onend = () => done('done');
      u.onerror = () => done('done');
      item.utt = u; // Chrome: ne szemetelje ki
      this.synth.speak(u);
    }

    /* Minden beszéd leállítása; a várakozók 'stopped' választ kapnak. */
    stop() {
      const pending = this.queue.splice(0);
      for (const q of pending) q.resolve(STOPPED);
      if (this.current) {
        const cur = this.current;
        try { this.audio.pause(); } catch (e) { /* nincs teendő */ }
        if (this.synth) this.synth.cancel();
        clearTimeout(cur.timer);
        this.current = null;
        this.busy = false;
        cur.resolve(STOPPED);
      }
    }

    // --- rövid hangjelzések (Web Audio) ---
    _ctx() {
      if (!this.ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        this.ctx = new C();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    }

    unlock() { this._ctx(); try { this.audio.play().catch(() => {}); this.audio.pause(); } catch (e) { /* ok */ } }

    beep(freq, dur, vol) {
      if (!this.settings.beeps || !(this.settings.volume > 0.01)) return;
      try {
        const ctx = this._ctx();
        if (!ctx) return;
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq || 880;
        const t = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, (vol || 0.12) * this.settings.volume), t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.15));
        o.connect(g).connect(ctx.destination);
        o.start(t);
        o.stop(t + (dur || 0.15) + 0.05);
      } catch (e) { /* a hangjelzés sosem állíthatja meg az edzést */ }
    }

    gong() {
      this.beep(523, 0.6, 0.1);
      setTimeout(() => this.beep(784, 0.8, 0.08), 120);
    }
  }

  Voice.STOPPED = STOPPED;
  window.GYTVoice = Voice;
})();
