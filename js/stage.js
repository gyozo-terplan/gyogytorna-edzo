/* 3D színpad: jelenet, kamera, báb, kellékek és pózanimáció. */
(function () {
  const { Mannequin, Props, flatten } = window.GYTFigure;
  const { EX, mirror, mirrorProps } = window.GYT_POSES;

  const swapLR = (n) => /^l[A-Z]/.test(n) ? 'r' + n.slice(1) : /^r[A-Z]/.test(n) ? 'l' + n.slice(1) : n;
  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  class Stage {
    constructor(container) {
      this.container = container;
      this.clock = { now: 0 }; // külső óra (szüneteltethető)
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(this.renderer.domElement);

      const scene = this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(38, 1, 0.05, 50);
      this.camera.position.set(2.4, 1.3, 0.8);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.75));
      const dir = new THREE.DirectionalLight(0xffffff, 0.75);
      dir.position.set(1.5, 3.5, 1.2);
      dir.castShadow = true;
      dir.shadow.mapSize.set(1024, 1024);
      Object.assign(dir.shadow.camera, { left: -2, right: 2, top: 2, bottom: -2, near: 0.5, far: 8 });
      dir.shadow.radius = 4;
      scene.add(dir);
      const fill = new THREE.DirectionalLight(0xdfe8ff, 0.3);
      fill.position.set(-2, 1.5, -1);
      scene.add(fill);

      // padló + matrac
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.ShadowMaterial({ opacity: 0.16 }));
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);
      const grid = new THREE.GridHelper(8, 32, 0x9aa7b4, 0xc9d2db);
      grid.material.transparent = true;
      grid.material.opacity = 0.35;
      grid.position.y = -0.001;
      scene.add(grid);
      this.grid = grid;
      const mat = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.008, 1.9), new THREE.MeshStandardMaterial({ color: 0x7fb7b0, roughness: 0.95, transparent: true, opacity: 0.55 }));
      mat.position.set(0, -0.004, 0.15);
      mat.receiveShadow = true;
      scene.add(mat);

      this.fig = new Mannequin(scene);
      this.props = new Props(scene, this.fig);

      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.minDistance = 1.0;
      this.controls.maxDistance = 6;
      this.controls.maxPolarAngle = Math.PI * 0.495;
      this.controls.target.set(0, 0.3, 0.1);
      this.camGoal = null;

      this.cache = {};
      this.cur = null;     // aktuális feloldott póz
      this.cfg = {};
      this.tween = null;
      this.exId = null;
      this.side = 'L';

      this.resize();
      window.addEventListener('resize', () => this.resize());
      if (window.ResizeObserver) { this._ro = new ResizeObserver(() => this.resize()); this._ro.observe(container); }
      this._last = performance.now();
      this.loop = this.loop.bind(this);
      requestAnimationFrame(this.loop);
    }

    /* A vászon áthelyezése másik nézetbe (egy WebGL kontextus az egész appban) */
    attach(host) {
      if (this.container === host) return;
      host.appendChild(this.renderer.domElement);
      this.container = host;
      if (window.ResizeObserver) {
        if (this._ro) this._ro.disconnect();
        this._ro = new ResizeObserver(() => this.resize());
        this._ro.observe(host);
      }
      this.resize();
    }

    resize() {
      const w = this.container.clientWidth || 300, h = this.container.clientHeight || 300;
      this.renderer.setSize(w, h, false);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
    }

    def(exId) { return EX[exId]; }

    rawPose(exId, name, side) {
      const d = EX[exId];
      if (!d) return null;
      let p = d.poses[name] || d.poses.start;
      if (side === 'R') p = mirror(p);
      return p;
    }

    resolved(exId, name, side) {
      const key = exId + '|' + name + '|' + side;
      if (!this.cache[key]) {
        const p = this.rawPose(exId, name, side);
        const cfg = p._cfg || {};
        this.cache[key] = { res: this.fig.resolve(flatten(p), cfg), cfg };
      }
      return this.cache[key];
    }

    /* Gyakorlat betöltése: kellékek, kiemelés, kamera, kiinduló póz */
    setExercise(exId, side, opts) {
      opts = opts || {};
      this.exId = exId;
      this.side = side || 'L';
      const d = EX[exId] || {};
      this.props.set(this.side === 'R' ? mirrorProps(d.props) : d.props);
      const hl = (d.hl || []).map(n => this.side === 'R' ? swapLR(n) : n);
      this.fig.setHighlight(opts.highlight === false ? [] : hl);
      const start = this.resolved(exId, opts.pose || 'start', this.side);
      if (opts.instant || !this.cur) {
        this.cur = Object.assign({}, start.res);
        this.cfg = start.cfg;
        this.tween = null;
      } else {
        this.to(opts.pose || 'start', opts.dur || 1.2);
      }
      const cam = d.cam || [2.4, 1.3, 0.8];
      const cx = this.side === 'R' ? -cam[0] : cam[0];
      // keskeny nézetben távolabb áll a kamera, hogy az egész test látsszon
      const k = Math.min(2.3, Math.max(1.05, 1.55 / Math.max(0.3, this.camera.aspect)));
      const base = new THREE.Vector3(0, 0.25, 0.1);
      const pos = new THREE.Vector3(cx, cam[1], cam[2] + 0.15).sub(base).multiplyScalar(k).add(base);
      this.camGoal = { pos, t: 0 };
      if (opts.instantCam) {
        this.camera.position.copy(this.camGoal.pos);
        this.camGoal = null;
      }
    }

    /* Oldal váltása mozgás nélkül (váltott oldalas gyakorlatokhoz): kiemelés és kellékek frissítése */
    setSideState(side) {
      if (side === this.side || !this.exId) return;
      this.side = side;
      const d = EX[this.exId] || {};
      this.props.set(side === 'R' ? mirrorProps(d.props) : d.props);
      this.fig.setHighlight((d.hl || []).map(n => side === 'R' ? swapLR(n) : n));
    }

    /* Animáció a megadott pózba; Promise a végén. */
    to(name, dur, side) {
      if (!this.exId) return Promise.resolve();
      const s = side || this.side;
      const target = this.resolved(this.exId, name, s);
      const from = Object.assign({}, this.cur);
      dur = Math.max(0.05, dur || 1);
      if (this.tween && this.tween.resolve) this.tween.resolve();
      return new Promise((resolve) => {
        this.tween = { from, to: target.res, cfg: target.cfg, t0: this.clock.now, dur, resolve };
      });
    }

    step(dt) {
      if (this.tween) {
        const tw = this.tween;
        let k = (this.clock.now - tw.t0) / tw.dur;
        if (k >= 1) k = 1;
        const e = ease(k);
        const out = {};
        for (const key in tw.to) out[key] = tw.from[key] + (tw.to[key] - tw.from[key]) * e;
        this.cur = out;
        this.cfg = tw.cfg;
        if (k >= 1) { this.tween = null; tw.resolve && tw.resolve(); }
      }
      if (this.cur) {
        this.fig.place(this.cur, this.cfg);
        this.props.update();
      }
      // kamera: lassan a test közepére fókuszál
      const c = this.fig.worldPos('pelvis').add(this.fig.worldPos('chest')).multiplyScalar(0.5);
      c.y = Math.max(0.15, c.y * 0.8);
      this.controls.target.lerp(c, Math.min(1, dt * 2.5));
      if (this.camGoal) {
        this.camGoal.t += dt;
        this.camera.position.lerp(this.camGoal.pos, Math.min(1, dt * 2.2));
        if (this.camGoal.t > 2.2) this.camGoal = null;
      }
      this.controls.update();
    }

    loop(t) {
      const raw = Math.max(0, (t - this._last) / 1000);
      const dt = Math.min(0.1, raw);
      this._last = t;
      // valós idő szerint halad (ritka képkockáknál se maradjon le a mozdulat a hangtól)
      if (!this.paused) this.clock.now += Math.min(raw, 5);
      this.step(dt);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(this.loop);
    }
  }

  window.GYTStage = Stage;
})();
