// Interior / special sets. Each set is a Group far from the others; shots toggle visibility.
import * as THREE from 'three';
import { rng, std, basic, box, rb, mesh, rbox, mottled, makeTree, makeCar, makePerson, canvasTex, redraw, V, clamp, lerp, smooth, CAR_COLS, SHIRTS } from './lib.js';

const sans = (w, px) => `${w} ${px}px Inter`;
const serif = (px, it = '') => `${it} 400 ${px}px Serif`;

// ======================= PHONE =======================
export function buildPhone(scene) {
  const g = new THREE.Group(); g.position.set(2000, 0, 0); scene.add(g);
  const wood = mottled('#8a6446', '#7a573b', '#9a7354', 256, 8, 900, [2, 10]); wood.repeat.set(2, 1);
  mesh(g, rbox(3.2, 0.08, 2.0, 0.03), std(0xffffff, { map: wood, r: 0.55 }), 0, 0.76, 0);
  box(g, 0.08, 0.76, 0.08, std(0x2a2a2a), 0, 0.38, 0);
  mesh(g, new THREE.PlaneGeometry(40, 40), std(0x9c8f80, { r: 0.9 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  // background cafe: wall, windows, lamps, other tables
  box(g, 30, 8, 0.3, std(0xd9cfc2, { r: 0.9 }), 0, 4, -6);
  for (let i = -3; i <= 3; i++) box(g, 2.6, 3.2, 0.1, basic(0xeaf3fb, { tm: false }), i * 3.6, 2.4, -5.8, { cast: false });
  for (let i = -2; i <= 2; i++) { const l = rb(g, 0.5, 0.35, 0.5, std(0x222222, { e: 0xffd9a0, ei: 2.5, unique: true }), i * 2.6, 3.2, -2.5, { rad: 0.15, cast: false }); }
  for (const [x, z] of [[-2.8, -2.6], [2.6, -3.2], [-0.5, -4]]) { mesh(g, rbox(1.4, 0.06, 1.0, 0.02), std(0x7a5a40), x, 0.76, z); const P = makePerson({ seed: Math.floor(x * 10) + 7 }); P.sit(); P.g.position.set(x, 0, z - 0.8); g.add(P.g); P.usePhone(true); }
  // phone
  const phone = new THREE.Group(); g.add(phone); phone.position.set(0.05, 0.81, 0.15); phone.rotation.set(-Math.PI / 2, 0, 0.32);
  mesh(phone, rbox(0.36, 0.74, 0.04, 0.05), std(0x101113, { r: 0.25, m: 0.6 }), 0, 0, 0);
  const tex = canvasTex(360, 760, () => {});
  const screen = mesh(phone, new THREE.PlaneGeometry(0.33, 0.7), basic(0xffffff, { map: tex, tm: false }), 0, 0, 0.021, { cast: false });
  // cup + keys
  const cupM = std(0xf4f1ec, { r: 0.4 });
  mesh(g, new THREE.CylinderGeometry(0.11, 0.09, 0.22, 24), cupM, -0.75, 0.91, -0.35);
  mesh(g, new THREE.CylinderGeometry(0.2, 0.2, 0.015, 32), cupM, -0.75, 0.805, -0.35);
  mesh(g, new THREE.CylinderGeometry(0.095, 0.095, 0.01, 24), std(0x4a2a17, { r: 0.2 }), -0.75, 1.015, -0.35, { cast: false });
  mesh(g, new THREE.TorusGeometry(0.05, 0.012, 8, 20), std(0xb8b8b8, { m: 0.8, r: 0.3 }), 0.75, 0.81, 0.35, { rx: -Math.PI / 2 });
  const light = new THREE.PointLight(0xbfe0ff, 0, 1.2, 2); light.position.set(0.05, 1.0, 0.15); g.add(light);

  function draw(state, t) {
    redraw(tex, (c, w, h) => {
      c.fillStyle = state === 0 ? '#f3f5f8' : '#0e1116'; c.fillRect(0, 0, w, h);
      c.fillStyle = state === 0 ? '#111' : '#cfd6df'; c.font = sans(600, 22); c.textAlign = 'left'; c.fillText('8:13', 26, 40);
      // status icons
      c.textAlign = 'right'; c.font = sans(700, 18); c.fillText(state === 0 ? '5G ▮▮▮▮' : 'No service', w - 24, 40);
      if (state === 0) {
        // a social feed
        for (let i = 0; i < 4; i++) { const y = 80 + i * 170; c.fillStyle = '#fff'; c.fillRect(16, y, w - 32, 158); c.fillStyle = ['#7cc6ff', '#ffb37c', '#9be3a8', '#d7a8ff'][i]; c.beginPath(); c.arc(50, y + 34, 20, 0, 7); c.fill(); c.fillStyle = '#ccd3db'; c.fillRect(80, y + 22, 140, 10); c.fillRect(80, y + 40, 90, 8); c.fillStyle = ['#cfe6f7', '#f7e2cf', '#d8f2dc', '#ead8f7'][i]; c.fillRect(30, y + 68, w - 60, 76); }
      } else {
        const cx = w / 2, cy = 300;
        c.strokeStyle = '#cfd6df'; c.lineWidth = 9; c.lineCap = 'round';
        for (const [r, a] of [[70, 1], [48, 1], [26, 1]]) { c.beginPath(); c.arc(cx, cy + 30, r, Math.PI * 1.22, Math.PI * 1.78); c.stroke(); }
        c.fillStyle = '#cfd6df'; c.beginPath(); c.arc(cx, cy + 30, 7, 0, 7); c.fill();
        c.strokeStyle = '#ff6b5e'; c.beginPath(); c.moveTo(cx - 62, cy - 50); c.lineTo(cx + 62, cy + 60); c.stroke();
        c.fillStyle = '#fff'; c.textAlign = 'center'; c.font = sans(700, 30); c.fillText('No internet', cx, 430);
        c.fillStyle = '#9aa5b1'; c.font = sans(500, 19); c.fillText('Try checking your connection.', cx, 468);
        // spinner
        const a0 = t * 6;
        c.strokeStyle = '#7cc6ff'; c.lineWidth = 6; c.beginPath(); c.arc(cx, 560, 24, a0, a0 + 4.2); c.stroke();
        c.fillStyle = '#ff6b5e'; c.font = sans(600, 18); c.fillText('Message not sent. Tap to retry.', cx, 660);
      }
    });
  }
  return { group: g, draw, screen, light, phone, focus: V(2000.05, 0.81, 0.15) };
}

// ======================= STORE (supermarket + checkout + pharmacy) =======================
export function buildStore(scene) {
  const g = new THREE.Group(); g.position.set(3000, 0, 0); scene.add(g);
  const R = rng(77);
  const floorT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#e9e6df'; c.fillRect(0, 0, w, h); c.strokeStyle = '#d6d2c9'; c.lineWidth = 3; for (let i = 0; i <= 4; i++) { c.beginPath(); c.moveTo(i * 64, 0); c.lineTo(i * 64, h); c.stroke(); c.beginPath(); c.moveTo(0, i * 64); c.lineTo(w, i * 64); c.stroke(); } }, { repeat: true });
  floorT.repeat.set(12, 12);
  mesh(g, new THREE.PlaneGeometry(48, 48), std(0xffffff, { map: floorT, r: 0.35 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xeeebe4, { r: 0.9 });
  box(g, 48, 6, 0.3, wallM, 0, 3, -24); box(g, 0.3, 6, 48, wallM, -24, 3, 0); box(g, 0.3, 6, 48, wallM, 24, 3, 0);
  box(g, 48, 0.2, 48, std(0xf2f2f0, { r: 0.9 }), 0, 6, 0, { cast: false });
  for (let x = -18; x <= 18; x += 6) for (let z = -20; z <= 18; z += 5) box(g, 1.2, 0.05, 2.4, std(0xffffff, { e: 0xffffff, ei: 0.8 }), x, 5.88, z, { cast: false });
  // aisles of shelves along z
  const shelfM = std(0xdedad2, { r: 0.7, m: 0.1 });
  const prodCols = [0xd6453a, 0xf0b33c, 0x3e7cc2, 0x55a35a, 0xe8e2d0, 0x8a4fa8, 0xf07c3c, 0x2f5a8a, 0xc9c9c9];
  const prodGeo = new THREE.BoxGeometry(0.28, 0.34, 0.26);
  const prods = [];
  const aisles = [-12, -6, 0, 6, 12];
  for (const ax of aisles) {
    const z0 = -18, z1 = 4;
    box(g, 1.2, 2.3, z1 - z0, shelfM, ax, 1.15, (z0 + z1) / 2);
    for (const side of [-1, 1]) for (let lvl = 0; lvl < 4; lvl++) {
      box(g, 0.55, 0.05, z1 - z0, shelfM, ax + side * 0.85, 0.25 + lvl * 0.55, (z0 + z1) / 2, { cast: false });
      for (let z = z0 + 0.3; z < z1 - 0.2; z += 0.3) prods.push({ x: ax + side * 0.85, y: 0.25 + lvl * 0.55 + 0.2, z, c: prodCols[Math.floor(R() * prodCols.length)], r: R(), h: 0.8 + R() * 0.4 });
    }
  }
  const prodMesh = new THREE.InstancedMesh(prodGeo, std(0xffffff, { r: 0.6, unique: true }), prods.length);
  prodMesh.castShadow = false; prodMesh.receiveShadow = true;
  const m4 = new THREE.Matrix4(), col = new THREE.Color();
  prods.forEach((p, i) => { m4.makeScale(1, p.h, 1).setPosition(p.x, p.y, p.z); prodMesh.setMatrixAt(i, m4); prodMesh.setColorAt(i, col.set(p.c)); });
  g.add(prodMesh);
  function setStock(frac) { // 1 = full, 0 = empty
    prods.forEach((p, i) => { const s = p.r < frac ? 1 : 0; m4.makeScale(s, p.h * s, s).setPosition(p.x, p.y, p.z); prodMesh.setMatrixAt(i, m4); });
    prodMesh.instanceMatrix.needsUpdate = true;
  }
  // aisle signs
  for (const [i, ax] of aisles.entries()) {
    const t = canvasTex(256, 64, (c, w, h) => { c.fillStyle = '#2d5d8a'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = sans(700, 30); c.textAlign = 'center'; c.fillText(['BAKERY', 'PASTA · RICE', 'CANNED', 'DRINKS', 'BABY · CARE'][i], w / 2, 43); });
    box(g, 2.6, 0.6, 0.05, basic(0xffffff, { map: t }), ax, 4.3, 3.8, { cast: false });
  }
  // checkout lanes (front, z ~ 10)
  const counterM = std(0x3b4a5a, { r: 0.5 }), beltM = std(0x1d1d1d, { r: 0.7 });
  const terms = [];
  for (const cx of [-10, -4, 2, 8]) {
    rb(g, 1.0, 0.95, 4.2, counterM, cx, 0.475, 10, { rad: 0.06 });
    box(g, 0.75, 0.04, 3.2, beltM, cx, 0.96, 9.6, { cast: false });
    // terminal
    const term = new THREE.Group(); term.position.set(cx + 0.55, 1.12, 11.8); g.add(term);
    box(term, 0.04, 0.3, 0.04, std(0x333333), 0, -0.1, 0);
    rb(term, 0.22, 0.34, 0.08, std(0x1b1b1b, { r: 0.4 }), 0, 0.12, 0, { rad: 0.03 });
    const tt = canvasTex(160, 200, () => {});
    const sc = mesh(term, new THREE.PlaneGeometry(0.17, 0.13), basic(0xffffff, { map: tt, tm: false }), 0, 0.2, 0.041, { cast: false });
    term.rotation.y = 0.5;
    terms.push({ term, tt });
    box(g, 0.08, 1.6, 0.08, std(0x777777), cx - 0.4, 0.8 + 0.95, 11.9);
    const n = canvasTex(64, 64, (c) => { c.fillStyle = '#e8f1f8'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#2d5d8a'; c.font = sans(800, 44); c.textAlign = 'center'; c.fillText(String(terms.length), 32, 48); });
    rb(g, 0.4, 0.4, 0.1, basic(0xffffff, { map: n }), cx - 0.4, 2.7, 11.9, { cast: false, rad: 0.04 });
  }
  function drawTerm(state, t) {
    for (const { tt } of terms) redraw(tt, (c, w, h) => {
      c.fillStyle = state === 0 ? '#e8f1f8' : '#1a0b0b'; c.fillRect(0, 0, w, h);
      c.textAlign = 'center';
      if (state === 0) { c.fillStyle = '#1a3a5a'; c.font = sans(700, 22); c.fillText('TOTAL', w / 2, 70); c.font = sans(800, 34); c.fillText('$47.80', w / 2, 112); c.font = sans(600, 16); c.fillText('Tap card', w / 2, 160); }
      else { c.fillStyle = '#ff4a3d'; c.font = sans(800, 30); c.fillText('DECLINED', w / 2, 80); c.fillStyle = '#ffd0cc'; c.font = sans(600, 17); c.fillText('NO CONNECTION', w / 2, 118); c.fillText('ERROR 0x1F', w / 2, 146); }
    });
  }
  // pharmacy counter at the back right
  const ph = new THREE.Group(); g.add(ph); ph.position.set(16, 0, -10);
  rb(ph, 6, 1.1, 1.2, std(0xf5f5f5, { r: 0.5 }), 0, 0.55, 0, { rad: 0.05 });
  box(ph, 6.4, 3.2, 0.2, std(0xffffff, { r: 0.8 }), 0, 2.2, -2.4);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) box(ph, 1.8, 0.04, 0.4, shelfM, -2 + i * 2, 1.0 + j * 0.6, -2.1, { cast: false });
  const meds = [];
  for (let i = 0; i < 90; i++) { const b = box(ph, 0.16, 0.2, 0.14, std([0xffffff, 0xd8e8f5, 0xf5e0d8, 0xe0f0e0][i % 4]), -2.8 + (i % 30) * 0.19, 1.13 + Math.floor(i / 30) * 0.6, -2.0, { cast: false }); meds.push(b); }
  const phSign = canvasTex(512, 96, (c, w, h) => { c.fillStyle = '#2e8b57'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = sans(800, 54); c.textAlign = 'center'; c.fillText('✚  PHARMACY', w / 2, 68); });
  box(ph, 4.4, 0.8, 0.08, basic(0xffffff, { map: phSign, tm: false }), 0, 4.2, -2.3, { cast: false });
  const note = canvasTex(256, 330, (c, w, h) => { c.fillStyle = '#fbfbf6'; c.fillRect(0, 0, w, h); c.fillStyle = '#c0261b'; c.font = sans(800, 34); c.textAlign = 'center'; c.fillText('SYSTEM', w / 2, 70); c.fillText('DOWN', w / 2, 110); c.fillStyle = '#222'; c.font = sans(600, 22); ['We cannot fill', 'prescriptions.', 'No new stock', 'until further', 'notice.'].forEach((l, i) => c.fillText(l, w / 2, 170 + i * 30)); });
  box(ph, 0.62, 0.8, 0.02, std(0xffffff, { map: note, r: 0.9 }), 0.5, 1.5, 0.62, { cast: false }).rotation.x = -0.15;
  function setMeds(frac) { meds.forEach((m, i) => m.visible = ((i * 37) % 90) / 90 < frac); }
  // people pool
  const people = [];
  for (let i = 0; i < 16; i++) { const P = makePerson({ seed: 300 + i }); g.add(P.g); people.push(P); }
  return { group: g, setStock, drawTerm, setMeds, people, terms, origin: V(3000, 0, 0) };
}

// ======================= AIRPORT =======================
export function buildAirport(scene) {
  const g = new THREE.Group(); g.position.set(4000, 0, 0); scene.add(g);
  const floorT = mottled('#d9d6cf', '#cfcbc3', '#e2dfd8', 256, 31, 500, [2, 8]); floorT.repeat.set(10, 10);
  mesh(g, new THREE.PlaneGeometry(80, 80), std(0xffffff, { map: floorT, r: 0.25, m: 0.05 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  box(g, 80, 0.4, 80, std(0xf0f0ee, { r: 0.9 }), 0, 12, 0, { cast: false });
  // ceiling beams + skylights
  for (let x = -30; x <= 30; x += 6) box(g, 0.5, 0.6, 80, std(0xdadada), x, 11.6, 0, { cast: false });
  for (let x = -27; x <= 27; x += 6) box(g, 3, 0.05, 70, basic(0xf4f8ff, { tm: false }), x, 11.75, 0, { cast: false });
  // glass wall at z=-20 with view of planes
  for (let x = -36; x <= 36; x += 4) box(g, 0.2, 11, 0.2, std(0x9aa3ab, { m: 0.4, r: 0.4 }), x, 5.5, -20);
  box(g, 80, 11, 0.05, std(0xcfe0ea, { t: true, op: 0.18, r: 0.05 }), 0, 5.5, -20, { cast: false });
  mesh(g, new THREE.PlaneGeometry(400, 200), std(0x8f948f, { r: 0.95 }), 0, -0.02, -120, { rx: -Math.PI / 2, cast: false });
  // plane outside
  const plane = new THREE.Group(); g.add(plane); plane.position.set(-6, 0, -44); plane.rotation.y = 0.5;
  const white = std(0xf2f3f5, { r: 0.4 });
  mesh(plane, new THREE.CapsuleGeometry(2.1, 30, 8, 18), white, 0, 4.2, 0, { rx: Math.PI / 2 });
  box(plane, 34, 0.5, 5, white, 0, 3.6, 2);
  box(plane, 0.5, 6, 4, white, 0, 8.5, 15.5);
  box(plane, 11, 0.4, 3, white, 0, 5, 15.5);
  for (const x of [-7, 7]) mesh(plane, new THREE.CylinderGeometry(1.1, 1.1, 3.2, 18), std(0xb9bec4, { r: 0.4, m: 0.3 }), x, 2.6, -0.5, { rx: Math.PI / 2 });
  const tail = canvasTex(64, 64, (c) => { c.fillStyle = '#2d5d8a'; c.fillRect(0, 0, 64, 64); });
  box(plane, 0.52, 3, 2.6, std(0xffffff, { map: tail }), 0, 9.4, 16);
  // departure board
  const boardT = canvasTex(1024, 640, () => {});
  const board = new THREE.Group(); board.position.set(0, 7.5, 6); g.add(board);
  box(board, 13.6, 8.6, 0.4, std(0x151719, { r: 0.4 }), 0, 0, 0);
  mesh(board, new THREE.PlaneGeometry(13, 8.1), basic(0xffffff, { map: boardT, tm: false }), 0, 0, 0.21, { cast: false });
  box(g, 0.12, 7.3, 0.12, std(0x9aa3ab, { m: 0.4 }), -5, 8.4 + 4.3 + 3.6 - 3.6 + 0.0, 6);
  const FL = [['08:15', 'LONDON', 'BA 117'], ['08:30', 'NEW YORK', 'DL 401'], ['08:40', 'TOKYO', 'NH 205'], ['08:55', 'PARIS', 'AF 1641'], ['09:05', 'DUBAI', 'EK 32'], ['09:20', 'BERLIN', 'LH 2041'], ['09:35', 'SYDNEY', 'QF 2'], ['09:50', 'MADRID', 'IB 3171'], ['10:05', 'TORONTO', 'AC 849'], ['10:15', 'SEOUL', 'KE 908'], ['10:30', 'ROME', 'AZ 611']];
  function drawBoard(frac, t) {
    redraw(boardT, (c, w, h) => {
      c.fillStyle = '#0a0d12'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#f2c14e'; c.font = sans(800, 40); c.textAlign = 'left'; c.fillText('DEPARTURES', 36, 62);
      c.fillStyle = '#8a95a3'; c.font = sans(600, 22); ['TIME', 'DESTINATION', 'FLIGHT', 'STATUS'].forEach((s, i) => c.fillText(s, [36, 170, 520, 720][i], 108));
      FL.forEach((f, i) => {
        const y = 156 + i * 44; c.fillStyle = i % 2 ? '#111720' : '#0d1219'; c.fillRect(20, y - 32, w - 40, 42);
        c.font = sans(700, 26); c.fillStyle = '#f0f0f0'; c.fillText(f[0], 36, y); c.fillText(f[1], 170, y); c.fillStyle = '#c8d0da'; c.fillText(f[2], 520, y);
        const canc = (i * 0.618 % 1) < frac;
        if (canc) { const blink = Math.sin(t * 6 + i) > -0.3; c.fillStyle = blink ? '#ff4a3d' : '#7a2620'; c.fillText('CANCELLED', 720, y); }
        else { c.fillStyle = '#6ad08a'; c.fillText(i < 2 ? 'BOARDING' : 'ON TIME', 720, y); }
      });
    });
  }
  // seats
  const seatM = std(0x3a4a5c, { r: 0.6 });
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = -14 + i * 0.75 + (i > 4 ? 1 : 0), z = -6 - r * 2.2; box(g, 0.62, 0.08, 0.6, seatM, x, 0.48, z); box(g, 0.62, 0.6, 0.08, seatM, x, 0.8, z - 0.28); }
  for (let r = 0; r < 4; r++) for (let i = 0; i < 9; i++) { const x = 8 + i * 0.75, z = -6 - r * 2.2; box(g, 0.62, 0.08, 0.6, seatM, x, 0.48, z); box(g, 0.62, 0.6, 0.08, seatM, x, 0.8, z - 0.28); }
  const people = [];
  for (let i = 0; i < 26; i++) { const P = makePerson({ seed: 500 + i }); g.add(P.g); people.push(P); }
  const R = rng(5);
  const suit = [];
  for (let i = 0; i < 18; i++) { const s = rb(g, 0.4, 0.6, 0.25, std([0x2b2b2b, 0x3e6fb0, 0xb85042, 0x6b6b6b][i % 4], { r: 0.5 }), 0, 0.3, 0, { rad: 0.05 }); suit.push(s); }
  return { group: g, drawBoard, people, suit, R };
}

// ======================= HOSPITAL =======================
export function buildHospital(scene) {
  const g = new THREE.Group(); g.position.set(5000, 0, 0); scene.add(g);
  mesh(g, new THREE.PlaneGeometry(30, 30), std(0xd5dcdc, { r: 0.3 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  const wallM = std(0xb9cfcc, { r: 0.9 });
  box(g, 14, 3.4, 0.2, wallM, 0, 1.7, -4); box(g, 0.2, 3.4, 10, wallM, -6, 1.7, 1); box(g, 0.2, 3.4, 10, wallM, 6, 1.7, 1);
  box(g, 14, 0.1, 10, std(0xf2f4f4), 0, 3.4, 1, { cast: false });
  box(g, 1.2, 0.04, 2.4, std(0xffffff, { e: 0xffffff, ei: 1.5 }), -2, 3.34, 0, { cast: false }); box(g, 1.2, 0.04, 2.4, std(0xffffff, { e: 0xffffff, ei: 1.5 }), 2.5, 3.34, 0, { cast: false });
  // bed
  const bed = new THREE.Group(); g.add(bed); bed.position.set(-0.6, 0, -1.2);
  rb(bed, 1.1, 0.25, 2.3, std(0xe9eef0, { r: 0.6 }), 0, 0.75, 0, { rad: 0.06 });
  box(bed, 1.15, 0.5, 0.06, std(0xb7c2c8, { m: 0.4, r: 0.4 }), 0, 0.95, -1.17); box(bed, 1.15, 0.3, 0.06, std(0xb7c2c8, { m: 0.4, r: 0.4 }), 0, 0.85, 1.17);
  for (const [x, z] of [[-0.45, -1], [0.45, -1], [-0.45, 1], [0.45, 1]]) box(bed, 0.05, 0.6, 0.05, std(0x9aa4aa, { m: 0.5 }), x, 0.3, z);
  const patient = makePerson({ seed: 41, shirt: 0xa9c6d8, pants: 0xa9c6d8 }); bed.add(patient.g);
  patient.g.rotation.x = -Math.PI / 2; patient.g.position.set(0, 1.0, 0.85); patient.g.scale.setScalar(0.92); patient.legL.visible = patient.legR.visible = false;
  rb(bed, 1.0, 0.2, 1.75, std(0x8fb4c9, { r: 0.9 }), 0, 1.02, 0.25, { rad: 0.08 });
  rb(bed, 0.6, 0.12, 0.35, std(0xffffff, { r: 0.9 }), 0, 0.92, -0.95, { rad: 0.06 });
  // IV pole
  box(g, 0.04, 2.0, 0.04, std(0xbfc6cc, { m: 0.6 }), 0.3, 1.0, -2.2);
  rb(g, 0.16, 0.26, 0.05, std(0xdff0ff, { t: true, op: 0.7, r: 0.1 }), 0.3, 1.9, -2.2, { rad: 0.03 });
  // monitor on stand
  const monT = canvasTex(320, 220, () => {});
  const mon = new THREE.Group(); mon.position.set(-1.9, 1.6, -2.4); mon.rotation.y = 0.55; g.add(mon);
  rb(mon, 0.75, 0.55, 0.08, std(0x2a2d31, { r: 0.4 }), 0, 0, 0, { rad: 0.03 });
  mesh(mon, new THREE.PlaneGeometry(0.66, 0.46), basic(0xffffff, { map: monT, tm: false }), 0, 0, 0.041, { cast: false });
  box(g, 0.06, 1.3, 0.06, std(0x888f96, { m: 0.5 }), -1.9, 0.65, -2.4);
  // computer cart
  const pcT = canvasTex(320, 200, () => {});
  const cart = new THREE.Group(); cart.position.set(1.9, 0, 0.6); cart.rotation.y = -0.7; g.add(cart);
  box(cart, 0.7, 0.05, 0.5, std(0xe3e8ea), 0, 1.0, 0); box(cart, 0.05, 1.0, 0.05, std(0x888f96, { m: 0.5 }), 0, 0.5, 0);
  rb(cart, 0.6, 0.4, 0.04, std(0x222222), 0, 1.3, -0.15, { rad: 0.02 });
  mesh(cart, new THREE.PlaneGeometry(0.55, 0.35), basic(0xffffff, { map: pcT, tm: false }), 0, 1.3, -0.128, { cast: false });
  // doctor + nurse
  const doc = makePerson({ seed: 61, shirt: 0xf4f6f6, pants: 0x5f8f9a }); g.add(doc.g); doc.g.position.set(0.55, 0, -1.0); doc.g.rotation.y = -1.6;
  const clip = new THREE.Group(); doc.armL.add(clip); clip.position.set(0.05, -0.7, 0.1);
  box(clip, 0.22, 0.3, 0.015, std(0x8a6a45), 0, 0, 0); box(clip, 0.19, 0.26, 0.005, std(0xffffff), 0, -0.01, 0.01, { cast: false });
  const nurse = makePerson({ seed: 62, shirt: 0x5f8f9a, pants: 0x5f8f9a }); g.add(nurse.g); nurse.g.position.set(-2.6, 0, 0.6); nurse.g.rotation.y = 0.9;
  function drawScreens(state, t) {
    redraw(monT, (c, w, h) => {
      c.fillStyle = '#05080a'; c.fillRect(0, 0, w, h);
      if (state === 0) { c.strokeStyle = '#4bd27a'; c.lineWidth = 3; c.beginPath(); for (let x = 0; x < w; x += 2) { const p = ((x / w) * 4 + t * 1.3) % 1; const y = 70 - (p > 0.45 && p < 0.5 ? 45 : p > 0.5 && p < 0.53 ? -25 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.fillStyle = '#4bd27a'; c.font = sans(700, 40); c.fillText('72', 240, 160); }
      else { const blink = Math.sin(t * 5) > 0; c.fillStyle = blink ? '#ff4a3d' : '#5a1a16'; c.font = sans(800, 30); c.textAlign = 'center'; c.fillText('SYSTEM OFFLINE', w / 2, 95); c.fillStyle = '#d0d6dc'; c.font = sans(600, 18); c.fillText('Patient records unavailable', w / 2, 135); c.strokeStyle = '#4bd27a'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x < w; x += 2) { const p = ((x / w) * 4 + t * 1.6) % 1; const y = 185 - (p > 0.45 && p < 0.5 ? 25 : 0); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    });
    redraw(pcT, (c, w, h) => {
      c.fillStyle = state === 0 ? '#eaf2f7' : '#101418'; c.fillRect(0, 0, w, h); c.textAlign = 'center';
      if (state === 0) { c.fillStyle = '#2d5d8a'; c.font = sans(700, 22); c.fillText('PATIENT RECORD', w / 2, 40); c.fillStyle = '#9aa'; for (let i = 0; i < 6; i++) c.fillRect(30, 62 + i * 20, 160 + (i * 37) % 90, 9); }
      else { c.fillStyle = '#ff4a3d'; c.font = sans(800, 26); c.fillText('CONNECTION LOST', w / 2, 90); c.fillStyle = '#9aa5b1'; c.font = sans(600, 16); c.fillText('Cannot reach records server', w / 2, 122); }
    });
  }
  return { group: g, drawScreens, doc, nurse, patient };
}

// ======================= PORT =======================
export function buildPort(scene) {
  const g = new THREE.Group(); g.position.set(6000, 0, 0); scene.add(g);
  const R = rng(9);
  mesh(g, new THREE.PlaneGeometry(1200, 1200), std(0x51697a, { r: 0.25, m: 0.1 }), 0, -1.2, -300, { rx: -Math.PI / 2, cast: false });
  box(g, 400, 2.4, 120, std(0xb0aca4, { r: 0.95 }), 0, 0, 60, { cast: false });                // quay
  for (let x = -190; x < 190; x += 6) box(g, 3, 0.03, 0.25, std(0xe0c860), x, 1.21, 6, { cast: false });
  const contCols = [0xa8503a, 0x3a5f80, 0xc48a40, 0x4a7560, 0x8a8f94, 0xc9c4b9, 0x6a4f72, 0xb89a45];
  const ribT = canvasTex(64, 64, (c) => { c.fillStyle = '#fff'; c.fillRect(0, 0, 64, 64); c.fillStyle = 'rgba(0,0,0,0.13)'; for (let i = 0; i < 64; i += 6) c.fillRect(i, 0, 2, 64); }, { repeat: true });
  ribT.repeat.set(4, 1);
  const cGeo = new THREE.BoxGeometry(2.4, 2.6, 6.1);
  const conts = [];
  // stacks on quay
  for (let bx = -60; bx <= 60; bx += 15) for (let row = 0; row < 6; row++) for (let i = 0; i < 4; i++) {
    const hgt = 1 + Math.floor(R() * 4);
    for (let k = 0; k < hgt; k++) conts.push([bx + i * 2.6, 1.2 + 1.3 + k * 2.6, 30 + row * 6.6, contCols[Math.floor(R() * contCols.length)], 0]);
  }
  // ship
  const ship = new THREE.Group(); g.add(ship); ship.position.set(0, 0, -22);
  rb(ship, 210, 9, 32, std(0x1f2c3a, { r: 0.6 }), 0, 1.5, 0, { rad: 1.2 });
  box(ship, 210.2, 1.6, 32.2, std(0x8a2a22, { r: 0.7 }), 0, -1.4, 0, { cast: false });
  rb(ship, 12, 14, 26, std(0xf1f1ef, { r: 0.8 }), 90, 12, 0, { rad: 0.6 });
  box(ship, 12.4, 1.4, 24, std(0x2d3b48), 90, 17, 0);
  for (let xx = -95; xx < 80; xx += 2.6) for (let z = -13.2; z <= 13.2; z += 6.6) { const hgt = 2 + Math.floor(R() * 4); for (let k = 0; k < hgt; k++) conts.push([xx, 6 + 1.3 + k * 2.6, z, contCols[Math.floor(R() * contCols.length)], 1, 1]); }
  const cMesh = new THREE.InstancedMesh(cGeo, std(0xffffff, { map: ribT, r: 0.7, unique: true }), conts.length);
  cMesh.castShadow = true; cMesh.receiveShadow = true;
  const m4 = new THREE.Matrix4(), col = new THREE.Color(), q = new THREE.Quaternion();
  const qr = new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 2);
  conts.forEach((c, i) => { m4.compose(V(c[0] + (c[4] ? ship.position.x : 0), c[1], c[2] + (c[4] ? ship.position.z : 0)), c[5] ? qr : q, V(1, 1, 1)); cMesh.setMatrixAt(i, m4); cMesh.setColorAt(i, col.set(c[3])); });
  g.add(cMesh);
  // cranes
  const craneM = std(0x2f6aa8, { r: 0.6, m: 0.2 });
  const cranes = [];
  for (const x of [-30, 0, 30]) {
    const cr = new THREE.Group(); cr.position.set(x, 1.2, 8); g.add(cr);
    for (const sx of [-6, 6]) for (const sz of [-4, 12]) box(cr, 1.0, 34, 1.0, craneM, sx, 17, sz);
    for (const sz of [-4, 12]) box(cr, 13, 1.2, 1.2, craneM, 0, 34, sz);
    box(cr, 2.4, 2.2, 72, craneM, 0, 36, -18);
    box(cr, 4, 3, 4, std(0xe9e6df), 0, 32.5, -18);
    const trolley = box(cr, 3.4, 1.6, 3.4, std(0x333a40), 0, 34.2, -30);
    const spreader = box(cr, 2.8, 0.4, 6.2, std(0xd9a62b), 0, 20, -30);
    cranes.push({ cr, trolley, spreader });
  }
  const trucks = [];
  for (let i = 0; i < 8; i++) { const t = makeCar(CAR_COLS[i % CAR_COLS.length], 'truck'); t.position.set(-50 + i * 13, 1.2, 18); t.rotation.y = Math.PI / 2; g.add(t); trucks.push(t); }
  const people = [];
  for (let i = 0; i < 6; i++) { const P = makePerson({ seed: 700 + i, shirt: 0xf07c2c, pants: 0x2c3445 }); g.add(P.g); P.g.position.set(-20 + i * 7, 1.2, 14 + (i % 2) * 2); P.g.rotation.y = Math.PI + 0.3 * (i % 3); people.push(P); }
  return { group: g, cranes, trucks, people };
}

// ======================= GAS STATION =======================
export function buildGas(scene) {
  const g = new THREE.Group(); g.position.set(7000, 0, 0); scene.add(g);
  const asph = mottled('#5d6066', '#54575d', '#686b70', 256, 13, 1400, [1, 4]); asph.repeat.set(40, 40);
  mesh(g, new THREE.PlaneGeometry(400, 400), std(0xffffff, { map: asph, r: 0.95 }), 0, 0, 0, { rx: -Math.PI / 2, cast: false });
  mesh(g, new THREE.PlaneGeometry(400, 160), std(0x7d9a5a, { r: 1 }), 0, 0.005, -110, { rx: -Math.PI / 2, cast: false });
  box(g, 400, 0.02, 0.2, std(0xd8b445), 0, 0.01, 18, { cast: false });
  // canopy
  const canM = std(0xf2f2f0, { r: 0.6 }), redM = std(0xc7362b, { r: 0.6 });
  box(g, 22, 1.2, 12, canM, 0, 6, 0); box(g, 22.2, 0.5, 12.2, redM, 0, 5.6, 0);
  for (const x of [-7, 7]) for (const z of [-3, 3]) box(g, 0.5, 5.4, 0.5, canM, x, 2.7, z);
  for (let x = -9; x <= 9; x += 3) box(g, 1.4, 0.05, 1.4, std(0xffffff, { e: 0xffffff, ei: 1.2 }), x, 5.37, 0, { cast: false });
  // pumps
  const pumpTex = canvasTex(128, 96, (c, w, h) => { c.fillStyle = '#0b0b0b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff4a3d'; c.font = sans(800, 22); c.textAlign = 'center'; c.fillText('OUT OF', w / 2, 42); c.fillText('SERVICE', w / 2, 70); });
  for (const x of [-7, 7]) for (const z of [-3, 3]) {
    rb(g, 0.9, 0.25, 2.2, std(0xd5d2cc), x, 0.12, z);
    rb(g, 0.7, 1.9, 1.1, std(0xeeeeee, { r: 0.5 }), x, 1.2, z, { rad: 0.06 });
    box(g, 0.72, 0.3, 1.12, redM, x, 2.0, z);
    box(g, 0.02, 0.4, 0.55, basic(0xffffff, { map: pumpTex, tm: false }), x + 0.36, 1.45, z, { cast: false });
    box(g, 0.02, 0.4, 0.55, basic(0xffffff, { map: pumpTex, tm: false }), x - 0.36, 1.45, z, { cast: false });
  }
  // price pylon
  const priceT = canvasTex(256, 384, (c, w, h) => { c.fillStyle = '#c7362b'; c.fillRect(0, 0, w, 90); c.fillStyle = '#fff'; c.font = sans(800, 56); c.textAlign = 'center'; c.fillText('FUEL', w / 2, 66); c.fillStyle = '#111'; c.fillRect(0, 90, w, h - 90); c.font = sans(700, 26); c.fillStyle = '#ddd'; ['REGULAR', 'PREMIUM', 'DIESEL'].forEach((s, i) => { c.textAlign = 'left'; c.fillText(s, 16, 150 + i * 90); c.fillStyle = '#ff4a3d'; c.font = sans(800, 44); c.textAlign = 'right'; c.fillText('--.--', w - 16, 160 + i * 90); c.fillStyle = '#ddd'; c.font = sans(700, 26); }); });
  box(g, 0.5, 8, 0.5, std(0x444444), 16, 4, 9);
  box(g, 3.2, 4.8, 0.4, basic(0xffffff, { map: priceT, tm: false }), 16, 9.5, 9, { cast: false });
  // shop
  box(g, 14, 4, 8, std(0xe8e4dc, { r: 0.8 }), -2, 2, -16);
  box(g, 10, 2.4, 0.1, std(0x6f8aa0, { r: 0.2, m: 0.3 }), -2, 1.5, -11.95, { cast: false });
  // cone + sign
  const signT = canvasTex(256, 192, (c, w, h) => { c.fillStyle = '#f5f2ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = sans(800, 46); c.textAlign = 'center'; c.fillText('NO FUEL', w / 2, 80); c.font = sans(700, 30); c.fillText('NO CARDS', w / 2, 130); c.fillText('SORRY', w / 2, 170); });
  const signG = new THREE.Group(); g.add(signG); signG.position.set(-3.6, 0, 10.6); signG.rotation.y = 1.9;
  box(signG, 1.3, 1.0, 0.05, std(0xffffff, { map: signT, r: 0.9 }), 0, 1.1, 0, { cast: false });
  box(signG, 0.06, 0.8, 0.06, std(0x555555), -0.55, 0.4, 0); box(signG, 0.06, 0.8, 0.06, std(0x555555), 0.55, 0.4, 0);
  // queue of cars along road
  const cars = [];
  for (let i = 0; i < 16; i++) { const c = makeCar(CAR_COLS[(i * 3) % CAR_COLS.length]); g.add(c); c.position.set(-14 - i * 5.6, 0, 14.5); c.rotation.y = Math.PI / 2; cars.push(c); }
  for (let i = 0; i < 4; i++) { const c = makeCar(CAR_COLS[(i * 5 + 2) % CAR_COLS.length]); g.add(c); c.position.set(i < 2 ? -7 : 7, 0, i % 2 ? 5.2 : -5.2 + 10.4 * 0); c.position.z = i % 2 ? 5.4 : -0.4; c.rotation.y = Math.PI / 2; cars.push(c); }
  const people = [];
  for (let i = 0; i < 8; i++) { const P = makePerson({ seed: 800 + i }); g.add(P.g); people.push(P); }
  return { group: g, cars, people };
}

// ======================= EARTH =======================
export function buildEarth(scene, loader) {
  const g = new THREE.Group(); g.position.set(20000, 0, 0); scene.add(g);
  const RAD = 50;
  const dayT = loader.load('vendor/earth_atmos_2048.jpg'); dayT.colorSpace = THREE.SRGBColorSpace;
  const lightsImg = new Image(); lightsImg.src = 'vendor/earth_lights_2048.png';
  const lc = document.createElement('canvas'); lc.width = 2048; lc.height = 1024; const lg = lc.getContext('2d');
  const lightsT = new THREE.CanvasTexture(lc); lightsT.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: dayT, emissiveMap: lightsT, emissive: new THREE.Color(0xffc879), emissiveIntensity: 2.2, roughness: 0.9, metalness: 0 });
  mat.color.setScalar(0.32);
  const earth = new THREE.Mesh(new THREE.SphereGeometry(RAD, 96, 64), mat); g.add(earth);
  // atmosphere rim
  const atm = new THREE.Mesh(new THREE.SphereGeometry(RAD * 1.035, 64, 48), new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    uniforms: { c: { value: new THREE.Color(0x5aa8ff) }, k: { value: 1.0 } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; uniform float k; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.2); gl_FragColor = vec4(c * f * 1.6 * k, f * k); }',
  }));
  g.add(atm);
  const atm2 = new THREE.Mesh(new THREE.SphereGeometry(RAD * 1.003, 64, 48), new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
    uniforms: { c: { value: new THREE.Color(0x4a90e0) } },
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 c; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV),0.0), 3.0); gl_FragColor = vec4(c*f*0.9, f*0.8); }',
  }));
  g.add(atm2);
  // stars
  const R = rng(99); const sp = [];
  for (let i = 0; i < 2500; i++) { const v = V(R() - 0.5, R() - 0.5, R() - 0.5).normalize().multiplyScalar(1500); sp.push(v.x, v.y, v.z); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 1.6, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.8 }));
  g.add(stars);
  // internet arcs between cities
  const cities = [[40.7, -74], [51.5, -0.1], [48.9, 2.3], [52.5, 13.4], [35.7, 139.7], [37.6, 127], [31.2, 121.5], [22.3, 114.2], [1.35, 103.8], [19.1, 72.9], [28.6, 77.2], [25.2, 55.3], [30, 31.2], [-1.3, 36.8], [6.5, 3.4], [-26.2, 28], [-23.5, -46.6], [-34.6, -58.4], [19.4, -99.1], [34, -118.2], [37.8, -122.4], [41.9, -87.6], [43.7, -79.4], [55.8, 37.6], [41, 29], [40.4, -3.7], [59.3, 18.1], [-33.9, 151.2], [-37.8, 145], [4.7, -74.1], [-12, -77], [64.1, -21.9], [33.6, 73], [13.7, 100.5], [14.6, 121], [-6.2, 106.8], [39.9, 116.4]];
  const ll2v = (la, lo, r = RAD) => { const phi = (90 - la) * Math.PI / 180, th = (lo + 180) * Math.PI / 180; return V(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)); };
  const arcs = [];
  const arcM = new THREE.MeshBasicMaterial({ color: 0x7cc6ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const linkR = rng(3);
  for (let i = 0; i < 70; i++) {
    const a = cities[Math.floor(linkR() * cities.length)], b = cities[Math.floor(linkR() * cities.length)];
    if (a === b) continue;
    const va = ll2v(a[0], a[1]), vb = ll2v(b[0], b[1]);
    const mid = va.clone().add(vb).multiplyScalar(0.5); const d = va.distanceTo(vb);
    mid.normalize().multiplyScalar(RAD + d * 0.22);
    const curve = new THREE.QuadraticBezierCurve3(va, mid, vb);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, 0.09, 5, false), arcM.clone());
    earth.add(m); arcs.push({ m, cut: linkR() });
  }
  const dots = [];
  for (const c of cities) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, toneMapped: false })); d.position.copy(ll2v(c[0], c[1], RAD + 0.1)); earth.add(d); dots.push(d); }
  // light mask: regions fade in a random order
  const regions = []; const rr = rng(17);
  for (let i = 0; i < 64; i++) for (let j = 0; j < 32; j++) regions.push({ x: i * 32, y: j * 32, k: rr() });
  let lastF = -1;
  function setLights(f) { // f: 0 = all lights on, 1 = all off (except a few)
    if (!lightsImg.complete) return;
    if (Math.abs(f - lastF) < 0.004 && lastF >= 0) return;
    lastF = f;
    lg.globalCompositeOperation = 'source-over'; lg.drawImage(lightsImg, 0, 0, 2048, 1024);
    lg.fillStyle = '#000';
    for (const r of regions) { const a = clamp((f * 1.25 - r.k * 0.95) * 4); if (a > 0) { lg.globalAlpha = Math.min(a, r.k < 0.04 ? 0.6 : 1); lg.fillRect(r.x, r.y, 32, 32); } }
    lg.globalAlpha = 1;
    lightsT.needsUpdate = true;
  }
  function setArcs(f, t) { // f: fraction of links still alive
    for (const a of arcs) { const alive = a.cut < f; a.m.visible = alive; a.m.material.opacity = 0.35 + 0.35 * Math.sin(t * 3 + a.cut * 20); }
    dots.forEach((d, i) => { d.material.opacity = f > 0.05 ? 1 : 0; });
  }
  return { group: g, earth, setLights, setArcs, atm, RAD, ll2v, ready: () => lightsImg.complete };
}
