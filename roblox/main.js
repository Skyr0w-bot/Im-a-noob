import * as THREE from 'three';
import { V, vlerp, lerp, clamp, ease, easeOut, smooth, noise1, rng, std, basic, box, rb, mesh, canvasTex, redraw, makePerson, makeBlocky } from './lib.js';
import { scene, setMood, setCam, render, sunAt, setDOF, sun, bloom, refreshEnv, registerMaterials } from './engine.js';
import { buildCity } from './city.js';
import { buildOffice, buildBedroom, buildConcert, buildCampus, buildBoutique, buildGarden, buildEarth, drawGame, drawGlitch } from './sets.js';
import { SHOTS, CAPTIONS, DURATION } from './timeline.js';

const loader = new THREE.TextureLoader();
const city = buildCity(scene); registerMaterials(city.allMats);
const office = buildOffice(scene);
const room = buildBedroom(scene);
const concert = buildConcert(scene);
const campus = buildCampus(scene);
const shop = buildBoutique(scene);
const garden = buildGarden(scene);
const earth = buildEarth(scene, loader);
const SETS = { city: city.group, office: office.group, room: room.group, concert: concert.group, campus: campus.group, shop: shop.group, garden: garden.group, earth: earth.group };
const sans = (w, px) => `${w} ${px}px Inter`;
function show(name) { for (const [k, g] of Object.entries(SETS)) g.visible = k === name; }
function standAt(P, x, y, z, ry) { P.reset(); P.g.visible = true; P.g.position.set(x, y, z); P.g.rotation.y = ry; }
const shake = (t, a, s = 0) => V(noise1(t * 2.3, s) * a, noise1(t * 2.1, s + 4) * a, noise1(t * 1.9, s + 9) * a * 0.5);
// moment-of-erasure helper: returns 0 before, ramps to 1 over dur
const eraseK = (lt, at, dur = 0.8) => smooth(at, at + dur, lt);

function drawBillboardIPO(t) {
  redraw(city.bbTex, (c, w, h) => {
    c.fillStyle = '#0b0f16'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1b4f8a'; c.fillRect(0, 0, w, 70); c.fillStyle = '#fff'; c.font = sans(800, 38); c.textAlign = 'left'; c.fillText('NEW LISTINGS · MARCH 2021', 24, 49);
    c.font = sans(800, 64); c.fillStyle = '#e8eef5'; c.fillText('RBLX', 24, 160);
    c.fillStyle = '#ff5a66'; c.font = sans(800, 40); c.fillText('NO SUCH COMPANY', 24, 220);
    c.fillStyle = '#6ad08a'; c.font = sans(700, 26); const tick = 'AAPL ▲ 121.08    MSFT ▲ 227.39    TSLA ▼ 668.06    AMZN ▲ 3,057    NFLX ▲ 520.20    ';
    c.fillText(tick + tick, 24 - ((t * 110) % 820), 292);
  });
}

function doShot(S, t) {
  const lt = t - S.t0, u = clamp(lt / (S.t1 - S.t0));
  const out = { hud: null, stat: null, title: 0, vig: 0.5, grain: 0.035, glitch: 0 };
  setDOF(false);
  switch (S.id) {
    case 'title': {
      show('city'); setMood('morning', { fogNear: 300, fogFar: 1600 }); city.setNight(false); city.setTraffic('green');
      city.placeCars(t); city.placePeds(t, { phones: true });
      sunAt(V(0, 0, -80), V(-50, 45, 30), 260);
      const k = easeOut(u);
      setCam(V(lerp(-24, -10, k), lerp(320, 250, k), lerp(-10, 25, k)), V(0, 0, lerp(-90, -70, k)), 40);
      out.title = 1; out.hud = { label: 'ERASING ROBLOX FROM HISTORY IN', big: countdown(3.2 - t), sub: 'PLAYERS TODAY: 111.8 MILLION A DAY' };
      break;
    }
    case 'office': {
      show('office'); setMood('interior', { exp: 0.62, env: 0.15 });
      const gone = lt > 2.1;
      office.drawScreen(gone ? (lt < 2.6 ? 'erase' : 'off') : 'code', t, smooth(2.1, 2.6, lt));
      office.scrLight.intensity = gone ? 0.2 : 2;
      sunAt(V(2000, 0, -2), V(-2, 8, 6), 6, 0.25);
      const { coder, coder2 } = office;
      coder.g.visible = coder2.g.visible = !gone;
      if (!gone) {
        standAt(coder, 0.45, 0.0, -1.3, Math.PI); coder.sit(); coder.g.position.y = 0.0; coder.type(t); coder.head.rotation.x = 0.12; coder.idle(t, 0.4);
        standAt(coder2, -0.25, 0, -1.0, Math.PI - 0.5); coder2.cross(); coder2.head.rotation.x = 0.2; coder2.idle(t);
      }
      const k = ease(u);
      setCam(V(2000 + lerp(1.7, 1.5, k), lerp(1.55, 1.45, k), lerp(0.2, -0.3, k)).add(shake(t, 0.006)), V(2000 + 0.4, 1.05, -2.2), 44);
      out.glitch = smooth(2.0, 2.1, lt) * (1 - smooth(2.35, 2.6, lt));
      out.flash = gone ? 0.6 * (1 - smooth(2.1, 2.35, lt)) : 0;
      out.hud = { label: 'WITHOUT ROBLOX', big: '2004', sub: 'THE PROJECT IS NEVER STARTED' };
      out.vig = 0.7;
      break;
    }
    case 'kid2006': case 'kid2010': case 'teen2016': case 'kidToday': {
      show('room');
      const key = { kid2006: '2006', kid2010: '2010', teen2016: '2016', kidToday: 'today' }[S.id];
      const night = S.id !== 'kid2006';
      room.setEra(key, night);
      setMood('interior', { exp: night ? 0.55 : 0.8, env: night ? 0.12 : 0.4 });
      sunAt(V(3000, 0, -1), night ? V(3, 9, -8) : V(4, 10, -9), 6, night ? 0.25 : 1.4);
      const kid = room.kid; kid.g.scale.setScalar(S.id === 'teen2016' ? 0.86 : 0.72);
      const sc = kid.g.scale.x;
      standAt(kid, 1.9, 0.51 - 0.5 * sc, -1.72, Math.PI); kid.sit();
      kid.g.position.y = 0.51 - 0.5 * sc;
      const eraseAt = S.id === 'kid2006' ? 2.1 : S.id === 'teen2016' ? 2.2 : 99;
      const ek = eraseK(lt, eraseAt, 0.9);
      room.toy.erase(S.id === 'kid2006' ? ek : (S.id === 'kidToday' ? 1 : 1));
      room.toy.g.visible = S.id === 'kid2006';
      if (S.id === 'kid2006' || S.id === 'teen2016') {
        if (lt < eraseAt) { kid.type(t); room.drawScreen((c, w, h) => drawGame(c, w, h, t)); }
        else { kid.armL.rotation.set(-0.3, 0, 0.1); kid.elbowL.rotation.x = -0.6; kid.armR.rotation.set(-0.3, 0, -0.1); kid.elbowR.rotation.x = -0.6; kid.head.rotation.y = Math.sin(lt * 1.2) * 0.25 * smooth(eraseAt + 0.3, eraseAt + 1, lt);
          room.drawScreen((c, w, h) => { drawGame(c, w, h, t); drawGlitch(c, w, h, t, ek); if (ek >= 1) { c.fillStyle = '#0a0c10'; c.fillRect(0, 0, w, h); c.fillStyle = '#5a6270'; c.font = sans(600, 20); c.textAlign = 'center'; c.fillText(S.id === 'kid2006' ? 'Nothing to play.' : 'Project not found.', w / 2, h / 2); } }); }
        out.glitch = smooth(eraseAt - 0.05, eraseAt + 0.05, lt) * (1 - smooth(eraseAt + 0.25, eraseAt + 0.5, lt));
      } else if (S.id === 'kid2010') {
        // bored kid, chin on hand, empty editor
        kid.armL.rotation.set(-0.95, 0, 0.12); kid.elbowL.rotation.x = -2.05; kid.head.rotation.set(0.12, 0.15, -0.16); kid.armR.rotation.set(-0.45, 0, -0.1); kid.elbowR.rotation.x = -0.9;
        room.drawScreen((c, w, h) => { c.fillStyle = '#f4f5f7'; c.fillRect(0, 0, w, h); c.fillStyle = '#d9dde3'; c.fillRect(0, 0, w, 28); c.fillStyle = '#444'; c.font = sans(600, 15); c.textAlign = 'left'; c.fillText('my_first_game.txt', 12, 19); c.fillStyle = '#9aa1ab'; c.font = sans(500, 16); c.fillText('1', 12, 60); if (Math.floor(t * 2) % 2) { c.fillStyle = '#111'; c.fillRect(36, 46, 2, 20); } c.fillStyle = '#b0b5bd'; c.font = sans(500, 15); c.textAlign = 'center'; c.fillText('…but where do you even make a game?', w / 2, h - 30); });
      } else {
        kid.armL.rotation.set(-0.2, 0, 0.1); kid.armR.rotation.set(-0.2, 0, -0.1); kid.head.rotation.x = 0.05; kid.idle(t, 0.4);
        room.drawScreen((c, w, h) => { c.fillStyle = '#07080b'; c.fillRect(0, 0, w, h); c.fillStyle = '#2a2f38'; c.font = sans(600, 18); c.textAlign = 'center'; c.fillText('No games installed.', w / 2, h / 2); });
      }
      kid.idle(t, 0.6);
      room.screenLight.intensity = night ? 0.9 : 0.4;
      room.screenLight.color.set(S.id === 'kidToday' || (lt > eraseAt) ? 0x6a7a90 : 0x9fd0ff);
      const k = ease(u);
      let p, l, fov = 44;
      if (S.id === 'kid2006') { p = V(3000 + lerp(0.6, 0.9, k), lerp(1.45, 1.35, k), lerp(-0.4, -0.75, k)); l = V(3001.9, 1.0, -2.45); }
      else if (S.id === 'kid2010') { p = V(3000 + lerp(0.55, 0.7, k), lerp(1.2, 1.15, k), lerp(-2.5, -2.45, k)); l = V(3001.9, 0.98, -1.85); fov = 40; }
      else if (S.id === 'teen2016') { p = V(3000 + lerp(0.2, 0.5, k), lerp(1.7, 1.6, k), lerp(0.4, 0.0, k)); l = V(3001.9, 1.05, -2.5); }
      else { p = V(3000 + lerp(0.5, 0.75, k), lerp(1.2, 1.12, k), lerp(-2.5, -2.45, k)); l = V(3001.9, 0.98, -1.8); fov = lerp(44, 34, k); }
      setCam(p.add(shake(t, 0.004, 2)), l, fov);
      if (S.id === 'kidToday') { setDOF(true, p.distanceTo(V(3001.9, 0.95, -1.8)), 0.004, 0.008); }
      const meta = {
        kid2006: { big: '2006', sub: 'THE YEAR ROBLOX WOULD HAVE LAUNCHED' },
        kid2010: { big: '2010', sub: 'NO FREE GAME STUDIO FOR KIDS' },
        teen2016: { big: '2016', sub: 'NO CREATOR ECONOMY' },
        kidToday: { big: 'TODAY', sub: 'NO STUDIO. NO PLAYERS. NO FIRST GAME.' },
      }[S.id];
      out.hud = { label: 'WITHOUT ROBLOX', ...meta };
      if (S.id === 'teen2016') out.stat = { big: '$922.8 MILLION', sub: 'PAID TO ROBLOX CREATORS IN 2024 ALONE' };
      out.vig = night ? 0.75 : 0.5;
      break;
    }
    case 'lockdown': {
      show('city'); setMood('night', { exp: 1.0 }); city.setNight(true, b => b.r < 0.35, 1.0); city.resetLamps(); city.setTraffic('red');
      city.placeCars(0, { stopped: true, night: true, hide: () => true }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -40), V(-30, 50, 20), 60, 0.25);
      const k = ease(u);
      city.placeCars(0, { stopped: true, night: true, hide: () => true });
      setCam(V(lerp(0.5, 0.0, k), lerp(1.5, 1.7, k), lerp(-6, -12, k)), V(-1, lerp(3.2, 3.6, k), -120), 44);
      out.hud = { label: 'WITHOUT ROBLOX', big: '2020', sub: 'LOCKDOWN. SCHOOLS CLOSED.' };
      out.vig = 0.75;
      break;
    }
    case 'concert': {
      show('concert'); setMood('night', { exp: 1.0, bloom: 0.7, ao: true });
      sunAt(V(4000, 0, 0), V(-10, 30, 20), 40, 0.1);
      const wave = (B) => smooth(1.6 + (10 - B.row) * 0.14, 2.4 + (10 - B.row) * 0.14, lt);
      concert.crowd.forEach(B => { B.pose(t + B.ph, 'dance'); B.g.position.y = Math.abs(Math.sin((t + B.ph) * 4)) * 0.18; B.erase(wave(B)); });
      concert.star.pose(t, 'wave'); concert.star.erase(smooth(3.3, 3.9, lt));
      const lightsOut = smooth(3.0, 3.8, lt);
      concert.cones.forEach((m, i) => { m.material.opacity = 0.13 * (1 - lightsOut); m.rotation.z = Math.sin(t * 1.3 + i) * 0.35; });
      concert.stageL.intensity = 60 * (1 - lightsOut) + 4; concert.stageL2.intensity = 60 * (1 - lightsOut) + 4;
      concert.drawBig(t, lightsOut);
      const k = ease(u);
      setCam(V(4000 + lerp(-3, 2, k), lerp(4.6, 3.8, k), lerp(24, 19, k)), V(4000, 3.2, -12), 46);
      out.stat = { big: '33 MILLION', sub: 'VIEWS OF ONE CONCERT INSIDE ROBLOX (2020)' };
      out.hud = { label: 'WITHOUT ROBLOX', big: '2020', sub: 'NO VIRTUAL CONCERTS FOR KIDS' };
      out.glitch = smooth(1.55, 1.65, lt) * (1 - smooth(1.85, 2.1, lt));
      out.vig = 0.7;
      break;
    }
    case 'ipo': {
      show('city'); setMood('overcast'); city.setNight(false); city.resetLamps(); city.setTraffic('green'); drawBillboardIPO(t);
      city.placeCars(t); city.placePeds(t, { speed: 0.9 });
      city.peds.forEach(p => { if (p.P.g.visible) p.P.idle(t, 0.5); });
      sunAt(V(4, 0, -40), V(-45, 50, 18), 40);
      const k = ease(u);
      setCam(V(lerp(-3.5, -2.5, k), lerp(1.7, 2.0, k), lerp(-18, -21, k)), V(10, lerp(7.5, 8.6, k), -44), 46);
      out.stat = { big: '$45 BILLION', sub: 'ROBLOX’S VALUE AFTER ITS FIRST DAY OF TRADING' };
      out.hud = { label: 'WITHOUT ROBLOX', big: 'MARCH 2021', sub: 'THE BIG STOCK MARKET DEBUT NEVER HAPPENS' };
      break;
    }
    case 'meta': {
      show('campus'); setMood('dusk', { fogNear: 80, fogFar: 400 });
      sunAt(V(5000, 0, 0), V(-60, 18, 30), 50);
      const swap = smooth(1.6, 2.0, lt);
      campus.drawSign(lt < 1.8 ? 'meta' : 'facebook', lt > 1.6 && lt < 2.0 ? (lt - 1.6) / 0.4 : 0);
      campus.people.forEach((P, i) => { const ph = (t * 0.06 + i / 8) % 1; standAt(P, -20 + ph * 40, 0, 12 + (i % 3) * 0.9, i % 2 ? Math.PI / 2 : -Math.PI / 2); if (i % 2 === 0) P.g.position.x = 20 - ph * 40; P.walk(t * 4.4 + i, 0.45); });
      const k = ease(u);
      setCam(V(5000 + lerp(3.0, 1.5, k), lerp(1.7, 1.9, k), lerp(23, 21, k)), V(5000, 0.2, 4), 46);
      out.glitch = smooth(1.55, 1.65, lt) * (1 - smooth(1.95, 2.1, lt));
      out.hud = { label: 'WITHOUT ROBLOX', big: 'OCTOBER 2021', sub: 'THE METAVERSE HYPE LOSES ITS BIGGEST PROOF' };
      break;
    }
    case 'gucci': {
      show('shop'); setMood('interior', { exp: 0.6, env: 0.3, bloom: 0.35 });
      sunAt(V(6000, 0, 0), V(2, 10, 6), 8, 0.6);
      shop.dissolve(smooth(1.6, 3.2, lt), t);
      shop.people.forEach((P, i) => { standAt(P, [-1.6, 1.7, -2.4, 2.3][i], 0, -1.0 + [0.4, 0.2, 1.4, 1.3][i], [0.9, -0.9, 0.6, -0.7][i]); P.idle(t, 1); if (i === 1) { P.usePhone(true); } if (i === 0) P.cross(); });
      const k = ease(u);
      const p = V(6000 + lerp(-0.9, 0.4, k), lerp(2.2, 2.0, k), lerp(2.8, 2.2, k));
      setCam(p, V(6000, 1.35, -1.5), 42);
      setDOF(true, p.distanceTo(V(6000, 1.55, -1.5)), 0.006, 0.01);
      out.stat = { big: '$4,100+', sub: 'PAID FOR A VIRTUAL GUCCI BAG IN 2021' };
      out.hud = { label: 'WITHOUT ROBLOX', big: 'MAY 2021', sub: 'MORE THAN THE REAL BAG COST IN STORES' };
      break;
    }
    case 'garden': {
      show('garden'); setMood('morning', { fogNear: 60, fogFar: 300 });
      sunAt(V(7000, 0, -4), V(-30, 40, 25), 30);
      const ek = smooth(1.5, 2.6, lt);
      garden.garden.forEach((B, i) => { B.pose(t + i, i % 3 ? 'idle' : 'wave'); B.erase(clamp(ek * 1.3 - (i % 4) * 0.1)); });
      const tn = garden.teen; standAt(tn, 4, 0.48 - 0.5 * 0.86, 6.85, Math.PI); tn.sit(); tn.g.position.y = 0.48 - 0.5 * 0.86;
      tn.type(t); tn.head.rotation.x = 0.35; if (lt > 2.2) { tn.head.rotation.x = lerp(0.35, -0.1, smooth(2.2, 2.8, lt)); tn.head.rotation.y = 0.5 * smooth(2.4, 3.2, lt); }
      tn.idle(t, 0.4);
      garden.lap.position.set(4, 0.84, 6.55); garden.lap.rotation.y = Math.PI;
      redraw(garden.lapT, (c, w, h) => { drawGame(c, w, h, t); drawGlitch(c, w, h, t, ek); });
      const k = ease(u);
      setCam(V(7000 + lerp(7.4, 6.6, k), lerp(1.9, 1.8, k), lerp(10.4, 9.8, k)), V(7000 + 2.2, 0.9, 1.5), 50);
      out.glitch = smooth(1.45, 1.55, lt) * (1 - smooth(1.8, 2.0, lt));
      out.stat = { big: '21.6 MILLION', sub: 'PLAYERS AT ONCE IN “GROW A GARDEN” (2025)' };
      out.hud = { label: 'WITHOUT ROBLOX', big: '2025', sub: 'MORE THAN FORTNITE’S RECORD OF 15.2 MILLION' };
      break;
    }
    case 'daily': {
      show('city'); setMood('dusk', { fogNear: 250, fogFar: 1300, bloom: 0.5 });
      city.setNight(true, b => b.r < 0.25, 1.2); city.resetLamps(); city.setTraffic('green');
      city.placeCars(t, { night: true }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -80), V(-70, 14, -20), 260, 0.8);
      const k = ease(u);
      setCam(V(lerp(90, 50, k), lerp(190, 165, k), lerp(140, 95, k)), V(0, 10, -90), 46);
      out.stat = { big: '111.8 MILLION', sub: 'PEOPLE PLAY ROBLOX EVERY DAY (2025)' };
      out.hud = { label: 'WITHOUT ROBLOX', big: 'TODAY', sub: 'GERMANY HAS 84 MILLION PEOPLE' };
      break;
    }
    case 'earth': case 'erase': case 'quiet': {
      show('earth'); setMood('space');
      const fade = S.id === 'earth' ? 0 : S.id === 'erase' ? smooth(0.4, 6.0, lt) : 1;
      const arcs = S.id === 'earth' ? 1 : S.id === 'erase' ? 1 - smooth(0.2, 2.2, lt) : 0;
      earth.update(t, fade, arcs);
      earth.earth.rotation.y = -0.9 + t * 0.01;
      earth.mat.emissiveIntensity = S.id === 'quiet' ? lerp(0.25, 0.9, smooth(0, 2.5, lt)) : 0.22;
      sun.position.set(20000 + 200, 60, -320); sun.target.position.set(20000, 0, 0); sun.intensity = 2.2; sun.castShadow = false;
      const tt = (t - 50.4) / (68 - 50.4);
      const dist = lerp(200, 150, ease(clamp(tt * 1.4))) + (S.id === 'quiet' ? lerp(0, 40, ease(u)) : 0);
      setCam(V(20000 - 25, 30, dist), V(20000, 6, 0), 40);
      if (S.id === 'earth') out.stat = { big: '3 MILLION YEARS', sub: 'OF PLAYTIME EVERY 3 MONTHS (27.4 BILLION HOURS)' };
      out.hud = S.id === 'quiet' ? null : { label: 'WITHOUT ROBLOX', big: 'TODAY', sub: S.id === 'earth' ? 'EVERY DOT: PLAYERS ONLINE RIGHT NOW' : 'EVERY DOT: A WORLD THAT NEVER EXISTED' };
      out.vig = 0.3; out.grain = 0.02;
      break;
    }
    case 'end': {
      show('earth'); setMood('space'); earth.update(t, 1, 0);
      setCam(V(20000 - 25, 30, 190), V(20000, 6, 0), 40);
      out.end = smooth(0, 0.6, lt);
      break;
    }
  }
  if (!['earth', 'erase', 'quiet', 'end'].includes(S.id)) sun.castShadow = true;
  return out;
}
function countdown(sec) { sec = Math.max(0, sec); const s = Math.floor(sec), ms = Math.floor((sec - s) * 1000); return `0:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`; }

// ---------- overlay ----------
const $ = id => document.getElementById(id);
const grain = $('grain'), gctx = grain.getContext('2d'), gimg = gctx.createImageData(270, 480);
function setGrain(seed, amt) { grain.style.opacity = amt; const r = rng(seed), d = gimg.data; for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } gctx.putImageData(gimg, 0, 0); }
function fmt(s) { return s.replace(/\*\*(.+?)\*\*/g, '<span class="hl">$1</span>'); }
const glitchEl = document.createElement('div'); glitchEl.className = 'ov'; glitchEl.style.cssText = 'position:absolute;inset:0;pointer-events:none;opacity:0;'; $('stage').insertBefore(glitchEl, $('titleShade'));
const canvasEl = document.getElementById('gl');
let lastCap = null;
function overlay(t, S, o) {
  const titleA = o.title ? 1 - smooth(2.75, 3.15, t) : 0;
  $('title').style.opacity = titleA; $('titleShade').style.opacity = titleA;
  $('title').style.transform = `translateY(${-smooth(2.7, 3.2, t) * 20}px)`;
  $('slash').setAttribute('opacity', smooth(1.3, 1.5, t));
  $('wifi').style.opacity = 1 - 0.6 * smooth(1.3, 1.5, t);
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
  $('flash').style.opacity = o.flash ?? 0;
  $('fade').style.opacity = S.fadeIn ? 1 - smooth(S.t0, S.t0 + 0.6, t) : 0;
  // erase glitch: RGB bars + horizontal jitter of the 3D image
  const gk = o.glitch || 0;
  glitchEl.style.opacity = gk;
  if (gk > 0) {
    const r = rng(Math.floor(t * 30) + 11); let html = '';
    for (let i = 0; i < 9; i++) { const y = r() * 100, h = 0.4 + r() * 3.2, col = ['rgba(255,90,102,.55)', 'rgba(90,220,255,.5)', 'rgba(255,255,255,.4)'][i % 3]; html += `<div style="position:absolute;left:0;width:100%;top:${y}%;height:${h}%;background:${col};transform:translateX(${(r() - 0.5) * 80}px)"></div>`; }
    glitchEl.innerHTML = html;
    canvasEl.style.transform = `translateX(${(r() - 0.5) * 26 * gk}px)`; canvasEl.style.filter = `saturate(${1 + gk}) hue-rotate(${(r() - 0.5) * 40 * gk}deg)`;
  } else { canvasEl.style.transform = ''; canvasEl.style.filter = ''; }
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
