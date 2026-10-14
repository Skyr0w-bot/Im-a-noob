// Sets for "What if Roblox never existed?". Each set lives far from the others; shots toggle visibility.
import * as THREE from 'three';
import { rng, std, basic, box, rb, mesh, rbox, mottled, makeTree, makePerson, makeBlocky, canvasTex, redraw, V, clamp, lerp, smooth } from './lib.js';

const sans = (w, px) => `${w} ${px}px Inter`;
const mono = (w, px) => `${w} ${px}px monospace`;

// 2D "classic block game" picture for screens
export function drawGame(c, w, h, t, kind = 'obby') {
  const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#7ec4ff'); sky.addColorStop(1, '#d8efff');
  c.fillStyle = sky; c.fillRect(0, 0, w, h);
  c.fillStyle = '#ffffff'; for (let i = 0; i < 4; i++) { const x = ((i * 97 + t * 12) % (w + 80)) - 40; c.globalAlpha = 0.8; c.fillRect(x, 20 + i * 14, 50, 14); }
  c.globalAlpha = 1;
  // baseplate
  c.fillStyle = '#5aa64a'; c.fillRect(0, h * 0.72, w, h * 0.28);
  c.fillStyle = '#4d9440'; for (let x = 0; x < w; x += 16) c.fillRect(x, h * 0.72, 8, h * 0.28);
  // obby platforms
  const cols = ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#2ecc71'];
  for (let i = 0; i < 6; i++) { c.fillStyle = cols[i % 5]; c.fillRect(20 + i * (w / 6.5), h * (0.62 - (i % 3) * 0.1), w / 9, 10); }
  // avatar jumping
  const ax = (t * 60) % (w * 0.9) + 10, ay = h * 0.55 - Math.abs(Math.sin(t * 4)) * 26;
  c.fillStyle = '#4ca64c'; c.fillRect(ax, ay + 22, 6, 12); c.fillRect(ax + 8, ay + 22, 6, 12);
  c.fillStyle = '#1e6fd6'; c.fillRect(ax - 1, ay + 8, 16, 14);
  c.fillStyle = '#f5cd30'; c.fillRect(ax - 6, ay + 8, 5, 13); c.fillRect(ax + 15, ay + 8, 5, 13); c.fillRect(ax + 1, ay - 3, 12, 11);
  // HUD bits
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(8, 8, 92, 18); c.fillStyle = '#fff'; c.font = sans(700, 12); c.fillText('Stage 7 / 30', 14, 21);
}
export function drawGlitch(c, w, h, t, k) {
  // k: 0..1 how far the erase has progressed
  const r = rng(Math.floor(t * 30) + 5);
  for (let i = 0; i < 18; i++) { const y = r() * h, hh = 2 + r() * 14; const dx = (r() - 0.5) * 60 * (1 - k); c.drawImage(c.canvas, 0, y, w, hh, dx, y, w, hh); }
  c.fillStyle = `rgba(255,70,80,${0.25 * (1 - k)})`; c.fillRect(0, r() * h, w, 4);
  c.fillStyle = `rgba(10,12,16,${k})`; c.fillRect(0, 0, w, h);
}

// ======================= OFFICE 2004 =======================
export function buildOffice(scene) {
  const g = new THREE.Group(); g.position.set(2000, 0, 0); scene.add(g);
  const carpet = mottled('#4a4f58', '#42464e', '#555a63', 256, 21, 900, [1, 3]); carpet.repeat.set(6, 6);
  mesh(g, new THREE.PlaneGeometry(14, 14), std(0xffffff, { map: carpet, r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xb9b2a5, { r: 0.9 });
  box(g, 10, 3.2, 0.2, wallM, 0, 1.6, -3); box(g, 0.2, 3.2, 8, wallM, -4.5, 1.6, 1);
  // night window
  const winT = canvasTex(256, 192, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#060b18'); gr.addColorStop(1, '#16223c'); c.fillStyle = gr; c.fillRect(0, 0, w, h); const r = rng(4); for (let i = 0; i < 12; i++) { const bw = 14 + r() * 26, bh = 40 + r() * 110, bx = r() * w; c.fillStyle = '#0b1222'; c.fillRect(bx, h - bh, bw, bh); for (let y = h - bh + 6; y < h - 4; y += 9) for (let x = bx + 3; x < bx + bw - 3; x += 7) if (r() < 0.3) { c.fillStyle = '#e8c27a'; c.fillRect(x, y, 3, 4); } } });
  box(g, 2.6, 1.6, 0.05, basic(0xffffff, { map: winT }), 2.2, 1.9, -2.88, { cast: false });
  box(g, 2.8, 0.08, 0.2, std(0xdddddd), 2.2, 1.08, -2.85);
  // whiteboard with sketch
  const wbT = canvasTex(512, 300, (c, w, h) => { c.fillStyle = '#f4f4ef'; c.fillRect(0, 0, w, h); c.strokeStyle = '#2b5fae'; c.lineWidth = 4; c.font = '700 44px Inter'; c.fillStyle = '#2b5fae'; c.fillText('DynaBlocks', 30, 70); c.strokeRect(60, 120, 60, 60); c.strokeRect(120, 120, 60, 60); c.strokeRect(90, 60 + 120 - 120 + 0, 0, 0); c.strokeRect(90, 180, 60, 60); c.strokeStyle = '#c0392b'; c.beginPath(); c.moveTo(220, 150); c.lineTo(300, 150); c.lineTo(285, 138); c.moveTo(300, 150); c.lineTo(285, 162); c.stroke(); c.fillStyle = '#c0392b'; c.font = '600 30px Inter'; c.fillText('physics!', 320, 160); c.fillStyle = '#333'; c.font = '500 24px Inter'; c.fillText('- build anything', 60, 280); });
  box(g, 2.4, 1.4, 0.04, std(0xffffff, { map: wbT, r: 0.4 }), -1.6, 1.8, -2.88, { cast: false });
  // desk
  const deskM = std(0x8a7357, { r: 0.6 });
  box(g, 2.2, 0.06, 0.9, deskM, 0.6, 0.76, -2.2); box(g, 0.06, 0.76, 0.85, deskM, -0.45, 0.38, -2.2); box(g, 0.06, 0.76, 0.85, deskM, 1.65, 0.38, -2.2);
  // CRT monitor
  const crtM = std(0xcfc8b8, { r: 0.6 });
  const crt = new THREE.Group(); crt.position.set(0.5, 0.79, -2.35); g.add(crt);
  rb(crt, 0.62, 0.52, 0.55, crtM, 0, 0.3, -0.08, { rad: 0.05 });
  box(crt, 0.36, 0.1, 0.3, crtM, 0, 0.03, -0.05);
  const scrT = canvasTex(400, 300, () => {});
  const scr = mesh(crt, new THREE.PlaneGeometry(0.5, 0.38), basic(0xffffff, { map: scrT, tm: false }), 0, 0.31, 0.2, { cast: false });
  box(g, 0.55, 0.03, 0.18, std(0xd6d0c2), 0.45, 0.8, -1.95);
  const lampL = new THREE.PointLight(0xffc27a, 6, 6, 1.6); lampL.position.set(1.4, 1.35, -2.2); g.add(lampL);
  box(g, 0.05, 0.45, 0.05, std(0x333333), 1.4, 1.0, -2.4); rb(g, 0.24, 0.16, 0.24, std(0x333333, { e: 0xffc27a, ei: 1.5, unique: true }), 1.4, 1.25, -2.3, { rad: 0.04, cast: false });
  rb(g, 0.42, 0.06, 0.42, std(0xb5442e, { r: 0.8 }), 1.2, 0.81, -1.95, { rad: 0.02 }); // pizza box
  const scrLight = new THREE.PointLight(0x9fd0ff, 2, 3, 2); scrLight.position.set(0.5, 1.15, -1.8); g.add(scrLight);
  // chairs + coder
  for (const x of [0.45, -0.6]) { box(g, 0.5, 0.06, 0.5, std(0x2b2f36), x, 0.48, -1.35); box(g, 0.5, 0.6, 0.06, std(0x2b2f36), x, 0.8, -1.1); box(g, 0.06, 0.45, 0.06, std(0x222222), x, 0.24, -1.35); }
  const coder = makePerson({ seed: 2004, shirt: 0x4a5a70, pants: 0x2b3445, hair: 0x5a4030, skin: 0xe8c4a8 }); g.add(coder.g);
  const coder2 = makePerson({ seed: 2005, shirt: 0x7a3b30, pants: 0x3b3b3b, hair: 0x2a1d15, skin: 0xe8c4a8 }); g.add(coder2.g);
  const CODE = ['-- DynaBlocks prototype', 'local world = Physics.new()', 'function addBlock(x, y, z)', '  local b = Block.new(2, 2, 2)', '  b.Position = Vec3(x, y, z)', '  b.Anchored = false', '  world:add(b)', 'end', '', 'for i = 1, 10 do', '  addBlock(0, i * 2, 0)', 'end', 'world:run() -- it works!!'];
  function drawScreen(state, t, k = 0) {
    redraw(scrT, (c, w, h) => {
      c.fillStyle = '#0d1a12'; c.fillRect(0, 0, w, h);
      if (state === 'off') { c.fillStyle = '#050505'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2a2a'; c.font = mono(700, 16); c.textAlign = 'center'; c.fillText('NO SIGNAL', w / 2, h / 2); return; }
      c.font = mono(500, 17); c.textAlign = 'left';
      const shown = state === 'erase' ? Math.floor(CODE.length * (1 - k)) : CODE.length;
      CODE.slice(0, shown).forEach((l, i) => { c.fillStyle = l.startsWith('--') ? '#6a9955' : '#b5f5c0'; c.fillText(l, 14, 26 + i * 21); });
      if (Math.floor(t * 2) % 2 === 0) { c.fillStyle = '#b5f5c0'; c.fillRect(14 + (state === 'erase' ? 0 : 10), 26 + shown * 21 - 14, 9, 17); }
      // scanlines
      c.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < h; y += 3) c.fillRect(0, y, w, 1);
    });
  }
  return { group: g, drawScreen, coder, coder2, scr, scrLight };
}

// ======================= BEDROOM (eras) =======================
export function buildBedroom(scene) {
  const g = new THREE.Group(); g.position.set(3000, 0, 0); scene.add(g);
  const wood = mottled('#9b7650', '#8c6a46', '#a9845c', 256, 33, 800, [2, 9]); wood.repeat.set(4, 4);
  mesh(g, new THREE.PlaneGeometry(12, 12), std(0xffffff, { map: wood, r: 0.7 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xd8d4ec, { r: 0.9, unique: true });
  box(g, 9, 3, 0.2, wallM, 0, 1.5, -3); box(g, 0.2, 3, 7, wallM, -4, 1.5, 0.5);
  // window
  const winDay = canvasTex(256, 200, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#8fc3ec'); gr.addColorStop(1, '#e6f1f8'); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.fillStyle = '#6aa56a'; c.fillRect(0, h * 0.75, w, h * 0.25); for (let i = 0; i < 5; i++) { c.fillStyle = '#4f8a4f'; c.beginPath(); c.arc(30 + i * 52, h * 0.74, 22, 0, 7); c.fill(); } });
  const winNight = canvasTex(256, 200, (c, w, h) => { c.fillStyle = '#0a1226'; c.fillRect(0, 0, w, h); c.fillStyle = '#1a2440'; c.fillRect(0, h * 0.7, w, h); const r = rng(8); for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(160,190,230,0.35)'; c.fillRect(r() * w, r() * h, 1, 10 + r() * 14); } });
  const winM = basic(0xffffff, { map: winDay });
  box(g, 1.8, 1.3, 0.05, winM, 2.2, 1.75, -2.88, { cast: false });
  box(g, 1.95, 0.08, 0.2, std(0xffffff), 2.2, 1.06, -2.85); box(g, 0.05, 1.3, 0.06, std(0xffffff), 2.2, 1.75, -2.86, { cast: false });
  // bed
  box(g, 2.0, 0.42, 1.3, std(0x6b4a33), -2.95, 0.21, 0.6); box(g, 1.95, 0.2, 1.25, std(0xf2f0ea), -2.95, 0.52, 0.6);
  rb(g, 1.6, 0.12, 1.28, std(0x3f6fb0, { r: 0.9, unique: true }), -2.75, 0.65, 0.6, { rad: 0.05 });
  rb(g, 0.4, 0.14, 0.8, std(0xffffff), -3.7, 0.68, 0.6, { rad: 0.06 });
  // posters
  const posterT = (txt, bg, fg) => canvasTex(200, 280, (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.font = '800 34px Inter'; c.textAlign = 'center'; txt.split('\n').forEach((l, i) => c.fillText(l, w / 2, 70 + i * 44)); c.fillRect(40, 190, 120, 60); });
  box(g, 0.02, 0.9, 0.65, std(0xffffff, { map: posterT('SPACE\nRACE', '#1b2a4a', '#ffd23f') }), -3.88, 1.9, -1.2, { cast: false });
  box(g, 0.65, 0.9, 0.02, std(0xffffff, { map: posterT('SKATE', '#c0392b', '#fff') }), 0.2, 2.0, -2.88, { cast: false });
  // desk
  const deskM = std(0xe8e2d8, { r: 0.6 });
  box(g, 1.9, 0.05, 0.75, deskM, 1.9, 0.74, -2.5); box(g, 0.05, 0.74, 0.7, deskM, 1.0, 0.37, -2.5); box(g, 0.05, 0.74, 0.7, deskM, 2.8, 0.37, -2.5);
  // era props
  const era = {};
  const scrT = canvasTex(400, 300, () => {});
  const scrM = basic(0xffffff, { map: scrT, tm: false });
  // 2006: CRT
  era['2006'] = new THREE.Group(); g.add(era['2006']);
  rb(era['2006'], 0.6, 0.5, 0.5, std(0xd9d3c4, { r: 0.6 }), 1.9, 1.04, -2.65, { rad: 0.05 });
  mesh(era['2006'], new THREE.PlaneGeometry(0.48, 0.36), scrM, 1.9, 1.05, -2.395, { cast: false });
  box(era['2006'], 0.42, 0.03, 0.15, std(0xd9d3c4), 1.9, 0.78, -2.2);
  // 2010: laptop
  era['2010'] = new THREE.Group(); g.add(era['2010']);
  box(era['2010'], 0.5, 0.025, 0.34, std(0x3a3d42, { r: 0.4, m: 0.4 }), 1.9, 0.775, -2.35);
  const lid = new THREE.Group(); lid.position.set(1.9, 0.79, -2.52); lid.rotation.x = -0.25; era['2010'].add(lid);
  box(lid, 0.5, 0.33, 0.015, std(0x3a3d42, { r: 0.4, m: 0.4 }), 0, 0.165, 0);
  mesh(lid, new THREE.PlaneGeometry(0.46, 0.29), scrM, 0, 0.165, 0.009, { cast: false });
  // 2016 / today: two monitors + RGB
  for (const key of ['2016', 'today']) {
    const e = new THREE.Group(); g.add(e); era[key] = e;
    for (const [x, ry] of key === '2016' ? [[1.55, 0.25], [2.25, -0.25]] : [[1.9, 0]]) {
      const mon = new THREE.Group(); mon.position.set(x, 0.77, -2.6); mon.rotation.y = ry; e.add(mon);
      rb(mon, key === 'today' ? 0.9 : 0.62, key === 'today' ? 0.5 : 0.38, 0.04, std(0x15171a, { r: 0.4 }), 0, 0.42, 0, { rad: 0.015 });
      mesh(mon, new THREE.PlaneGeometry(key === 'today' ? 0.86 : 0.58, key === 'today' ? 0.46 : 0.34), scrM, 0, 0.42, 0.021, { cast: false });
      box(mon, 0.04, 0.2, 0.04, std(0x222222), 0, 0.12, -0.02);
    }
    box(e, 0.5, 0.02, 0.16, std(0x222222), 1.9, 0.775, -2.25);
    if (key === 'today') box(e, 1.9, 0.02, 0.02, basic(0xa45cff, { tm: false }), 1.9, 0.72, -2.13, { cast: false });
  }
  // toy blocky figure on the desk
  const toy = makeBlocky({ u: 0.035, seed: 3 }); toy.g.position.set(2.55, 0.765, -2.3); toy.g.rotation.y = -0.5; g.add(toy.g);
  // chair + kid
  const chair = new THREE.Group(); g.add(chair); chair.position.set(1.9, 0, -1.7);
  box(chair, 0.5, 0.06, 0.5, std(0x2f3a4a), 0, 0.48, 0); box(chair, 0.5, 0.6, 0.06, std(0x2f3a4a), 0, 0.82, 0.25); box(chair, 0.06, 0.45, 0.06, std(0x222222), 0, 0.24, 0);
  const kid = makePerson({ seed: 77, shirt: 0xe07b39, pants: 0x2c3445, hair: 0x4a3020, scale: 0.72, skin: 0xf1d3bd });
  g.add(kid.g);
  const screenLight = new THREE.PointLight(0x9fd0ff, 0, 3.5, 2); screenLight.position.set(1.9, 1.2, -2.35); g.add(screenLight);
  function setEra(key, night) {
    for (const [k, e] of Object.entries(era)) e.visible = k === key;
    winM.map = night ? winNight : winDay; winM.needsUpdate = true;
  }
  function drawScreen(fn) { redraw(scrT, fn); }
  return { group: g, setEra, drawScreen, kid, toy, chair, screenLight, wallM };
}

// ======================= CONCERT VOID =======================
export function buildConcert(scene) {
  const g = new THREE.Group(); g.position.set(4000, 0, 0); scene.add(g);
  mesh(g, new THREE.PlaneGeometry(200, 200), std(0x15121c, { r: 0.25, m: 0.4 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  // grid lines on floor
  const gridT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.strokeStyle = '#3a2a6a'; c.lineWidth = 2; c.strokeRect(0, 0, w, h); }, { repeat: true });
  gridT.repeat.set(60, 60);
  mesh(g, new THREE.PlaneGeometry(200, 200), basic(0xffffff, { map: gridT, t: true, op: 0.55, add: true, dw: false, tm: false }), 0, 0.01, 0, { rx: -Math.PI / 2, cast: false, receive: false });
  // stage
  rb(g, 20, 1.4, 8, std(0x22202a, { r: 0.4, m: 0.3 }), 0, 0.7, -14, { rad: 0.1 });
  const trussM = std(0x9a9aa6, { m: 0.7, r: 0.35 });
  for (const x of [-10, 10]) box(g, 0.5, 12, 0.5, trussM, x, 6, -14);
  box(g, 20.5, 0.5, 0.5, trussM, 0, 12, -14);
  const scrT = canvasTex(512, 256, () => {});
  const bigScreen = mesh(g, new THREE.PlaneGeometry(16, 8), basic(0xffffff, { map: scrT, tm: false }), 0, 6.6, -17.9, { cast: false });
  box(g, 16.6, 8.6, 0.3, std(0x111111), 0, 6.6, -18.1);
  // spot cones
  const cones = [];
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(2.2, 14, 24, 1, true), new THREE.MeshBasicMaterial({ color: i % 2 ? 0xff4fd8 : 0x4fd8ff, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }));
    m.position.set(-8 + i * 3.2, 11.5 - 7, -14); g.add(m); cones.push(m);
  }
  const stageL = new THREE.PointLight(0xff4fd8, 60, 40, 1.4); stageL.position.set(-5, 8, -8); g.add(stageL);
  const stageL2 = new THREE.PointLight(0x4fd8ff, 60, 40, 1.4); stageL2.position.set(5, 8, -8); g.add(stageL2);
  // performer (blocky, larger)
  const star = makeBlocky({ u: 0.75, seed: 40, head: 0xf1c9a5, arms: 0xf1c9a5, torso: 0xe8e8e8, legs: 0x8a3ad6 }); star.g.position.set(0, 1.4, -13); g.add(star.g);
  // crowd
  const crowd = []; const R = rng(41);
  const tCols = [0x1e6fd6, 0xd63a3a, 0x2fae5a, 0xf1c40f, 0x8e44ad, 0xffffff, 0x222222, 0xff7ab8];
  for (let row = 0; row < 11; row++) for (let i = 0; i < 13; i++) {
    const B = makeBlocky({ u: 0.36, seed: row * 20 + i, head: R() < 0.7 ? 0xf5cd30 : 0xf1c9a5, torso: tCols[Math.floor(R() * tCols.length)], legs: tCols[Math.floor(R() * tCols.length)] });
    B.g.position.set(-11 + i * 1.8 + (R() - 0.5) * 0.6, 0, -6 + row * 2.0 + (R() - 0.5) * 0.5); B.g.rotation.y = Math.PI + (R() - 0.5) * 0.4 + Math.PI; B.row = row; B.ph = R() * 6;
    g.add(B.g); crowd.push(B);
  }
  function drawBig(t, k) {
    redraw(scrT, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#2a0f4a'); gr.addColorStop(1, '#0f2a4a'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff'; c.font = '800 64px Inter'; c.textAlign = 'center'; c.globalAlpha = 1 - k; c.fillText('LIVE', w / 2, 110); c.font = '600 30px Inter'; c.fillText('VIRTUAL CONCERT', w / 2, 160); c.globalAlpha = 1;
      if (k > 0) { c.fillStyle = `rgba(0,0,0,${k})`; c.fillRect(0, 0, w, h); }
    });
  }
  return { group: g, crowd, star, cones, drawBig, stageL, stageL2 };
}

// ======================= TECH CAMPUS (sign) =======================
export function buildCampus(scene) {
  const g = new THREE.Group(); g.position.set(5000, 0, 0); scene.add(g);
  const grass = mottled('#6f9a4e', '#628c44', '#7ea85a', 256, 51, 900, [3, 12]); grass.repeat.set(30, 30);
  mesh(g, new THREE.PlaneGeometry(300, 300), std(0xffffff, { map: grass, r: 1 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  box(g, 300, 0.05, 8, std(0x5d6066, { r: 0.9 }), 0, 0.02, 14, { cast: false });
  // building
  const glassM = std(0x6f8aa8, { r: 0.15, m: 0.5 });
  box(g, 60, 9, 18, std(0xe8e6e0, { r: 0.8 }), 0, 4.5, -26);
  for (let x = -28; x <= 28; x += 4) box(g, 3.4, 6.5, 0.1, glassM, x, 4.6, -16.95, { cast: false });
  // sign wall
  const signT = canvasTex(1024, 256, () => {});
  const sign = new THREE.Group(); g.add(sign); sign.position.set(0, 0, 4);
  rb(sign, 9, 2.6, 0.6, std(0x2d3540, { r: 0.6 }), 0, 1.3, 0, { rad: 0.08 });
  const signFace = mesh(sign, new THREE.PlaneGeometry(8.4, 2.1), basic(0xffffff, { map: signT, tm: false }), 0, 1.35, 0.31, { cast: false });
  for (let i = 0; i < 16; i++) { const t = makeTree(500 + i, 0.9); t.position.set(-40 + i * 5.3 + (Math.abs(-40 + i * 5.3) < 7 ? 14 : 0), 0, -6 - (i % 2) * 2); g.add(t); }
  const people = []; for (let i = 0; i < 8; i++) { const P = makePerson({ seed: 5000 + i }); g.add(P.g); people.push(P); }
  function drawSign(word, k) {
    redraw(signT, (c, w, h) => {
      c.fillStyle = word === 'meta' ? '#0b2d5c' : '#1d4f9a'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#ffffff'; c.font = '800 150px Inter'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.globalAlpha = 1; c.fillText(word === 'meta' ? 'META' : 'FACEBOOK', w / 2, h / 2 + 8);
      if (k > 0 && k < 1) { const r = rng(Math.floor(k * 40)); for (let i = 0; i < 10; i++) { const y = r() * h, hh = 4 + r() * 20; c.drawImage(c.canvas, 0, y, w, hh, (r() - 0.5) * 80, y, w, hh); } }
    });
  }
  return { group: g, drawSign, people, sign };
}

// ======================= BOUTIQUE =======================
export function buildBoutique(scene) {
  const g = new THREE.Group(); g.position.set(6000, 0, 0); scene.add(g);
  const marble = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#efece6'; c.fillRect(0, 0, w, h); const r = rng(61); c.strokeStyle = 'rgba(150,140,130,0.35)'; for (let i = 0; i < 26; i++) { c.lineWidth = 0.5 + r() * 2; c.beginPath(); let x = r() * w, y = r() * h; c.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 120; y += (r() - 0.3) * 70; c.lineTo(x, y); } c.stroke(); } }, { repeat: true });
  marble.repeat.set(3, 3);
  mesh(g, new THREE.PlaneGeometry(24, 24), std(0xffffff, { map: marble, r: 0.15, m: 0.05 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0x2b2622, { r: 0.7 });
  box(g, 16, 5, 0.2, wallM, 0, 2.5, -5); box(g, 0.2, 5, 12, wallM, -7, 2.5, 0); box(g, 0.2, 5, 12, wallM, 7, 2.5, 0);
  const gold = std(0xc9a45a, { m: 0.9, r: 0.3 });
  for (const x of [-5, 5]) for (let j = 0; j < 3; j++) { box(g, 1.8, 0.05, 0.5, gold, x, 1.0 + j * 0.8, -4.7); rb(g, 0.4, 0.3, 0.18, std([0x8a2a22, 0x2b2b2b, 0xd9c7a6][j], { r: 0.4 }), x - 0.4, 1.2 + j * 0.8, -4.7, { rad: 0.06 }); rb(g, 0.4, 0.3, 0.18, std([0x2b2b2b, 0xd9c7a6, 0x5a3a2a][j], { r: 0.4 }), x + 0.4, 1.2 + j * 0.8, -4.7, { rad: 0.06 }); }
  // pedestal + holographic bag
  mesh(g, new THREE.CylinderGeometry(0.7, 0.8, 1.1, 40), std(0xf2efe8, { r: 0.3 }), 0, 0.55, -1.5);
  mesh(g, new THREE.CylinderGeometry(0.72, 0.72, 0.04, 40), gold, 0, 1.12, -1.5);
  const bag = new THREE.Group(); bag.position.set(0, 1.45, -1.5); g.add(bag);
  const holo = new THREE.MeshBasicMaterial({ color: 0x8fe6ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const bagParts = [];
  const R = rng(62);
  // bag body made of small voxels so it can dissolve
  for (let x = -7; x <= 7; x++) for (let y = 0; y <= 5; y++) for (let z = -1; z <= 1; z++) {
    const half = 7 - Math.floor(y / 2.5);
    const inside = Math.abs(x) <= half && (Math.abs(z) === 1 || Math.abs(x) === half || y === 0 || y === 5);
    if (!inside) continue;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.055, 0.055), holo); m.position.set(x * 0.06, y * 0.06, z * 0.06); bag.add(m);
    bagParts.push({ m, p: m.position.clone(), d: V(R() - 0.5, R() * 0.8, R() - 0.5).normalize(), k: R() });
  }
  for (let a = 0; a < 16; a++) { const ang = Math.PI * a / 15; const m = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.035), holo); m.position.set(Math.cos(ang) * 0.17, 0.32 + Math.sin(ang) * 0.13, 0); bag.add(m); bagParts.push({ m, p: m.position.clone(), d: V(R() - 0.5, R(), R() - 0.5).normalize(), k: R() }); }
  const holoLight = new THREE.PointLight(0x8fe6ff, 4, 5, 2); holoLight.position.set(0, 1.8, -1.2); g.add(holoLight);
  const spot = new THREE.SpotLight(0xfff1dc, 22, 20, 0.5, 0.6, 1.4); spot.position.set(0, 5, 2); spot.target.position.set(0, 1, -1.5); g.add(spot, spot.target);
  const priceT = canvasTex(256, 96, (c, w, h) => { c.fillStyle = '#111'; c.fillRect(0, 0, w, h); c.fillStyle = '#c9a45a'; c.font = '700 30px Inter'; c.textAlign = 'center'; c.fillText('350,000 R$', w / 2, 44); c.fillStyle = '#ddd'; c.font = '500 18px Inter'; c.fillText('virtual edition', w / 2, 74); });
  const tag = box(g, 0.5, 0.19, 0.02, basic(0xffffff, { map: priceT, tm: false }), 0.55, 1.2, -0.86, { cast: false }); tag.rotation.x = -0.3;
  const people = []; for (let i = 0; i < 4; i++) { const P = makePerson({ seed: 6000 + i }); g.add(P.g); people.push(P); }
  function dissolve(k, t) {
    for (const p of bagParts) { const e = clamp((k - p.k * 0.4) / 0.6); p.m.position.copy(p.p).addScaledVector(p.d, e * e * 1.4); p.m.scale.setScalar(Math.max(0.001, 1 - e)); }
    holo.opacity = 0.75 * (1 - smooth(0.6, 1, k)) * (0.85 + 0.15 * Math.sin(t * 20));
    holoLight.intensity = 4 * (1 - k);
    bag.rotation.y = t * 0.6;
  }
  return { group: g, dissolve, people, tag };
}

// ======================= GARDEN =======================
export function buildGarden(scene) {
  const g = new THREE.Group(); g.position.set(7000, 0, 0); scene.add(g);
  const grass = mottled('#7aa857', '#6c9a4b', '#88b664', 256, 71, 900, [3, 12]); grass.repeat.set(20, 20);
  mesh(g, new THREE.PlaneGeometry(200, 200), std(0xffffff, { map: grass, r: 1 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const soil = mottled('#6b4a32', '#5d4029', '#7a5638', 128, 72, 500, [2, 6]); soil.repeat.set(2, 8);
  const soilM = std(0xffffff, { map: soil, r: 1 });
  const plants = []; const R = rng(73);
  const cropCols = [0xe74c3c, 0xf39c12, 0x9b59b6, 0xf1c40f];
  for (let row = 0; row < 7; row++) {
    const x = -9 + row * 3;
    box(g, 1.4, 0.2, 18, soilM, x, 0.1, -6, { cast: false });
    for (let z = -14; z < 2; z += 1.1) {
      const p = new THREE.Group(); p.position.set(x + (R() - 0.5) * 0.3, 0.2, z); g.add(p);
      const h = 0.4 + R() * 0.5;
      mesh(p, new THREE.ConeGeometry(0.28, h, 6), std(0x4f8f3a, { r: 0.9 }), 0, h / 2, 0);
      if (R() < 0.6) mesh(p, new THREE.SphereGeometry(0.11, 10, 8), std(cropCols[row % 4], { r: 0.5 }), 0.12, h * 0.6, 0.05);
      plants.push(p);
    }
  }
  // fence
  for (let x = -12; x <= 12; x += 1.5) box(g, 0.1, 0.9, 0.1, std(0xe9e2d0), x, 0.45, 4);
  box(g, 24.2, 0.08, 0.06, std(0xe9e2d0), 0, 0.75, 4); box(g, 24.2, 0.08, 0.06, std(0xe9e2d0), 0, 0.4, 4);
  // bench + teen with laptop
  box(g, 2, 0.08, 0.5, std(0x8a6a45), 4, 0.48, 7); box(g, 2, 0.5, 0.06, std(0x8a6a45), 4, 0.78, 7.25); box(g, 0.08, 0.48, 0.45, std(0x444444), 3.1, 0.24, 7); box(g, 0.08, 0.48, 0.45, std(0x444444), 4.9, 0.24, 7);
  const teen = makePerson({ seed: 7007, shirt: 0x5a7d5a, pants: 0x2c3445, scale: 0.86 }); g.add(teen.g);
  const lap = new THREE.Group(); g.add(lap);
  box(lap, 0.42, 0.02, 0.3, std(0x3a3d42, { m: 0.4, r: 0.4 }), 0, 0, 0);
  const lapT = canvasTex(400, 300, () => {});
  const lid = new THREE.Group(); lid.position.set(0, 0.01, -0.15); lid.rotation.x = -0.35; lap.add(lid);
  box(lid, 0.42, 0.28, 0.012, std(0x3a3d42, { m: 0.4, r: 0.4 }), 0, 0.14, 0);
  mesh(lid, new THREE.PlaneGeometry(0.39, 0.25), basic(0xffffff, { map: lapT, tm: false }), 0, 0.14, 0.008, { cast: false });
  // blocky gardeners
  const garden = [];
  for (let i = 0; i < 9; i++) { const B = makeBlocky({ u: 0.5, seed: 700 + i, torso: [0x1e6fd6, 0xd63a3a, 0x2fae5a, 0x8e44ad][i % 4] }); B.g.position.set(-9 + (i % 7) * 3 + 0.9, 0, -12 + i * 1.6); B.g.rotation.y = (i % 2 ? 1 : -1) * 1.2; g.add(B.g); garden.push(B); }
  return { group: g, plants, teen, lap, lapT, garden };
}

// ======================= EARTH with player lights =======================
export function buildEarth(scene, loader) {
  const g = new THREE.Group(); g.position.set(20000, 0, 0); scene.add(g);
  const RAD = 50;
  const dayT = loader.load('vendor/earth_atmos_2048.jpg'); dayT.colorSpace = THREE.SRGBColorSpace;
  const lightsT = loader.load('vendor/earth_lights_2048.png'); lightsT.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: dayT, emissiveMap: lightsT, emissive: new THREE.Color(0xffc879), emissiveIntensity: 1.1, roughness: 0.9 });
  mat.color.setScalar(0.3);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(RAD, 96, 64), mat); g.add(earth);
  const fresnel = (rad, side, power, gain, col) => new THREE.Mesh(new THREE.SphereGeometry(rad, 64, 48), new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, side, depthWrite: false, uniforms: { c: { value: new THREE.Color(col) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: `uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), ${power.toFixed(1)}); gl_FragColor = vec4(c * f * ${gain.toFixed(2)}, f); }`,
  }));
  g.add(fresnel(RAD * 1.035, THREE.BackSide, 2.2, 1.6, 0x5aa8ff));
  g.add(fresnel(RAD * 1.003, THREE.FrontSide, 3.0, 0.9, 0x4a90e0));
  const R = rng(99); const sp = [];
  for (let i = 0; i < 2500; i++) { const v = V(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(1500); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  g.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 })));
  const ll2v = (la, lo, r = RAD) => { const phi = (90 - la) * Math.PI / 180, th = (lo + 180) * Math.PI / 180; return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); };
  // player points sampled from the night-lights image (populated places), each with its own smooth fade
  const players = { ready: false };
  const img = new Image(); img.src = 'vendor/earth_lights_2048.png';
  img.onload = () => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 512, 256);
    const d = x.getImageData(0, 0, 512, 256).data; const pr = rng(7);
    const pos = [], seed = [];
    for (let j = 0; j < 256; j++) for (let i = 0; i < 512; i++) {
      const v = d[(j * 512 + i) * 4] / 255; if (v < 0.12 || pr() > v * 1.1) continue;
      const la = 90 - (j + pr()) / 256 * 180, lo = (i + pr()) / 512 * 360 - 180;
      const p = ll2v(la, lo, RAD + 0.25); pos.push(p.x, p.y, p.z);
      // fade order: smooth spatial noise (regions) + per-point jitter -> organic, no blocks
      const n = 0.5 + 0.25 * Math.sin(la * 0.09 + lo * 0.05) + 0.25 * Math.sin(lo * 0.13 - la * 0.04 + 1.3);
      seed.push(clamp(n * 0.75 + pr() * 0.25));
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('k', new THREE.Float32BufferAttribute(seed, 1));
    const pm = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { fade: { value: 0 }, time: { value: 0 }, col: { value: new THREE.Color(0x5fe0ff) } },
      vertexShader: `attribute float k; uniform float fade; uniform float time; varying float vA;
        void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize((modelMatrix * vec4(position,1.0)).xyz - (modelMatrix * vec4(0.0,0.0,0.0,1.0)).xyz);
          vec3 toCam = normalize(cameraPosition - (modelMatrix * vec4(position,1.0)).xyz);
          float facing = smoothstep(-0.05, 0.2, dot(n, toCam));
          float alive = 1.0 - smoothstep(k - 0.06, k + 0.06, fade * 1.15);
          vA = alive * facing * (0.75 + 0.25 * sin(time * 3.0 + k * 40.0));
          gl_PointSize = 3.0 + 2.6 * alive;
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform vec3 col; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard; gl_FragColor = vec4(col * (1.0 - r * 1.4) * vA * 2.4, vA); }`,
    });
    const pts = new THREE.Points(geo, pm); earth.add(pts);
    players.mat = pm; players.ready = true;
  };
  // multiplayer arcs between big player hubs
  const hubs = [[40.7, -74], [34, -118.2], [41.9, -87.6], [43.7, -79.4], [19.4, -99.1], [-23.5, -46.6], [51.5, -0.1], [48.9, 2.3], [52.5, 13.4], [40.4, -3.7], [41.9, 12.5], [59.3, 18.1], [55.8, 37.6], [35.7, 139.7], [37.6, 127], [-33.9, 151.2], [1.35, 103.8], [14.6, 121], [-6.2, 106.8], [25.2, 55.3], [6.5, 3.4], [30, 31.2]];
  const arcs = []; const ar = rng(3);
  for (let i = 0; i < 60; i++) {
    const a = hubs[Math.floor(ar() * hubs.length)], b = hubs[Math.floor(ar() * hubs.length)]; if (a === b) continue;
    const va = ll2v(a[0], a[1]), vb = ll2v(b[0], b[1]); const mid = va.clone().add(vb).multiplyScalar(0.5); mid.normalize().multiplyScalar(RAD + va.distanceTo(vb) * 0.22);
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(va, mid, vb), 48, 0.08, 5, false), new THREE.MeshBasicMaterial({ color: 0x5fe0ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
    earth.add(m); arcs.push({ m, k: ar() });
  }
  function update(t, fade, arcAlive) {
    if (players.ready) { players.mat.uniforms.fade.value = fade; players.mat.uniforms.time.value = t; }
    for (const a of arcs) { const al = 1 - smooth(a.k - 0.1, a.k + 0.1, 1 - arcAlive); a.m.material.opacity = (0.3 + 0.3 * Math.sin(t * 3 + a.k * 20)) * al; a.m.visible = al > 0.01; }
  }
  return { group: g, earth, update, mat, ready: () => players.ready };
}
