// The city: avenue grid, towers, sidewalks, trees, street furniture, traffic, pedestrians.
import * as THREE from 'three';
import { rng, std, basic, box, rb, mesh, rbox, boxUV, facadeTex, litTex, mottled, makeTree, makeCar, makePerson, CAR_COLS, canvasTex, V, clamp } from './lib.js';

export function buildCity(scene) {
  const city = new THREE.Group(); scene.add(city);
  const R = rng(2024);
  const AV = [-180, -120, -60, 0, 60, 120, 180];       // avenues (along z) at these x
  const ST = [-300, -240, -180, -120, -60, 0, 60, 120]; // streets (along x) at these z
  const ROAD = 12;

  // ground + asphalt
  const asph = mottled('#5d6066', '#54575d', '#686b70', 256, 3, 1400, [1, 4]); asph.repeat.set(160, 160);
  mesh(city, new THREE.PlaneGeometry(1600, 1600), std(0xffffff, { map: asph, r: 0.95 }), 0, 0, -100, { rx: -Math.PI / 2, cast: false });
  const markM = std(0xe9e6dc, { r: 0.8 });
  const yellowM = std(0xd8b445, { r: 0.8 });
  for (const x of AV) { box(city, 0.18, 0.02, 900, yellowM, x - 0.15, 0.01, -100, { cast: false }); box(city, 0.18, 0.02, 900, yellowM, x + 0.15, 0.01, -100, { cast: false });
    for (let z = -540; z < 340; z += 9) { box(city, 0.15, 0.02, 3, markM, x - 3, 0.01, z, { cast: false }); box(city, 0.15, 0.02, 3, markM, x + 3, 0.01, z, { cast: false }); } }
  // crosswalks
  for (const x of AV) for (const z of ST) {
    for (let i = 0; i < 9; i++) { box(city, 0.7, 0.02, 3.2, markM, x - 5 + i * 1.25, 0.012, z + ROAD / 2 + 2.2, { cast: false }); box(city, 0.7, 0.02, 3.2, markM, x - 5 + i * 1.25, 0.012, z - ROAD / 2 - 2.2, { cast: false }); }
  }

  // facade materials
  const kinds = ['glass', 'concrete', 'white', 'brick', 'glass', 'white'];
  const facades = kinds.map((k, i) => facadeTex(k, 10 + i));
  const dayMats = facades.map(f => std(0xffffff, { map: f.map, r: f.kind === 'glass' ? 0.35 : 0.85, m: f.kind === 'glass' ? 0.15 : 0, unique: true }));
  const nightLit = facades.map((f, i) => litTex(f.cols, f.rows, f.kind, 50 + i, 0.42));
  const nightMats = facades.map((f, i) => { const m = std(0x8a93a6, { map: f.map, r: 0.6, unique: true }); m.emissiveMap = nightLit[i]; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = 0.9; return m; });
  const darkMats = facades.map(f => std(0x6a7080, { map: f.map, r: 0.6, unique: true }));
  const roofM = std(0xb9bcbf, { r: 0.9 }), roofDark = std(0x8e9195, { r: 0.9 });
  const shopTex = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = '#3c3f44'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4; i++) { g.fillStyle = ['#c9b48a', '#8fb3c9', '#d7c7a6', '#9bc4b0'][i]; g.fillRect(i * 64 + 6, 14, 52, 44); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(i * 64 + 6, 14, 52, 8); g.fillStyle = ['#a33', '#246', '#663', '#264'][i]; g.fillRect(i * 64 + 4, 2, 56, 10); }
  }, { repeat: true });
  const shopM = std(0xffffff, { map: shopTex, r: 0.6 });

  const buildings = [];
  const sideM = std(0xc8c3b8, { r: 0.9 });
  for (let i = 0; i < AV.length - 1; i++) for (let j = 0; j < ST.length - 1; j++) {
    const x0 = AV[i] + ROAD / 2, x1 = AV[i + 1] - ROAD / 2, z0 = ST[j] + ROAD / 2, z1 = ST[j + 1] - ROAD / 2;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, bw = x1 - x0, bd = z1 - z0;
    box(city, bw, 0.18, bd, sideM, cx, 0.09, cz, { cast: false });      // sidewalk slab
    // curbs
    // parcels: split into 2 x 2
    const splitX = R() < 0.6, splitZ = R() < 0.75;
    const px = splitX ? [[x0 + 4, cx - 0.5], [cx + 0.5, x1 - 4]] : [[x0 + 4, x1 - 4]];
    const pz = splitZ ? [[z0 + 4, cz - 0.5], [cz + 0.5, z1 - 4]] : [[z0 + 4, z1 - 4]];
    for (const [a, b] of px) for (const [c, d] of pz) {
      const w = b - a, dd = d - c;
      const distC = Math.hypot((a + b) / 2, (c + d) / 2 + 60);
      const h = Math.max(14, (30 + R() * 70) * (1.25 - Math.min(1, distC / 320) * 0.7));
      const k = Math.floor(R() * facades.length);
      const tileX = 3.2, tileY = 3.6;
      const geo = boxUV(w, h, dd, tileX * 4 / 4 * 4, tileY * 4);
      const me = mesh(city, geo, dayMats[k], (a + b) / 2, h / 2 + 0.18, (c + d) / 2);
      mesh(city, rbox(w + 0.4, 0.6, dd + 0.4, 0.1), roofM, (a + b) / 2, h + 0.3 + 0.18, (c + d) / 2, { cast: false });
      if (R() < 0.5) box(city, w * 0.35, 2.5, dd * 0.3, roofDark, (a + b) / 2 + w * 0.15, h + 1.6, (c + d) / 2 - dd * 0.1);
      // shop band at street level on the faces toward avenues
      const shop = mesh(city, boxUV(w + 0.08, 4.2, dd + 0.08, 16, 4.2), shopM, (a + b) / 2, 2.28, (c + d) / 2, { cast: false });
      buildings.push({ me, k, x: (a + b) / 2, z: (c + d) / 2, h, r: R() });
    }
  }
  // far skyline ring
  for (let i = 0; i < 70; i++) {
    const ang = R() * Math.PI * 2, rad = 420 + R() * 160;
    const w = 20 + R() * 30, h = 40 + R() * 120, k = Math.floor(R() * facades.length);
    const me = mesh(city, boxUV(w, h, w, 12.8, 14.4), dayMats[k], Math.cos(ang) * rad, h / 2, -100 + Math.sin(ang) * rad, { cast: false });
    buildings.push({ me, k, x: me.position.x, z: me.position.z, h, r: R(), far: true });
  }

  // trees, street lights, traffic lights along all avenues near camera area
  const lampHeads = [], pools = [];
  const poleM = std(0x3f4448, { r: 0.6, m: 0.3 });
  const headM = std(0xf2efe6, { e: 0xffe7b0, ei: 0, unique: true });
  const poolTex = canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,214,150,0.55)'); gr.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const poolM = basic(0xffffff, { map: poolTex, t: true, add: true, dw: false, tm: false });
  for (const x of AV) for (const side of [-1, 1]) {
    const near = x === 0;
    for (let z = -290; z < 110; z += near ? 9 : 18) {
      if (ST.some(s => Math.abs(z - s) < 9)) continue;
      const tx = x + side * (ROAD / 2 + 1.6);
      if (near || Math.abs(x) <= 60) { const t = makeTree(Math.floor(z * 7 + x + side * 3), 0.95 + ((z * 13) % 7) / 30); t.position.set(tx, 0.18, z); city.add(t); }
    }
    for (let z = -295; z < 115; z += 24) {
      if (ST.some(s => Math.abs(z - s) < 8)) continue;
      const lx = x + side * (ROAD / 2 + 0.6);
      box(city, 0.16, 7, 0.16, poleM, lx, 3.5, z);
      box(city, 1.6, 0.12, 0.14, poleM, lx - side * 0.75, 6.95, z);
      const hd = rb(city, 0.7, 0.14, 0.32, headM, lx - side * 1.4, 6.85, z, { cast: false, rad: 0.05 });
      lampHeads.push(hd);
      const p = mesh(city, new THREE.PlaneGeometry(9, 9), poolM, lx - side * 1.6, 0.05, z, { rx: -Math.PI / 2, cast: false, receive: false });
      p.visible = false; pools.push(p);
    }
  }
  const tlLights = [];
  for (const x of [0, 60, -60]) for (const z of ST) for (const [sx, sz] of [[1, 1], [-1, -1]]) {
    const px = x + sx * (ROAD / 2 + 0.5), pz = z + sz * (ROAD / 2 + 0.5);
    box(city, 0.14, 3.6, 0.14, poleM, px, 1.8, pz);
    rb(city, 0.34, 0.95, 0.3, std(0x2b2f33, { r: 0.6 }), px, 3.7, pz, { rad: 0.06 });
    for (const [c, dy] of [[0xd9362b, 0.3], [0xe0a227, 0], [0x3dbb5a, -0.3]]) {
      const m = std(0x222222, { e: c, ei: 0, unique: true });
      const l = mesh(city, new THREE.CircleGeometry(0.1, 16), m, px, 3.7 + dy, pz + sz * 0.16, { cast: false, ry: sz < 0 ? Math.PI : 0 });
      tlLights.push({ m, c, dy });
    }
  }

  // billboard (news screen) on the facade at x=+6.5+, z=-40
  const bbTex = canvasTex(512, 320, () => {});
  const billboard = new THREE.Group(); city.add(billboard);
  box(billboard, 0.4, 7.4, 11.4, std(0x1a1a1a, { r: 0.5 }), 0, 0, 0);
  const bbScreen = mesh(billboard, new THREE.PlaneGeometry(11, 7), basic(0xffffff, { map: bbTex, tm: false }), -0.21, 0, 0, { ry: -Math.PI / 2, cast: false });
  billboard.position.set(10.2, 9, -44);

  // traffic
  const cars = [];
  for (let i = 0; i < 34; i++) {
    const lane = [-4.6, -1.6, 1.6, 4.6][i % 4];
    const c = makeCar(CAR_COLS[i % CAR_COLS.length], i % 11 === 5 ? 'truck' : 'sedan'); city.add(c);
    cars.push({ g: c, lane, dir: lane > 0 ? -1 : 1, z0: R() * 400 - 300, v: 7 + R() * 5 });
  }
  function placeCars(t, o = {}) {
    for (const c of cars) {
      let z = c.z0 + c.dir * c.v * t * (o.speed ?? 1);
      z = ((z + 300) % 420 + 420) % 420 - 300;
      if (o.stopped) z = c.z0 > -60 ? c.z0 - 300 : c.z0;
      c.g.position.set(c.lane, 0, z); c.g.rotation.y = c.dir > 0 ? 0 : Math.PI;
      c.g.visible = !(o.hide && o.hide(c, z));
      const on = !!o.night;
      c.g.userData.head.forEach(h => h.material.emissiveIntensity = on ? 3 : 0);
      c.g.userData.tail.material.emissiveIntensity = on ? 2.5 : 0.3;
    }
  }
  const peds = [];
  for (let i = 0; i < 46; i++) {
    const P = makePerson({ seed: 100 + i }); city.add(P.g);
    const side = i % 2 ? 1 : -1;
    peds.push({ P, x: side * (ROAD / 2 + 2.6 + R() * 2.4), dir: R() < 0.5 ? 1 : -1, z0: R() * 120 - 80, v: 1.1 + R() * 0.5, ph: R() * 6, phone: R() < 0.55 });
  }
  function placePeds(t, o = {}) {
    for (const p of peds) {
      let z = p.z0 + p.dir * p.v * t * (o.speed ?? 1); z = ((z + 80) % 120 + 120) % 120 - 80;
      p.P.g.visible = !(o.hide && o.hide(p, z));
      p.P.reset();
      p.P.g.position.set(p.x, 0.18, z); p.P.g.rotation.y = p.dir > 0 ? 0 : Math.PI;
      if (o.freeze) { if (o.pose) o.pose(p); continue; }
      p.P.walk(t * p.v * 4.4 + p.ph, 0.5);
      if (p.phone && o.phones) { p.P.usePhone(true, o.screen ?? 0xbfe0ff); p.P.legL.rotation.x *= 1; }
    }
  }

  function setNight(on, darkFn = null, litBoost = 0.9) {
    for (const b of buildings) {
      const dark = darkFn && darkFn(b);
      b.me.material = !on ? dayMats[b.k] : dark ? darkMats[b.k] : nightMats[b.k];
    }
    nightMats.forEach(m => m.emissiveIntensity = litBoost);
    headM.emissiveIntensity = on ? 4 : 0;
    pools.forEach(p => p.visible = on);
  }
  function setLampsByFn(fn) { // per-lamp on/off at night
    lampHeads.forEach((h, i) => { const on = fn(h.position, i); h.material = on ? headM : poleM; pools[i].visible = on; });
  }
  function resetLamps() { lampHeads.forEach((h, i) => h.material = headM); }
  function setTraffic(state) { tlLights.forEach(l => l.m.emissiveIntensity = state === 'red' ? (l.dy > 0.1 ? 3 : 0) : state === 'off' ? 0 : (l.dy < -0.1 ? 3 : 0)); }

  const allMats = [...dayMats, ...nightMats, ...darkMats];
  return { allMats, group: city, buildings, cars, peds, placeCars, placePeds, setNight, setLampsByFn, resetLamps, setTraffic, billboard, bbTex, lampHeads, pools };
}
