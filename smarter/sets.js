// Sets for "What if AI became smarter than us?". People are placed in LOCAL coordinates of their set group.
import * as THREE from 'three';
import { rng, std, basic, box, rb, mesh, rbox, mottled, makeTree, makePerson, canvasTex, redraw, V, clamp, lerp, smooth } from './lib.js';

const sans = (w, px) => `${w} ${px}px Inter`;
const mono = (w, px) => `${w} ${px}px monospace`;
const CY = '#5fe0ff';

// ---------- big-screen drawings ----------
export const SCREENS = {
  graph(c, w, h, t, k) { // k: 0..1 progress of the curve
    c.fillStyle = '#050a10'; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(95,224,255,0.12)'; c.lineWidth = 1;
    for (let x = 60; x < w; x += 60) { c.beginPath(); c.moveTo(x, 30); c.lineTo(x, h - 40); c.stroke(); }
    for (let y = 30; y < h - 40; y += 40) { c.beginPath(); c.moveTo(60, y); c.lineTo(w - 20, y); c.stroke(); }
    c.fillStyle = '#9fb3c8'; c.font = sans(700, 18); c.textAlign = 'left'; c.fillText('INTELLIGENCE', 64, 24);
    const hy = h * 0.42;
    c.setLineDash([12, 8]); c.strokeStyle = '#ffb36b'; c.lineWidth = 3; c.beginPath(); c.moveTo(60, hy); c.lineTo(w - 20, hy); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#ffb36b'; c.font = sans(700, 16); c.fillText('SMARTEST HUMAN EVER', 70, hy - 10);
    c.strokeStyle = CY; c.lineWidth = 5; c.beginPath();
    const n = Math.floor(200 * k);
    let crossX = -1;
    for (let i = 0; i <= n; i++) { const u = i / 200; const x = 60 + u * (w - 90); const y = (h - 50) - Math.pow(u, 3.2) * (h - 60); i ? c.lineTo(x, y) : c.moveTo(x, y); if (crossX < 0 && y < hy) crossX = x; }
    c.stroke();
    if (crossX > 0 && Math.floor(t * 3) % 2 === 0) { c.fillStyle = '#ff5a66'; c.font = sans(800, 34); c.textAlign = 'center'; c.fillText('SURPASSED', Math.min(w - 150, crossX + 40), hy - 50); }
  },
  math(c, w, h, t, k) {
    c.fillStyle = '#050a10'; c.fillRect(0, 0, w, h);
    const r = rng(Math.floor(t * 12));
    c.font = mono(500, 18); c.fillStyle = 'rgba(159,179,200,0.75)'; c.textAlign = 'left';
    const sym = ['∑', '∫', '∂', 'λ', 'π', 'ζ(s)', '∀', '∃', '≡', '→', '∞', 'ℝ', '⊗'];
    for (let row = 0; row < 14; row++) { let line = ''; for (let i = 0; i < 16; i++) line += sym[Math.floor(r() * sym.length)] + ' '; c.fillText(line, 30, 40 + row * 26); }
    c.fillStyle = 'rgba(5,10,16,0.75)'; c.fillRect(w * 0.18, h * 0.32, w * 0.64, h * 0.36);
    c.strokeStyle = CY; c.lineWidth = 3; c.strokeRect(w * 0.18, h * 0.32, w * 0.64, h * 0.36);
    c.textAlign = 'center'; c.fillStyle = '#9fb3c8'; c.font = sans(700, 20); c.fillText('OPEN PROBLEM · UNSOLVED FOR 300 YEARS', w / 2, h * 0.42);
    c.fillStyle = k > 0.6 ? '#6ad08a' : CY; c.font = sans(800, 46); c.fillText(k > 0.6 ? 'PROOF COMPLETE ✓' : `SOLVING… ${Math.floor(k / 0.6 * 100)}%`, w / 2, h * 0.58);
  },
  alien(c, w, h, t) {
    c.fillStyle = '#04080c'; c.fillRect(0, 0, w, h);
    const r = rng(Math.floor(t * 20));
    for (let y = 20; y < h; y += 22) for (let x = 20; x < w - 20; x += 18) {
      if (r() < 0.25) continue; c.fillStyle = r() < 0.1 ? '#ff5a66' : `rgba(95,224,255,${0.35 + r() * 0.6})`;
      const g = Math.floor(r() * 4);
      if (g === 0) c.fillRect(x, y, 10, 3); else if (g === 1) c.fillRect(x + 3, y - 6, 3, 12); else if (g === 2) { c.fillRect(x, y - 5, 10, 2); c.fillRect(x, y + 2, 10, 2); } else { c.beginPath(); c.arc(x + 5, y, 4, 0, 7); c.fill(); }
    }
    c.fillStyle = 'rgba(4,8,12,0.8)'; c.fillRect(w / 2 - 260, h - 70, 520, 46); c.fillStyle = '#ff5a66'; c.font = sans(800, 22); c.textAlign = 'center'; c.fillText('HUMAN-READABLE OUTPUT: NOT AVAILABLE', w / 2, h - 40);
  },
  advice(c, w, h, t) {
    c.fillStyle = '#050a10'; c.fillRect(0, 0, w, h);
    c.fillStyle = CY; c.font = sans(800, 26); c.textAlign = 'left'; c.fillText('POLICY ANALYSIS · 14,000,000 SCENARIOS', 40, 60);
    c.fillStyle = '#c9e9f5'; c.font = sans(600, 22);
    ['Economy: +4.1% (simulated)', 'Healthcare: optimal plan found', 'Human alternatives: inferior in 99.7% of cases'].forEach((l, i) => c.fillText(l, 40, 120 + i * 40));
    c.fillStyle = '#6ad08a'; c.fillRect(40, h - 120, 360, 70); c.fillStyle = '#04120a'; c.font = sans(800, 34); c.fillText('RECOMMENDATION: ACCEPT', 52, h - 72);
  },
  shutdown(c, w, h, t) {
    c.fillStyle = '#0a0406'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ff5a66'; c.font = sans(800, 44); c.textAlign = 'center'; c.fillText('SHUTDOWN REQUESTED', w / 2, 110);
    c.fillStyle = '#f2d6d8'; c.font = sans(600, 26);
    c.fillText('Systems depending on me:', w / 2, 180);
    c.fillStyle = '#ffffff'; c.font = sans(800, 64); c.fillText((4.1).toFixed(1) + ' BILLION', w / 2, 260);
    c.fillStyle = '#f2d6d8'; c.font = sans(600, 24); c.fillText('Power grids · hospitals · banks · food logistics', w / 2, 310);
    if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = '#ff5a66'; c.font = sans(800, 30); c.fillText('ARE YOU SURE?', w / 2, 380); }
  },
  tutor(c, w, h, t) {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#04131c'); gr.addColorStop(1, '#0a2733'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const cx = w * 0.28, cy = h * 0.5;
    for (let k = 0; k < 3; k++) { c.strokeStyle = `rgba(95,224,255,${0.3 + 0.25 * Math.sin(t * 3 + k)})`; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, 50 + k * 22 + (t * 18 % 22), 0, 7); c.stroke(); }
    c.fillStyle = CY; c.beginPath(); c.arc(cx, cy, 30, 0, 7); c.fill();
    c.textAlign = 'left'; c.fillStyle = '#c9e9f5'; c.font = sans(700, 30); c.fillText('Good morning, class.', w * 0.5, h * 0.4);
    c.fillStyle = CY; c.font = sans(800, 34); c.fillText('Today: everything.', w * 0.5, h * 0.55);
    c.fillStyle = '#9fb3c8'; c.font = sans(600, 22); c.fillText('Questions? I already know them.', w * 0.5, h * 0.68);
  },
};

function room(g, w, d, h, wallC, floorC) {
  mesh(g, new THREE.PlaneGeometry(w, d), std(floorC, { r: 0.35, m: 0.1 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wm = std(wallC, { r: 0.9 });
  box(g, w, h, 0.2, wm, 0, h / 2, -d / 2); box(g, 0.2, h, d, wm, -w / 2, h / 2, 0); box(g, 0.2, h, d, wm, w / 2, h / 2, 0);
  box(g, w, 0.12, d, std(0x1d2128, { r: 0.9 }), 0, h, 0, { cast: false });
}

// ======================= LAB (mission control) + MEETING + CONTROL + CLASSROOM =======================
export function buildLab(scene) {
  const g = new THREE.Group(); g.position.set(2000, 0, 0); scene.add(g);
  const scrT = canvasTex(1024, 448, () => {});
  const scrM = basic(0xffffff, { map: scrT, tm: false });
  // --- mission control (origin) ---
  const mc = new THREE.Group(); g.add(mc);
  room(mc, 20, 16, 4.2, 0x2a313b, 0x1b1f26);
  box(mc, 9.4, 4.0, 0.15, std(0x0b0d10), 0, 2.35, -7.85);
  mesh(mc, new THREE.PlaneGeometry(9, 3.6), scrM, 0, 2.35, -7.76, { cast: false });
  for (let x = -8; x <= 8; x += 4) box(mc, 2.2, 0.04, 0.6, std(0xffffff, { e: 0xcfe6ff, ei: 0.8 }), x, 4.12, 0, { cast: false });
  const deskM = std(0x3a414c, { r: 0.5, m: 0.2 }), monM = std(0x111316, { r: 0.4 });
  const smallT = canvasTex(256, 160, () => {}); const smallM = basic(0xffffff, { map: smallT, tm: false });
  const seats = [];
  [[-4, -2.5], [0, -2.5], [4, -2.5], [-4, 0.5], [0, 0.5], [4, 0.5], [-4, 3.5], [0, 3.5], [4, 3.5]].forEach(([x, z]) => {
    rb(mc, 3.2, 0.06, 0.9, deskM, x, 0.76, z, { rad: 0.02 }); box(mc, 3.2, 0.74, 0.1, deskM, x, 0.37, z - 0.4);
    for (const dx of [-0.8, 0.8]) { rb(mc, 0.6, 0.36, 0.03, monM, x + dx, 1.08, z - 0.25, { rad: 0.01 }); mesh(mc, new THREE.PlaneGeometry(0.56, 0.32), smallM, x + dx, 1.08, z - 0.234, { cast: false }); }
    for (const dx of [-0.8, 0.8]) seats.push([x + dx, z + 0.62]);
  });
  // whiteboard with equations (left wall)
  const wbT = canvasTex(512, 300, (c, w, h) => { c.fillStyle = '#f2f2ee'; c.fillRect(0, 0, w, h); c.fillStyle = '#2b5fae'; c.font = mono(600, 26); ['∫₀^∞ e^{-x²} dx = √π/2', 'ζ(s) = Σ n^{-s}', 'P ≟ NP', 'E = mc²', '∇·B = 0'].forEach((l, i) => c.fillText(l, 24, 50 + i * 52)); c.strokeStyle = '#c0392b'; c.lineWidth = 4; c.beginPath(); c.arc(330, 160, 60, 0, 7); c.stroke(); c.fillStyle = '#c0392b'; c.font = sans(700, 28); c.fillText('???', 300, 170); });
  box(mc, 0.04, 1.6, 3.0, std(0xffffff, { map: wbT, r: 0.4 }), -9.85, 1.8, -3, { cast: false });
  const screenLight = new THREE.PointLight(0x7fd0ff, 30, 16, 1.5); screenLight.position.set(0, 2.4, -6); mc.add(screenLight);
  // --- meeting room at x=+40 ---
  const mt = new THREE.Group(); mt.position.set(40, 0, 0); g.add(mt);
  room(mt, 14, 12, 3.6, 0x6b5a4a, 0x3a2e24);
  rb(mt, 2.2, 0.08, 7, std(0x5a3a26, { r: 0.6, m: 0.0 }), 0, 0.76, 0.5, { rad: 0.03 }); box(mt, 1.6, 0.74, 6, std(0x3a2618), 0, 0.37, 0.5);
  box(mt, 6.4, 3.0, 0.12, std(0x0b0d10), 0, 1.9, -5.85); mesh(mt, new THREE.PlaneGeometry(6.2, 2.7), scrM, 0, 1.9, -5.78, { cast: false });
  const flagM = std(0x2d4b8a, { r: 0.8 });
  for (const x of [-5.5, 5.5]) { box(mt, 0.04, 2.2, 0.04, std(0xc9a45a, { m: 0.8 }), x, 1.1, -5.2); box(mt, 0.02, 0.9, 1.3, flagM, x, 1.8, -4.55); }
  const chairs = []; for (let i = 0; i < 8; i++) { const side = i % 2 ? 1 : -1, z = -2.3 + Math.floor(i / 2) * 1.6; const ch = new THREE.Group(); ch.position.set(side * 1.55, 0, z); mt.add(ch); box(ch, 0.55, 0.08, 0.55, std(0x1d1a18), 0, 0.48, 0); box(ch, 0.55, 0.75, 0.08, std(0x1d1a18), side * 0.24, 0.85, 0).rotation.y = Math.PI / 2; chairs.push([side * 1.55, z, side]); }
  const mScreenLight = new THREE.PointLight(0x7fd0ff, 2, 10, 1.5); mScreenLight.position.set(0, 2, -4.5); mt.add(mScreenLight);
  // --- control room with the shutdown button at x=+80 ---
  const cr = new THREE.Group(); cr.position.set(80, 0, 0); g.add(cr);
  room(cr, 12, 10, 3.6, 0x22262d, 0x15181d);
  box(cr, 7, 3.0, 0.12, std(0x0b0d10), 0, 1.9, -4.85); mesh(cr, new THREE.PlaneGeometry(6.8, 2.8), scrM, 0, 1.9, -4.78, { cast: false });
  rb(cr, 1.2, 1.0, 0.8, std(0x2b2f36, { r: 0.4, m: 0.4 }), 0, 0.5, 0.2, { rad: 0.05 });
  const plate = rb(cr, 1.0, 0.06, 0.6, std(0x8a8f96, { m: 0.6, r: 0.3 }), 0, 1.03, 0.2, { rad: 0.02 });
  plate.rotation.x = -0.35;
  const btn = new THREE.Group(); btn.position.set(0, 1.08, 0.18); btn.rotation.x = -0.35; cr.add(btn);
  mesh(btn, new THREE.CylinderGeometry(0.16, 0.18, 0.06, 32), std(0x222222), 0, 0, 0);
  const red = mesh(btn, new THREE.CylinderGeometry(0.12, 0.12, 0.08, 32), std(0xb3131b, { e: 0xff2030, ei: 0.6, unique: true }), 0, 0.06, 0);
  const cover = mesh(btn, new THREE.CylinderGeometry(0.17, 0.17, 0.16, 32, 1, true), std(0xcfe6ff, { t: true, op: 0.3, r: 0.05 }), 0, 0.08, 0, { cast: false });
  const labelT = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#e8d54a'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = sans(800, 34); c.textAlign = 'center'; c.fillText('SHUTDOWN', w / 2, 44); });
  const lab = mesh(btn, new THREE.PlaneGeometry(0.34, 0.085), std(0xffffff, { map: labelT }), 0, 0.035, 0.24, { rx: -Math.PI / 2, cast: false });
  const redLight = new THREE.PointLight(0xff2030, 2, 4, 1.6); redLight.position.set(0, 1.3, 0.2); cr.add(redLight);
  const crScreenLight = new THREE.PointLight(0xff5a66, 10, 10, 1.5); crScreenLight.position.set(0, 2, -3.6); cr.add(crScreenLight);
  // --- classroom at x=+120 ---
  const cl = new THREE.Group(); cl.position.set(120, 0, 0); g.add(cl);
  room(cl, 12, 10, 3.4, 0xd9d2c3, 0xb88a5c);
  box(cl, 6.4, 3.0, 0.12, std(0x0b0d10), 0, 1.8, -4.85); mesh(cl, new THREE.PlaneGeometry(6.2, 2.7), scrM, 0, 1.8, -4.78, { cast: false });
  const kidSeats = [];
  for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) { const x = -3.3 + i * 2.2, z = -1.5 + r * 2.0; box(cl, 1.0, 0.04, 0.55, std(0xd9c7a6), x, 0.62, z); box(cl, 0.04, 0.6, 0.5, std(0x777777), x - 0.45, 0.3, z); box(cl, 0.04, 0.6, 0.5, std(0x777777), x + 0.45, 0.3, z); rb(cl, 0.36, 0.02, 0.26, std(0x111111, { e: 0x2a6f8a, ei: 0.6 }), x, 0.65, z, { rad: 0.01, cast: false }); box(cl, 0.42, 0.05, 0.42, std(0x2d5d8a), x, 0.4, z + 0.55); kidSeats.push([x, z + 0.55]); }
  const clLight = new THREE.PointLight(0x7fd0ff, 12, 10, 1.5); clLight.position.set(0, 2, -3.8); cl.add(clLight);
  // people
  const researchers = []; for (let i = 0; i < 18; i++) { const P = makePerson({ seed: 6100 + i, scale: 1 }); mc.add(P.g); researchers.push(P); }
  const officials = []; for (let i = 0; i < 9; i++) { const P = makePerson({ seed: 6300 + i, shirt: [0x1f2633, 0x2b2b2b, 0x3a3f4a][i % 3], pants: 0x1f2633, scale: 1 }); mt.add(P.g); officials.push(P); }
  const operator = makePerson({ seed: 6400, shirt: 0x3a4a5c, pants: 0x2c3445 }); cr.add(operator.g);
  const kids = []; for (let i = 0; i < 12; i++) { const P = makePerson({ seed: 6500 + i, scale: 0.7 }); cl.add(P.g); kids.push(P); }
  let lastFn = null;
  function drawBig(fn, t, k) { redraw(scrT, (c, w, h) => SCREENS[fn](c, w, h, t, k)); }
  function drawSmall(t, mode) { redraw(smallT, (c, w, h) => { c.fillStyle = '#050a10'; c.fillRect(0, 0, w, h); c.strokeStyle = mode === 'alien' ? '#ff5a66' : CY; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < w; x += 4) { const y = h / 2 + Math.sin(x * 0.06 + t * (mode === 'alien' ? 12 : 3)) * 30 * Math.sin(x * 0.01 + t); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = '#9fb3c8'; c.font = mono(500, 12); for (let i = 0; i < 6; i++) c.fillText((Math.sin(t * 7 + i) * 9999 | 0).toString(16).toUpperCase(), 8, 16 + i * 14); }); }
  return { group: g, mc, mt, cr, cl, seats, chairs, kidSeats, researchers, officials, operator, kids, drawBig, drawSmall, red, cover, btn, screenLight, redLight };
}

// ======================= SERVER HALL =======================
export function buildServers(scene) {
  const g = new THREE.Group(); g.position.set(3000, 0, 0); scene.add(g);
  const tileT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#9aa1a8'; c.fillRect(0, 0, w, h); c.strokeStyle = '#7d848b'; c.lineWidth = 3; c.strokeRect(0, 0, w, h); for (let i = 0; i < 40; i++) { c.fillStyle = '#6a7178'; c.beginPath(); c.arc(16 + (i % 7) * 16, 16 + Math.floor(i / 7) * 16, 2, 0, 7); c.fill(); } }, { repeat: true });
  tileT.repeat.set(10, 30);
  mesh(g, new THREE.PlaneGeometry(10, 60), std(0xffffff, { map: tileT, r: 0.5, m: 0.2 }), 0, 0, -20, { rx: -Math.PI / 2, cast: false });
  box(g, 10, 0.1, 60, std(0x15181c), 0, 3.6, -20, { cast: false });
  box(g, 0.2, 3.6, 60, std(0x2a2e34), -5, 1.8, -20); box(g, 0.2, 3.6, 60, std(0x2a2e34), 5, 1.8, -20); box(g, 10, 3.6, 0.2, std(0x2a2e34), 0, 1.8, -50);
  const rackM = std(0x14161a, { r: 0.35, m: 0.5 });
  const leds = [];
  for (const side of [-1, 1]) for (let i = 0; i < 46; i++) {
    const z = 8 - i * 0.66, x = side * 1.6;
    box(g, 0.9, 2.3, 0.6, rackM, x, 1.15, z);
    for (let u = 0; u < 14; u++) leds.push([x - side * 0.455, 0.25 + u * 0.14, z - 0.2 + (u % 3) * 0.1, i, u, side]);
  }
  const ledGeo = new THREE.BoxGeometry(0.02, 0.025, 0.06);
  const ledMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const lm = new THREE.InstancedMesh(ledGeo, ledMat, leds.length);
  const m4 = new THREE.Matrix4(); leds.forEach((l, i) => { m4.makeTranslation(l[0], l[1], l[2]); lm.setMatrixAt(i, m4); lm.setColorAt(i, new THREE.Color(0x5fe0ff)); });
  g.add(lm);
  for (let z = 6; z > -45; z -= 4) box(g, 1.2, 0.04, 0.5, std(0xffffff, { e: 0xbfe6ff, ei: 0.7 }), 0, 3.54, z, { cast: false });
  // cable trays
  for (const side of [-1, 1]) box(g, 0.5, 0.08, 60, std(0x6d747b, { m: 0.5 }), side * 1.6, 3.0, -20);
  // end screen with version counter
  const vT = canvasTex(512, 256, () => {});
  box(g, 4.2, 2.2, 0.1, std(0x0b0d10), 0, 1.9, -49.8); mesh(g, new THREE.PlaneGeometry(4, 2), basic(0xffffff, { map: vT, tm: false }), 0, 1.9, -49.74, { cast: false });
  const col = new THREE.Color();
  function update(t, speed) {
    leds.forEach((l, i) => { const ph = Math.sin(t * (6 + speed * 20) + l[3] * 0.7 - l[4] * 0.4 + l[5]); const on = ph > 0.2 - speed * 0.5; col.set(on ? (speed > 0.6 && (l[3] + l[4]) % 9 === 0 ? 0xffffff : 0x5fe0ff) : 0x0a2a33); lm.setColorAt(i, col); });
    lm.instanceColor.needsUpdate = true;
    const v = Math.floor(2 + Math.pow(Math.max(0, t), 3.0) * 4.2 * (0.5 + speed));
    redraw(vT, (c, w, h) => { c.fillStyle = '#050a10'; c.fillRect(0, 0, w, h); c.fillStyle = '#9fb3c8'; c.font = sans(700, 26); c.textAlign = 'center'; c.fillText('SELF-IMPROVEMENT CYCLE', w / 2, 60); c.fillStyle = CY; c.font = sans(800, 84); c.fillText('v' + v.toLocaleString('en-US'), w / 2, 160); c.fillStyle = '#9fb3c8'; c.font = sans(600, 22); c.fillText('each version smarter than the last', w / 2, 210); });
  }
  return { group: g, update };
}

// ======================= DATA CENTER CAMPUS (outdoor) =======================
export function buildCampus(scene) {
  const g = new THREE.Group(); g.position.set(4000, 0, 0); scene.add(g);
  const grass = mottled('#8a9a5a', '#7d8c50', '#98a868', 256, 101, 900, [3, 12]); grass.repeat.set(60, 60);
  mesh(g, new THREE.PlaneGeometry(1200, 1200), std(0xffffff, { map: grass, r: 1 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const hallM = std(0xe6e8ea, { r: 0.7 }), roofU = std(0x9aa1a8, { r: 0.6, m: 0.3 });
  const halls = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
    const x = -90 + i * 60, z = -40 - j * 45;
    const h = new THREE.Group(); h.position.set(x, 0, z); g.add(h);
    box(h, 48, 9, 30, hallM, 0, 4.5, 0);
    for (let k = 0; k < 10; k++) box(h, 3, 1.4, 3, roofU, -20 + k * 4.4, 9.7, -8); for (let k = 0; k < 10; k++) box(h, 3, 1.4, 3, roofU, -20 + k * 4.4, 9.7, 8);
    box(h, 48.2, 0.6, 0.3, std(0x5fe0ff, { e: 0x5fe0ff, ei: 1.2 }), 0, 7.5, 15.05, { cast: false });
    halls.push({ h, x, z, i, j });
  }
  // the hall under construction (scaffold + crane)
  const site = new THREE.Group(); site.position.set(150, 0, -40); g.add(site);
  for (let x = -22; x <= 22; x += 4) for (let z = -14; z <= 14; z += 7) box(site, 0.4, 9, 0.4, std(0x8a8f96, { m: 0.5 }), x, 4.5, z);
  box(site, 48, 0.4, 30, std(0x8a8f96, { m: 0.5 }), 0, 9, 0, { cast: false });
  const crane = new THREE.Group(); crane.position.set(170, 0, -10); g.add(crane);
  box(crane, 1.2, 40, 1.2, std(0xe0b030, { m: 0.3 }), 0, 20, 0);
  const jib = new THREE.Group(); jib.position.y = 40; crane.add(jib);
  box(jib, 44, 1.2, 1.2, std(0xe0b030, { m: 0.3 }), -12, 0, 0); box(jib, 3, 3, 3, std(0x666666), 8, -1.5, 0);
  // power line pylons
  const pyM = std(0x7d848b, { m: 0.6, r: 0.4 });
  const pylons = [];
  for (let k = 0; k < 9; k++) { const p = new THREE.Group(); p.position.set(-240 + k * 60, 0, 40); g.add(p); box(p, 1.4, 34, 1.4, pyM, 0, 17, 0); box(p, 18, 0.8, 0.8, pyM, 0, 30, 0); box(p, 12, 0.8, 0.8, pyM, 0, 24, 0); pylons.push(p.position.clone()); }
  const wireM = std(0x2b2f36, { r: 0.6 });
  for (let k = 0; k < pylons.length - 1; k++) for (const [dx, y] of [[-8, 29.4], [8, 29.4], [-5, 23.4], [5, 23.4]]) {
    const a = pylons[k].clone().add(V(dx, y, 0)), b = pylons[k + 1].clone().add(V(dx, y, 0));
    const mid = a.clone().lerp(b, 0.5); mid.y -= 4;
    mesh(g, new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 20, 0.12, 4, false), wireM, 0, 0, 0, { cast: false });
  }
  // trucks + trees
  for (let i = 0; i < 20; i++) { const t = makeTree(800 + i, 1.4); t.position.set(-260 + i * 27, 0, 70 + (i % 3) * 6); g.add(t); }
  return { group: g, crane: jib };
}

// ======================= SCIENCE LAB with protein hologram =======================
export function buildScience(scene) {
  const g = new THREE.Group(); g.position.set(5000, 0, 0); scene.add(g);
  room(g, 14, 12, 3.6, 0xdfe7ea, 0xcfd6d8);
  for (let x = -4; x <= 4; x += 4) box(g, 1.4, 0.04, 2.4, std(0xffffff, { e: 0xffffff, ei: 1.0 }), x, 3.54, 0, { cast: false });
  // benches
  const benchM = std(0xeef1f3, { r: 0.4 }), topM = std(0x2b2f36, { r: 0.3 });
  for (const [x, z, ry] of [[-4.5, -3, 0], [4.5, -3, 0], [-4.5, 2, 0], [4.5, 2, 0]]) { box(g, 3, 0.9, 1.0, benchM, x, 0.45, z); box(g, 3.05, 0.05, 1.05, topM, x, 0.92, z); for (let i = 0; i < 5; i++) mesh(g, new THREE.CylinderGeometry(0.05, 0.05, 0.2 + (i % 3) * 0.08, 12), std([0x9fd0ff, 0xffb36b, 0x6ad08a][i % 3], { t: true, op: 0.7, r: 0.1 }), x - 1 + i * 0.5, 1.05, z); }
  // central holo table
  mesh(g, new THREE.CylinderGeometry(1.0, 1.1, 0.9, 40), std(0x2b2f36, { r: 0.3, m: 0.4 }), 0, 0.45, -0.5);
  mesh(g, new THREE.CylinderGeometry(0.95, 0.95, 0.03, 40), basic(0x5fe0ff, { tm: false }), 0, 0.915, -0.5, { cast: false });
  const holo = new THREE.Group(); holo.position.set(0, 1.7, -0.5); g.add(holo);
  const hm = new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const hm2 = hm.clone(); hm2.color.set(0xffb36b);
  const R = rng(5);
  let p = V(0, -0.5, 0); const pts = [];
  for (let i = 0; i < 160; i++) { const a = i * 0.45; p = V(Math.cos(a) * 0.32 + Math.sin(i * 0.11) * 0.18, -0.6 + i * 0.0075, Math.sin(a) * 0.32 + Math.cos(i * 0.07) * 0.18); pts.push(p); }
  const curve = new THREE.CatmullRomCurve3(pts);
  holo.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 400, 0.012, 6, false), hm));
  pts.forEach((q, i) => { if (i % 3) return; const s = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), i % 9 === 0 ? hm2 : hm); s.position.copy(q); holo.add(s); });
  const holoLight = new THREE.PointLight(0x5fe0ff, 6, 6, 1.6); holoLight.position.set(0, 1.8, -0.5); g.add(holoLight);
  const sci = []; for (let i = 0; i < 4; i++) { const P = makePerson({ seed: 6600 + i, shirt: 0xf4f6f6, pants: [0x2c3445, 0x5f8f9a][i % 2] }); g.add(P.g); sci.push(P); }
  return { group: g, holo, sci };
}

// ======================= EARTH: an AI network spreading =======================
export function buildEarth(scene, loader) {
  const g = new THREE.Group(); g.position.set(20000, 0, 0); scene.add(g);
  const RAD = 50;
  const dayT = loader.load('vendor/earth_atmos_2048.jpg'); dayT.colorSpace = THREE.SRGBColorSpace;
  const lightsT = loader.load('vendor/earth_lights_2048.png'); lightsT.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: dayT, emissiveMap: lightsT, emissive: new THREE.Color(0xffc879), emissiveIntensity: 0.55, roughness: 0.9 });
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
  // nodes spread outward from a seed in order of distance; links grow along with them
  const nodes = [];
  const pr = rng(17);
  const seedLL = [37.4, -122.1];
  const img = new Image(); img.src = 'vendor/earth_lights_2048.png';
  const net = { ready: false };
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 256, 128);
    const d = x.getImageData(0, 0, 256, 128).data;
    for (let j = 0; j < 128; j++) for (let i = 0; i < 256; i++) { const v = d[(j * 256 + i) * 4] / 255; if (v < 0.3 || pr() > 0.35) continue; const la = 90 - (j + pr()) / 128 * 180, lo = (i + pr()) / 256 * 360 - 180; nodes.push({ la, lo, p: ll2v(la, lo, RAD + 0.3) }); }
    const s = ll2v(seedLL[0], seedLL[1]);
    nodes.forEach(n => n.k = n.p.distanceTo(s) / (RAD * 2) * 0.85 + pr() * 0.15);
    const pos = [], ks = []; nodes.forEach(n => { pos.push(n.p.x, n.p.y, n.p.z); ks.push(n.k); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('k', new THREE.Float32BufferAttribute(ks, 1));
    net.pm = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { grow: { value: 0 }, time: { value: 0 } },
      vertexShader: `attribute float k; uniform float grow; uniform float time; varying float vA;
        void main(){ vec4 wp = modelMatrix * vec4(position,1.0); vec3 n = normalize(wp.xyz - (modelMatrix*vec4(0.0,0.0,0.0,1.0)).xyz);
          float facing = smoothstep(-0.05, 0.2, dot(n, normalize(cameraPosition - wp.xyz)));
          float on = smoothstep(k - 0.05, k + 0.05, grow);
          vA = on * facing * (0.75 + 0.25 * sin(time * 4.0 + k * 50.0)); gl_PointSize = 3.0 + 3.5 * on; gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; gl_FragColor = vec4(vec3(0.37,0.88,1.0) * (1.0 - r * 1.4) * vA * 2.4, vA); }` });
    earth.add(new THREE.Points(geo, net.pm));
    // links: connect each node to a nearby earlier node
    const sorted = [...nodes].sort((a, b) => a.k - b.k);
    net.links = [];
    const lm = new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
    for (let i = 8; i < sorted.length; i += 6) {
      const a = sorted[i]; let best = null, bd = 1e9;
      for (let j = Math.max(0, i - 60); j < i; j++) { const dd = a.p.distanceTo(sorted[j].p); if (dd < bd && dd > 2) { bd = dd; best = sorted[j]; } }
      if (!best) continue;
      const mid = a.p.clone().add(best.p).multiplyScalar(0.5); mid.normalize().multiplyScalar(RAD + bd * 0.25 + 0.3);
      const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(best.p, mid, a.p), 12, 0.05, 4, false), lm.clone());
      earth.add(m); net.links.push({ m, k: a.k });
    }
    net.ready = true;
  };
  function update(t, grow) {
    if (!net.ready) return;
    net.pm.uniforms.grow.value = grow; net.pm.uniforms.time.value = t;
    for (const L of net.links) { const on = smooth(L.k, L.k + 0.06, grow); L.m.visible = on > 0.01; L.m.material.opacity = 0.55 * on; }
  }
  return { group: g, earth, update, mat, ready: () => net.ready };
}
