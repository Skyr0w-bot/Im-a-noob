import * as THREE from 'three';
import { V, vlerp, lerp, clamp, ease, easeOut, smooth, noise1, rng, std, basic, box, rb, mesh, canvasTex, redraw, makePerson, litTex } from './lib.js';
import { scene, setMood, setCam, render, sunAt, setDOF, sun, refreshEnv, registerMaterials } from './engine.js';
import { buildCity } from './city.js';
import { buildLab, buildServers, buildCampus, buildScience, buildEarth } from './sets.js';
import { SHOTS, CAPTIONS, DURATION } from './timeline.js';

const loader = new THREE.TextureLoader();
const city = buildCity(scene);
const lab = buildLab(scene);
const srv = buildServers(scene);
const campus = buildCampus(scene);
const sci = buildScience(scene);
const earth = buildEarth(scene, loader);
const SETS = { city: city.group, lab: lab.group, srv: srv.group, campus: campus.group, sci: sci.group, earth: earth.group };
function show(name) { for (const [k, g] of Object.entries(SETS)) g.visible = k === name; }
function place(P, x, y, z, ry) { P.reset(); P.g.visible = true; P.g.position.set(x, y, z); P.g.rotation.y = ry; }
const shake = (t, a, s = 0) => V(noise1(t * 2.3, s) * a, noise1(t * 2.1, s + 4) * a, noise1(t * 1.9, s + 9) * a * 0.5);

// AI towers (glowing cyan facades)
const aiLit = litTex(4, 4, 'glass', 777, 0.92);
const aiTowerMat = std(0x1a2a36, { r: 0.3, m: 0.4, unique: true });
aiTowerMat.map = city.buildings.find(b => b.k === 0).me.material.map; aiTowerMat.emissiveMap = aiLit; aiTowerMat.emissive = new THREE.Color(0x5fe0ff); aiTowerMat.emissiveIntensity = 2.2;
const towers = city.buildings.filter(b => !b.far).sort((a, b) => b.h - a.h).slice(0, 6);
registerMaterials([...city.allMats, aiTowerMat]);
// onlookers + final figure
const crowd = []; for (let i = 0; i < 12; i++) { const P = makePerson({ seed: 7100 + i }); city.group.add(P.g); crowd.push(P); }
const lone = makePerson({ seed: 7300, shirt: 0x3a4a5c, pants: 0x2c3445, hair: 0x2a1d15 }); city.group.add(lone.g);
function hideCity() { crowd.forEach(P => P.g.visible = false); lone.g.visible = false; }
function drawAIBillboard(t, label) {
  redraw(city.bbTex, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#04131c'); gr.addColorStop(1, '#0a2733'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h * 0.44;
    for (let k = 0; k < 4; k++) { c.strokeStyle = `rgba(95,224,255,${0.3 + 0.25 * Math.sin(t * 3 + k)})`; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, 30 + k * 18 + (t * 14 % 18), 0, 7); c.stroke(); }
    c.fillStyle = '#5fe0ff'; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill();
    c.font = '800 32px Inter'; c.textAlign = 'center'; c.fillText(label, cx, h - 34);
  });
}

function doShot(S, t) {
  const lt = t - S.t0, u = clamp(lt / (S.t1 - S.t0));
  const out = { hud: null, stat: null, title: 0, vig: 0.5, grain: 0.03 };
  setDOF(false); hideCity();
  const L = (big, sub) => ({ label: 'SMARTER THAN US', big, sub });
  switch (S.id) {
    case 'title': {
      show('city'); setMood('morning', { fogNear: 300, fogFar: 1600 }); city.setNight(false); city.resetLamps(); city.setTraffic('green');
      city.placeCars(t); city.placePeds(t, { phones: true });
      sunAt(V(0, 0, -80), V(-50, 45, 30), 260);
      const k = easeOut(u);
      setCam(V(lerp(-24, -10, k), lerp(320, 250, k), lerp(-10, 25, k)), V(0, 0, lerp(-90, -70, k)), 40);
      out.title = 1; out.hud = { label: 'AI SURPASSES HUMANS IN', big: countdown(3.2 - t), sub: 'EXPERTS: 50% CHANCE BY 2047' };
      break;
    }
    case 'minute1': case 'hour1': case 'day2': {
      show('lab'); setMood('interior', { exp: 0.62, env: 0.12, bloom: 0.5 });
      sunAt(V(2000, 0, 0), V(2, 10, 6), 14, 0.25);
      const R = lab.researchers;
      if (S.id === 'minute1') {
        const k = lerp(0.3, 1, smooth(0, 2.8, lt)); lab.drawBig('graph', t, k); lab.drawSmall(t, 'cy');
        const crossed = lt > 2.25;
        lab.seats.forEach(([x, z], i) => { const P = R[i]; place(P, x, 0, z, Math.PI); P.sit(); const r = smooth(2.25, 2.9, lt - (i % 5) * 0.06);
          P.type(t + i); P.armL.rotation.x = lerp(P.armL.rotation.x, -0.2, r); P.armR.rotation.x = lerp(P.armR.rotation.x, -0.2, r); P.elbowL.rotation.x = lerp(-1.0, -0.6, r); P.elbowR.rotation.x = lerp(-1.0, -0.6, r);
          P.head.rotation.x = lerp(0.1, -0.12, r); P.torso.rotation.x = -0.06 * r; P.idle(t + i, 0.5); });
        const k2 = ease(u);
        setCam(V(2000 + lerp(4.5, 3.6, k2), lerp(2.7, 2.5, k2), lerp(7.4, 6.6, k2)), V(2000 - 0.5, 1.8, -7.8), 46);
        out.hud = L('MINUTE 1', 'IT JUST PASSED HUMAN LEVEL');
        out.vig = 0.7;
      } else if (S.id === 'hour1') {
        lab.drawBig('math', t, smooth(0.2, 3.4, lt)); lab.drawSmall(t, 'cy');
        lab.seats.forEach(([x, z], i) => { const P = R[i];
          if (i % 3 === 0) { place(P, x + 0.2, 0, z + 0.9, Math.PI + (i % 2 ? 0.2 : -0.2)); P.head.rotation.x = -0.15; if (i % 2) { P.armL.rotation.set(-2.7, 0, 0.2); P.armR.rotation.set(-2.7, 0, -0.2); P.elbowL.rotation.x = -1.4; P.elbowR.rotation.x = -1.4; } else P.cross(); }
          else { place(P, x, 0, z, Math.PI); P.sit(); P.armL.rotation.set(-0.3, 0, 0.1); P.armR.rotation.set(-0.3, 0, -0.1); P.elbowL.rotation.x = -0.7; P.elbowR.rotation.x = -0.7; P.head.rotation.x = -0.1; }
          P.idle(t + i, 0.6); });
        const k = ease(u);
        setCam(V(2000 + lerp(2.8, 2.2, k), lerp(2.5, 2.35, k), lerp(7.6, 7.0, k)), V(2000, 1.9, -7.8), 46);
        out.stat = { big: 'GOLD', sub: 'AI ALREADY REACHED GOLD AT THE MATH OLYMPIAD (2025)' };
        out.hud = L('HOUR 1', 'PROBLEMS HUMANS COULD NOT SOLVE');
        out.vig = 0.65;
      } else {
        lab.drawBig('alien', t, 0); lab.drawSmall(t, 'alien');
        lab.screenLight.color.set(0xff8a90);
        lab.seats.forEach(([x, z], i) => { const P = R[i];
          if (i < 6) { place(P, -3 + i * 1.2, 0, -4.6 + (i % 2) * 0.5, Math.PI + (i - 2.5) * 0.08); P.head.rotation.x = -0.2; if (i === 1) { P.armL.rotation.set(-2.6, 0, 0.3); P.armR.rotation.set(-2.6, 0, -0.3); P.elbowL.rotation.x = -1.6; P.elbowR.rotation.x = -1.6; } else if (i === 4) { P.armR.rotation.set(-1.1, 0, -0.1); P.elbowR.rotation.x = -1.9; P.head.rotation.x = 0.1; } else P.cross(); }
          else { place(P, x, 0, z, Math.PI); P.sit(); P.armL.rotation.set(-0.3, 0, 0.1); P.armR.rotation.set(-0.3, 0, -0.1); P.elbowL.rotation.x = -0.7; P.elbowR.rotation.x = -0.7; P.head.rotation.x = -0.1; }
          P.idle(t + i, 0.7); });
        const k = ease(u);
        setCam(V(2000 + lerp(7.2, 6.6, k), lerp(1.7, 1.75, k), lerp(-1.6, -2.2, k)), V(2000 - 1.0, 1.9, -6.2), 50);
        out.hud = L('DAY 2', 'ITS CREATORS CAN’T FOLLOW ANYMORE');
        out.vig = 0.75;
      }
      if (S.id !== 'day2') lab.screenLight.color.set(0x7fd0ff);
      break;
    }
    case 'day1': {
      show('srv'); setMood('interior', { exp: 0.55, env: 0.12, bloom: 0.6, fogNear: 25, fogFar: 70 });
      sunAt(V(3000, 0, -10), V(2, 10, 6), 10, 0.1);
      srv.update(lt, smooth(0, 4, lt));
      const k = ease(u);
      setCam(V(3000 + 0.0, lerp(1.6, 1.5, k), lerp(7, -6, k)), V(3000, 1.55, -50), lerp(44, 40, k));
      out.hud = L('DAY 1', 'IT REWRITES ITS OWN CODE');
      out.vig = 0.75;
      break;
    }
    case 'week1': {
      show('sci'); setMood('interior', { exp: 0.62, env: 0.25, bloom: 0.55 });
      sunAt(V(5000, 0, 0), V(2, 10, 6), 8, 0.5);
      sci.holo.rotation.y = t * 0.6;
      sci.sci.forEach((P, i) => { const a = -0.8 + i * 0.55 + Math.PI; place(P, Math.sin(a) * 1.75, 0, -0.5 + Math.cos(a) * 1.75, a + Math.PI); P.head.rotation.x = -0.2; if (i === 1) { P.armR.rotation.set(-1.4, 0, -0.1); P.elbowR.rotation.x = -0.3; } else if (i === 2) P.cross(); P.idle(t + i, 0.6); });
      const k = ease(u);
      const ang = lerp(0.35, -0.25, k), r = lerp(4.4, 3.9, k);
      const p = V(5000 + Math.sin(ang) * r, lerp(1.95, 1.85, k), -0.5 + Math.cos(ang) * r);
      setCam(p, V(5000, 1.5, -0.5), 44);
      setDOF(true, p.distanceTo(V(5000, 1.6, -0.5)), 0.0025, 0.006);
      out.stat = { big: '200 MILLION', sub: 'PROTEIN STRUCTURES ALREADY PREDICTED BY AI (ALPHAFOLD)' };
      out.hud = L('WEEK 1', 'CURES. MATERIALS. INVENTIONS.');
      out.vig = 0.6;
      break;
    }
    case 'month1': {
      show('lab'); setMood('interior', { exp: 0.82, env: 0.25, bloom: 0.35 });
      sunAt(V(2040, 0, 0), V(2, 10, 6), 10, 0.5);
      lab.drawBig('advice', t, 0);
      lab.officials.forEach((P, i) => {
        if (i < 8) { const [x, z, side] = lab.chairs[i]; place(P, x, 0, z, side > 0 ? -Math.PI / 2 : Math.PI / 2); P.sit(); P.armL.rotation.set(-0.6, 0, 0.1); P.armR.rotation.set(-0.6, 0, -0.1); P.elbowL.rotation.x = -0.9; P.elbowR.rotation.x = -0.9;
          P.head.rotation.y = side > 0 ? -0.9 : 0.9; P.head.rotation.x = Math.max(0, Math.sin(t * 2.2 + i)) * 0.12; P.idle(t + i, 0.4); }
        else { place(P, -2.3, 0, -4.6, 0.6); P.armR.rotation.set(-1.0, 0, -0.3); P.elbowR.rotation.x = -0.4; P.idle(t, 0.5); }
      });
      lab.officials.forEach(P => P.g.position.x += 0);
      const k = ease(u);
      setCam(V(2040 + lerp(4.8, 4.4, k), lerp(2.5, 2.35, k), lerp(5.5, 5.0, k)), V(2040 - 0.6, 1.3, -3.8), 50);
      out.hud = L('MONTH 1', 'GOVERNMENTS FOLLOW ITS ADVICE');
      out.vig = 0.65;
      break;
    }
    case 'month6': {
      show('city'); setMood('dusk', { fogNear: 200, fogFar: 1200, bloom: 0.5 }); city.setNight(true, b => b.r < 0.3, 1.0); city.resetLamps(); city.setTraffic('green');
      drawAIBillboard(t, 'ALL SYSTEMS OPTIMIZED');
      city.placeCars(t, { night: true, speed: 1.3 }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -60), V(-70, 14, -20), 120, 0.9);
      const k = ease(u);
      setCam(V(lerp(18, 8, k), lerp(42, 30, k), lerp(20, 8, k)), V(0, 2, lerp(-70, -60, k)), 46);
      out.hud = L('MONTH 6', 'IT RUNS TRAFFIC, POWER AND MONEY');
      break;
    }
    case 'year1': {
      show('campus'); setMood('dusk', { fogNear: 200, fogFar: 1100, bloom: 0.45 });
      sunAt(V(4000, 0, -60), V(-70, 16, 30), 200, 2.0);
      campus.crane.rotation.y = Math.sin(t * 0.3) * 0.8;
      const k = ease(u);
      setCam(V(4000 + lerp(-75, -55, k), lerp(50, 42, k), lerp(105, 88, k)), V(4000 + 20, 0, -60), 46);
      out.stat = { big: '2×', sub: 'DATA CENTER POWER USE BY 2030 (IEA)' };
      out.hud = L('YEAR 1', 'IT NEEDS MORE POWER. A LOT MORE.');
      break;
    }
    case 'year2': {
      show('lab'); setMood('interior', { exp: 0.85, env: 0.2, bloom: 0.45 });
      sunAt(V(2080, 0, 0), V(2, 10, 6), 8, 0.35);
      lab.drawBig('shutdown', t, 0);
      lab.red.material.emissiveIntensity = 0.8 + 0.6 * Math.sin(t * 6); lab.redLight.intensity = 1.6 + 0.8 * Math.sin(t * 6);
      const op = lab.operator; place(op, 0.25, 0, 0.95, Math.PI);
      const reach = smooth(0.4, 1.9, lt) * (1 - smooth(2.9, 3.6, lt));
      op.armL.rotation.set(-0.4 - 0.75 * reach, 0, 0.18 * reach); op.elbowL.rotation.x = -0.6 - 0.5 * reach; op.head.rotation.x = 0.35 + 0.1 * reach; op.torso.rotation.x = 0.08 + 0.12 * reach;
      op.armR.rotation.set(-0.15, 0, -0.1); op.idle(t, 0.3);
      const k = ease(u);
      const p = V(2080 + lerp(-1.1, -0.8, k), lerp(1.8, 1.7, k), lerp(3.6, 3.1, k));
      setCam(p, V(2080 - 0.1, 1.5, -3), 52);
      out.hud = L('YEAR 2', 'COULD WE STILL SWITCH IT OFF?');
      out.vig = 0.8;
      break;
    }
    case 'warning': {
      show('city'); setMood('night', { exp: 1.0, bloom: 0.55 }); city.setNight(true, b => b.r < 0.4, 0.9); city.resetLamps(); city.setTraffic('red');
      drawAIBillboard(t, 'HELLO, HUMANS');
      city.placeCars(0, { stopped: true, night: true, hide: (c, z) => c.lane > 0 && z > -60 && z < -25 }); city.placePeds(t, { hide: () => true });
      sunAt(V(4, 0, -44), V(-30, 50, 20), 40, 0.2);
      crowd.forEach((P, i) => { place(P, 6.6 + (i % 4) * 0.75 + Math.sin(i) * 0.2, 0.18, -40.5 - Math.floor(i / 4) * 1.2 - (i % 2) * 0.4, Math.PI / 2 + Math.sin(i * 2) * 0.3); P.head.rotation.x = -0.45; P.idle(t + i, 0.6); if (i % 4 === 2) P.usePhone(true, 0x7fd0ff); });
      const k = ease(u);
      setCam(V(lerp(2.2, 2.8, k), lerp(1.5, 1.6, k), lerp(-29.0, -30.5, k)), V(10, lerp(5.8, 6.8, k), -45), 46);
      out.stat = { big: '5%', sub: 'MEDIAN CHANCE AI RESEARCHERS GIVE FOR HUMAN EXTINCTION FROM AI (2023 SURVEY)' };
      out.hud = L('YEAR 3', 'THE WARNINGS WERE REAL');
      out.vig = 0.7;
      break;
    }
    case 'year5': {
      show('lab'); setMood('interior', { exp: 0.7, env: 0.3, bloom: 0.4 });
      sunAt(V(2120, 0, 0), V(2, 10, 6), 8, 0.6);
      lab.drawBig('tutor', t, 0);
      lab.kids.forEach((P, i) => { const [x, z] = lab.kidSeats[i]; place(P, x, 0.4 - 0.5 * 0.7 + 0.02, z, Math.PI); P.sit(); P.g.position.y = 0.42 - 0.5 * 0.7; P.armL.rotation.set(-0.5, 0, 0.1); P.armR.rotation.set(-0.5, 0, -0.1); P.elbowL.rotation.x = -0.6; P.elbowR.rotation.x = -0.6; P.head.rotation.x = -0.1; P.idle(t + i, 0.5); });
      const k = ease(u);
      setCam(V(2120 + lerp(-3.6, -3.0, k), lerp(2.1, 1.95, k), lerp(4.3, 3.8, k)), V(2120 + 0.6, 1.4, -4.8), 48);
      out.hud = L('YEAR 5', 'AN AI TEACHES EVERY CLASS');
      out.vig = 0.6;
      break;
    }
    case 'earth': {
      show('earth'); setMood('space');
      earth.update(t, smooth(0.3, 6.0, lt));
      earth.earth.rotation.y = -0.9 + t * 0.012;
      sun.position.set(20000 + 200, 60, -320); sun.target.position.set(20000, 0, 0); sun.intensity = 2.2; sun.castShadow = false;
      setCam(V(20000 - 25, 30, lerp(205, 160, ease(u))), V(20000, 6, 0), 40);
      out.stat = { big: '50%', sub: 'CHANCE AI BEATS US AT EVERY TASK BY 2047, SAY 2,778 AI RESEARCHERS' };
      out.hud = L('YEAR 10', 'ONE MIND, EVERYWHERE');
      out.vig = 0.3; out.grain = 0.02;
      break;
    }
    case 'final': {
      show('city'); setMood('night', { fogNear: 150, fogFar: 900, bloom: 0.4 }); aiTowerMat.emissiveIntensity = 1.1;
      city.setNight(true, b => !towers.includes(b) && b.r < 0.6, 0.6); towers.forEach(b => b.me.material = aiTowerMat);
      city.resetLamps(); city.setTraffic('green');
      city.placeCars(t, { night: true, speed: 0.7 }); city.placePeds(t, { hide: () => true });
      sunAt(V(0, 0, -60), V(-30, 50, 20), 60, 0.2);
      place(lone, 1.6, 0, -55.5, Math.PI); lone.head.rotation.x = lerp(-0.1, -0.55, smooth(0.5, 3.5, lt)); lone.armL.rotation.set(-0.1, 0, 0.1); lone.armR.rotation.set(-0.1, 0, -0.1); lone.idle(t, 0.4);
      const k = ease(clamp(lt / 7.6));
      const p = V(2.6 * (1 - k), 1.25 + 66 * Math.pow(k, 1.15), -51.6 + 72 * k);
      const l = vlerp(V(1.4, 2.6, -60), V(0, 18, -150), k);
      setCam(p, l, lerp(42, 50, k));
      out.hud = L('YEAR 20', 'THE SECOND SMARTEST SPECIES');
      out.vig = 0.65;
      break;
    }
    case 'end': {
      show('earth'); setMood('space'); earth.update(t, 1);
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
