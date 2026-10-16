import * as THREE from 'three';
import { V, vlerp, lerp, clamp, ease, easeOut, smooth, noise1, rng, std, basic, box, rb, mesh, rbox, canvasTex, redraw, makePerson, litTex } from './lib.js';
import { scene, setMood, setCam, render, sunAt, setDOF, sun, refreshEnv, registerMaterials } from './engine.js';
import { buildCity } from './city.js';
import { buildOffice, buildWarehouse, buildHospital, buildShop, buildEarth } from './sets.js';
import { SHOTS, CAPTIONS, DURATION } from './timeline.js';

const loader = new THREE.TextureLoader();
const city = buildCity(scene);
const office = buildOffice(scene);
const wh = buildWarehouse(scene);
const hosp = buildHospital(scene);
const shop = buildShop(scene);
const earth = buildEarth(scene, loader);
const SETS = { city: city.group, office: office.group, wh: wh.group, hosp: hosp.group, shop: shop.group, earth: earth.group };
const sans = (w, px) => `${w} ${px}px Inter`;
function show(name) { for (const [k, g] of Object.entries(SETS)) g.visible = k === name; }
function place(P, x, y, z, ry) { P.reset(); P.g.visible = true; P.g.position.set(x, y, z); P.g.rotation.y = ry; }
const shake = (t, a, s = 0) => V(noise1(t * 2.3, s) * a, noise1(t * 2.1, s + 4) * a, noise1(t * 1.9, s + 9) * a * 0.5);

// walk along a polyline at speed v starting at time t0; returns false before start / after the end (if hideAfter)
function walkPath(P, pts, t, t0, v, o = {}) {
  let d = Math.max(0, (t - t0) * v);
  let total = 0; for (let i = 1; i < pts.length; i++) total += pts[i - 1].distanceTo(pts[i]);
  if (d >= total) { if (o.hideAfter) { P.g.visible = false; return false; } d = total - 1e-3; }
  let i = 1, acc = 0;
  for (; i < pts.length; i++) { const L = pts[i - 1].distanceTo(pts[i]); if (acc + L >= d) break; acc += L; }
  i = Math.min(i, pts.length - 1);
  const a = pts[i - 1], b = pts[i], u = (d - acc) / Math.max(1e-6, a.distanceTo(b));
  P.reset(); P.g.visible = true;
  P.g.position.set(lerp(a.x, b.x, u), o.y ?? 0, lerp(a.z, b.z, u));
  P.g.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
  if (t < t0) { P.g.position.set(pts[0].x, o.y ?? 0, pts[0].z); return true; }
  P.walkDist(d, o.amp ?? 0.5);
  return true;
}

// ---------- city extras ----------
city.cars.forEach(c => { const s = new THREE.Group(); s.position.set(0, c.g.userData.tail.position.z < -3 ? 2.7 : 1.42, -0.2); mesh(s, new THREE.CylinderGeometry(0.22, 0.25, 0.2, 18), std(0x1d1f23, { r: 0.3, m: 0.5 }), 0, 0, 0, { cast: false }); mesh(s, new THREE.CylinderGeometry(0.235, 0.235, 0.05, 18), std(0x111111, { e: 0x5fe0ff, ei: 3 }), 0, 0.03, 0, { cast: false }); mesh(s, new THREE.SphereGeometry(0.16, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0x223344, { r: 0.1, m: 0.6 }), 0, 0.1, 0, { cast: false }); c.g.add(s); c.sensor = s; s.visible = false; });
const setSensors = on => city.cars.forEach(c => c.sensor.visible = on);
// truck driver for the robotaxi shot
const driver = makePerson({ seed: 1777, shirt: 0x8a3a2a, pants: 0x2c3445, hair: 0x2a1d15 }); city.group.add(driver.g);
const cap = mesh(driver.head, new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(0x2d5d8a, { r: 0.7 }), 0, 0.2, 0, { cast: false });
// FOR LEASE banners
const leaseT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#c0261b'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.fillRect(12, 12, w - 24, h - 24); c.fillStyle = '#c0261b'; c.font = sans(800, 64); c.textAlign = 'center'; c.fillText('FOR LEASE', w / 2, 110); c.font = sans(700, 30); c.fillStyle = '#222'; c.fillText('ENTIRE BUILDING AVAILABLE', w / 2, 170); c.fillText('555-0100', w / 2, 215); });
const banners = new THREE.Group(); city.group.add(banners);
for (const [x, y, z, ry] of [[9.97, 11, -96, -Math.PI / 2], [9.97, 19, -82, -Math.PI / 2], [-9.97, 13, -100, Math.PI / 2], [9.97, 8, -110, -Math.PI / 2]]) mesh(banners, new THREE.PlaneGeometry(8, 4), std(0xffffff, { map: leaseT, r: 0.9 }), x, y, z, { ry, cast: false });
banners.visible = false;
const jobT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#123b63'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = sans(800, 60); c.textAlign = 'center'; c.fillText('JOB CENTER', w / 2, 86); });
const jobSign = mesh(city.group, new THREE.PlaneGeometry(4, 1), basic(0xffffff, { map: jobT }), 9.95, 4.9, -90, { ry: -Math.PI / 2, cast: false }); jobSign.visible = false;
const queue = []; for (let i = 0; i < 18; i++) { const P = makePerson({ seed: 2100 + i }); city.group.add(P.g); queue.push(P); }
// protest
const signTexts = ['HUMANS FIRST', 'WE NEED JOBS', 'TAX THE ROBOTS', 'AI TOOK MY JOB', 'PEOPLE > PROFIT', 'WHO PAYS RENT?'];
const signTex = signTexts.map(s => canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#f5f2ea'; c.fillRect(0, 0, w, h); c.fillStyle = '#111'; c.font = sans(800, s.length > 12 ? 30 : 36); c.textAlign = 'center'; const words = s.split(' '); if (words.length > 2) { c.fillText(words.slice(0, 2).join(' '), w / 2, 70); c.fillText(words.slice(2).join(' '), w / 2, 112); } else c.fillText(s, w / 2, 92); }));
const crowd = [];
for (let i = 0; i < 44; i++) {
  const P = makePerson({ seed: 2400 + i }); city.group.add(P.g);
  const sg = new THREE.Group(); P.torso.add(sg); sg.position.set(0, 0.0, 0.08);
  box(sg, 0.025, 0.7, 0.025, std(0x8a6a45), 0, 1.3, 0); box(sg, 0.62, 0.4, 0.02, std(0xffffff, { map: signTex[i % signTex.length], r: 0.9 }), 0, 1.72, 0.0);
  P.sign = sg; sg.visible = i % 3 !== 2;
  crowd.push(P);
}
const police = []; for (let i = 0; i < 7; i++) { const P = makePerson({ robot: true, seed: 2600 + i }); city.group.add(P.g); rb(P.torso, 0.55, 0.95, 0.05, std(0x9fb3c8, { t: true, op: 0.55, r: 0.1 }), 0, 0.25, 0.3, { rad: 0.02, cast: false }); police.push(P); }
// drones
function makeDrone() { const d = new THREE.Group(); const dk = std(0x22252b, { r: 0.4, m: 0.4 }); rb(d, 0.5, 0.16, 0.5, std(0xe9edf1, { r: 0.25 }), 0, 0, 0, { rad: 0.06 }); const rotors = []; for (const [x, z] of [[0.38, 0.38], [-0.38, 0.38], [0.38, -0.38], [-0.38, -0.38]]) { box(d, 0.36, 0.04, 0.05, dk, x / 2, 0, z / 2).rotation.y = Math.atan2(z, x); const r = mesh(d, new THREE.CylinderGeometry(0.2, 0.2, 0.01, 18), std(0x444444, { t: true, op: 0.45 }), x, 0.08, z, { cast: false }); rotors.push(r); } mesh(d, new THREE.SphereGeometry(0.04, 8, 6), std(0x111111, { e: 0xff3030, ei: 3 }), 0, -0.09, 0.2, { cast: false }); const pkg = rb(d, 0.3, 0.24, 0.3, std(0xb8925e, { r: 0.9 }), 0, -0.3, 0, { rad: 0.01 }); d.pkg = pkg; d.scale.setScalar(1.6); city.group.add(d); return d; }
const drones = []; for (let i = 0; i < 6; i++) drones.push(makeDrone());
const hideDrones = () => drones.forEach(d => d.visible = false);
// final: bench + sitter + street robots
const bench = new THREE.Group(); city.group.add(bench); bench.position.set(9.2, 0.18, -15.5); bench.rotation.y = -Math.PI / 2;
box(bench, 1.8, 0.06, 0.45, std(0x8a6a45, { r: 0.7 }), 0, 0.46, 0); box(bench, 1.8, 0.4, 0.05, std(0x8a6a45, { r: 0.7 }), 0, 0.76, -0.2); for (const x of [-0.8, 0.8]) box(bench, 0.06, 0.46, 0.4, std(0x333333, { m: 0.5 }), x, 0.23, 0);
bench.visible = false;
const sitter = makePerson({ seed: 1999, shirt: 0x5a7d5a, pants: 0x3b3b3b, hair: 0x4a3020, scale: 1 }); city.group.add(sitter.g);
const streetBots = []; for (let i = 0; i < 12; i++) { const P = makePerson({ robot: true, seed: 2800 + i }); city.group.add(P.g); streetBots.push(P); }
// AI towers glow
const aiLit = litTex(4, 4, 'glass', 777, 0.92); const aiTowerMat = std(0x1a2a36, { r: 0.3, m: 0.4, unique: true }); aiTowerMat.map = city.buildings.find(b => b.k === 0).me.material.map; aiTowerMat.emissiveMap = aiLit; aiTowerMat.emissive = new THREE.Color(0x5fe0ff); aiTowerMat.emissiveIntensity = 2.2;
const towers = city.buildings.filter(b => !b.far).sort((a, b) => b.h - a.h).slice(0, 5);
registerMaterials([...city.allMats, aiTowerMat]);

function hideCityExtras() {
  driver.g.visible = false; banners.visible = false; jobSign.visible = false; bench.visible = false; sitter.g.visible = false;
  [...queue, ...crowd, ...police, ...streetBots].forEach(P => P.g.visible = false);
  hideDrones(); setSensors(false);
}
function flyDrones(t, n, pathFn) { drones.forEach((d, i) => { if (i >= n) { d.visible = false; return; } d.visible = true; const p = pathFn(i, t); d.position.copy(p.pos); d.rotation.y = p.ry; d.children.forEach(ch => { if (ch.geometry && ch.geometry.type === 'CylinderGeometry' && ch.position.y > 0.05) ch.rotation.y = t * 40; }); }); }

function doShot(S, t) {
  const lt = t - S.t0, u = clamp(lt / (S.t1 - S.t0));
  const out = { hud: null, stat: null, title: 0, vig: 0.5, grain: 0.03 };
  setDOF(false);
  if (SETS.city.visible || true) hideCityExtras();
  switch (S.id) {
    case 'title': {
      show('city'); setMood('morning', { fogNear: 300, fogFar: 1600 }); city.setNight(false); city.resetLamps(); city.setTraffic('green');
      city.placeCars(t); city.placePeds(t, { phones: true });
      sunAt(V(0, 0, -80), V(-50, 45, 30), 260);
      const k = easeOut(u);
      setCam(V(lerp(-24, -10, k), lerp(320, 250, k), lerp(-10, 25, k)), V(0, 0, lerp(-90, -70, k)), 40);
      out.title = 1; out.hud = { label: 'AI GOES LIVE IN', big: countdown(3.2 - t), sub: 'PEOPLE WITH A JOB TODAY: ~3.5 BILLION' };
      break;
    }
    case 'day1': case 'call': case 'creative': case 'coders': {
      show('office');
      const night = S.id === 'coders';
      office.setWindows(night);
      setMood('interior', { exp: night ? 0.5 : 0.78, env: night ? 0.1 : 0.4, bloom: night ? 0.55 : 0.25 });
      sunAt(V(2000, 0, -4), night ? V(2, 10, -14) : V(4, 12, -14), 18, night ? 0.15 : 1.2);
      const D = office.desks, PP = office.people;
      PP.forEach(P => { P.g.visible = false; P.hs.visible = false; });
      office.boxes.forEach(b => b.visible = false);
      office.deskLamps.forEach(l => l.visible = false);
      const sitAt = (P, d, i) => { place(P, d.x, 0, d.z + 0.55, Math.PI); P.sit(); };
      if (S.id === 'day1') {
        const sweep = d => 1.0 + (Math.abs(d.x - 7.2) + Math.abs(d.z - 2)) * 0.035;      // AI switches on in a wave
        office.screens('work', t, (d, i) => lt > sweep(d) ? office.M.ai : office.M.work[i % 4]);
        D.forEach((d, i) => { const P = PP[i]; sitAt(P, d, i); const on = lt > sweep(d) + 0.25;
          if (!on) { P.type(t + i); P.head.rotation.x = 0.15; } else { P.armL.rotation.set(-0.25, 0, 0.1); P.armR.rotation.set(-0.25, 0, -0.1); P.elbowL.rotation.x = -0.9; P.elbowR.rotation.x = -0.9; P.head.rotation.x = lerp(0.15, -0.05, smooth(0, 0.6, lt - sweep(d) - 0.25)); P.head.rotation.y = Math.sin(i * 2.3) * 0.5 * smooth(0.2, 1.0, lt - sweep(d) - 0.25); }
          P.idle(t + i, 0.5); });
        const k = ease(u);
        setCam(V(2000 + lerp(8.6, 7.6, k), lerp(2.7, 2.4, k), lerp(7.6, 6.8, k)), V(2000 - 0.5, 0.9, -3), 46);
        out.hud = { label: 'AFTER AI', big: 'DAY 1', sub: 'IT NEVER SLEEPS. IT COSTS CENTS PER HOUR.' };
      } else if (S.id === 'call') {
        office.screens('ai', t, () => office.M.ai);
        const R = rng(5);
        const leavers = [];
        D.forEach((d, i) => {
          const P = PP[i]; P.hs.visible = true; const r = R();
          if (r < 0.42) return;                                      // already gone
          if (r < 0.62 && (d.ri === 2 || d.ri === 1)) { leavers.push([P, d, i]); return; }
          sitAt(P, d, i); P.armL.rotation.set(-0.25, 0, 0.1); P.armR.rotation.set(-0.25, 0, -0.1); P.elbowL.rotation.x = -0.9; P.elbowR.rotation.x = -0.9; P.head.rotation.x = 0.1; P.idle(t + i, 0.8);
        });
        leavers.forEach(([P, d, i], n) => {
          const aisle = d.z + 1.8;
          const pts = [V(d.x, 0, d.z + 0.95), V(d.x, 0, aisle), V(13.6, 0, aisle), V(13.6, 0, -0.5), V(17, 0, -0.5)];
          const t0 = S.t0 + 0.2 + n * 0.55;
          walkPath(P, pts, t, t0, 1.25, { hideAfter: true, amp: 0.42 });
          if (P.g.visible) { P.carry(); P.head.rotation.x = 0.2; if (t < t0) P.idle(t + i, 0.8); const b = office.boxes[i]; b.visible = true; P.torso.updateWorldMatrix(true, false); const wp = new THREE.Vector3(0, 0.35, 0.42).applyMatrix4(P.torso.matrixWorld); office.group.worldToLocal(wp); b.position.copy(wp); b.rotation.y = P.g.rotation.y; }
        });
        const k = ease(u);
        setCam(V(2000 + lerp(12.8, 12.2, k), lerp(1.7, 1.75, k), lerp(1.6, 1.0, k)), V(2000 + 1, 1.0, -2.5), 46);
        out.stat = { big: '700', sub: 'AGENTS’ WORK DONE BY ONE AI ASSISTANT (KLARNA, 2024)' };
        out.hud = { label: 'AFTER AI', big: '+1 WEEK', sub: 'CUSTOMER SERVICE GOES FIRST' };
      } else if (S.id === 'creative') {
        office.drawArt(lt);
        const front = D.find(d => d.ri === 3 && d.ci === 0);
        office.screens('ai', t, (d, i) => d === front ? office.M.art : (rng(i * 7)() < 0.5 ? office.M.ai : office.M.off));
        const P = PP[D.indexOf(front)];
        place(P, front.x + 0.1, 0, front.z + 0.78, Math.PI + 0.15);
        const b = office.boxes[D.indexOf(front)]; b.visible = true; b.position.set(front.x - 0.25, 0.89, front.z + 0.12); b.rotation.y = 0.2;
        const cyc = (lt % 1.6) / 1.6; const reachA = Math.sin(cyc * Math.PI);
        P.armR.rotation.set(-0.5 - 0.7 * reachA, 0, -0.1 + 0.25 * reachA); P.elbowR.rotation.x = -0.5 + 0.2 * reachA;
        P.armL.rotation.set(-0.35, 0, 0.1); P.elbowL.rotation.x = -0.6; P.head.rotation.x = 0.35; P.head.rotation.y = 0.35 * Math.sin(cyc * Math.PI * 2);
        P.torso.rotation.x = 0.12; P.idle(t, 0.4);
        const k = ease(u);
        const p = V(2000 + front.x + lerp(-2.6, -2.3, k), lerp(1.6, 1.55, k), front.z + lerp(-0.5, -0.3, k));
        setCam(p, V(2000 + front.x + 0.05, 1.12, front.z + 0.45), 46);
        setDOF(true, p.distanceTo(V(2000 + front.x, 1.2, front.z + 0.6)), 0.004, 0.008);
        out.hud = { label: 'AFTER AI', big: '+1 MONTH', sub: 'WRITERS, TRANSLATORS, DESIGNERS' };
      } else {
        office.screens('codeAI', t, (d, i) => office.M.codeAI);
        D.forEach((d, i) => { if ((d.ri + d.ci) % 3 === 0) office.deskLamps[i].visible = true; });
        const d1 = D.find(d => d.ri === 2 && d.ci === 4);
        const A = PP[D.indexOf(d1)], B = PP[D.indexOf(d1) + 1];
        place(A, d1.x + 0.3, 0, d1.z + 1.2, Math.PI + 0.2); A.cross(); A.head.rotation.x = 0.15; A.idle(t, 1);
        place(B, d1.x + 1.15, 0, d1.z + 1.3, Math.PI - 0.15); B.armR.rotation.set(-1.2, 0, -0.1); B.elbowR.rotation.x = -1.9; B.head.rotation.set(0.12, -0.25, 0.1); B.idle(t + 3, 0.6);
        const k = ease(u);
        setCam(V(2000 + lerp(3.6, 3.0, k), lerp(1.3, 1.25, k), lerp(5.6, 5.2, k)), V(2000 - 0.8, 1.0, -3.5), 44);
        out.hud = { label: 'AFTER AI', big: '+3 MONTHS', sub: 'AI NOW WRITES THE CODE' };
        out.vig = 0.75;
      }
      break;
    }
    case 'robotaxi': {
      show('city'); setMood('morning'); city.setNight(false); city.resetLamps(); city.setTraffic('green'); setSensors(true);
      city.placeCars(t, { speed: 1.2 }); city.placePeds(t, { hide: (p, z) => p.x > 0 && z > -40 && z < -24 });
      sunAt(V(4, 0, -36), V(-45, 38, 18), 40);
      place(driver, 6.9, 0.18, -35.5, -Math.PI / 2 + 0.25); driver.armL.rotation.set(-0.15, 0, 0.12); driver.armR.rotation.set(-0.15, 0, -0.12); driver.head.rotation.y = lerp(0.5, -0.4, smooth(0.5, 3.2, lt)); driver.idle(t, 0.6);
      const k = ease(u);
      setCam(V(lerp(9.6, 9.4, k), lerp(1.5, 1.55, k), lerp(-29.0, -29.6, k)), V(3.5, 1.2, -41), 44);
      out.hud = { label: 'AFTER AI', big: '+6 MONTHS', sub: 'SELF-DRIVING CARS AND TRUCKS' };
      break;
    }
    case 'warehouse': {
      show('wh'); setMood('interior', { exp: 0.8, env: 0.35, fogNear: 60, fogFar: 220 });
      sunAt(V(3000, 0, -5), V(10, 30, 20), 40, 0.9);
      wh.update(t);
      const lanes = [-12, 0.8, 12, -0.8, -12, 12, 0.8, -0.8, 12];
      wh.robots.forEach((P, i) => { const x = lanes[i], dir = i % 2 ? 1 : -1; const z0 = -20 + ((i * 7.3) % 22); const pts = dir > 0 ? [V(x, 0, z0), V(x, 0, z0 + 12)] : [V(x, 0, z0 + 6), V(x, 0, z0 - 6)]; walkPath(P, pts, t, S.t0 - 0.0, 1.0, { amp: 0.42 }); P.carry(); P.crate.visible = true; });
      const hm = wh.humans[0]; walkPath(hm, [V(2.0, 0, 2), V(2.4, 0, 12)], t, S.t0 + 0.3, 0.7, { amp: 0.35 }); hm.head.rotation.x = 0.35; hm.armR.rotation.x = -0.25; hm.elbowR.rotation.x = -0.5;
      hm.torso.updateWorldMatrix(true, true); const hp = new THREE.Vector3(0, -0.36, 0.05).applyMatrix4(hm.elbowR.matrixWorld); wh.group.worldToLocal(hp); wh.helmet.position.copy(hp); wh.helmet.rotation.set(Math.PI, 0, 0.3);
      wh.humans[1].g.visible = wh.humans[2].g.visible = false;
      const k = ease(u);
      setCam(V(3000 + lerp(3.4, 2.4, k), lerp(3.4, 3.0, k), lerp(22, 20, k)), V(3000, 1.3, -8), 46);
      out.stat = { big: '40%', sub: 'OF ALL JOBS WORLDWIDE ARE EXPOSED TO AI (IMF)' };
      out.hud = { label: 'AFTER AI', big: '+1 YEAR', sub: 'ROBOTS RUN WAREHOUSES AND FACTORIES' };
      break;
    }
    case 'hospital': {
      show('hosp'); setMood('interior', { exp: 0.72 });
      sunAt(V(4000, 0, 0), V(2, 10, 6), 8, 1.0);
      hosp.update(t);
      const doc = hosp.doc; place(doc, -1.6, 0, -1.55, -2.76); doc.armL.rotation.set(-0.6, 0.2, 0.1); doc.elbowL.rotation.x = -1.4; doc.armR.rotation.set(-0.1, 0, -0.1); doc.head.rotation.set(0.05, 0.5, 0); doc.idle(t, 0.6);
      const k = ease(u);
      const p = V(4000 + lerp(2.4, 1.9, k), lerp(1.8, 1.7, k), lerp(3.2, 2.7, k));
      setCam(p, V(4000 - 0.9, 1.35, -1.6), 46);
      setDOF(true, p.distanceTo(V(4000 - 0.6, 1.4, -1.4)), 0.003, 0.006);
      out.hud = { label: 'AFTER AI', big: '+2 YEARS', sub: 'DOCTORS, LAWYERS, ACCOUNTANTS' };
      break;
    }
    case 'empty': {
      show('city'); setMood('overcast'); city.setNight(false); city.resetLamps(); city.setTraffic('off'); setSensors(true);
      city.placeCars(t, { speed: 0.5, hide: (c, z) => c.lane > 0 || (z > -120 && z < -60 && Math.abs(c.lane) > 3) }); city.placePeds(t, { hide: () => true });
      sunAt(V(8, 0, -90), V(-45, 50, 18), 40);
      banners.visible = true; jobSign.visible = true;
      queue.forEach((P, i) => { place(P, 8.75 - (i % 2) * 0.3, 0.18, -88.6 + i * 0.95, Math.PI + (i % 3 - 1) * 0.12); P.head.rotation.x = 0.2; P.idle(t + i, 1); if (i % 4 === 1) P.usePhone(true, 0xbfe0ff); if (i % 5 === 3) P.cross(); });
      const k = ease(u);
      setCam(V(lerp(5.2, 5.6, k), lerp(1.7, 1.9, k), lerp(-70.5, -72, k)), V(9.6, lerp(5.5, 6.5, k), -92), 46);
      out.stat = { big: '300 MILLION', sub: 'FULL-TIME JOBS EXPOSED TO AUTOMATION (GOLDMAN SACHS)' };
      out.hud = { label: 'AFTER AI', big: '+3 YEARS', sub: 'UNEMPLOYMENT AT RECORD HIGHS' };
      break;
    }
    case 'protest': {
      show('city'); setMood('overcast', { exp: 0.95 }); city.setNight(false); city.resetLamps(); city.setTraffic('off');
      city.placeCars(0, { stopped: true, hide: (c, z) => z < -120 && z > -200 }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -155), V(-30, 50, 30), 40);
      const R = rng(9);
      crowd.forEach((P, i) => {
        const x = -6.5 + (i % 11) * 1.3 + (R() - 0.5) * 0.5, z0 = -158 - Math.floor(i / 11) * 1.6 + (R() - 0.5) * 0.6;
        const d = lt * 0.55;
        place(P, x, 0, z0 + d, (R() - 0.5) * 0.4); P.walkDist(d, 0.35);
        if (P.sign.visible) { const pump = Math.max(0, Math.sin(t * 3 + i)) * 0.15; P.armL.rotation.set(-2.75 + pump, 0, 0.12); P.armR.rotation.set(-2.75 + pump, 0, -0.12); P.elbowL.rotation.x = -0.15; P.elbowR.rotation.x = -0.15; P.sign.position.y = -pump * 0.25; }
        else { P.armR.rotation.set(-2.6 + Math.sin(t * 4 + i) * 0.3, 0, -0.2); P.elbowR.rotation.x = -0.6; }
        P.head.rotation.x = -0.1;
      });
      police.forEach((P, i) => { place(P, -5.4 + i * 1.8, 0, -146, Math.PI); P.armL.rotation.set(-0.8, 0, 0.1); P.elbowL.rotation.x = -0.9; P.armR.rotation.set(-0.2, 0, -0.1); P.idle(t + i, 0.3); });
      flyDrones(t, 3, (i, tt) => ({ pos: V(-4 + i * 4 + Math.sin(tt * 0.7 + i) * 0.8, 7.5 + Math.sin(tt * 1.3 + i) * 0.3, -152 + Math.cos(tt * 0.5 + i) * 1.5), ry: 0 }));
      drones.forEach(d => d.pkg.visible = false);
      const k = ease(u);
      setCam(V(lerp(-2.6, -1.6, k), lerp(2.3, 2.6, k), lerp(-136, -138, k)).add(shake(t, 0.015)), V(0, 2.0, -158), 44);
      out.hud = { label: 'AFTER AI', big: '+5 YEARS', sub: 'PROTESTS IN EVERY MAJOR CITY' };
      break;
    }
    case 'shop': {
      show('shop'); setMood('interior', { exp: 0.75 });
      sunAt(V(5000, 0, -6), V(4, 12, 6), 20, 0.9);
      const [r1, r2, r3, r4] = shop.robots;
      place(r1, 1.75, 0, -6, -Math.PI / 2); r1.reach('R', 0.8 + 0.2 * Math.sin(t * 2)); r1.reach('L', 0.6); r1.idle(t, 0.3);
      place(r2, 4.25, 0, -11, Math.PI / 2); r2.reach('L', 0.9 + 0.1 * Math.sin(t * 2.5)); r2.idle(t + 2, 0.3);
      walkPath(r3, [V(3.0, 0, -15), V(3.0, 0, 1.5)], t, S.t0 - 6, 1.0, { amp: 0.42 }); r3.carry(); r3.crate.visible = true;
      r4.g.visible = false;
      const k = ease(u);
      setCam(V(5000 + 3.0, lerp(1.85, 1.75, k), lerp(9, 5.5, k)), V(5000 + 3.0, 1.2, -16), 46);
      out.stat = { big: '68%', sub: 'OF THE US ECONOMY IS CONSUMER SPENDING' };
      out.hud = { label: 'AFTER AI', big: '+7 YEARS', sub: 'NO PAYCHECKS. NO CUSTOMERS.' };
      break;
    }
    case 'elite': {
      show('city'); setMood('dusk', { fogNear: 250, fogFar: 1300, bloom: 0.55 });
      city.setNight(true, b => !towers.includes(b), 0.9); towers.forEach(b => b.me.material = aiTowerMat);
      city.setLampsByFn(p => ((p.z * 13.7 + p.x * 7.1) % 1 + 1) % 1 > 0.7);
      city.placeCars(0, { stopped: true, night: true, hide: () => true }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -80), V(-70, 14, -20), 260, 0.5);
      const k = ease(u);
      setCam(V(lerp(120, 70, k), lerp(170, 140, k), lerp(140, 90, k)), V(0, 20, -90), 46);
      out.hud = { label: 'AFTER AI', big: '+10 YEARS', sub: 'WEALTH FLOWS TO A FEW AI COMPANIES' };
      break;
    }
    case 'earth': {
      show('earth'); setMood('space');
      earth.update(t, smooth(1.2, 6.0, lt), smooth(0.4, 4.0, lt));
      earth.earth.rotation.y = -0.9 + t * 0.01;
      sun.position.set(20000 + 200, 60, -320); sun.target.position.set(20000, 0, 0); sun.intensity = 2.2; sun.castShadow = false;
      setCam(V(20000 - 25, 30, lerp(205, 160, ease(u))), V(20000, 6, 0), 40);
      out.stat = { big: '3.5 BILLION', sub: 'PEOPLE HAVE A JOB TODAY' };
      out.hud = { label: 'AFTER AI', big: '+15 YEARS', sub: 'WARM: HUMAN WORK · BLUE: AI DATA CENTERS' };
      out.vig = 0.3; out.grain = 0.02;
      break;
    }
    case 'final': {
      show('city'); setMood('dusk', { fogNear: 120, fogFar: 900, bloom: 0.45 }); city.setNight(true, b => b.r < 0.55, 0.7); city.resetLamps(); city.setTraffic('green'); setSensors(true);
      city.placeCars(t, { night: true, speed: 0.8 }); city.placePeds(t, { hide: () => true });
      sunAt(V(4, 0, -20), V(-70, 14, -20), 40, 2.0);
      bench.visible = true;
      place(sitter, 9.15, 0.18, -15.5, -Math.PI / 2); sitter.sit(); sitter.g.position.y = 0.18; sitter.armL.rotation.set(-0.5, 0, 0.15); sitter.elbowL.rotation.x = -0.9; sitter.armR.rotation.set(-0.5, 0, -0.15); sitter.elbowR.rotation.x = -0.9;
      sitter.head.rotation.x = lerp(0.2, -0.25, smooth(1.0, 4.0, lt)); sitter.head.rotation.y = Math.sin(lt * 0.5) * 0.25; sitter.idle(t, 0.4);
      streetBots.forEach((P, i) => { const dir = i % 2 ? 1 : -1; const x = 7.0 + (i % 3) * 0.6; const z0 = -20 + dir * -14 + (i * 3.7) % 12 * -dir; walkPath(P, [V(x, 0, z0), V(x, 0, z0 + dir * 30)], t, S.t0, 1.1, { y: 0.18, amp: 0.42 }); });
      flyDrones(t, 6, (i, tt) => { const dir = i % 2 ? 1 : -1; const z = -60 + ((tt * 6 + i * 17) % 80) ; return { pos: V(-3 + i * 1.6, 9 + (i % 3) * 2.5, dir > 0 ? z : -20 - (z + 20)), ry: dir > 0 ? 0 : Math.PI }; });
      drones.forEach(d => d.pkg.visible = true);
      const k = ease(clamp(lt / 7.5));
      const p = vlerp(V(6.7, 1.25, -13.9), V(-6, 26, 20), k); p.y += Math.sin(k * Math.PI) * 4;
      const l = vlerp(V(9.15, 1.15, -15.5), V(4, 2, -40), k);
      setCam(p, l, lerp(36, 50, k));
      if (lt < 3) setDOF(true, p.distanceTo(V(9.15, 1.2, -15.5)), 0.003 * (1 - lt / 3), 0.008);
      out.hud = { label: 'AFTER AI', big: '+20 YEARS', sub: 'EVERYTHING RUNS. NOBODY WORKS.' };
      out.vig = 0.6;
      break;
    }
    case 'end': {
      show('earth'); setMood('space'); earth.update(t, 1, 1);
      setCam(V(20000 - 25, 30, 190), V(20000, 6, 0), 40);
      out.end = smooth(0, 0.6, lt);
      break;
    }
  }
  if (!['earth', 'end'].includes(S.id)) sun.castShadow = true;
  return out;
}
function countdown(sec) { sec = Math.max(0, sec); const s = Math.floor(sec), ms = Math.floor((sec - s) * 1000); return `0:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`; }

// ---------- overlay ----------
const $ = id => document.getElementById(id);
const grain = $('grain'), gctx = grain.getContext('2d'), gimg = gctx.createImageData(270, 480);
function setGrain(seed, amt) { grain.style.opacity = amt; const r = rng(seed), d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gctx.putImageData(gimg, 0, 0); }
function fmt(s) { return s.replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>'); }
let lastCap = null;
function overlay(t, S, o) {
  const titleA = o.title ? 1 - smooth(2.75, 3.15, t) : 0;
  $('title').style.opacity = titleA; $('titleShade').style.opacity = titleA;
  $('title').style.transform = `translateY(${-smooth(2.7, 3.2, t) * 20}px)`;
  $('slash').setAttribute('opacity', 0);
  const hud = $('hud');
  if (o.hud) {
    const hudT0 = S.hudKeep ? -10 : S.t0;
    $('hudLabel').textContent = o.hud.label; $('hudBig').textContent = o.hud.big; $('hudSub').textContent = o.hud.sub;
    hud.style.opacity = smooth(hudT0, hudT0 + 0.3, t); hud.style.transform = `translateY(${(1 - easeOut((t - hudT0) / 0.4)) * 14}px)`;
  } else hud.style.opacity = 0;
  const st = $('stat');
  if (o.stat) {
    $('statBig').textContent = o.stat.big; $('statSub').textContent = o.stat.sub;
    const a = smooth(S.t0 + 0.15, S.t0 + 0.55, t) * (1 - smooth(S.t1 - 0.25, S.t1 - 0.02, t));
    st.style.opacity = a; $('statShade').style.opacity = a; st.style.transform = `scale(${0.96 + 0.04 * easeOut((t - S.t0 - 0.15) / 0.6)})`;
  } else { st.style.opacity = 0; $('statShade').style.opacity = 0; }
  const c = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  const cap = $('cap');
  if (c) { if (lastCap !== c) { cap.innerHTML = fmt(c.text); lastCap = c; } const a = smooth(c.t0, c.t0 + 0.3, t) * (1 - smooth(c.t1 - 0.25, c.t1, t)); cap.style.opacity = a; $('capShade').style.opacity = a; cap.style.transform = `translateY(${(1 - easeOut((t - c.t0) / 0.5)) * 10}px)`; }
  else { cap.style.opacity = 0; $('capShade').style.opacity = 0; }
  $('end').style.opacity = o.end ?? 0;
  $('vignette').style.opacity = o.vig;
  $('flash').style.opacity = 0;
  $('fade').style.opacity = S.fadeIn ? 1 - smooth(S.t0, S.t0 + 0.6, t) : 0;
  setGrain(Math.floor(t * 30), o.grain);
}

window.renderAt = (t) => {
  const S = SHOTS.find(s => t >= s.t0 && t < s.t1) || SHOTS[SHOTS.length - 1];
  const o = doShot(S, t);
  render();
  overlay(t, S, o);
};
window.DURATION = DURATION;
Promise.all([document.fonts.ready, new Promise(r => { const chk = () => earth.ready() ? r() : setTimeout(chk, 50); chk(); })]).then(() => { refreshEnv(); window.READY = true; });
