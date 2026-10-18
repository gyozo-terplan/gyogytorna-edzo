/* Kulcspózok a bábhoz. Minden szög fokban.
 * Alapkonvenció: a bal (l) oldali végtag dolgozik; a jobb oldal tükrözéssel készül.
 * root: x/y/z a test tájolása (fej mindig -Z felé): hanyatt {x:-90}, hason {x:-90,y:180}, jobb oldalon fekve {x:-90,y:-90}
 * spine/neck: flex (+ előrehajlás), side, twist
 * lSh: flex (+ előre/fel), abd (+ oldalra), rot (forgatás), h (vízszintes hátra)  · lEl: könyökhajlítás · lWr: csukló
 * lHip: flex, abd, rot · lKn: térdhajlítás · lAn: + pipa / – spicc · breath: 0..1 légzés
 * Póz szintű beállítás (_cfg): level {a,b} – a törzs billentése, hogy mindkét kontaktcsoport a talajon legyen;
 *   groundOff {szegmens: magasság} – kellékre támaszkodó testrész; groundSkip – figyelmen kívül hagyott szegmensek.
 */
(function () {
  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }
  function merge(a, b) {
    const out = Object.assign({}, a);
    for (const k in b) out[k] = isObj(b[k]) && isObj(a[k]) ? merge(a[k], b[k]) : b[k];
    return out;
  }
  function P(...parts) { return parts.reduce((acc, p) => merge(acc, p || {}), {}); }

  const SWAP = { lSh: 'rSh', rSh: 'lSh', lEl: 'rEl', rEl: 'lEl', lHip: 'rHip', rHip: 'lHip', lKn: 'rKn', rKn: 'lKn', lAn: 'rAn', rAn: 'lAn', lWr: 'rWr', rWr: 'lWr' };
  function swapName(n) {
    if (typeof n !== 'string') return n;
    if (/^l[A-Z]/.test(n)) return 'r' + n.slice(1);
    if (/^r[A-Z]/.test(n)) return 'l' + n.slice(1);
    return n;
  }
  function mirrorCfg(cfg) {
    if (!cfg) return cfg;
    const out = {};
    if (cfg.level) out.level = { a: cfg.level.a.map(swapName), b: cfg.level.b.map(swapName) };
    if (cfg.groundOff) { out.groundOff = {}; for (const k in cfg.groundOff) out.groundOff[swapName(k)] = cfg.groundOff[k]; }
    if (cfg.groundSkip) out.groundSkip = cfg.groundSkip.map(swapName);
    return out;
  }
  function mirror(p) {
    const out = {};
    for (const k in p) {
      if (k === '_cfg') { out._cfg = mirrorCfg(p._cfg); continue; }
      const nk = SWAP[k] || k;
      out[nk] = isObj(p[k]) ? Object.assign({}, p[k]) : p[k];
    }
    for (const k of ['spine', 'neck']) if (out[k]) { out[k] = Object.assign({}, out[k]); if (out[k].side) out[k].side *= -1; if (out[k].twist) out[k].twist *= -1; }
    if (out.root) { out.root = Object.assign({}, out.root); if (out.root.y) out.root.y = -out.root.y; if (out.root.z) out.root.z *= -1; }
    return out;
  }
  function mirrorProps(list) {
    return (list || []).map(s => {
      const o = Object.assign({}, s);
      if (o.at) o.at = o.at.map(swapName);
      if (o.from) o.from = o.from.map(swapName);
      if (o.to) o.to = o.to.map(swapName);
      if (o.off) o.off = [-o.off[0], o.off[1], o.off[2]];
      if (o.fixed) o.fixed = [-o.fixed[0], o.fixed[1], o.fixed[2]];
      if (o.fromFixed) o.fromFixed = [-o.fromFixed[0], o.fromFixed[1], o.fromFixed[2]];
      return o;
    });
  }

  // ---------- Alaphelyzetek ----------
  const B = {};
  B.supine = { root: { x: -90 }, lSh: { abd: 7 }, rSh: { abd: 7 }, lAn: -18, rAn: -18, lWr: 0, rWr: 0 };
  // horogfekvés: térdek hajlítva, talpak a talajon
  B.hook = P(B.supine, { lHip: { flex: 50, abd: 3 }, rHip: { flex: 50, abd: 3 }, lKn: 105, rKn: 105, lAn: -35, rAn: -35,
    _cfg: { level: { a: ['pelvis', 'chest'], b: ['lFoot', 'rFoot'] } } });
  // döglött bogár kiinduló helyzet
  B.bug = P(B.supine, { lSh: { flex: 90, abd: 4 }, rSh: { flex: 90, abd: 4 }, lHip: { flex: 90 }, rHip: { flex: 90 }, lKn: 90, rKn: 90, lAn: -15, rAn: -15 });
  // híd (medence fent) – a törzs dőlését a level számolja
  B.bridgeArms = { lSh: { flex: 90, abd: 3 }, rSh: { flex: 90, abd: 3 } };
  B.bridge = P(B.hook, { lHip: { flex: 8 }, rHip: { flex: 8 }, lKn: 95, rKn: 95, lAn: -12, rAn: -12, neck: { flex: 25 },
    _cfg: { level: { a: ['chest', 'head'], b: ['lFoot', 'rFoot'] } } });

  B.prone = { root: { x: -90, y: 180 }, lSh: { abd: 6, rot: 0 }, rSh: { abd: 6, rot: 0 }, lAn: -65, rAn: -65, neck: { flex: 4 } };
  B.quad = { root: { x: -90, y: 180 }, lHip: { flex: 90, abd: 2 }, rHip: { flex: 90, abd: 2 }, lKn: 105, rKn: 105, lAn: -20, rAn: -20,
    lSh: { flex: 90, abd: 3 }, rSh: { flex: 90, abd: 3 }, lWr: 85, rWr: 85, spine: { flex: -6 },
    _cfg: { level: { a: ['lHand', 'rHand'], b: ['lShin', 'rShin'] } } };
  // lebegő tigris: térdek ~2 cm-re a talaj felett
  B.hover = P(B.quad, { lHip: { flex: 88 }, rHip: { flex: 88 }, lKn: 100, rKn: 100, lAn: -15, rAn: -15,
    _cfg: { level: { a: ['lHand', 'rHand'], b: ['lFoot', 'rFoot'] }, groundSkip: ['lShin', 'rShin'] } });

  // jobb oldalon fekve, a bal (felső) oldal dolgozik
  B.side = { root: { x: -90, y: -90 }, rSh: { flex: 175, abd: 8 }, rEl: 10, lSh: { abd: 2 }, lHip: { abd: 4 }, rHip: { abd: 0 }, lAn: -20, rAn: -20, neck: { side: 8 } };

  // ---------- Gyakorlatok ----------
  const EX = {};

  EX.e01 = {
    cam: [2.4, 1.2, 0.9],
    hl: ['lThigh', 'lShin', 'lFoot'],
    poses: {
      start: P(B.supine, { lHip: { flex: 112 }, lKn: 100, lAn: -10, lSh: { flex: 48, abd: 0 }, lEl: 30, rSh: { flex: 50, abd: -14 }, rEl: 30, rAn: -10 }),
    }
  };
  EX.e01.poses.pipa = P(EX.e01.poses.start, { lAn: 22 });
  EX.e01.poses.nyujt = P(EX.e01.poses.start, { lHip: { flex: 98 }, lKn: 8, lAn: -40 });

  EX.e02 = {
    cam: [2.4, 1.1, 0.4],
    hl: ['chest', 'lUpperArm', 'rUpperArm'],
    props: [
      { type: 'ball', r: 0.09, at: ['chest'], off: [0, 0, 0.05], floor: 0.09 },
      { type: 'block', size: [0.23, 0.08, 0.15], at: ['head'], floor: 0.04, off: [0, 0, 0] }
    ],
    poses: {
      start: P(B.hook, { root: { x: -80 }, spine: { flex: -14 }, neck: { flex: 12 }, lHip: { flex: 60 }, rHip: { flex: 60 }, lKn: 110, rKn: 110,
        _cfg: { level: null, groundOff: { chest: 0.16, head: 0.08, neckSeg: 0.08 } } })
    }
  };
  EX.e02.poses.up = P(EX.e02.poses.start, { lSh: { flex: 168, abd: 10 }, rSh: { flex: 168, abd: 10 }, spine: { flex: -16 } });

  EX.e03 = {
    cam: [-2.2, 1.6, 0.6],
    hl: ['lUpperArm', 'lForearm', 'lDelt'],
    props: [{ type: 'ball', r: 0.075, at: ['lAnkle', 'rAnkle'], off: [0, 0, 0] }],
    poses: { start: P(B.side, { lHip: { abd: 5 } }) }
  };
  EX.e03.poses.up = P(EX.e03.poses.start, { lSh: { abd: 90 } });

  EX.e04 = {
    cam: [-2.2, 1.6, 0.6],
    hl: ['lUpperArm', 'lForearm', 'lDelt'],
    props: EX.e03.props,
    poses: {}
  };
  {
    const s = EX.e03.poses.start;
    EX.e04.poses.start = s;
    EX.e04.poses.up = P(s, { lSh: { abd: 90 } });
    EX.e04.poses.cA = P(s, { lSh: { abd: 90, h: -35 } });   // előre
    EX.e04.poses.cB = P(s, { lSh: { abd: 128 } });          // fej felé
    EX.e04.poses.cC = P(s, { lSh: { abd: 90, h: 35 } });    // hátra
    EX.e04.poses.cD = P(s, { lSh: { abd: 55 } });           // láb felé
  }

  EX.e05 = {
    cam: [2.3, 1.3, 0.6],
    hl: ['lThigh', 'lShin', 'rUpperArm', 'rForearm'],
    poses: { start: P(B.quad) }
  };
  EX.e05.poses.slide = P(B.quad, { lHip: { flex: 28 }, lKn: 0, lAn: 5, _cfg: { level: { a: ['lHand', 'rHand'], b: ['rShin'] } } });
  EX.e05.poses.lift = P(B.quad, { lHip: { flex: -2 }, lKn: 0, lAn: 20, rSh: { flex: 172, abd: 4 }, rWr: 0, _cfg: { level: { a: ['lHand'], b: ['rShin'] } } });

  EX.e06 = {
    cam: [2.3, 1.3, 0.6],
    hl: ['lThigh', 'lShin', 'rUpperArm', 'rForearm'],
    props: [{ type: 'ball', r: 0.07, at: ['rAnkle'], off: [0, 0, 0], floor: 0.07 }],
    poses: { start: P(B.quad, { _cfg: { level: { a: ['lHand', 'rHand'], b: ['lShin', 'rShin'] }, groundOff: { rFoot: 0.08 } } }) }
  };
  EX.e06.poses.slide = P(EX.e05.poses.slide, { _cfg: { level: { a: ['lHand', 'rHand'], b: ['rShin'] } } });
  EX.e06.poses.lift = P(EX.e05.poses.lift, { _cfg: { level: { a: ['lHand'], b: ['rShin'] } } });

  EX.e07 = {
    cam: [1.6, 1.3, 2.0],
    hl: ['pelvis', 'lThigh'],
    props: [{ type: 'block', size: [0.15, 0.09, 0.23], at: ['rKnee'], off: [0, 0, 0.05], floor: 0.045 }],
    poses: {
      start: P(B.quad, { root: { y: 170 }, spine: { twist: 10 }, lHip: { flex: 95, abd: 0 }, lKn: 95,
        _cfg: { level: { a: ['lHand', 'rHand'], b: ['rShin'] }, groundOff: { rShin: 0.09 }, groundSkip: ['lShin', 'lFoot', 'lThigh'] } })
    }
  };
  EX.e07.poses.level = P(EX.e07.poses.start, { root: { y: 180 }, spine: { twist: 0 }, lHip: { flex: 90 }, lKn: 90 });

  EX.e08 = {
    cam: [2.3, 1.3, 0.3],
    hl: ['lUpperArm', 'rUpperArm', 'chest'],
    props: [{ type: 'pillow', at: ['head'], floor: 0.025, size: [0.3, 0.05, 0.18] }],
    poses: { start: P(B.prone, { _cfg: { groundOff: { head: 0.05 } } }) }
  };
  EX.e08.poses.squeeze = P(EX.e08.poses.start, { lSh: { flex: -6 }, rSh: { flex: -6 } });
  EX.e08.poses.lift = P(EX.e08.poses.start, { lSh: { flex: -24 }, rSh: { flex: -24 } });

  const ARMS_NAPE = { lSh: { abd: 110, h: -40, rot: 75, flex: 0 }, rSh: { abd: 110, h: -40, rot: 75, flex: 0 }, lEl: 140, rEl: 140 };
  const ARMS_NAPE_UP = { lSh: { abd: 110, h: 40, rot: 150, flex: 0 }, rSh: { abd: 110, h: 40, rot: 150, flex: 0 }, lEl: 120, rEl: 120 };
  EX.e09 = {
    cam: [2.0, 1.6, 0.9],
    hl: ['lUpperArm', 'rUpperArm', 'lForearm', 'rForearm', 'chest'],
    props: EX.e08.props,
    poses: { start: P(B.prone, ARMS_NAPE, { _cfg: { groundOff: { head: 0.05 } } }) }
  };
  EX.e09.poses.elbows = P(EX.e09.poses.start, { lSh: { h: 10, rot: 120 }, rSh: { h: 10, rot: 120 } });
  EX.e09.poses.w = P(EX.e09.poses.start, { lSh: { abd: 85, rot: 90, h: 24 }, rSh: { abd: 85, rot: 90, h: 24 }, lEl: 95, rEl: 95 });

  EX.e10 = {
    cam: [2.0, 1.7, 0.9],
    hl: ['lUpperArm', 'rUpperArm', 'lForearm', 'rForearm', 'chest'],
    props: EX.e08.props,
    poses: { start: EX.e08.poses.start }
  };
  EX.e10.poses.i = EX.e08.poses.lift;
  EX.e10.poses.w = P(EX.e08.poses.start, { lSh: { abd: 85, rot: 90, h: 24 }, rSh: { abd: 85, rot: 90, h: 24 }, lEl: 95, rEl: 95 });
  EX.e10.poses.y = P(EX.e08.poses.start, { lSh: { flex: 186, abd: 38 }, rSh: { flex: 186, abd: 38 } });

  EX.e11 = {
    cam: [2.3, 1.2, 0.8],
    hl: ['abdomen', 'chest', 'lThigh'],
    poses: { start: P(B.hook, ARMS_NAPE_UP) }
  };
  EX.e11.poses.crunch = P(EX.e11.poses.start, { spine: { flex: 22 }, neck: { flex: 8 }, lHip: { flex: 48 }, lKn: 0, lAn: 5,
    _cfg: { level: { a: ['pelvis'], b: ['rFoot'] } } });

  EX.e12 = {
    cam: [-2.2, 1.3, 0.9],
    hl: ['pelvis', 'abdomen', 'rThigh', 'lThigh'],
    props: [{ type: 'block', size: [0.15, 0.09, 0.23], at: ['rElbow', 'rWrist'], floor: 0.045 }],
    poses: {
      start: P(B.side, { rSh: { flex: 0, abd: 115 }, rEl: 90, rWr: 0, lSh: { abd: 20, rot: 60 }, lEl: 110,
        lHip: { flex: 25, abd: 50 }, rHip: { flex: 25, abd: -50 }, lKn: 90, rKn: 90, neck: { side: -4 },
        _cfg: { level: { a: ['rForearm'], b: ['pelvis'] }, groundOff: { rForearm: 0.09, rHand: 0.09 } } })
    }
  };
  EX.e12.poses.up = P(EX.e12.poses.start, { lHip: { flex: 2, abd: 2 }, rHip: { flex: 2, abd: 0 }, rSh: { abd: 95 }, spine: { side: 4 },
    _cfg: { level: { a: ['rForearm'], b: ['rShin'] }, groundOff: { rForearm: 0.09, rHand: 0.09 } } });

  EX.e13 = { cam: [2.4, 1.2, 0.6], hl: ['abdomen', 'lThigh'], poses: { start: P(B.bug) } };
  EX.e13.poses.tap = P(B.bug, { lHip: { flex: 34 } });

  EX.e14 = { cam: [2.4, 1.2, 0.6], hl: ['abdomen', 'lThigh', 'lShin'], poses: { start: P(B.bug) } };
  EX.e14.poses.ext = P(B.bug, { lHip: { flex: 12 }, lKn: 2, lAn: -10 });

  EX.e15 = { cam: [2.4, 1.2, 0.6], hl: ['abdomen', 'lThigh', 'lShin', 'rUpperArm'], poses: { start: P(B.bug) } };
  EX.e15.poses.ext = P(B.bug, { lHip: { flex: 12 }, lKn: 2, lAn: -10, rSh: { flex: 170 } });

  EX.e16 = {
    cam: [2.2, 1.0, 0.0],
    hl: ['abdomen', 'pelvis'],
    poses: {
      start: P(B.prone, { lSh: { flex: 75, abd: 12 }, rSh: { flex: 75, abd: 12 }, lEl: 95, rEl: 95, lWr: 0, rWr: 0, spine: { flex: -30 }, neck: { flex: -8 },
        _cfg: { level: { a: ['lForearm', 'rForearm'], b: ['pelvis', 'lThigh', 'rThigh'] } } })
    }
  };
  EX.e16.poses.in = P(EX.e16.poses.start, { breath: 1, spine: { flex: -28 } });
  EX.e16.poses.out = P(EX.e16.poses.start, { breath: 0, spine: { flex: -36 }, neck: { flex: -4 } });

  EX.e17 = { cam: [0.6, 1.5, 2.4], hl: ['lThigh', 'abdomen'], poses: { start: P(B.bug) } };
  EX.e17.poses.open = P(B.bug, { lHip: { abd: 42, rot: -15 } });

  EX.e18 = { cam: [2.4, 1.1, 0.5], hl: ['pelvis', 'lThigh', 'rThigh'], poses: { start: P(B.hook) } };
  EX.e18.poses.up = P(B.bridge);

  EX.e19 = { cam: [2.4, 1.2, 0.5], hl: ['pelvis', 'lThigh', 'rThigh'], poses: { start: P(B.hook, B.bridgeArms) } };
  EX.e19.poses.up = P(B.bridge, B.bridgeArms);

  EX.e20 = { cam: [2.4, 1.2, 0.6], hl: ['pelvis', 'lThigh', 'rThigh', 'abdomen'], poses: { start: P(B.hook, B.bridgeArms) } };
  EX.e20.poses.bridge = P(B.bridge, B.bridgeArms);
  EX.e20.poses.kneeL = P(EX.e20.poses.bridge, { lHip: { flex: 100 }, lKn: 100, lAn: 0, _cfg: { level: { a: ['chest', 'head'], b: ['rFoot'] } } });
  EX.e20.poses.kneeR = mirror(EX.e20.poses.kneeL);

  EX.e21 = { cam: [2.4, 1.2, 0.6], hl: ['pelvis', 'lThigh', 'rThigh'], poses: { start: P(B.hook, B.bridgeArms) } };
  EX.e21.poses.bridge = P(B.bridge, B.bridgeArms);
  EX.e21.poses.extL = P(EX.e21.poses.bridge, { lKn: 8, lAn: 5, _cfg: { level: { a: ['chest', 'head'], b: ['rFoot'] } } });
  EX.e21.poses.extR = mirror(EX.e21.poses.extL);

  const FIT_OFF = { lFoot: 0.5, rFoot: 0.5 };
  const FIT_CFG_DOWN = { level: { a: ['pelvis'], b: ['lFoot', 'rFoot'] }, groundOff: FIT_OFF, groundSkip: ['lShin', 'rShin'] };
  const FIT_CFG_UP = { level: { a: ['chest'], b: ['lFoot', 'rFoot'] }, groundOff: FIT_OFF, groundSkip: ['lShin', 'rShin'] };
  EX.e22 = {
    cam: [2.5, 1.2, 0.8],
    hl: ['pelvis', 'lThigh', 'rThigh'],
    props: [{ type: 'fitball', r: 0.27, at: ['lAnkle', 'rAnkle'], off: [0, 0, -0.02], floor: 0.27 }],
    poses: { start: P(B.supine, { lHip: { flex: 32 }, rHip: { flex: 32 }, lKn: 12, rKn: 12, lAn: 0, rAn: 0, _cfg: FIT_CFG_DOWN }) }
  };
  EX.e22.poses.up = P(EX.e22.poses.start, { lHip: { flex: 0 }, rHip: { flex: 0 }, lKn: 4, rKn: 4, neck: { flex: 25 }, _cfg: FIT_CFG_UP });

  EX.e23 = { cam: EX.e22.cam, hl: EX.e22.hl, props: EX.e22.props, poses: { start: P(EX.e22.poses.start, B.bridgeArms) } };
  EX.e23.poses.up = P(EX.e22.poses.up, B.bridgeArms);

  EX.e24 = {
    cam: [1.0, 1.4, 2.4],
    hl: ['pelvis', 'lThigh', 'rThigh'],
    props: [{ type: 'stretch', r: 0.014, from: ['lKnee'], to: ['rKnee'] }],
    poses: { start: P(B.hook, B.bridgeArms) }
  };
  EX.e24.poses.bridge = P(B.bridge, B.bridgeArms);
  EX.e24.poses.open = P(EX.e24.poses.bridge, { lHip: { abd: 20, rot: -10 }, rHip: { abd: 20, rot: -10 } });

  EX.e25 = {
    cam: [2.6, 1.4, 0.2],
    hl: ['pelvis', 'lUpperArm', 'rUpperArm', 'chest'],
    props: [
      { type: 'wallbars', fixed: [0, 0, -1.3] },
      { type: 'stretch', r: 0.007, fromFixed: [0.12, 1.0, -1.27], to: ['lHandTip'] },
      { type: 'stretch', r: 0.007, fromFixed: [-0.12, 1.0, -1.27], to: ['rHandTip'] }
    ],
    poses: { start: P(B.hook, { lSh: { flex: 150, abd: 5 }, rSh: { flex: 150, abd: 5 } }) }
  };
  EX.e25.poses.bridge = P(B.bridge, { lSh: { flex: 150, abd: 5 }, rSh: { flex: 150, abd: 5 } });
  EX.e25.poses.pull = P(B.bridge, { lSh: { flex: 8, abd: 8 }, rSh: { flex: 8, abd: 8 } });

  EX.e26 = { cam: [2.3, 0.9, 0.5], hl: ['abdomen', 'lThigh', 'rThigh'], poses: { start: P(B.quad) } };
  EX.e26.poses.hover = P(B.hover);

  const SLIDE_PROPS = [{ type: 'slider', at: ['lToe'], off: [0, 0, -0.03], floor: 0.006 }];
  const slidePoses = () => ({
    start: P(B.quad),
    hover: P(B.hover),
    back: P(B.hover, { lHip: { flex: 30 }, lKn: 0, lAn: 0, _cfg: { level: { a: ['lHand', 'rHand'], b: ['rFoot'] }, groundSkip: ['lShin', 'rShin'] } }),
    side: P(B.hover, { lHip: { flex: 72, abd: 62, rot: 0 }, lKn: 5, lAn: 0, _cfg: { level: { a: ['lHand', 'rHand'], b: ['rFoot'] }, groundSkip: ['lShin', 'rShin'] } }),
    arc: P(B.hover, { lHip: { flex: 45, abd: 48 }, lKn: 0, lAn: 0, _cfg: { level: { a: ['lHand', 'rHand'], b: ['rFoot'] }, groundSkip: ['lShin', 'rShin'] } })
  });
  EX.e27 = { cam: [2.3, 1.2, 0.8], hl: ['abdomen', 'lThigh', 'lShin'], props: SLIDE_PROPS, poses: slidePoses() };
  EX.e28 = { cam: [0.8, 1.9, 2.0], hl: ['abdomen', 'lThigh', 'lShin'], props: SLIDE_PROPS, poses: slidePoses() };
  EX.e29 = { cam: [1.6, 2.0, 1.6], hl: ['abdomen', 'lThigh', 'lShin'], props: SLIDE_PROPS, poses: slidePoses() };

  // ---------- Kiegészítő gyakorlatok ----------
  const HANDS_BELLY = { lSh: { flex: 10, abd: 30, h: 20, rot: -90 }, rSh: { flex: 10, abd: 30, h: 20, rot: -90 }, lEl: 100, rEl: 100 };
  EX.w01 = { cam: [2.2, 1.2, 0.3], hl: ['abdomen'], poses: { start: P(B.hook, HANDS_BELLY, { breath: 0 }) } };
  EX.w01.poses.in = P(EX.w01.poses.start, { breath: 1, spine: { flex: -2 } });

  const ARMS_OUT = { lSh: { abd: 35 }, rSh: { abd: 35 } };
  EX.w02 = { cam: [0.3, 1.8, 2.4], hl: ['pelvis', 'lThigh', 'rThigh'], poses: { start: P(B.hook, ARMS_OUT) } };
  EX.w02.poses.tilt = P(EX.w02.poses.start, { root: { y: 28 }, spine: { twist: -28 }, _cfg: {} });

  EX.w03 = { cam: [2.3, 0.9, 0.3], hl: ['pelvis', 'abdomen'], poses: { start: P(B.hook) } };
  EX.w03.poses.tilt = P(B.hook, { spine: { flex: 8 }, lHip: { flex: 56 }, rHip: { flex: 56 } });
  EX.w03.poses.arch = P(B.hook, { spine: { flex: -10 }, lHip: { flex: 45 }, rHip: { flex: 45 } });

  EX.w04 = { cam: [2.4, 1.0, 0.4], hl: ['abdomen', 'chest'], poses: { start: P(B.quad) } };
  EX.w04.poses.cat = P(B.quad, { spine: { flex: 26 }, neck: { flex: 30 } });
  EX.w04.poses.cow = P(B.quad, { spine: { flex: -26 }, neck: { flex: -22 } });

  EX.c01 = {
    cam: [2.3, 1.0, 0.4],
    hl: ['chest', 'abdomen'],
    poses: {
      start: P(B.prone, { lHip: { flex: 135, abd: 10 }, rHip: { flex: 135, abd: 10 }, lKn: 140, rKn: 140, lAn: -60, rAn: -60,
        lSh: { flex: 172, abd: 10 }, rSh: { flex: 172, abd: 10 }, spine: { flex: 14 }, neck: { flex: 10 },
        _cfg: { level: { a: ['head', 'lHand', 'rHand'], b: ['lShin', 'rShin'] } } })
    }
  };
  EX.c01.poses.in = P(EX.c01.poses.start, { breath: 1, spine: { flex: 18 } });

  EX.c02 = {
    cam: [2.4, 1.1, 0.4],
    hl: ['pelvis', 'abdomen'],
    poses: { start: P(B.supine, { lHip: { flex: 105 }, rHip: { flex: 105 }, lKn: 115, rKn: 115, lSh: { flex: 55, abd: 10 }, rSh: { flex: 55, abd: 10 }, lEl: 40, rEl: 40 }) }
  };
  EX.c02.poses.pull = P(EX.c02.poses.start, { lHip: { flex: 122 }, rHip: { flex: 122 }, lSh: { flex: 40 }, rSh: { flex: 40 }, lEl: 75, rEl: 75, spine: { flex: 6 } });

  const ARMS_T = { lSh: { abd: 82 }, rSh: { abd: 82 } };
  EX.c03 = { cam: [0.3, 2.0, 2.3], hl: ['abdomen', 'chest', 'pelvis'], poses: { start: P(B.hook, ARMS_T) } };
  EX.c03.poses.twist = P(EX.c03.poses.start, { root: { y: 55 }, spine: { twist: -55 }, neck: { twist: 35 }, _cfg: {} });

  window.GYT_POSES = { EX, mirror, mirrorProps, P };
})();
