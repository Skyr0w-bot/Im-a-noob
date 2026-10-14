import * as THREE from 'three';
import { V, vlerp, lerp, clamp, ease, easeOut, easeIn, smooth, noise1, rng, std, basic, box, rb, mesh, rbox, canvasTex, redraw, makePerson, makeCar } from './lib.js';
import { scene, camera, setMood, setCam, render, sunAt, setDOF, sun, bloom, refreshEnv, registerMaterials } from './engine.js';
import { buildCity } from './city.js';
import { buildPhone, buildStore, buildAirport, buildHospital, buildPort, buildGas, buildEarth } from './sets.js';
import { SHOTS, CAPTIONS, DURATION } from './timeline.js';

const loader = new THREE.TextureLoader();
const city = buildCity(scene);
registerMaterials(city.allMats);
const phone = buildPhone(scene);
const store = buildStore(scene);
const airport = buildAirport(scene);
const hosp = buildHospital(scene);
const port = buildPort(scene);
const gas = buildGas(scene);
const earth = buildEarth(scene, loader);
const SETS = { city: city.group, phone: phone.group, store: store.group, airport: airport.group, hosp: hosp.group, port: port.group, gas: gas.group, earth: earth.group };

const sans = (w, px) => `${w} ${px}px Inter`;

// ---------- city extras ----------
// ATM on the facade at x=10 (east block), z=-90
const atm = new THREE.Group(); city.group.add(atm); atm.position.set(9.95, 0.18, -90);
rb(atm, 0.5, 2.2, 1.3, std(0x2b3440, { r: 0.4 }), -0.1, 1.1, 0);
const atmT = canvasTex(256, 200, (c, w, h) => { c.fillStyle = '#0b1a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff4a3d'; c.font = sans(800, 26); c.textAlign = 'center'; c.fillText('TEMPORARILY', w / 2, 80); c.fillText('OUT OF SERVICE', w / 2, 114); c.fillStyle = '#9fb3c8'; c.font = sans(600, 16); c.fillText('No connection to bank', w / 2, 152); });
mesh(atm, new THREE.PlaneGeometry(0.62, 0.48), basic(0xffffff, { map: atmT, tm: false }), -0.36, 1.45, 0, { ry: -Math.PI / 2, cast: false });
const bankT = canvasTex(512, 128, (c, w, h) => { c.fillStyle = '#123b63'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = sans(800, 64); c.textAlign = 'center'; c.fillText('CITY BANK', w / 2, 88); });
mesh(atm, new THREE.PlaneGeometry(4, 1), basic(0xffffff, { map: bankT }), -0.12, 4.75, 0, { ry: -Math.PI / 2, cast: false });
const atmQueue = []; for (let i = 0; i < 14; i++) { const P = makePerson({ seed: 1200 + i }); city.group.add(P.g); atmQueue.push(P); }

// Ration point on avenue at z=-150
const ration = new THREE.Group(); city.group.add(ration);
const foodT = canvasTex(512, 200, (c, w, h) => { c.fillStyle = '#4b5a3c'; c.fillRect(0, 0, w, h); c.fillStyle = '#f1efe6'; c.font = sans(800, 78); c.textAlign = 'center'; c.fillText('FOOD + WATER', w / 2, 128); });
const trucks = [];
for (const [x, z, ry] of [[-2.2, -146, 0.15], [3.4, -158, -0.2]]) {
  const t = makeCar(0x4b5a3c, 'truck'); t.position.set(x, 0, z); t.rotation.y = ry; ration.add(t); trucks.push(t);
  for (const s of [-1, 1]) mesh(t, new THREE.PlaneGeometry(4.6, 1.8), basic(0xffffff, { map: foodT }), s * 1.11, 1.9, -1.2, { ry: s * Math.PI / 2, cast: false });
}
const palM = std(0x8a6a45, { r: 0.9 }), waterM = std(0x6fa8dc, { r: 0.3, t: true, op: 0.85 });
for (const [x, z] of [[-6, -140], [-6.2, -143], [0.5, -139]]) { box(ration, 1.2, 0.15, 1.2, palM, x, 0.08, z); for (let i = 0; i < 9; i++) box(ration, 0.36, 0.42, 0.36, waterM, x - 0.4 + (i % 3) * 0.4, 0.37 + Math.floor(i / 9) * 0.42, z - 0.4 + Math.floor(i / 3) * 0.4); for (let i = 0; i < 6; i++) box(ration, 0.36, 0.42, 0.36, waterM, x - 0.4 + (i % 3) * 0.4, 0.79, z - 0.2 + Math.floor(i / 3) * 0.4); }
const soldiers = []; for (let i = 0; i < 5; i++) { const P = makePerson({ seed: 1300 + i, shirt: 0x556b45, pants: 0x4d5f3d, hair: 0x3b4a33 }); ration.add(P.g); soldiers.push(P); }
const rationQ = []; for (let i = 0; i < 26; i++) { const P = makePerson({ seed: 1400 + i }); ration.add(P.g); rationQ.push(P); }

// Night chaos at z=-230
const chaos = new THREE.Group(); city.group.add(chaos);
const burnt = makeCar(0x2a2a2a); burnt.position.set(1.5, 0, -232); burnt.rotation.y = 0.6; chaos.add(burnt);
const police = makeCar(0xf2f2f2); police.position.set(-3.8, 0, -222); police.rotation.y = -0.3; chaos.add(police);
box(police, 1.7, 0.05, 0.6, std(0x111111), 0, 0.95, 0.3, { cast: false });
const lbR = box(police, 0.6, 0.18, 0.3, std(0x330000, { e: 0xff2020, ei: 0, unique: true }), -0.4, 1.47, -0.3, { cast: false });
const lbB = box(police, 0.6, 0.18, 0.3, std(0x000033, { e: 0x2050ff, ei: 0, unique: true }), 0.4, 1.47, -0.3, { cast: false });
const polLight = new THREE.PointLight(0xff2020, 0, 30, 1.6); polLight.position.set(-3.8, 2.5, -222); chaos.add(polLight);
const fire = new THREE.Group(); fire.position.set(1.5, 0.9, -232); chaos.add(fire);
const fireCones = [];
for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.ConeGeometry(0.35 + (i % 3) * 0.12, 1.4 + (i % 4) * 0.4, 7), new THREE.MeshBasicMaterial({ color: i % 3 ? 0xff8a2a : 0xffd27a, transparent: true, opacity: 0.85, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending })); fire.add(m); fireCones.push(m); }
const fireLight = new THREE.PointLight(0xff7a2a, 0, 40, 1.4); fireLight.position.set(1.5, 2.5, -232); chaos.add(fireLight);
const smokeT = canvasTex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(60,60,64,0.55)'); gr.addColorStop(1, 'rgba(60,60,64,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
const smoke = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeT, transparent: true, depthWrite: false })); chaos.add(s); smoke.push(s); }
const glowT = canvasTex(128, 128, (c, w, h) => { const gr = c.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, 'rgba(255,150,60,0.9)'); gr.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
const fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); fireGlow.scale.set(9, 9, 1); fireGlow.position.set(1.5, 2, -232); chaos.add(fireGlow);
const runners = []; for (let i = 0; i < 9; i++) { const P = makePerson({ seed: 1500 + i }); chaos.add(P.g); runners.push(P); }
// trash / debris
for (let i = 0; i < 18; i++) { const r = rng(1600 + i); box(chaos, 0.3 + r() * 0.4, 0.05 + r() * 0.15, 0.3 + r() * 0.5, std([0x777777, 0x5a4a3a, 0x9a9a9a][i % 3]), -6 + r() * 12, 0.1, -240 + r() * 20, { ry: r() * 3 }); }

// billboard content
function drawBillboard(state, t) {
  redraw(city.bbTex, (c, w, h) => {
    c.fillStyle = '#0b0f16'; c.fillRect(0, 0, w, h);
    if (state === 0) { c.fillStyle = '#123b63'; c.fillRect(0, 0, w, h); c.fillStyle = '#fff'; c.font = sans(800, 60); c.textAlign = 'center'; c.fillText('NEW PHONE', w / 2, 140); c.font = sans(600, 30); c.fillText('Faster than ever', w / 2, 190); return; }
    c.fillStyle = '#c0261b'; c.fillRect(0, 0, w, 70); c.fillStyle = '#fff'; c.font = sans(800, 40); c.textAlign = 'left'; c.fillText('BREAKING', 24, 50);
    c.fillStyle = '#fff'; c.font = sans(800, 58); c.fillText('ALL TRADING', 24, 150); c.fillText('SUSPENDED', 24, 214);
    c.fillStyle = '#ff4a3d'; c.font = sans(700, 28); const tick = 'NYSE  ▼ CLOSED     NASDAQ  ▼ CLOSED     LSE  ▼ CLOSED     DAX  ▼ CLOSED     NIKKEI  ▼ CLOSED     ';
    c.fillText(tick + tick, 24 - ((t * 120) % 760), 290);
  });
}

// ---------- helpers ----------
function show(setName) { for (const [k, g] of Object.entries(SETS)) g.visible = k === setName; }
const R = rng(1);
function standAt(P, x, z, ry, o = {}) { P.reset(); P.g.visible = true; P.g.position.set(x, o.y ?? 0, z); P.g.rotation.y = ry; }
function hideAll(list) { list.forEach(P => P.g.visible = false); }
const shake = (t, a, s = 0) => V(noise1(t * 2.3, s) * a, noise1(t * 2.1, s + 4) * a, noise1(t * 1.9, s + 9) * a * 0.5);

// ---------- shots ----------
function doShot(S, t) {
  const lt = t - S.t0, u = clamp(lt / (S.t1 - S.t0));
  const out = { hud: null, stat: null, title: 0, dof: false, vig: 0.5, fade: 0, grain: 0.035 };
  setDOF(false); bloom.radius = 0.6;
  switch (S.id) {
    case 'title': {
      show('city'); setMood('day', { fogNear: 300, fogFar: 1600 }); city.setNight(false); city.setTraffic('green');
      city.placeCars(t); city.placePeds(t, { phones: true }); drawBillboard(0, t);
      sunAt(V(0, 0, -80), V(50, 70, 25), 260);
      const k = easeOut(u);
      setCam(V(lerp(30, 14, k), lerp(330, 250, k), lerp(-10, 20, k)), V(0, 0, lerp(-90, -70, k)), 40);
      out.title = 1; out.hud = { label: 'INTERNET SHUTS OFF IN', big: countdown(6.5 - t), sub: 'PEOPLE ONLINE: 5.5 BILLION' };
      break;
    }
    case 'street': case 'sec0': {
      show('city'); setMood('morning'); city.setNight(false); city.setTraffic(S.id === 'sec0' && lt > 1 ? 'off' : 'green'); drawBillboard(0, t);
      const off = S.id === 'sec0';
      city.placeCars(t, { speed: off ? lerp(1, 0.25, smooth(0, 2.5, lt)) : 1 });
      city.placePeds(t, { phones: true, speed: off ? lerp(1, 0, smooth(0, 0.6, lt)) : 1, screen: off ? 0x2a2f36 : 0xbfe0ff,
        hide: (p, z) => p.x > 0 && Math.abs(z - 2) < 1.2 });
      if (off) city.peds.forEach((p, i) => { if (lt > 0.5 + (i % 5) * 0.12) { const lift = smooth(0.5, 1.3, lt - (i % 5) * 0.12); p.P.head.rotation.x = lerp(0.42, -0.15, lift); p.P.armR.rotation.x = lerp(-1.15, -1.6, lift); p.P.head.rotation.y = Math.sin(i * 7) * 0.5 * lift; } });
      sunAt(V(4, 0, -10), V(-45, 38, 18), 45);
      if (!off) { const k = ease(u); setCam(V(lerp(10.9, 10.6, k), 1.65, lerp(10, 8, k)), V(8.0, 1.55, -20), 42); }
      else { const k = ease(u); setCam(V(lerp(11.0, 10.6, k), lerp(1.65, 1.8, k), lerp(9.5, 10.5, k)).add(shake(t, 0.01)), V(lerp(8.2, 7.6, k), 1.7, -8), 40); }
      // hero person close to camera
      const P = atmQueue[0]; standAt(P, 8.9, 2, Math.PI - 0.1, { y: 0.18 });
      if (!off) { P.walk(t * 4.4, 0.45); P.g.position.z = 2.5 - lt * 0.9; P.usePhone(true); }
      else { P.g.position.z = 2; P.usePhone(true, 0x2a2f36); const lift = smooth(0.6, 1.6, lt); P.head.rotation.x = lerp(0.42, -0.2, lift); P.armR.rotation.x = lerp(-1.15, -1.7, lift); P.head.rotation.y = lerp(0, 0.6, smooth(1.8, 2.8, lt)); }
      for (let i = 1; i < atmQueue.length; i++) atmQueue[i].g.visible = false;
      out.hud = off ? { label: 'WITHOUT INTERNET', big: 'SECOND 0', sub: '68% OF HUMANITY JUST WENT OFFLINE' } : { label: 'INTERNET SHUTS OFF IN', big: countdown(6.5 - t), sub: 'PEOPLE ONLINE: 5.5 BILLION' };
      out.flash = off ? 0.55 * (1 - smooth(0, 0.25, lt)) : 0;
      break;
    }
    case 'phone': {
      show('phone'); setMood('interior', { exp: 0.95 }); phone.draw(1, t);
      sunAt(V(2000, 0, 0), V(-3, 6, 4), 6, 1.6);
      phone.light.intensity = 0.6;
      const k = ease(u);
      const p = V(2000.05 + lerp(-0.25, 0.05, k), lerp(1.55, 1.35, k), lerp(0.9, 0.62, k));
      setCam(p, V(2000.05, 0.81, 0.12), 38);
      setDOF(true, p.distanceTo(phone.focus), 0.012, 0.012); out.dof = true;
      out.hud = { label: 'WITHOUT INTERNET', big: '+10 SEC', sub: 'MAPS, MESSAGES, BANKING: ALL GONE' };
      break;
    }
    case 'checkout': {
      show('store'); setMood('interior'); store.setStock(1); store.drawTerm(1, t); store.setMeds(1);
      sunAt(V(3000, 0, 8), V(4, 12, 6), 14, 1.0);
      const ps = store.people; ps.forEach(P => P.g.visible = false);
      const [cashier, cust, q1, q2, q3] = ps;
      const O = 0, OW = 3000;
      standAt(cashier, O + 2.0 - 1.1, 10.6, Math.PI / 2 + 0.3); cashier.armL.rotation.x = -0.6;
      standAt(cust, O + 2.0 + 1.25, 12.35, -2.4); cust.armR.rotation.set(-1.3, 0, 0.2); cust.head.rotation.x = 0.25;
      const retry = Math.sin(lt * 2.4) > 0.6 ? 0.15 : 0; cust.armR.rotation.x -= retry;
      standAt(q1, O + 2.0 + 1.4, 14.2, Math.PI); q1.head.rotation.y = 0.4;
      standAt(q2, O + 2.0 + 1.3, 15.5, Math.PI); standAt(q3, O + 2.0 + 1.6, 16.8, Math.PI);
      ps.slice(5, 9).forEach((P, i) => standAt(P, O - 4 + 1.3 + (i % 2) * 0.2, 12.4 + i * 1.3, Math.PI));
      const k = ease(u);
      const p = V(OW + lerp(1.75, 1.95, k), lerp(1.8, 1.7, k), lerp(14.0, 13.5, k));
      setCam(p, V(OW + 2.7, 1.2, 11.7), 42);
      setDOF(true, p.distanceTo(V(OW + 2.55, 1.32, 11.8)), 0.004, 0.007); out.dof = true;
      out.stat = { big: '639 MILLION', sub: 'VISA CARD PAYMENTS EVERY DAY' };
      out.hud = { label: 'WITHOUT INTERNET', big: '+1 MIN', sub: 'EVERY CARD PAYMENT NEEDS A CONNECTION' };
      break;
    }
    case 'atm': {
      show('city'); setMood('morning'); city.setNight(false); city.setTraffic('off'); drawBillboard(0, t);
      city.placeCars(t, { speed: 0.4 }); city.placePeds(t, { hide: (p, z) => true });
      sunAt(V(8, 0, -90), V(-45, 38, 18), 30);
      atmQueue.forEach((P, i) => { standAt(P, 8.7 - (i % 2) * 0.25, -90 + 1.5 + i * 1.05, Math.PI + (i % 3 - 1) * 0.15, { y: 0.18 }); P.head.rotation.y = (i % 4 - 1.5) * 0.15; if (i % 3 === 1) P.usePhone(true, 0x2a2f36); });
      atmQueue[0].g.position.set(9.3, 0.18, -90); atmQueue[0].g.rotation.y = Math.PI / 2; atmQueue[0].armR.rotation.x = -1.2 - (Math.sin(lt * 3) > 0.7 ? 0.2 : 0);
      const k = ease(u);
      setCam(V(lerp(5.4, 5.7, k), lerp(1.75, 1.9, k), lerp(-82.5, -84, k)), V(9.7, 1.45, -90.2), 42);
      out.hud = { label: 'WITHOUT INTERNET', big: '+10 MIN', sub: 'MOST MONEY ONLY EXISTS AS DATA' };
      break;
    }
    case 'airport': {
      show('airport'); setMood('overcast', { fogNear: 60, fogFar: 260, exp: 1.05 });
      airport.drawBoard(smooth(0.2, 2.4, lt), t);
      sunAt(V(4000, 0, 0), V(10, 30, -20), 40, 1.2);
      const A = 4000; const PR = rng(31);
      airport.people.forEach((P, i) => {
        const x = -9 + PR() * 18, z = 12 + PR() * 14;
        standAt(P, x, z, Math.PI + (PR() - 0.5) * 0.8); P.head.rotation.x = -0.35;
        if (i % 4 === 0) { P.usePhone(true, 0x2a2f36); }
        if (i % 5 === 1) P.armL.rotation.set(-0.3, 0, -0.4);
      });
      airport.suit.forEach((s, i) => { s.position.set(-8 + (i * 1.7) % 16, 0.3, 13 + (i * 2.3) % 12); });
      const k = ease(u);
      setCam(V(A + lerp(-2.5, -0.5, k), lerp(1.7, 1.75, k), lerp(39, 37, k)), V(A + lerp(-0.4, 0, k), 1.15, 6), 46);
      out.hud = { label: 'WITHOUT INTERNET', big: '+1 HOUR', sub: 'IN 2024, ONE BAD UPDATE CANCELLED 10,000+ FLIGHTS' };
      break;
    }
    case 'hospital': {
      show('hosp'); setMood('interior', { exp: 0.72 }); hosp.drawScreens(1, t);
      sunAt(V(5000, 0, 0), V(2, 10, 6), 8, 1.1);
      hosp.doc.head.rotation.x = 0.4; hosp.doc.armL.rotation.set(-1.0, 0.3, 0); hosp.doc.armR.rotation.set(-0.9 + Math.sin(lt * 2) * 0.05, 0, 0.2);
      hosp.nurse.head.rotation.y = -0.4 + Math.sin(lt) * 0.2; hosp.nurse.armR.rotation.x = -0.4;
      const k = ease(u);
      const p = V(5000 + lerp(2.4, 1.8, k), lerp(1.8, 1.7, k), lerp(3.3, 2.7, k));
      setCam(p, V(5000 - 0.9, 1.25, -1.5), 46);
      setDOF(true, p.distanceTo(V(5000 - 1.9, 1.6, -2.4)), 0.0035, 0.007); out.dof = true;
      out.stat = { big: '96%', sub: 'OF US HOSPITALS RUN ON ELECTRONIC RECORDS' };
      out.hud = { label: 'WITHOUT INTERNET', big: '+3 HOURS', sub: 'PATIENT FILES, LAB RESULTS, PRESCRIPTIONS' };
      break;
    }
    case 'markets': {
      show('city'); setMood('overcast'); city.setNight(false); city.setTraffic('off'); drawBillboard(1, t);
      city.placeCars(0, { stopped: true }); city.placePeds(t, { speed: 0.6 });
      sunAt(V(4, 0, -40), V(-45, 50, 18), 40);
      const k = ease(u);
      setCam(V(lerp(-3.5, -2.5, k), lerp(1.7, 2.0, k), lerp(-18, -21, k)), V(10, lerp(7.5, 8.6, k), -44), 46, 0.0);
      out.stat = { big: '$300 BILLION', sub: 'VALUE THE WORLD ECONOMY CREATES EACH DAY' };
      out.hud = { label: 'WITHOUT INTERNET', big: '+1 DAY', sub: 'STOCK EXCHANGES, BANKS, TRADE: FROZEN' };
      break;
    }
    case 'port': {
      show('port'); setMood('overcast', { fogNear: 120, fogFar: 700 });
      sunAt(V(6000, 0, 0), V(-30, 50, 40), 120, 1.1);
      const k = ease(u);
      setCam(V(6000 + lerp(75, 62, k), lerp(26, 22, k), lerp(-120, -105, k)), V(6000 - 5, 6, -12), 44);
      out.stat = { big: '80%', sub: 'OF WORLD TRADE TRAVELS BY SEA' };
      out.hud = { label: 'WITHOUT INTERNET', big: '+2 DAYS', sub: 'EVERY CONTAINER IS TRACKED ONLINE' };
      break;
    }
    case 'supermarket': {
      show('store'); setMood('interior', { exp: 0.78 }); store.setStock(lerp(0.32, 0.12, u)); store.drawTerm(1, t); store.setMeds(1);
      sunAt(V(3000, 0, -6), V(4, 12, 6), 20, 0.9);
      const ps = store.people; ps.forEach(P => P.g.visible = false);
      const O = 3000; const PR = rng(44);
      ps.slice(0, 9).forEach((P, i) => { const z = -14 + i * 2.1, x = (i % 2 ? 1.75 : 4.25) + PR() * 0.1; standAt(P, x, z + Math.sin(lt * 0.8 + i) * 0.15, (i % 2 ? -1 : 1) * Math.PI / 2); P.armR.rotation.x = -1.2 - Math.max(0, Math.sin(lt * 3 + i)) * 0.4; P.head.rotation.x = 0.1; });
      const k = ease(u);
      setCam(V(O + 3, lerp(1.9, 1.75, k), lerp(8, 3.5, k)), V(O + 3, 1.2, -16), 46);
      out.hud = { label: 'WITHOUT INTERNET', big: '+3 DAYS', sub: 'STORES RESTOCK DAILY THROUGH ONLINE ORDERS' };
      break;
    }
    case 'gas': {
      show('gas'); setMood('dusk', { fogNear: 60, fogFar: 380 });
      sunAt(V(7000, 0, 0), V(-60, 18, 30), 60);
      const G = 7000;
      gas.people.forEach((P, i) => { standAt(P, -8 - i * 6.1 + 1.6, 12.6, Math.PI / 2 + (i % 2 ? 0.7 : -0.2)); if (i % 3 === 0) P.armL.rotation.set(0, 0, -0.5); });
      const k = ease(u);
      setCam(V(G + lerp(3.4, 2.6, k), lerp(1.55, 1.65, k), lerp(8.4, 8.9, k)), V(G - 14, 1.3, 14.2), 44);
      setDOF(true, 18, 0.0018, 0.006); out.dof = true;
      out.hud = { label: 'WITHOUT INTERNET', big: '+5 DAYS', sub: 'FUEL ORDERS AND PAYMENTS RUN ONLINE' };
      break;
    }
    case 'pharmacy': {
      show('store'); setMood('interior', { exp: 0.74 }); store.setStock(0.08); store.setMeds(lerp(0.3, 0.12, u));
      sunAt(V(3016, 0, -10), V(4, 12, 6), 12, 0.8);
      const ps = store.people; ps.forEach(P => P.g.visible = false);
      const O = 16, OW = 3016;
      const ph = ps[0]; standAt(ph, O - 0.6, -11.1, 0); ph.armL.rotation.set(-0.5, 0, -0.2); ph.armR.rotation.set(-0.5, 0, 0.2); ph.head.rotation.x = 0.2;
      ps.slice(1, 12).forEach((P, i) => { standAt(P, O + 0.6 + (i % 2) * 0.3, -8.6 + i * 1.0, Math.PI + (i % 3 - 1) * 0.2); if (i === 0) { P.armR.rotation.set(-1.4, 0, 0.1); } P.head.rotation.y = (i % 3 - 1) * 0.3; });
      const k = ease(u);
      const p = V(OW + lerp(3.6, 3.0, k), lerp(1.8, 1.7, k), lerp(-4.0, -5.2, k));
      setCam(p, V(OW + 0.1, 1.3, -10.6), 44);
      setDOF(true, p.distanceTo(V(OW + 0.5, 1.5, -9.4)), 0.003, 0.006); out.dof = true;
      out.hud = { label: 'WITHOUT INTERNET', big: '+1 WEEK', sub: 'PRESCRIPTIONS ARE SENT AND FILLED DIGITALLY' };
      break;
    }
    case 'chaos': {
      show('city'); setMood('night'); city.setNight(true, b => (b.r * 7) % 1 < 0.55, 0.55); city.setTraffic('off');
      city.placeCars(0, { stopped: true, night: true }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -230), V(-30, 50, 20), 40, 0.25);
      city.setLampsByFn((p, i) => (i * 7) % 5 > 1);
      // fire
      fireCones.forEach((m, i) => { const r = 0.6 + (i % 4) * 0.25; const a = i * 2.4 + t * (1.5 + (i % 3)); m.position.set(Math.cos(a) * r * 0.6, 0.4 + Math.abs(Math.sin(t * 7 + i)) * 0.4, Math.sin(a) * r); const s = 0.75 + 0.35 * Math.sin(t * 9 + i * 1.7); m.scale.set(s, s * (1 + 0.4 * Math.sin(t * 11 + i)), s); });
      fireLight.intensity = 90 + 40 * Math.sin(t * 13) + 20 * Math.sin(t * 29); fireGlow.material.opacity = 0.7 + 0.2 * Math.sin(t * 17);
      smoke.forEach((s, i) => { const ph = ((t * 0.18 + i / smoke.length) % 1); s.position.set(1.5 + Math.sin(i * 3 + t * 0.3) * 1.5 + ph * 4, 2 + ph * 16, -232 - ph * 3); const sc = 3 + ph * 10; s.scale.set(sc, sc, 1); s.material.opacity = 0.75 * Math.sin(ph * Math.PI); });
      const red = Math.sin(t * 14) > 0; lbR.material.emissiveIntensity = red ? 6 : 0; lbB.material.emissiveIntensity = red ? 0 : 6; polLight.color.set(red ? 0xff2020 : 0x2050ff); polLight.intensity = 22;
      runners.forEach((P, i) => { const ph = (t * 0.45 + i / runners.length) % 1; standAt(P, -6 + (i % 3) * 5 + Math.sin(i) * 1.5, lerp(-212, -252, ph) + (i % 2) * 3, Math.PI + Math.sin(i) * 0.3, { y: 0.0 }); P.walk(t * 9 + i, 0.9); P.torso.rotation.x = 0.25; });
      const k = ease(u);
      setCam(V(lerp(-6.5, -5.2, k), lerp(1.6, 1.8, k), lerp(-206, -212, k)).add(shake(t, 0.03, 2)), V(1.0, 2.0, -232), 46);
      out.hud = { label: 'WITHOUT INTERNET', big: '+2 WEEKS', sub: 'NO NEWS. NO MESSAGES. ONLY RUMORS.' };
      out.vig = 0.85;
      break;
    }
    case 'ration': {
      show('city'); setMood('overcast', { exp: 0.95 }); city.setNight(false); city.resetLamps(); city.setTraffic('off');
      city.placeCars(0, { stopped: true, hide: (c, z) => z < -120 && z > -180 }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -150), V(-30, 50, 30), 40);
      soldiers.forEach((P, i) => { standAt(P, [-4.2, -0.8, 1.6, -5.4, 5.2][i], [-141.5, -141, -142.5, -138, -150][i], Math.PI * 0.05 + (i === 4 ? -1.2 : 0), { y: 0 }); P.armL.rotation.set(-0.5, 0, -0.1); P.armR.rotation.set(-0.6, 0, 0.1); });
      rationQ.forEach((P, i) => { const row = i % 2; standAt(P, -3.4 + row * 1.0 + Math.sin(i) * 0.15, -137 + Math.floor(i / 2) * 1.15, Math.PI + Math.sin(i * 3) * 0.2, { y: 0 }); P.head.rotation.x = 0.15; P.g.position.z += Math.sin(lt * 0.6 + i) * 0.05; });
      const k = ease(u);
      setCam(V(lerp(-1.0, 0.2, k), lerp(2.2, 2.5, k), lerp(-118, -121, k)), V(-1.8, 1.5, -146), 44);
      out.hud = { label: 'WITHOUT INTERNET', big: '+3 WEEKS', sub: 'SOLDIERS GUARD FOOD AND WATER' };
      break;
    }
    case 'aerialNight': case 'aerial1950': {
      show('city'); setMood('night', { fogNear: 300, fogFar: 1500, bloom: 0.55 }); city.setTraffic('off');
      const g0 = S.id === 'aerialNight' ? lerp(0.15, 0.55, u) : lerp(0.55, 0.92, u);
      city.setNight(true, b => b.r < g0, 0.9);
      city.setLampsByFn((p) => { const r = ((p.z * 13.7 + p.x * 7.1) % 1 + 1) % 1; return r > g0; });
      city.placeCars(0, { stopped: true, night: true }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -80), V(-30, 50, 20), 260, 0.2);
      const k = S.id === 'aerialNight' ? ease(u) * 0.5 : 0.5 + ease(u) * 0.5;
      setCam(V(lerp(-60, 40, k), lerp(160, 360, k), lerp(120, 160, k)), V(0, 0, -90), 48);
      out.stat = S.id === 'aerialNight' ? { big: '8.2 BILLION', sub: 'PEOPLE ON EARTH TODAY' } : { big: '2.5 BILLION', sub: 'WORLD POPULATION IN 1950, BEFORE THE DIGITAL AGE' };
      out.hud = { label: 'WITHOUT INTERNET', big: '+1 MONTH', sub: 'CITIES GO DARK, DISTRICT BY DISTRICT' };
      break;
    }
    case 'earth': case 'earthDark': {
      show('earth'); setMood('space');
      const E = earth;
      const f = S.id === 'earth' ? smooth(1.2, 6.5, lt) * 0.7 : 0.7 + smooth(0, 3.5, lt) * 0.27;
      E.setLights(f); E.setArcs(S.id === 'earth' ? 1 - smooth(0.2, 1.8, lt) : 0, t);
      E.earth.rotation.y = -1.95 + t * 0.012;
      sun.position.set(20000 + 200, 60, -320); sun.target.position.set(20000, 0, 0); sun.intensity = 2.2; sun.castShadow = false;
      const k = S.id === 'earth' ? ease(u) : 1;
      const dist = lerp(190, 165, k) + (S.id === 'earthDark' ? lerp(0, 25, ease(u)) : 0);
      setCam(V(20000 + 18, 24, dist), V(20000, 4, 0), 40);
      out.hud = S.id === 'earth' ? { label: 'WITHOUT INTERNET', big: '+1 MONTH', sub: '5.5 BILLION PEOPLE CUT OFF' } : null;
      out.vig = 0.3; out.grain = 0.02;
      break;
    }
    case 'end': {
      show('earth'); setMood('space'); earth.setLights(0.97); earth.setArcs(0, t);
      setCam(V(20000 + 18, 24, 190), V(20000, 4, 0), 40);
      out.end = smooth(0, 0.6, lt);
      break;
    }
  }
  if (S.id !== 'earth' && S.id !== 'earthDark' && S.id !== 'end') sun.castShadow = true;
  return out;
}
function countdown(sec) { sec = Math.max(0, sec); const s = Math.floor(sec), ms = Math.floor((sec - s) * 1000); return `0:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`; }

// ---------- overlay ----------
const $ = id => document.getElementById(id);
const grain = $('grain'), gctx = grain.getContext('2d'), gimg = gctx.createImageData(270, 480);
function setGrain(seed, amt) { grain.style.opacity = amt; const r = rng(seed), d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gctx.putImageData(gimg, 0, 0); }
function fmt(s) { return s.replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>'); }
let lastCap = null, lastHudKey = null, hudT0 = 0, lastStatKey = null, statT0 = 0;
function overlay(t, S, o) {
  // title
  const titleA = o.title ? 1 - smooth(2.55, 2.95, t) : 0;
  $('title').style.opacity = titleA; $('titleShade').style.opacity = titleA;
  $('title').style.transform = `translateY(${-smooth(2.5, 3.0, t) * 20}px)`;
  $('slash').setAttribute('opacity', smooth(1.1, 1.3, t));
  $('wifi').style.opacity = 1 - 0.55 * smooth(1.1, 1.3, t);
  // hud
  const hud = $('hud');
  if (o.hud) {
    const key = o.hud.label + '|' + o.hud.sub + '|' + (o.hud.big.startsWith('0:') ? 'cd' : o.hud.big);
    hudT0 = S.hudKeep ? -10 : S.t0;
    $('hudLabel').textContent = o.hud.label; $('hudBig').textContent = o.hud.big; $('hudSub').textContent = o.hud.sub;
    const a = smooth(hudT0, hudT0 + 0.3, t) * (1 - smooth(S.t1 - 0.12, S.t1, t) * (S.hudOutFade ? 1 : 0));
    hud.style.opacity = a; hud.style.transform = `translateY(${(1 - easeOut((t - hudT0) / 0.4)) * 14}px)`;
  } else { hud.style.opacity = 0; lastHudKey = null; }
  // stat
  const st = $('stat');
  if (o.stat) {
    statT0 = S.t0;
    $('statBig').textContent = o.stat.big; $('statSub').textContent = o.stat.sub;
    const a = smooth(statT0 + 0.15, statT0 + 0.55, t) * (1 - smooth(S.t1 - 0.25, S.t1 - 0.02, t));
    st.style.opacity = a; $('statShade').style.opacity = a; st.style.transform = `scale(${0.96 + 0.04 * easeOut((t - statT0 - 0.15) / 0.6)})`;
  } else { st.style.opacity = 0; $('statShade').style.opacity = 0; lastStatKey = null; }
  // caption
  const c = CAPTIONS.find(c => t >= c.t0 && t < c.t1);
  const cap = $('cap');
  if (c) { if (lastCap !== c) { cap.innerHTML = fmt(c.text); lastCap = c; } cap.style.opacity = smooth(c.t0, c.t0 + 0.3, t) * (1 - smooth(c.t1 - 0.25, c.t1, t)); $('capShade').style.opacity = (o.capShade ?? 1) * cap.style.opacity; cap.style.transform = `translateY(${(1 - easeOut((t - c.t0) / 0.5)) * 10}px)`; }
  else { cap.style.opacity = 0; $('capShade').style.opacity = 0; }
  $('end').style.opacity = o.end ?? 0;
  $('vignette').style.opacity = o.vig;
  $('flash').style.opacity = o.flash ?? 0;
  // quick dip to black between shots for the earth sequence
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
