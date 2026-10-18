/* 3D wireframe báb (Three.js r128, globális THREE).
 * Pózparaméterek fokban; a test feje mindig a -Z irányba néz a matracon.
 */
(function () {
  const D2R = Math.PI / 180;

  // --- Pózparaméterek kulcsai (lapos formában animálhatók) ---
  const KEYS = [
    'root.x', 'root.y', 'root.z',
    'spine.flex', 'spine.side', 'spine.twist',
    'neck.flex', 'neck.side', 'neck.twist',
    'lSh.flex', 'lSh.abd', 'lSh.rot', 'rSh.flex', 'rSh.abd', 'rSh.rot',
    'lEl', 'rEl',
    'lHip.flex', 'lHip.abd', 'lHip.rot', 'rHip.flex', 'rHip.abd', 'rHip.rot',
    'lKn', 'rKn', 'lAn', 'rAn', 'lWr', 'rWr', 'lSh.h', 'rSh.h', 'breath'
  ];

  function flatten(pose) {
    const out = {};
    for (const k of KEYS) {
      const [a, b] = k.split('.');
      const v = pose[a];
      if (b) out[k] = v && typeof v === 'object' && v[b] != null ? v[b] : 0;
      else out[k] = typeof v === 'number' ? v : 0;
    }
    return out;
  }

  // --- Geometria segédek ---
  function limbGeometry(L, r0, r1, bulge) {
    const pts = [];
    const capN = 6, bodyN = 14;
    for (let i = 0; i <= capN; i++) { // felső félgömb
      const a = (i / capN) * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.max(0.0001, r0 * Math.sin(a)), r0 * Math.cos(a)));
    }
    for (let i = 1; i < bodyN; i++) {
      const t = i / bodyN;
      const r = r0 + (r1 - r0) * t + bulge * Math.sin(Math.PI * Math.pow(t, 0.8));
      pts.push(new THREE.Vector2(r, -t * L));
    }
    for (let i = 0; i <= capN; i++) { // alsó félgömb
      const a = (i / capN) * Math.PI / 2;
      pts.push(new THREE.Vector2(Math.max(0.0001, r1 * Math.cos(a)), -L - r1 * Math.sin(a)));
    }
    return new THREE.LatheGeometry(pts, 14);
  }

  class Mannequin {
    constructor(scene) {
      this.scene = scene;
      this.segments = [];
      this.points = {};
      this.solidMat = new THREE.MeshStandardMaterial({ color: 0xe9eef4, roughness: 0.55, metalness: 0.05, transparent: true, opacity: 0.92 });
      this.wireMat = new THREE.LineBasicMaterial({ color: 0x1f6f8b, transparent: true, opacity: 0.32 });
      this.hlSolidMat = new THREE.MeshStandardMaterial({ color: 0xffd9b8, roughness: 0.5, metalness: 0.05, transparent: true, opacity: 0.95 });
      this.hlWireMat = new THREE.LineBasicMaterial({ color: 0xd9622b, transparent: true, opacity: 0.5 });
      this.build();
    }

    addMesh(parent, geo, name, pos, scale) {
      const m = new THREE.Mesh(geo, this.solidMat);
      if (pos) m.position.set(pos[0], pos[1], pos[2]);
      if (scale) m.scale.set(scale[0], scale[1], scale[2]);
      m.castShadow = true;
      const w = new THREE.LineSegments(new THREE.WireframeGeometry(geo), this.wireMat);
      m.add(w);
      m.userData.wire = w;
      m.name = name;
      parent.add(m);
      return m;
    }

    ell(parent, name, center, radii) {
      const m = this.addMesh(parent, this.sphereGeo, name, center, radii);
      this.segments.push({ name, kind: 'ell', mesh: m });
      return m;
    }

    limb(jointA, jointB, name, L, r0, r1, bulge) {
      const m = this.addMesh(jointA, limbGeometry(L, r0, r1, bulge), name);
      this.segments.push({ name, kind: 'cap', a: jointA, b: jointB, r0, r1, mesh: m });
      return m;
    }

    joint(parent, name, pos) {
      const g = new THREE.Group();
      g.name = name;
      g.position.set(pos[0], pos[1], pos[2]);
      parent.add(g);
      this.points[name] = g;
      return g;
    }

    build() {
      this.sphereGeo = new THREE.SphereGeometry(1, 18, 12);
      const root = new THREE.Group();
      root.name = 'root';
      root.rotation.order = 'XYZ';
      this.root = root;
      this.scene.add(root);
      this.points.pelvis = root;

      // Törzs
      this.ell(root, 'pelvis', [0, -0.015, 0], [0.155, 0.1, 0.11]);
      const spineLow = this.joint(root, 'spineLow', [0, 0.07, 0]);
      this.ell(spineLow, 'abdomen', [0, 0.08, 0.005], [0.132, 0.12, 0.098]);
      const chest = this.joint(spineLow, 'chest', [0, 0.17, 0]);
      this.ell(chest, 'chest', [0, 0.1, 0.0], [0.168, 0.165, 0.112]);
      const neck = this.joint(chest, 'neck', [0, 0.24, -0.01]);
      const head = this.joint(neck, 'head', [0, 0.08, 0]);
      this.ell(neck, 'neckSeg', [0, 0.035, 0], [0.05, 0.065, 0.05]);
      const headMesh = this.ell(head, 'head', [0, 0.1, 0.012], [0.078, 0.108, 0.094]);
      // orr, hogy látszódjon merre néz
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.035, 8), this.solidMat);
      nose.rotation.x = Math.PI / 2;
      nose.position.set(0, -0.05, 1.0);
      nose.scale.set(1 / 0.078, 1 / 0.108, 1 / 0.094);
      headMesh.add(nose);
      this.joint(head, 'headTop', [0, 0.21, 0]);

      // Karok
      for (const s of ['l', 'r']) {
        const sx = s === 'l' ? 1 : -1;
        const shBase = this.joint(chest, s + 'ShBase', [0.17 * sx, 0.175, -0.01]);
        const sh = this.joint(shBase, s + 'Shoulder', [0, 0, 0]);
        sh.rotation.order = 'XZY';
        const el = this.joint(sh, s + 'Elbow', [0, -0.29, 0]);
        const wr = this.joint(el, s + 'Wrist', [0, -0.255, 0]);
        this.limb(sh, el, s + 'UpperArm', 0.29, 0.05, 0.038, 0.007);
        this.limb(el, wr, s + 'Forearm', 0.255, 0.038, 0.027, 0.007);
        this.ell(wr, s + 'Hand', [0, -0.08, 0], [0.044, 0.085, 0.024]);
        this.joint(wr, s + 'HandTip', [0, -0.16, 0]);
        this.ell(sh, s + 'Delt', [0.012 * sx, -0.01, 0], [0.062, 0.06, 0.06]);

        const hip = this.joint(root, s + 'Hip', [0.088 * sx, -0.065, 0]);
        hip.rotation.order = 'XZY';
        const kn = this.joint(hip, s + 'Knee', [0, -0.44, 0]);
        const an = this.joint(kn, s + 'Ankle', [0, -0.42, 0]);
        this.limb(hip, kn, s + 'Thigh', 0.44, 0.078, 0.05, 0.01);
        this.limb(kn, an, s + 'Shin', 0.42, 0.05, 0.032, 0.013);
        this.ell(an, s + 'Foot', [0, -0.045, 0.06], [0.044, 0.035, 0.125]);
        this.joint(an, s + 'Toe', [0, -0.06, 0.18]);
        this.joint(an, s + 'Heel', [0, -0.07, -0.05]);
      }
      this.segMap = {};
      for (const sg of this.segments) this.segMap[sg.name] = sg;
    }

    setHighlight(names) {
      const set = new Set(names || []);
      for (const sg of this.segments) {
        const hl = set.has(sg.name);
        sg.mesh.material = hl ? this.hlSolidMat : this.solidMat;
        sg.mesh.userData.wire.material = hl ? this.hlWireMat : this.wireMat;
      }
    }

    // Lapos paraméterek alkalmazása a csontokra
    applyFlat(p, rootXOffset) {
      const P = this.points;
      this.root.rotation.set((p['root.x'] + (rootXOffset || 0)) * D2R, p['root.y'] * D2R, p['root.z'] * D2R);
      const sf = p['spine.flex'], ss = p['spine.side'], st = p['spine.twist'];
      P.spineLow.rotation.set(sf * 0.45 * D2R, st * 0.4 * D2R, -ss * 0.45 * D2R);
      P.chest.rotation.set(sf * 0.55 * D2R, st * 0.6 * D2R, -ss * 0.55 * D2R);
      P.neck.rotation.set(p['neck.flex'] * 0.5 * D2R, p['neck.twist'] * 0.5 * D2R, -p['neck.side'] * 0.5 * D2R);
      P.head.rotation.set(p['neck.flex'] * 0.5 * D2R, p['neck.twist'] * 0.5 * D2R, -p['neck.side'] * 0.5 * D2R);
      const br = p['breath'] || 0; // légzés: has és mellkas tágulása
      this.segMap.abdomen.mesh.scale.z = 0.098 * (1 + 0.22 * br);
      this.segMap.chest.mesh.scale.z = 0.112 * (1 + 0.06 * br);
      for (const s of ['l', 'r']) {
        const m = s === 'l' ? 1 : -1;
        P[s + 'ShBase'].rotation.set(0, m * p[s + 'Sh.h'] * D2R, 0);
        P[s + 'Shoulder'].rotation.set(-p[s + 'Sh.flex'] * D2R, m * p[s + 'Sh.rot'] * D2R, m * p[s + 'Sh.abd'] * D2R);
        P[s + 'Elbow'].rotation.set(-p[s + 'El'] * D2R, 0, 0);
        P[s + 'Wrist'].rotation.set(-p[s + 'Wr'] * D2R, 0, 0);
        P[s + 'Hip'].rotation.set(-p[s + 'Hip.flex'] * D2R, m * p[s + 'Hip.rot'] * D2R, m * p[s + 'Hip.abd'] * D2R);
        P[s + 'Knee'].rotation.set(p[s + 'Kn'] * D2R, 0, 0);
        P[s + 'Ankle'].rotation.set(-p[s + 'An'] * D2R, 0, 0);
      }
      this.root.position.set(0, 0, 0);
      this.root.updateMatrixWorld(true);
    }

    segMinY(sg) {
      if (sg.kind === 'ell') {
        const e = sg.mesh.matrixWorld.elements;
        return e[13] - Math.sqrt(e[1] * e[1] + e[5] * e[5] + e[9] * e[9]);
      }
      const a = this._v1.setFromMatrixPosition(sg.a.matrixWorld).y - sg.r0;
      const b = this._v2.setFromMatrixPosition(sg.b.matrixWorld).y - sg.r1;
      return Math.min(a, b);
    }

    groupMin(names, offs, skip) {
      let m = Infinity;
      for (const sg of this.segments) {
        if (names && !names.includes(sg.name)) continue;
        if (!names && skip && skip.includes(sg.name)) continue;
        const v = this.segMinY(sg) - ((offs && offs[sg.name]) || 0);
        if (v < m) m = v;
      }
      return m;
    }

    /* Kulcspóz feloldása: a törzs billentése (level) és a talajmagasság kiszámítása.
     * cfg: { level:{a:[],b:[]}, groundOff:{seg:h}, groundSkip:[seg] }
     * Visszaad: lapos paraméterek, ahol 'root.x' már billentett, és '_y' a medence magassága. */
    resolve(flat, cfg) {
      this._v1 = this._v1 || new THREE.Vector3();
      this._v2 = this._v2 || new THREE.Vector3();
      cfg = cfg || {};
      const offs = cfg.groundOff || {};
      let dx = 0;
      if (cfg.level) {
        // root billentése (világ X tengely körül), amíg mindkét kontaktcsoport a talajon nem lesz
        const f = (d) => {
          this.applyFlat(flat, d);
          return this.groupMin(cfg.level.a, offs) - this.groupMin(cfg.level.b, offs);
        };
        // gyökkeresés: rácson előjelváltás a 0-hoz legközelebb, majd felezés
        let best = null;
        let prevD = -70, prevF = f(-70);
        for (let d = -65; d <= 70; d += 5) {
          const fd = f(d);
          if ((prevF <= 0) !== (fd <= 0)) {
            const mid = Math.abs(prevD + d) / 2;
            if (!best || mid < best.mid) best = { lo: prevD, flo: prevF, hi: d, mid };
          }
          prevD = d; prevF = fd;
        }
        if (best) {
          let lo = best.lo, hi = best.hi, flo = best.flo;
          for (let i = 0; i < 22; i++) {
            const m = (lo + hi) / 2, fm = f(m);
            if ((fm <= 0) === (flo <= 0)) { lo = m; flo = fm; } else hi = m;
          }
          dx = (lo + hi) / 2;
        }
      }
      const out = Object.assign({}, flat);
      out['root.x'] = flat['root.x'] + dx;
      this.applyFlat(out, 0);
      out._y = -this.groupMin(null, offs, cfg.groundSkip);
      return out;
    }

    /* Feloldott (esetleg interpolált) póz megjelenítése; a talajba süllyedést megakadályozza. */
    place(res, cfg) {
      cfg = cfg || {};
      this.applyFlat(res, 0);
      const minY = this.groupMin(null, cfg.groundOff || {}, cfg.groundSkip);
      this.root.position.y = Math.max(res._y, -minY - 0.002);
      this.root.updateMatrixWorld(true);
    }

    worldPos(name, target) {
      const o = this.points[name];
      return (target || new THREE.Vector3()).setFromMatrixPosition(o.matrixWorld);
    }
  }

  // --- Kellékek ---
  class Props {
    constructor(scene, fig) {
      this.scene = scene;
      this.fig = fig;
      this.items = [];
      this.group = new THREE.Group();
      scene.add(this.group);
      this.mats = {
        ball: new THREE.MeshStandardMaterial({ color: 0xf2a65a, roughness: 0.6 }),
        fitball: new THREE.MeshStandardMaterial({ color: 0x5aa0d8, roughness: 0.45, transparent: true, opacity: 0.85 }),
        block: new THREE.MeshStandardMaterial({ color: 0x8e7cc3, roughness: 0.8 }),
        band: new THREE.MeshStandardMaterial({ color: 0xe2574c, roughness: 0.5 }),
        slider: new THREE.MeshStandardMaterial({ color: 0x3d9970, roughness: 0.5 }),
        pillow: new THREE.MeshStandardMaterial({ color: 0xd7d2c8, roughness: 0.9 }),
        wood: new THREE.MeshStandardMaterial({ color: 0xc8a06a, roughness: 0.7 })
      };
      this.tmp = new THREE.Vector3();
      this.tmp2 = new THREE.Vector3();
    }

    clear() {
      for (const it of this.items) this.group.remove(it.obj);
      this.items = [];
    }

    wire(mesh, color) {
      const w = new THREE.LineSegments(new THREE.WireframeGeometry(mesh.geometry), new THREE.LineBasicMaterial({ color: color || 0x000000, transparent: true, opacity: 0.12 }));
      mesh.add(w);
    }

    /* spec: {type, at:[joint,...], off:[x,y,z], ...} */
    set(list) {
      this.clear();
      for (const spec of list || []) {
        let obj;
        switch (spec.type) {
          case 'ball': {
            const r = spec.r || 0.1;
            obj = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), this.mats.ball);
            this.wire(obj);
            break;
          }
          case 'fitball': {
            const r = spec.r || 0.3;
            obj = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), this.mats.fitball);
            this.wire(obj, 0x1a4d7a);
            break;
          }
          case 'block': {
            const s = spec.size || [0.15, 0.08, 0.23];
            obj = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), this.mats.block);
            this.wire(obj);
            break;
          }
          case 'pillow': {
            const s = spec.size || [0.32, 0.05, 0.22];
            obj = new THREE.Mesh(new THREE.BoxGeometry(s[0], s[1], s[2]), this.mats.pillow);
            break;
          }
          case 'slider': {
            obj = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.012, 24), this.mats.slider);
            break;
          }
          case 'stretch': { // két pont közé feszített szalag
            obj = new THREE.Mesh(new THREE.CylinderGeometry(spec.r || 0.008, spec.r || 0.008, 1, 8), this.mats.band);
            break;
          }
          case 'wallbars': {
            obj = new THREE.Group();
            const w = 0.9, h = 2.2;
            for (const sx of [-1, 1]) {
              const post = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.05), this.mats.wood);
              post.position.set(sx * w / 2, h / 2, 0);
              obj.add(post);
            }
            for (let i = 0; i < 14; i++) {
              const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, w, 8), this.mats.wood);
              rung.rotation.z = Math.PI / 2;
              rung.position.set(0, 0.12 + i * 0.15, 0);
              obj.add(rung);
            }
            break;
          }
        }
        if (!obj) continue;
        obj.castShadow = true;
        this.group.add(obj);
        this.items.push({ spec, obj });
      }
      this.update();
    }

    avg(names, out) {
      out.set(0, 0, 0);
      for (const n of names) out.add(this.fig.worldPos(n, this.tmp2));
      return out.multiplyScalar(1 / names.length);
    }

    update() {
      for (const { spec, obj } of this.items) {
        const off = spec.off || [0, 0, 0];
        if (spec.type === 'stretch') {
          const a = spec.fromFixed ? this.tmp.set(...spec.fromFixed) : this.avg(spec.from, this.tmp);
          const b = this.avg(spec.to, new THREE.Vector3());
          const mid = a.clone().add(b).multiplyScalar(0.5);
          const len = a.distanceTo(b);
          obj.position.copy(mid);
          obj.scale.set(1, Math.max(0.001, len), 1);
          obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
          continue;
        }
        if (spec.fixed) { obj.position.set(...spec.fixed); continue; }
        const p = this.avg(spec.at, this.tmp);
        p.x += off[0]; p.z += off[2];
        if (spec.floor) p.y = spec.floor; // talajhoz rögzített magasság
        else p.y += off[1];
        obj.position.copy(p);
      }
    }
  }

  window.GYTFigure = { Mannequin, Props, flatten, KEYS };
})();
