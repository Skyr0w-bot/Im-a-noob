// Sets for "What if AI took all our jobs?". Each set is a Group far from the others (people are placed in LOCAL coords).
import * as THREE from 'three';
import { rng, std, basic, box, rb, mesh, rbox, mottled, makeTree, makePerson, canvasTex, redraw, V, clamp, lerp, smooth } from './lib.js';

const sans = (w, px) => `${w} ${px}px Inter`;
const mono = (w, px) => `${w} ${px}px monospace`;

function skyline(night) {
  return canvasTex(1024, 384, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    if (night) { gr.addColorStop(0, '#050914'); gr.addColorStop(1, '#152038'); } else { gr.addColorStop(0, '#9cc2e4'); gr.addColorStop(1, '#e3edf4'); }
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const r = rng(12);
    for (let i = 0; i < 26; i++) {
      const bw = 40 + r() * 70, bx = r() * w - 20, bh = 120 + r() * 240;
      c.fillStyle = night ? '#0c1222' : '#c3cbd4'; c.fillRect(bx, h - bh, bw, bh);
      for (let y = h - bh + 10; y < h - 6; y += 14) for (let x = bx + 5; x < bx + bw - 6; x += 10) {
        c.fillStyle = night ? (r() < 0.3 ? '#f2d08a' : '#141c30') : (r() < 0.5 ? '#9fb3c7' : '#aebfd0'); c.fillRect(x, y, 5, 8);
      }
    }
  });
}

// ---------- screen drawings ----------
function drawWork(c, w, h, seed) {
  c.fillStyle = '#f4f6f8'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#2d5d8a'; c.fillRect(0, 0, w, 16);
  const r = rng(seed);
  c.strokeStyle = '#d5dbe2'; c.lineWidth = 1;
  for (let y = 24; y < h; y += 12) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
  for (let x = 0; x < w; x += 40) { c.beginPath(); c.moveTo(x, 16); c.lineTo(x, h); c.stroke(); }
  c.fillStyle = '#5a6672'; for (let i = 0; i < 40; i++) c.fillRect(4 + Math.floor(r() * 6) * 40, 26 + Math.floor(r() * 10) * 12, 10 + r() * 22, 5);
}
function drawAI(c, w, h, t, label = 'AI AGENT ACTIVE') {
  const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#04131c'); gr.addColorStop(1, '#0a2733'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.strokeStyle = '#5fe0ff'; c.lineWidth = 3; const cx = w / 2, cy = h * 0.42;
  for (let k = 0; k < 3; k++) { c.globalAlpha = 0.35 + 0.3 * Math.sin(t * 3 + k); c.beginPath(); c.arc(cx, cy, 14 + k * 9 + (t * 12 % 9), 0, 7); c.stroke(); }
  c.globalAlpha = 1; c.fillStyle = '#5fe0ff'; c.beginPath(); c.arc(cx, cy, 8, 0, 7); c.fill();
  c.font = sans(800, 13); c.textAlign = 'center'; c.fillText(label, cx, h * 0.78);
  c.fillStyle = 'rgba(95,224,255,0.25)'; c.fillRect(w * 0.15, h * 0.86, w * 0.7, 4); c.fillStyle = '#5fe0ff'; c.fillRect(w * 0.15, h * 0.86, w * 0.7 * ((t * 0.7) % 1), 4);
}
function drawCode(c, w, h, t, fast) {
  c.fillStyle = '#0d1117'; c.fillRect(0, 0, w, h);
  const lines = ['def route(req):', '  user = auth(req)', '  if not user:', '    return 401', '  data = db.fetch(user.id)', '  return render(data)', '', 'class Model:', '  def train(self, x):', '    for b in batches(x):', '      loss = self.step(b)', '      log(loss)', 'deploy(model, "prod")'];
  const n = fast ? Math.floor(t * 30) : Math.floor(t * 3);
  c.font = mono(500, 11); c.textAlign = 'left';
  for (let i = 0; i < 16; i++) { const L = lines[(i + Math.floor(n / 13)) % lines.length]; const show = i < (n % 16) || fast; c.fillStyle = L.startsWith('  ') ? '#9cdcfe' : '#c586c0'; if (show) c.fillText(L, 8, 16 + i * 11); }
  if (fast) { c.fillStyle = '#5fe0ff'; c.font = sans(800, 10); c.textAlign = 'right'; c.fillText('AI · 4,812 lines/min', w - 6, h - 6); }
}

// ======================= OFFICE =======================
export function buildOffice(scene) {
  const g = new THREE.Group(); g.position.set(2000, 0, 0); scene.add(g);
  const carpet = mottled('#59606b', '#525862', '#626a75', 256, 81, 900, [1, 3]); carpet.repeat.set(10, 8);
  mesh(g, new THREE.PlaneGeometry(32, 26), std(0xffffff, { map: carpet, r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xe6e3dc, { r: 0.9 });
  box(g, 32, 3.4, 0.2, wallM, 0, 1.7, 9.5); box(g, 0.2, 3.4, 26, wallM, -15, 1.7, -0.5);
  box(g, 0.2, 3.4, 10, wallM, 15, 1.7, 4.5); box(g, 0.2, 3.4, 12, wallM, 15, 1.7, -8.5); box(g, 0.2, 1.0, 4, wallM, 15, 2.9, -0.5); // door gap at z∈[-2.5,1.5]
  box(g, 32, 0.1, 26, std(0xf2f2f0, { r: 0.9 }), 0, 3.4, -0.5, { cast: false });
  for (let x = -12; x <= 12; x += 3) for (let z = -9; z <= 7; z += 4) box(g, 1.2, 0.04, 1.2, std(0xffffff, { e: 0xffffff, ei: 1.0, unique: false }), x, 3.34, z, { cast: false });
  // window wall (back, z=-11.5) with skyline
  const skyDay = skyline(false), skyNight = skyline(true);
  const skyM = basic(0xffffff, { map: skyDay });
  mesh(g, new THREE.PlaneGeometry(36, 13), skyM, 0, 4, -14, { cast: false });
  for (let x = -14; x <= 14; x += 2) box(g, 0.12, 3.4, 0.12, std(0x3d4248, { m: 0.4, r: 0.4 }), x, 1.7, -11.5);
  box(g, 32, 0.12, 0.2, std(0x3d4248), 0, 0.06, -11.5); box(g, 32, 0.12, 0.2, std(0x3d4248), 0, 3.34, -11.5);
  // screens
  const T = { work: [], ai: canvasTex(256, 160, () => {}), code: canvasTex(256, 160, () => {}), codeAI: canvasTex(256, 160, () => {}), art: canvasTex(256, 160, () => {}) };
  for (let i = 0; i < 4; i++) T.work.push(canvasTex(256, 160, (c, w, h) => drawWork(c, w, h, i + 1)));
  const M = { work: T.work.map(t => basic(0xffffff, { map: t, tm: false })), ai: basic(0xffffff, { map: T.ai, tm: false }), code: basic(0xffffff, { map: T.code, tm: false }), codeAI: basic(0xffffff, { map: T.codeAI, tm: false }), art: basic(0xffffff, { map: T.art, tm: false }), off: basic(0x07080a) };
  // desks
  const deskM = std(0xd9d4ca, { r: 0.55 }), legM = std(0x8a8f96, { m: 0.5, r: 0.4 }), panelM = std(0x6d8a9a, { r: 0.9 }), chairM = std(0x2b3038, { r: 0.6 });
  const desks = [];
  const ROWS = [-7, -4, -1, 2], COLS = [];
  for (let x = -7.2; x <= 7.21; x += 1.6) COLS.push(x);
  const R = rng(83);
  ROWS.forEach((z, ri) => COLS.forEach((x, ci) => {
    box(g, 1.5, 0.04, 0.7, deskM, x, 0.74, z);
    box(g, 0.04, 0.72, 0.65, legM, x - 0.72, 0.36, z);
    box(g, 1.5, 0.36, 0.04, panelM, x, 0.94, z - 0.37);
    const mon = new THREE.Group(); mon.position.set(x, 0.76, z - 0.15); g.add(mon);
    rb(mon, 0.56, 0.34, 0.03, std(0x15171a, { r: 0.4 }), 0, 0.3, 0, { rad: 0.012 });
    const scr = mesh(mon, new THREE.PlaneGeometry(0.52, 0.3), M.work[0], 0, 0.3, 0.016, { cast: false });
    box(mon, 0.04, 0.14, 0.04, std(0x222222), 0, 0.07, -0.02);
    box(g, 0.42, 0.02, 0.14, std(0x2b2b2b), x, 0.77, z + 0.12);
    // chair
    const ch = new THREE.Group(); ch.position.set(x, 0, z + 0.62); g.add(ch);
    box(ch, 0.48, 0.06, 0.48, chairM, 0, 0.47, 0); box(ch, 0.46, 0.55, 0.06, chairM, 0, 0.8, 0.24); box(ch, 0.05, 0.44, 0.05, std(0x222222), 0, 0.22, 0);
    // personal props
    if (R() < 0.5) mesh(g, new THREE.CylinderGeometry(0.04, 0.035, 0.1, 12), std([0xffffff, 0xc0392b, 0x2d5d8a][Math.floor(R() * 3)], { r: 0.4 }), x + 0.5, 0.81, z + 0.1);
    if (R() < 0.3) { mesh(g, new THREE.CylinderGeometry(0.06, 0.05, 0.1, 10), std(0x8a5a3a), x - 0.55, 0.81, z - 0.15); mesh(g, new THREE.SphereGeometry(0.11, 10, 8), std(0x4f8f3a, { r: 0.9 }), x - 0.55, 0.92, z - 0.15); }
    desks.push({ x, z, ri, ci, scr, chair: ch, seed: R() });
  }));
  // workers: one per desk
  const people = desks.map((d, i) => {
    const P = makePerson({ seed: 4000 + i, scale: 1 });
    g.add(P.g);
    const hs = new THREE.Group(); P.head.add(hs);
    const hsM = std(0x1d1f23, { r: 0.4 });
    const band = mesh(hs, new THREE.TorusGeometry(0.142, 0.011, 6, 20, Math.PI), hsM, 0, 0.15, 0, { cast: false }); band.rotation.y = Math.PI / 2;
    for (const sx of [-0.137, 0.137]) mesh(hs, new THREE.CylinderGeometry(0.042, 0.042, 0.03, 14), hsM, sx, 0.13, 0, { rz: Math.PI / 2, cast: false });
    const boom = mesh(hs, rbox(0.012, 0.012, 0.12, 0.005), hsM, 0.11, 0.08, 0.075, { cast: false }); boom.rotation.y = -0.45;
    P.hs = hs; hs.visible = false;
    return P;
  });
  // cardboard boxes for leavers
  const boxM = std(0xb8925e, { r: 0.9 });
  const boxes = people.map(() => { const b = new THREE.Group(); rb(b, 0.42, 0.26, 0.32, boxM, 0, 0, 0, { rad: 0.01 }); mesh(b, new THREE.CylinderGeometry(0.05, 0.04, 0.1, 10), std(0x8a5a3a), 0.1, 0.17, 0); mesh(b, new THREE.SphereGeometry(0.1, 10, 8), std(0x4f8f3a, { r: 0.9 }), 0.1, 0.27, 0); box(b, 0.14, 0.18, 0.02, std(0x2a2a2a), -0.1, 0.18, 0.02); g.add(b); b.visible = false; return b; });
  // creative desk close-up props (front-left desk)
  const lampM = std(0x2b2b2b, { m: 0.4 });
  const deskLamps = desks.map(d => { const l = new THREE.Group(); l.position.set(d.x + 0.6, 0.76, d.z - 0.1); box(l, 0.03, 0.4, 0.03, lampM, 0, 0.2, 0); rb(l, 0.16, 0.08, 0.16, std(0x222222, { e: 0xffc27a, ei: 1.6, unique: false }), 0, 0.42, 0.05, { rad: 0.03, cast: false }); g.add(l); l.visible = false; return l; });
  const dayLight = []; // none needed: sun via engine
  let lastScreens = '';
  function screens(mode, t, fn) {
    redraw(T.ai, (c, w, h) => drawAI(c, w, h, t));
    if (mode === 'code' || mode === 'codeAI') { redraw(T.code, (c, w, h) => drawCode(c, w, h, t, false)); redraw(T.codeAI, (c, w, h) => drawCode(c, w, h, t, true)); }
    desks.forEach((d, i) => { d.scr.material = fn(d, i); });
  }
  function drawArt(t) {
    redraw(T.art, (c, w, h) => {
      c.fillStyle = '#16181d'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#5fe0ff'; c.font = sans(700, 11); c.textAlign = 'left'; c.fillText('AI · generating 64 designs…', 8, 14);
      const n = Math.floor(t * 14);
      for (let i = 0; i < 24; i++) { const x = 8 + (i % 6) * 40, y = 22 + Math.floor(i / 6) * 34; if (i < n) { const hue = (i * 47) % 360; const gg = c.createLinearGradient(x, y, x + 36, y + 30); gg.addColorStop(0, `hsl(${hue},70%,60%)`); gg.addColorStop(1, `hsl(${(hue + 80) % 360},70%,40%)`); c.fillStyle = gg; } else c.fillStyle = '#2a2e36'; c.fillRect(x, y, 36, 30); }
    });
  }
  function setWindows(night) { skyM.map = night ? skyNight : skyDay; skyM.needsUpdate = true; }
  return { group: g, desks, people, boxes, screens, M, drawArt, setWindows, deskLamps, ROWS, COLS };
}

// ======================= WAREHOUSE =======================
export function buildWarehouse(scene) {
  const g = new THREE.Group(); g.position.set(3000, 0, 0); scene.add(g);
  const conc = mottled('#b9b6ae', '#aeaba3', '#c4c1b9', 256, 91, 900, [2, 8]); conc.repeat.set(12, 12);
  mesh(g, new THREE.PlaneGeometry(80, 80), std(0xffffff, { map: conc, r: 0.6 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  for (let z = -30; z <= 30; z += 6) box(g, 80, 0.01, 0.12, std(0xe0b030), 0, 0.006, z + 3, { cast: false });
  const wallM = std(0xd9dcdf, { r: 0.85 });
  box(g, 80, 12, 0.3, wallM, 0, 6, -32); box(g, 0.3, 12, 64, wallM, -40, 6, 0); box(g, 0.3, 12, 64, wallM, 40, 6, 0);
  box(g, 80, 0.3, 64, std(0xc9ccd0), 0, 12, 0, { cast: false });
  for (let x = -36; x <= 36; x += 8) box(g, 0.4, 0.6, 64, std(0x8f959b, { m: 0.5 }), x, 11.6, 0, { cast: false });
  for (let x = -32; x <= 32; x += 8) for (let z = -26; z <= 26; z += 8) box(g, 2.2, 0.08, 0.5, std(0xffffff, { e: 0xffffff, ei: 1.3 }), x, 11.3, z, { cast: false });
  // racks along z at x = -14, -7, 7, 14
  const rackM = std(0x2f5f9e, { m: 0.4, r: 0.5 }), beamM = std(0xe07b2c, { m: 0.3, r: 0.5 });
  const crates = []; const R = rng(92);
  for (const rx of [-15, -9, 9, 15]) {
    for (let z = -26; z <= 10; z += 3) for (const sx of [-0.9, 0.9]) box(g, 0.12, 6.2, 0.12, rackM, rx + sx, 3.1, z);
    for (let lvl = 0; lvl < 4; lvl++) { box(g, 0.1, 0.14, 36, beamM, rx - 0.9, 0.3 + lvl * 1.6, -8); box(g, 0.1, 0.14, 36, beamM, rx + 0.9, 0.3 + lvl * 1.6, -8); }
    for (let lvl = 0; lvl < 4; lvl++) for (let z = -25.5; z <= 9.5; z += 1.5) if (R() < 0.85) crates.push([rx, 0.37 + lvl * 1.6 + 0.4, z, R()]);
  }
  const crateM = std(0xb8925e, { r: 0.9, unique: true });
  const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 0.8, 1.25), crateM, crates.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  crates.forEach((c, i) => { m4.makeTranslation(c[0], c[1], c[2]); cm.setMatrixAt(i, m4); cm.setColorAt(i, col.setHSL(0.09, 0.4, 0.5 + c[3] * 0.12)); });
  cm.castShadow = true; cm.receiveShadow = true; g.add(cm);
  // conveyor across the front (x from -6 to 6 at z=14)
  const belt = box(g, 14, 0.12, 1.1, std(0x1f2124, { r: 0.7 }), 0, 0.85, 14);
  box(g, 14.2, 0.2, 1.3, std(0x6d747b, { m: 0.5 }), 0, 0.72, 14);
  for (let x = -6.5; x <= 6.5; x += 1.6) { box(g, 0.1, 0.72, 0.1, std(0x6d747b), x, 0.36, 13.5); box(g, 0.1, 0.72, 0.1, std(0x6d747b), x, 0.36, 14.5); }
  const parcels = []; for (let i = 0; i < 10; i++) { const p = rb(g, 0.5, 0.35, 0.45, std(0xc9a46e, { r: 0.9 }), 0, 1.09, 14, { rad: 0.02 }); parcels.push(p); }
  // robot arms by the conveyor
  const arms = [];
  for (const ax of [-3, 3]) {
    const a = new THREE.Group(); a.position.set(ax, 0, 15.6); g.add(a);
    const orange = std(0xe8742c, { r: 0.4, m: 0.2 }), dark = std(0x2b2f36, { r: 0.4, m: 0.5 });
    mesh(a, new THREE.CylinderGeometry(0.45, 0.55, 0.4, 24), dark, 0, 0.2, 0);
    const base = new THREE.Group(); base.position.y = 0.4; a.add(base);
    mesh(base, new THREE.CylinderGeometry(0.32, 0.36, 0.5, 20), orange, 0, 0.25, 0);
    const sh = new THREE.Group(); sh.position.y = 0.55; base.add(sh);
    mesh(sh, rbox(0.3, 1.3, 0.3, 0.1), orange, 0, 0.65, 0);
    const el = new THREE.Group(); el.position.y = 1.3; sh.add(el);
    mesh(el, rbox(0.24, 1.1, 0.24, 0.08), orange, 0, 0.55, 0);
    const wr = new THREE.Group(); wr.position.y = 1.1; el.add(wr);
    mesh(wr, new THREE.CylinderGeometry(0.12, 0.12, 0.2, 14), dark, 0, 0.1, 0);
    rb(wr, 0.3, 0.08, 0.3, dark, 0, 0.22, 0, { rad: 0.03 });
    arms.push({ base, sh, el, wr, ph: ax });
  }
  // robots + humans
  const robots = []; for (let i = 0; i < 9; i++) { const P = makePerson({ robot: true, seed: 300 + i }); g.add(P.g); const b = rb(P.torso, 0.5, 0.36, 0.42, std(0xb8925e, { r: 0.9 }), 0, 0.42, 0.42, { rad: 0.01 }); P.crate = b; robots.push(P); }
  const humans = []; for (let i = 0; i < 3; i++) { const P = makePerson({ seed: 3300 + i, shirt: 0xe8742c, pants: 0x2c3445 }); g.add(P.g); humans.push(P); }
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(0xf2c14e, { r: 0.4 })); g.add(helmet);
  function update(t) {
    parcels.forEach((p, i) => { const x = ((t * 0.9 + i * 1.45) % 14.5) - 7.2; p.position.x = x; p.visible = Math.abs(x) < 6.9; });
    arms.forEach((a, i) => { const ph = t * 1.6 + i * 2; a.base.rotation.y = Math.sin(ph) * 0.9; a.sh.rotation.x = 0.4 + Math.sin(ph * 2) * 0.25; a.el.rotation.x = 1.2 + Math.sin(ph * 2 + 1) * 0.3; a.wr.rotation.x = 0.6; });
  }
  return { group: g, robots, humans, helmet, update };
}

// ======================= HOSPITAL =======================
export function buildHospital(scene) {
  const g = new THREE.Group(); g.position.set(4000, 0, 0); scene.add(g);
  mesh(g, new THREE.PlaneGeometry(30, 30), std(0xd3dcdc, { r: 0.3 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xb9cfcc, { r: 0.9 });
  box(g, 14, 3.4, 0.2, wallM, 0, 1.7, -4); box(g, 0.2, 3.4, 10, wallM, -6, 1.7, 1); box(g, 0.2, 3.4, 10, wallM, 6, 1.7, 1);
  box(g, 14, 0.1, 10, std(0xf2f4f4), 0, 3.4, 1, { cast: false });
  box(g, 1.2, 0.04, 2.4, std(0xffffff, { e: 0xffffff, ei: 1.2 }), -2, 3.34, 0, { cast: false }); box(g, 1.2, 0.04, 2.4, std(0xffffff, { e: 0xffffff, ei: 1.2 }), 2.5, 3.34, 0, { cast: false });
  const bed = new THREE.Group(); g.add(bed); bed.position.set(-0.4, 0, -1.2);
  rb(bed, 1.1, 0.25, 2.3, std(0xe9eef0, { r: 0.6 }), 0, 0.75, 0, { rad: 0.06 });
  box(bed, 1.15, 0.5, 0.06, std(0xb7c2c8, { m: 0.4, r: 0.4 }), 0, 0.95, -1.17); box(bed, 1.15, 0.3, 0.06, std(0xb7c2c8, { m: 0.4, r: 0.4 }), 0, 0.85, 1.17);
  for (const [x, z] of [[-0.45, -1], [0.45, -1], [-0.45, 1], [0.45, 1]]) box(bed, 0.05, 0.6, 0.05, std(0x9aa4aa, { m: 0.5 }), x, 0.3, z);
  const patient = makePerson({ seed: 41, shirt: 0xa9c6d8, pants: 0xa9c6d8, scale: 0.92 }); bed.add(patient.g);
  patient.g.rotation.x = -Math.PI / 2; patient.g.position.set(0, 1.0, 0.85); patient.legL.visible = patient.legR.visible = false;
  rb(bed, 1.0, 0.2, 1.75, std(0x8fb4c9, { r: 0.9 }), 0, 1.02, 0.25, { rad: 0.08 });
  rb(bed, 0.6, 0.12, 0.35, std(0xffffff, { r: 0.9 }), 0, 0.92, -0.95, { rad: 0.06 });
  // surgical robot arm from the ceiling
  const arm = new THREE.Group(); arm.position.set(-0.4, 3.35, -1.0); g.add(arm);
  const white = std(0xeef1f4, { r: 0.25 }), dark = std(0x2b2f36, { r: 0.4, m: 0.5 });
  mesh(arm, new THREE.CylinderGeometry(0.18, 0.18, 0.25, 20), dark, 0, -0.12, 0);
  const a1 = new THREE.Group(); a1.position.y = -0.25; arm.add(a1);
  mesh(a1, rbox(0.16, 0.9, 0.16, 0.06), white, 0, -0.45, 0);
  const a2 = new THREE.Group(); a2.position.y = -0.9; a1.add(a2);
  mesh(a2, rbox(0.13, 0.6, 0.13, 0.05), white, 0, -0.3, 0);
  const tip = mesh(a2, new THREE.CylinderGeometry(0.03, 0.01, 0.18, 10), std(0x111111, { e: 0x5fe0ff, ei: 2 }), 0, -0.68, 0, { cast: false });
  // AI diagnosis monitor
  const monT = canvasTex(400, 260, () => {});
  const mon = new THREE.Group(); mon.position.set(-2.0, 1.65, -2.6); mon.rotation.y = 0.5; g.add(mon);
  rb(mon, 1.0, 0.65, 0.06, std(0x2a2d31, { r: 0.4 }), 0, 0, 0, { rad: 0.03 });
  mesh(mon, new THREE.PlaneGeometry(0.92, 0.57), basic(0xffffff, { map: monT, tm: false }), 0, 0, 0.031, { cast: false });
  box(g, 0.06, 1.3, 0.06, std(0x888f96, { m: 0.5 }), -2.0, 0.65, -2.6);
  const doc = makePerson({ seed: 61, shirt: 0xf4f6f6, pants: 0x5f8f9a }); g.add(doc.g);
  const clip = new THREE.Group(); doc.elbowL.add(clip); clip.position.set(0.04, -0.33, 0.08);
  box(clip, 0.22, 0.3, 0.015, std(0x8a6a45), 0, 0, 0); box(clip, 0.19, 0.26, 0.005, std(0xffffff), 0, -0.01, 0.01, { cast: false });
  function update(t) {
    a1.rotation.z = Math.sin(t * 0.8) * 0.35; a1.rotation.x = 0.25 + Math.sin(t * 0.6) * 0.1; a2.rotation.x = -0.5 + Math.sin(t * 1.1) * 0.25;
    redraw(monT, (c, w, h) => {
      c.fillStyle = '#04131c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#5fe0ff'; c.font = sans(800, 22); c.textAlign = 'left'; c.fillText('AI DIAGNOSIS', 18, 36);
      c.fillStyle = '#c9e9f5'; c.font = sans(600, 16); ['Scan analysed in 0.8 s', 'Confidence: 99.2 %', 'Treatment plan: ready', 'Human review: optional'].forEach((l, i) => c.fillText(l, 18, 74 + i * 28));
      c.strokeStyle = '#5fe0ff'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < w; x += 3) { const y = 225 - Math.abs(Math.sin(x * 0.05 + t * 3)) * 18 * (Math.sin(x * 0.013 + t) > 0.6 ? 1 : 0.2); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    });
  }
  return { group: g, doc, update };
}

// ======================= SHOP (robots restock, no customers) =======================
export function buildShop(scene) {
  const g = new THREE.Group(); g.position.set(5000, 0, 0); scene.add(g);
  const floorT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ecebe6'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d8d6cf'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }, { repeat: true });
  floorT.repeat.set(12, 12);
  mesh(g, new THREE.PlaneGeometry(48, 48), std(0xffffff, { map: floorT, r: 0.3 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xeeebe4, { r: 0.9 });
  box(g, 48, 6, 0.3, wallM, 0, 3, -24); box(g, 0.3, 6, 48, wallM, -24, 3, 0); box(g, 0.3, 6, 48, wallM, 24, 3, 0);
  box(g, 48, 0.2, 48, std(0xf2f2f0, { r: 0.9 }), 0, 6, 0, { cast: false });
  for (let x = -18; x <= 18; x += 6) for (let z = -20; z <= 18; z += 5) box(g, 1.2, 0.05, 2.4, std(0xffffff, { e: 0xffffff, ei: 0.8 }), x, 5.88, z, { cast: false });
  const shelfM = std(0xdedad2, { r: 0.7, m: 0.1 });
  const prodCols = [0xd6453a, 0xf0b33c, 0x3e7cc2, 0x55a35a, 0xe8e2d0, 0x8a4fa8, 0xf07c3c, 0x2f5a8a];
  const prods = []; const R = rng(77);
  for (const ax of [-12, -6, 0, 6, 12]) {
    box(g, 1.2, 2.3, 22, shelfM, ax, 1.15, -7);
    for (const side of [-1, 1]) for (let lvl = 0; lvl < 4; lvl++) { box(g, 0.55, 0.05, 22, shelfM, ax + side * 0.85, 0.25 + lvl * 0.55, -7, { cast: false }); for (let z = -17.7; z < 3.8; z += 0.3) prods.push([ax + side * 0.85, 0.25 + lvl * 0.55 + 0.2, z, prodCols[Math.floor(R() * prodCols.length)], 0.8 + R() * 0.4]); }
  }
  const pm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.28, 0.34, 0.26), std(0xffffff, { r: 0.6, unique: true }), prods.length);
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  prods.forEach((p, i) => { m4.makeScale(1, p[4], 1).setPosition(p[0], p[1], p[2]); pm.setMatrixAt(i, m4); pm.setColorAt(i, col.set(p[3])); });
  pm.receiveShadow = true; g.add(pm);
  // self-checkout kiosks at the front
  const kT = canvasTex(160, 200, (c, w, h) => { c.fillStyle = '#04131c'; c.fillRect(0, 0, w, h); c.fillStyle = '#5fe0ff'; c.font = sans(800, 18); c.textAlign = 'center'; c.fillText('AUTOMATED', w / 2, 70); c.fillText('CHECKOUT', w / 2, 96); c.fillStyle = '#9fb3c8'; c.font = sans(600, 14); c.fillText('No staff on duty', w / 2, 140); });
  for (const x of [-8, -4, 0, 4, 8]) { rb(g, 0.8, 1.0, 0.6, std(0xf2f2f2, { r: 0.4 }), x, 0.5, 9, { rad: 0.05 }); const k = box(g, 0.5, 0.6, 0.05, basic(0xffffff, { map: kT, tm: false }), x, 1.35, 8.75, { cast: false }); k.rotation.x = -0.25; }
  const robots = []; for (let i = 0; i < 4; i++) { const P = makePerson({ robot: true, seed: 900 + i }); g.add(P.g); P.crate = rb(P.torso, 0.5, 0.36, 0.42, std(0xb8925e, { r: 0.9 }), 0, 0.42, 0.42, { rad: 0.01 }); P.crate.visible = false; robots.push(P); }
  return { group: g, robots };
}

// ======================= EARTH: work lights fade, data centers grow =======================
export function buildEarth(scene, loader) {
  const g = new THREE.Group(); g.position.set(20000, 0, 0); scene.add(g);
  const RAD = 50;
  const dayT = loader.load('vendor/earth_atmos_2048.jpg'); dayT.colorSpace = THREE.SRGBColorSpace;
  const lightsT = loader.load('vendor/earth_lights_2048.png'); lightsT.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: dayT, emissiveMap: lightsT, emissive: new THREE.Color(0xffc879), emissiveIntensity: 0.3, roughness: 0.9 });
  mat.color.setScalar(0.3);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(RAD, 96, 64), mat); g.add(earth);
  const fresnel = (rad, side, power, gain, colr) => new THREE.Mesh(new THREE.SphereGeometry(rad, 64, 48), new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, side, depthWrite: false, uniforms: { c: { value: new THREE.Color(colr) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), ${power.toFixed(1)}); gl_FragColor = vec4(c * f * ${gain.toFixed(2)}, f); }`,
  }));
  g.add(fresnel(RAD * 1.035, THREE.BackSide, 2.2, 1.6, 0x5aa8ff));
  g.add(fresnel(RAD * 1.003, THREE.FrontSide, 3.0, 0.9, 0x4a90e0));
  const Rs = rng(99); const sp = [];
  for (let i = 0; i < 2500; i++) { const v = V(Rs() - 0.5, Rs() - 0.5, Rs() - 0.5).normalize().multiplyScalar(1500); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
  const ll2v = (la, lo, r = RAD) => { const phi = (90 - la) * Math.PI / 180, th = (lo + 180) * Math.PI / 180; return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); };
  const pointMat = (color, grow) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { fade: { value: 0 }, time: { value: 0 }, col: { value: new THREE.Color(color) } },
    vertexShader: `attribute float k; uniform float fade; uniform float time; varying float vA;
      void main(){ vec4 wp = modelMatrix * vec4(position,1.0);
        vec3 n = normalize(wp.xyz - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz);
        float facing = smoothstep(-0.05, 0.2, dot(n, normalize(cameraPosition - wp.xyz)));
        float alive = ${grow ? 'smoothstep(k - 0.08, k + 0.08, fade * 1.15)' : '1.0 - smoothstep(k - 0.06, k + 0.06, fade * 1.15)'};
        vA = alive * facing * (0.8 + 0.2 * sin(time * 3.0 + k * 40.0));
        gl_PointSize = ${grow ? '4.0 + 5.0 * alive' : '2.6 + 2.2 * alive'};
        gl_Position = projectionMatrix * viewMatrix * wp; }`,
    fragmentShader: `uniform vec3 col; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; gl_FragColor = vec4(col * (1.0 - r * 1.4) * vA * 2.2, vA); }`,
  });
  const work = { ready: false }, dc = {};
  const img = new Image(); img.src = 'vendor/earth_lights_2048.png';
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 512, 256);
    const d = x.getImageData(0, 0, 512, 256).data; const pr = rng(7);
    const pos = [], seed = [];
    for (let j = 0; j < 256; j++) for (let i = 0; i < 512; i++) {
      const v = d[(j * 512 + i) * 4] / 255; if (v < 0.12 || pr() > v * 1.1) continue;
      const la = 90 - (j + pr()) / 256 * 180, lo = (i + pr()) / 512 * 360 - 180;
      const p = ll2v(la, lo, RAD + 0.25); pos.push(p.x, p.y, p.z);
      const n = 0.5 + 0.25 * Math.sin(la * 0.09 + lo * 0.05) + 0.25 * Math.sin(lo * 0.13 - la * 0.04 + 1.3);
      seed.push(clamp(n * 0.75 + pr() * 0.25));
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('k', new THREE.Float32BufferAttribute(seed, 1));
    work.mat = pointMat(0xffc98a, false); earth.add(new THREE.Points(geo, work.mat));
    // data centers: few big cyan points
    const hubs = [[37.4, -122.1], [47.6, -122.3], [39.0, -77.5], [33.4, -112], [32.8, -96.8], [41.9, -87.6], [45.6, -122.7], [53.3, -6.3], [50.1, 8.7], [52.4, 4.9], [51.5, -0.1], [59.3, 18.1], [35.7, 139.7], [37.5, 127], [1.35, 103.8], [22.3, 114.2], [31.2, 121.5], [39.9, 116.4], [19.1, 72.9], [-33.9, 151.2], [-23.5, -46.6], [25.2, 55.3], [24.7, 46.7], [43.7, -79.4], [30.3, -97.7]];
    const p2 = [], k2 = [];
    hubs.forEach(([la, lo], i) => { for (let q = 0; q < 3; q++) { const p = ll2v(la + (pr() - 0.5) * 1.5, lo + (pr() - 0.5) * 1.5, RAD + 0.3); p2.push(p.x, p.y, p.z); k2.push(pr() * 0.8); } });
    const geo2 = new THREE.BufferGeometry(); geo2.setAttribute('position', new THREE.Float32BufferAttribute(p2, 3)); geo2.setAttribute('k', new THREE.Float32BufferAttribute(k2, 1));
    dc.mat = pointMat(0x5fe0ff, true); earth.add(new THREE.Points(geo2, dc.mat));
    work.ready = true;
  };
  function update(t, fadeWork, growDC) {
    if (!work.ready) return;
    work.mat.uniforms.fade.value = fadeWork; work.mat.uniforms.time.value = t;
    dc.mat.uniforms.fade.value = growDC; dc.mat.uniforms.time.value = t;
  }
  return { group: g, earth, update, mat, ready: () => work.ready };
}
