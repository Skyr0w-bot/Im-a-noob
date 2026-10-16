// Shared building blocks: math helpers, procedural textures, materials, people, cars, trees, buildings.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ease = u => { u = clamp(u); return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const easeOut = u => 1 - Math.pow(1 - clamp(u), 3);
export const easeIn = u => Math.pow(clamp(u), 3);
export const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a)); return u * u * (3 - 2 * u); };
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const vlerp = (a, b, u) => a.clone().lerp(b, u);
export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export const noise1 = (x, s = 0) => Math.sin(x * 1.31 + s) * 0.5 + Math.sin(x * 2.17 + s * 1.7) * 0.3 + Math.sin(x * 3.73 + s * 2.3) * 0.2;

// ---------- textures ----------
export function canvasTex(w, h, draw, opts = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (opts.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.userData = { c, g, draw, w, h };
  return t;
}
export function redraw(t, fn) { const { g, w, h } = t.userData; fn(g, w, h); t.needsUpdate = true; }

// mottled noise (foliage, grass, asphalt, concrete)
export function mottled(base, var1, var2, size = 256, seed = 1, blobs = 900, rad = [3, 14]) {
  return canvasTex(size, size, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < blobs; i++) {
      const x = r() * w, y = r() * h, rr = rad[0] + r() * (rad[1] - rad[0]);
      g.fillStyle = r() < 0.5 ? var1 : var2; g.globalAlpha = 0.18 + r() * 0.25;
      for (const dx of [-w, 0, w]) for (const dy of [-h, 0, h]) { g.beginPath(); g.arc(x + dx, y + dy, rr, 0, 7); g.fill(); }
    }
    g.globalAlpha = 1;
  }, { repeat: true });
}

// building facade: window grid. Returns {map, emissive(lit pattern)}
export function facadeTex(kind, seed) {
  const r = rng(seed);
  const cols = 4, rows = 4, W = 256, H = 256;
  const pal = {
    glass:    { wall: '#c9d2db', frame: '#aab6c2', win: ['#7f9bb8', '#8ba6c0', '#6f8daa'], mull: '#e9eef2' },
    concrete: { wall: '#e3dccf', frame: '#cfc6b6', win: ['#5f7389', '#6b7f95', '#56697e'], mull: '#d8cfbf' },
    white:    { wall: '#eef0f2', frame: '#d7dbe0', win: ['#8aa2bb', '#7d95ae', '#98aec4'], mull: '#ffffff' },
    brick:    { wall: '#b98b73', frame: '#a8775f', win: ['#53657a', '#4a5b6f', '#5d7086'], mull: '#e8dfd4' },
  }[kind];
  const map = canvasTex(W, H, (g) => {
    g.fillStyle = pal.wall; g.fillRect(0, 0, W, H);
    const cw = W / cols, ch = H / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const x = i * cw, y = j * ch;
      if (kind === 'glass') { g.fillStyle = pal.win[(i + j * 3) % 3]; g.fillRect(x + 3, y + 4, cw - 6, ch - 6); g.fillStyle = pal.mull; g.fillRect(x + cw / 2 - 1, y + 4, 2, ch - 6); }
      else { g.fillStyle = pal.frame; g.fillRect(x + cw * 0.18 - 2, y + ch * 0.2 - 2, cw * 0.64 + 4, ch * 0.62 + 4); g.fillStyle = pal.win[(i * 7 + j) % 3]; g.fillRect(x + cw * 0.18, y + ch * 0.2, cw * 0.64, ch * 0.62); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + cw * 0.18, y + ch * 0.2, cw * 0.64, ch * 0.12); }
    }
    // subtle grime
    for (let k = 0; k < 400; k++) { g.fillStyle = `rgba(0,0,0,${r() * 0.04})`; g.fillRect(r() * W, r() * H, 2 + r() * 6, 2 + r() * 10); }
  }, { repeat: true });
  return { map, cols, rows, kind };
}
// emissive pattern for night windows: separate canvas per lit fraction level
export function litTex(cols, rows, kind, seed, frac) {
  const r = rng(seed), W = 256, H = 256;
  return canvasTex(W, H, (g) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    const cw = W / cols, ch = H / rows;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const v = r();
      if (v > frac) continue;
      const warm = r();
      g.fillStyle = warm < 0.75 ? '#ffd9a0' : warm < 0.9 ? '#fff1d6' : '#a9c8ff';
      if (kind === 'glass') g.fillRect(i * cw + 3, j * ch + 4, cw - 6, ch - 6);
      else g.fillRect(i * cw + cw * 0.18, j * ch + ch * 0.2, cw * 0.64, ch * 0.62);
    }
  }, { repeat: true });
}

// Box geometry with world-scaled UVs (tile = world units per texture repeat)
export function boxUV(w, h, d, tileX, tileY = tileX) {
  const g = new THREE.BoxGeometry(w, h, d);
  const pos = g.attributes.position, nor = g.attributes.normal, uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const nx = Math.abs(nor.getX(i)), ny = Math.abs(nor.getY(i));
    let u, v;
    if (ny > 0.5) { u = x / tileX; v = z / tileX; }
    else if (nx > 0.5) { u = z / tileX; v = (y + h / 2) / tileY; }
    else { u = x / tileX; v = (y + h / 2) / tileY; }
    uv.setXY(i, u, v);
  }
  return g;
}

// ---------- materials ----------
const matCache = new Map();
export function std(color, o = {}) {
  const key = JSON.stringify([color, o.r, o.m, o.e, o.ei, o.t, o.op, o.map ? o.map.uuid : 0]);
  if (!o.unique && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.85, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.t, opacity: o.op ?? 1, map: o.map ?? null });
  if (!o.unique) matCache.set(key, m);
  return m;
}
export function basic(color, o = {}) { return new THREE.MeshBasicMaterial({ color, transparent: !!o.t, opacity: o.op ?? 1, fog: o.fog ?? true, map: o.map ?? null, toneMapped: o.tm ?? true, depthWrite: o.dw ?? true, side: o.side ?? THREE.FrontSide, blending: o.add ? THREE.AdditiveBlending : THREE.NormalBlending }); }

const geoCache = new Map();
export function rbox(w, h, d, rad = 0.05, seg = 2) {
  const key = [w, h, d, rad, seg].join(',');
  if (!geoCache.has(key)) geoCache.set(key, new RoundedBoxGeometry(w, h, d, seg, Math.min(rad, Math.min(w, h, d) / 2 - 1e-4)));
  return geoCache.get(key);
}
export const unitBox = new THREE.BoxGeometry(1, 1, 1);
export function mesh(parent, geo, m, x = 0, y = 0, z = 0, o = {}) {
  const me = new THREE.Mesh(geo, m); me.position.set(x, y, z);
  me.castShadow = o.cast ?? true; me.receiveShadow = o.receive ?? true;
  if (o.rx) me.rotation.x = o.rx; if (o.ry) me.rotation.y = o.ry; if (o.rz) me.rotation.z = o.rz;
  parent.add(me); return me;
}
export function box(parent, w, h, d, m, x, y, z, o = {}) {
  const me = mesh(parent, unitBox, m, x, y, z, o); me.scale.set(w, h, d); return me;
}
export function rb(parent, w, h, d, m, x, y, z, o = {}) { return mesh(parent, rbox(w, h, d, o.rad ?? 0.06), m, x, y, z, o); }

// ---------- people ----------
const capCache = new Map();
function cap(r, len) { const k = r + ',' + len; if (!capCache.has(k)) capCache.set(k, new THREE.CapsuleGeometry(r, len, 4, 10)); return capCache.get(k); }
const sphereG = new THREE.SphereGeometry(1, 20, 14);
export const SKINS = [0xe8c4a8, 0xc99674, 0x8d5b3e, 0xf1d3bd, 0xb07c5a, 0x6b4430];
export const SHIRTS = [0x3e6fb0, 0xd9d4cb, 0x5a7d5a, 0xb85042, 0x2f3b4c, 0xe0b04a, 0x7a5c99, 0x9fb6c9, 0x4a4a4a, 0xc76f8f];
export const PANTS = [0x2c3445, 0x3b3b3b, 0x5b4a3a, 0x1f2a3a, 0x6e6a62, 0x283c2c];
export function makePerson(o = {}) {
  const r = rng(o.seed ?? 1);
  const R = !!o.robot;
  const skin = R ? std(0x2b2f36, { r: 0.35, m: 0.6 }) : std(o.skin ?? SKINS[Math.floor(r() * SKINS.length)], { r: 0.7 });
  const shirt = R ? std(0xe9edf1, { r: 0.22, m: 0.05 }) : std(o.shirt ?? SHIRTS[Math.floor(r() * SHIRTS.length)], { r: 0.9 });
  const pants = R ? std(0xdfe4e9, { r: 0.25, m: 0.05 }) : std(o.pants ?? PANTS[Math.floor(r() * PANTS.length)], { r: 0.9 });
  const hairC = o.hair ?? [0x2a1d15, 0x4a3020, 0x111111, 0x8a6a45, 0x9a9a9a][Math.floor(r() * 5)];
  const shoe = R ? std(0x2b2f36, { r: 0.35, m: 0.6 }) : std(0x2a2522, { r: 0.6 });
  const S = o.scale ?? (R ? 1.0 : 0.92 + r() * 0.14);
  const g = new THREE.Group(); g.scale.setScalar(S);
  const P = { g, skin, seed: (o.seed ?? 1) * 1.37 };
  const seg = (parent, x, y, z, rad, len, m) => { const pv = new THREE.Group(); pv.position.set(x, y, z); parent.add(pv); mesh(pv, cap(rad, len), m, 0, -(len / 2 + rad) + rad * 0.5, 0); return pv; };
  P.hips = new THREE.Group(); P.hips.position.y = 0.92; g.add(P.hips);
  P.legL = seg(P.hips, -0.11, 0, 0, 0.078, 0.33, pants); P.kneeL = seg(P.legL, 0, -0.45, 0, 0.068, 0.31, pants);
  P.legR = seg(P.hips, 0.11, 0, 0, 0.078, 0.33, pants); P.kneeR = seg(P.legR, 0, -0.45, 0, 0.068, 0.31, pants);
  for (const K of [P.kneeL, P.kneeR]) mesh(K, rbox(0.15, 0.08, 0.27, 0.035), shoe, 0, -0.43, 0.05);
  P.torso = new THREE.Group(); P.hips.add(P.torso);
  mesh(P.torso, rbox(0.42, 0.62, 0.24, 0.1), shirt, 0, 0.33, 0);
  mesh(P.torso, rbox(0.38, 0.14, 0.22, 0.05), pants, 0, 0.04, 0);
  mesh(P.torso, cap(0.05, 0.06), skin, 0, 0.7, 0);
  P.armL = seg(P.torso, -0.27, 0.58, 0, 0.062, 0.2, shirt); P.elbowL = seg(P.armL, 0, -0.31, 0, 0.055, 0.18, shirt);
  P.armR = seg(P.torso, 0.27, 0.58, 0, 0.062, 0.2, shirt); P.elbowR = seg(P.armR, 0, -0.31, 0, 0.055, 0.18, shirt);
  for (const E of [P.elbowL, P.elbowR]) mesh(E, sphereG, skin, 0, -0.33, 0).scale.set(0.058, 0.07, 0.05);
  P.head = new THREE.Group(); P.head.position.y = 0.76; P.torso.add(P.head);
  P.eyes = [];
  if (R) {
    const hd = mesh(P.head, sphereG, shirt, 0, 0.14, 0); hd.scale.set(0.13, 0.15, 0.14);
    const visor = mesh(P.head, sphereG, std(0x0b0d12, { r: 0.08, m: 0.5 }), 0, 0.15, 0.03, { cast: false }); visor.scale.set(0.118, 0.085, 0.12);
    P.eyeStrip = mesh(P.head, rbox(0.15, 0.018, 0.02, 0.008), std(0x0b0d12, { e: 0x5fe0ff, ei: 2.5 }), 0, 0.155, 0.142, { cast: false });
    mesh(P.torso, rbox(0.16, 0.025, 0.02, 0.01), std(0x0b0d12, { e: 0x5fe0ff, ei: 2.0 }), 0, 0.5, 0.125, { cast: false });
  } else {
    const hd = mesh(P.head, sphereG, skin, 0, 0.13, 0); hd.scale.set(0.125, 0.15, 0.135);
    const hairM = std(hairC, { r: 0.9 });
    const hr = mesh(P.head, sphereG, hairM, 0, 0.19, -0.015); hr.scale.set(0.132, 0.12, 0.14);
    const eyeM = std(0x1a1a1a, { r: 0.4 });
    for (const sx of [-0.045, 0.045]) { const e = mesh(P.head, sphereG, eyeM, sx, 0.15, 0.118, { cast: false }); e.scale.set(0.014, 0.018, 0.01); P.eyes.push(e); }
    const mouth = mesh(P.head, sphereG, std(0x7a4a3a, { r: 0.6 }), 0, 0.075, 0.122, { cast: false }); mouth.scale.set(0.03, 0.008, 0.008);
    if (o.headset) {
      const hsM = std(0x1d1f23, { r: 0.4 });
      const band = mesh(P.head, new THREE.TorusGeometry(0.14, 0.012, 6, 20, Math.PI), hsM, 0, 0.16, 0, { cast: false, rz: 0 }); band.rotation.y = Math.PI / 2;
      for (const sx of [-0.135, 0.135]) mesh(P.head, new THREE.CylinderGeometry(0.04, 0.04, 0.03, 14), hsM, sx, 0.14, 0, { rz: Math.PI / 2, cast: false });
      const boom = mesh(P.head, rbox(0.012, 0.012, 0.13, 0.005), hsM, 0.12, 0.09, 0.07, { cast: false }); boom.rotation.y = -0.5;
    }
  }
  // phone in right hand (hidden by default)
  P.phone = new THREE.Group(); P.elbowR.add(P.phone); P.phone.position.set(0, -0.36, 0.05); P.phone.visible = false;
  mesh(P.phone, rbox(0.075, 0.15, 0.012, 0.008), std(0x151515, { r: 0.3 }), 0, 0, 0, { cast: false });
  P.screen = mesh(P.phone, new THREE.PlaneGeometry(0.066, 0.135), basic(0xffffff, { tm: false }), 0, 0, 0.0075, { cast: false });
  P.screen.material.color.set(0xbfe0ff);
  const J = ['legL', 'legR', 'kneeL', 'kneeR', 'armL', 'armR', 'elbowL', 'elbowR', 'torso', 'head', 'hips'];
  P.reset = () => { for (const k of J) P[k].rotation.set(0, 0, 0); P.hips.position.y = 0.92; P.phone.visible = false;
    // relaxed default: arms slightly out and bent
    P.armL.rotation.z = 0.07; P.armR.rotation.z = -0.07; P.elbowL.rotation.x = -0.18; P.elbowR.rotation.x = -0.18; };
  P.walk = (ph, amp = 0.5) => {
    const s = Math.sin(ph) * amp;
    P.legL.rotation.x = s; P.legR.rotation.x = -s;
    P.kneeL.rotation.x = Math.max(0, Math.sin(ph - 1.2)) * amp * 1.3; P.kneeR.rotation.x = Math.max(0, Math.sin(ph + Math.PI - 1.2)) * amp * 1.3;
    P.armL.rotation.x = -s * 0.7; P.armR.rotation.x = s * 0.7;
    P.elbowL.rotation.x = -0.25 - Math.max(0, -s) * 0.4; P.elbowR.rotation.x = -0.25 - Math.max(0, s) * 0.4;
    P.hips.position.y = 0.92 + Math.abs(Math.cos(ph)) * 0.025; P.torso.rotation.y = s * 0.12;
  };
  // natural idle motion layered on top of any pose
  P.idle = (t, amt = 1) => {
    const k = P.seed;
    P.torso.rotation.x += Math.sin(t * 1.5 + k) * 0.012 * amt;
    P.hips.rotation.z += Math.sin(t * 0.55 + k * 2) * 0.025 * amt;
    P.torso.rotation.z -= Math.sin(t * 0.55 + k * 2) * 0.018 * amt;
    P.head.rotation.y += (Math.sin(t * 0.37 + k * 3) * 0.22 + Math.sin(t * 0.9 + k) * 0.05) * amt;
    P.head.rotation.x += Math.sin(t * 0.7 + k * 1.3) * 0.04 * amt;
    P.armL.rotation.x += Math.sin(t * 0.8 + k) * 0.05 * amt; P.armR.rotation.x += Math.sin(t * 0.75 + k * 1.7) * 0.05 * amt;
  };
  P.usePhone = (on = true, screenColor = 0xbfe0ff) => {
    P.phone.visible = on; if (!on) return;
    P.armR.rotation.set(-0.35, 0, -0.22); P.elbowR.rotation.set(-1.45, 0.25, 0); P.phone.rotation.set(0.25, 0, 0);
    P.head.rotation.x = 0.42; P.screen.material.color.set(screenColor);
  };
  P.reach = (side = 'R', a = 1) => { const A = side === 'R' ? P.armR : P.armL, E = side === 'R' ? P.elbowR : P.elbowL; A.rotation.x = -1.25 * a; E.rotation.x = -0.25 * a; P.torso.rotation.x += 0.08 * a; };
  P.cross = () => { P.armL.rotation.set(-0.55, 0, 0.25); P.elbowL.rotation.set(-1.5, 0, 0); P.armR.rotation.set(-0.5, 0, -0.25); P.elbowR.rotation.set(-1.55, 0, 0); };
  P.type = (t) => { P.armL.rotation.set(-0.5, 0, 0.15); P.elbowL.rotation.set(-1.0 + Math.sin(t * 13) * 0.05, 0, 0); P.armR.rotation.set(-0.5, 0, -0.15); P.elbowR.rotation.set(-1.0 + Math.sin(t * 11 + 1) * 0.05, 0, 0); };
  P.walkDist = (d, amp = 0.5) => P.walk(d * 3.6, amp);          // phase from distance travelled: no foot sliding
  P.carry = () => { P.armL.rotation.set(-0.85, 0, 0.12); P.elbowL.rotation.set(-0.75, 0, 0); P.armR.rotation.set(-0.85, 0, -0.12); P.elbowR.rotation.set(-0.75, 0, 0); };
  P.sit = () => { P.legL.rotation.x = -1.5; P.legR.rotation.x = -1.5; P.kneeL.rotation.x = 1.5; P.kneeR.rotation.x = 1.5; P.hips.position.y = 0.5; };
  return P;
}

// ---------- blocky "classic" game avatar that can shatter ----------
let faceTex;
export function makeBlocky(o = {}) {
  faceTex ??= canvasTex(64, 64, (c) => { c.fillStyle = '#f5cd30'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#111'; c.fillRect(19, 22, 6, 10); c.fillRect(39, 22, 6, 10); c.lineWidth = 3.5; c.strokeStyle = '#111'; c.beginPath(); c.arc(32, 34, 13, 0.25 * Math.PI, 0.75 * Math.PI); c.stroke(); });
  const u = o.u ?? 0.42;
  const g = new THREE.Group();
  const head = std(o.head ?? 0xf5cd30, { r: 0.55 }), torso = std(o.torso ?? 0x1e6fd6, { r: 0.55 }), legs = std(o.legs ?? 0x4ca64c, { r: 0.55 }), arms = std(o.arms ?? o.head ?? 0xf5cd30, { r: 0.55 });
  const parts = [];
  const add = (w, h, d, m, x, y, z) => { const me = rb(g, w * u, h * u, d * u, m, x * u, y * u, z * u, { rad: 0.035 }); reg(me); return me; };
  const reg = (me) => { const r = rng(parts.length * 131 + (o.seed ?? 0) * 7 + 3); parts.push({ me, p: me.position.clone(), dir: V(r() - 0.5, r() * 0.9 + 0.3, r() - 0.5).normalize(), spin: V(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(9), delay: r() * 0.35 }); };
  add(1, 2, 1, legs, -0.5, 1, 0); add(1, 2, 1, legs, 0.5, 1, 0);
  add(2, 2, 1, torso, 0, 3, 0);
  const aL = add(1, 2, 1, arms, -1.5, 3, 0), aR = add(1, 2, 1, arms, 1.5, 3, 0);
  const hd = add(1.2, 1.2, 1.2, head, 0, 4.6, 0);
  const face = mesh(g, new THREE.PlaneGeometry(1.0 * u, 1.0 * u), std(0xffffff, { map: faceTex, r: 0.6 }), 0, 4.6 * u, 0.61 * u + 0.002, { cast: false });
  reg(face);
  const B = { g, parts, aL, aR, hd };
  B.erase = (k) => { // 0 = intact, 1 = gone
    for (const pt of parts) {
      const e = clamp((k - pt.delay) / 0.65);
      pt.me.position.copy(pt.p).addScaledVector(pt.dir, e * e * 2.2);
      pt.me.rotation.set(e * pt.spin.x, e * pt.spin.y, e * pt.spin.z);
      const s = 1 - e * e; pt.me.scale.setScalar(Math.max(0.0001, s)); pt.me.visible = s > 0.01;
    }
  };
  B.pose = (t, kind = 'idle') => {
    const w = kind === 'jump' ? Math.abs(Math.sin(t * 4)) : 0;
    aL.rotation.x = kind === 'wave' ? 0 : Math.sin(t * 3) * 0.3; aR.rotation.x = -Math.sin(t * 3) * 0.3;
    if (kind === 'wave') { aR.rotation.z = 2.6 + Math.sin(t * 8) * 0.3; }
    if (kind === 'dance') { aL.rotation.z = -1.2 - Math.sin(t * 6) * 0.6; aR.rotation.z = 1.2 + Math.sin(t * 6 + 1) * 0.6; }
    g.position.y = (o.y ?? 0) + w * 0.5;
  };
  return B;
}

// ---------- cars ----------
export const CAR_COLS = [0xb03a2e, 0x2e5c8a, 0xdedede, 0x2b2b2b, 0x6b7f8c, 0xc9a227, 0x3d6b4f, 0x8c8c8c, 0xe8e4dc];
export function makeCar(color, kind = 'sedan') {
  const g = new THREE.Group();
  const paint = std(color, { r: 0.35, m: 0.2 });
  const glass = std(0x22303d, { r: 0.15, m: 0.4 });
  const tire = std(0x1c1c1c, { r: 0.8 });
  if (kind === 'truck') {
    mesh(g, rbox(1.95, 1.6, 2.0, 0.12), paint, 0, 1.25, 2.6);
    mesh(g, rbox(1.85, 0.6, 0.05, 0.02), glass, 0, 1.6, 3.61, { cast: false });
    g.userData.box = mesh(g, rbox(2.2, 2.4, 5.2, 0.06), std(0x4b5a3c, { r: 0.9 }), 0, 1.65, -1.2);
    for (const z of [2.6, -0.4, -2.6]) for (const x of [-0.95, 0.95]) mesh(g, new THREE.CylinderGeometry(0.45, 0.45, 0.32, 18), tire, x, 0.45, z, { rz: Math.PI / 2 });
  } else {
    mesh(g, rbox(1.8, 0.62, 4.3, 0.18), paint, 0, 0.62, 0);
    mesh(g, rbox(1.62, 0.55, 2.3, 0.2), paint, 0, 1.1, -0.25);
    mesh(g, rbox(1.66, 0.42, 2.2, 0.16), glass, 0, 1.12, -0.25, { cast: false });
    for (const z of [1.35, -1.35]) for (const x of [-0.85, 0.85]) mesh(g, new THREE.CylinderGeometry(0.34, 0.34, 0.24, 18), tire, x, 0.34, z, { rz: Math.PI / 2 });
  }
  const zf = kind === 'truck' ? 3.62 : 2.16;
  g.userData.head = [mesh(g, rbox(0.32, 0.12, 0.04, 0.02), std(0xfff4dc, { e: 0xfff4dc, ei: 0, unique: true }), -0.6, kind === 'truck' ? 0.9 : 0.68, zf, { cast: false })];
  g.userData.head.push(mesh(g, rbox(0.32, 0.12, 0.04, 0.02), g.userData.head[0].material, 0.6, kind === 'truck' ? 0.9 : 0.68, zf, { cast: false }));
  g.userData.tail = mesh(g, rbox(1.4, 0.1, 0.04, 0.02), std(0x9a1a1a, { e: 0xff2a1a, ei: 0.2, unique: true }), 0, 0.72, -(kind === 'truck' ? 3.82 : 2.16), { cast: false });
  return g;
}

// ---------- trees ----------
let leafTex;
export function makeTree(seed, scale = 1) {
  leafTex ??= mottled('#4f7a3a', '#3b6230', '#6e9450', 128, 5, 500, [4, 12]);
  const r = rng(seed);
  const g = new THREE.Group();
  mesh(g, new THREE.CylinderGeometry(0.12, 0.16, 2.6, 8), std(0x5a4232, { r: 0.95 }), 0, 1.3, 0);
  const leaf = std(0xffffff, { map: leafTex, r: 0.95 });
  const h = 2.0 + r() * 0.8;
  mesh(g, rbox(2.2, h, 2.2, 0.25, 2), leaf, 0, 2.4 + h / 2, 0).rotation.y = r();
  mesh(g, rbox(1.5, 1.1, 1.5, 0.22, 2), leaf, (r() - 0.5) * 0.4, 2.4 + h + 0.4, (r() - 0.5) * 0.4).rotation.y = r();
  g.scale.setScalar(scale);
  return g;
}

// ---------- sky dome ----------
export function makeSky(radius = 900) {
  const geo = new THREE.SphereGeometry(radius, 32, 16);
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(0x6f9fd0) }, mid: { value: new THREE.Color(0xc9dcea) }, bot: { value: new THREE.Color(0xe6ecef) } },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 top; uniform vec3 mid; uniform vec3 bot; varying vec3 vP; void main(){ float h = vP.y; vec3 c = h > 0.0 ? mix(mid, top, pow(clamp(h*1.6,0.0,1.0),0.7)) : bot; gl_FragColor = vec4(c,1.0); }',
  });
  const m = new THREE.Mesh(geo, mat); m.frustumCulled = false; m.renderOrder = -10;
  return m;
}

// ---------- screen textures ----------
export function textPanel(w, h, draw) { return canvasTex(w, h, draw); }
