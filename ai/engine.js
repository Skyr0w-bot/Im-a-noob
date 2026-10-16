// Renderer + post-processing + lighting moods.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { makeSky, V } from './lib.js';

export const RW = 720, RH = 1280;   // 3D render resolution (upscaled to 1080x1920 by CSS; text is drawn at full res)
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(RW, RH, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(45, RW / RH, 0.1, 2500);
scene.fog = new THREE.Fog(0xcfdde8, 80, 700);

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

export const sky = makeSky(); scene.add(sky);
export const hemi = new THREE.HemisphereLight(0xdfe9f5, 0x8a8478, 0.9); scene.add(hemi);
export const sun = new THREE.DirectionalLight(0xfff3e2, 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);

export function sunAt(target, dir, span = 40, intensity) {
  sun.target.position.copy(target);
  sun.position.copy(target).add(dir.clone().normalize().multiplyScalar(150));
  const c = sun.shadow.camera; c.left = -span; c.right = span; c.top = span; c.bottom = -span; c.near = 10; c.far = 400; c.updateProjectionMatrix();
  if (intensity != null) sun.intensity = intensity;
}

// ---- post ----
export const composer = new EffectComposer(renderer);
composer.setPixelRatio(1); composer.setSize(RW, RH);
const renderPass = new RenderPass(scene, camera); composer.addPass(renderPass);
export const gtao = new GTAOPass(scene, camera, RW, RH);
gtao.output = GTAOPass.OUTPUT.Default;
gtao.blendIntensity = 0.85;
gtao.updateGtaoMaterial({ radius: 0.6, distanceExponent: 1.6, thickness: 1.5, scale: 1.0, samples: 12 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
composer.addPass(gtao);
export const bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.002, maxblur: 0.008 });
bokeh.enabled = false; composer.addPass(bokeh);
export const bloom = new UnrealBloomPass(new THREE.Vector2(RW, RH), 0.35, 0.6, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

export function setDOF(on, focus = 10, aperture = 0.002, maxblur = 0.01) {
  bokeh.enabled = on;
  if (on) { bokeh.uniforms.focus.value = focus; bokeh.uniforms.aperture.value = aperture; bokeh.uniforms.maxblur.value = maxblur; }
}

// ---- moods ----
const C = c => new THREE.Color(c);
export const MOODS = {
  day:      { sky: [0x5f93c9, 0xbcd3e6, 0xdfe6ea], fog: [0xc6d6e3, 90, 650], hemi: [0xe2ecf7, 0x8a8478, 0.95], sun: [0xfff2df, 2.8], env: 0.35, exp: 1.0, bloom: [0.25, 0.92] },
  morning:  { sky: [0x7fa6cf, 0xd9e2e8, 0xf0e6da], fog: [0xdfe3e4, 70, 600], hemi: [0xf2ece2, 0x857e72, 0.9], sun: [0xffe4c2, 2.7], env: 0.35, exp: 1.0, bloom: [0.25, 0.92] },
  overcast: { sky: [0x9aa8b5, 0xc4ccd3, 0xd3d8dc], fog: [0xc2c9cf, 50, 420], hemi: [0xe6eaee, 0x7d7f80, 1.5], sun: [0xe8ecf0, 0.9], env: 0.45, exp: 1.0, bloom: [0.2, 0.92] },
  dusk:     { sky: [0x37476e, 0xc98a6c, 0xe2b394], fog: [0xb88a78, 60, 500], hemi: [0xffcfb0, 0x4a3f50, 0.7], sun: [0xff9a5c, 2.2], env: 0.25, exp: 1.0, bloom: [0.4, 0.85] },
  night:    { sky: [0x03060e, 0x0b1326, 0x141c30], fog: [0x0b1120, 80, 700], hemi: [0x34466e, 0x0a0a10, 0.3], sun: [0x8ea6e0, 0.3], env: 0.05, exp: 1.0, bloom: [0.45, 0.82] },
  interior: { sky: [0x9aa8b5, 0xc4ccd3, 0xd3d8dc], fog: [0xd8d8d6, 60, 260], hemi: [0xf4f1ea, 0x8c857a, 0.8], sun: [0xfff6ea, 1.1], env: 0.4, exp: 0.82, bloom: [0.2, 0.95] },
  space:    { sky: [0x000000, 0x000000, 0x000000], fog: [0x000000, 5000, 6000], hemi: [0x223355, 0x000000, 0.05], sun: [0xffffff, 3.0], env: 0.0, exp: 1.0, bloom: [0.9, 0.5] },
};
let lastEnv = -1;
const EXTRA = new Set();
export function registerMaterials(list) { list.forEach(m => EXTRA.add(m)); lastEnv = -1; }
export function refreshEnv() { lastEnv = -1; }
export function setMood(name, o = {}) {
  const m = MOODS[name];
  const u = sky.material.uniforms; u.top.value.set(m.sky[0]); u.mid.value.set(m.sky[1]); u.bot.value.set(m.sky[2]);
  scene.fog.color.set(m.fog[0]); scene.fog.near = o.fogNear ?? m.fog[1]; scene.fog.far = o.fogFar ?? m.fog[2];
  hemi.color.set(m.hemi[0]); hemi.groundColor.set(m.hemi[1]); hemi.intensity = m.hemi[2];
  sun.color.set(m.sun[0]); sun.intensity = m.sun[1];
  const env = o.env ?? m.env;
  if (env !== lastEnv) { lastEnv = env; scene.traverse(ob => { const ms = ob.material ? (Array.isArray(ob.material) ? ob.material : [ob.material]) : []; for (const mm of ms) if ('envMapIntensity' in mm) mm.envMapIntensity = env; }); for (const mm of EXTRA) mm.envMapIntensity = env; }
  renderer.toneMappingExposure = o.exp ?? m.exp;
  bloom.strength = o.bloom ?? m.bloom[0]; bloom.threshold = m.bloom[1];
  sky.visible = name !== 'space';
  scene.background = name === 'space' ? C(0x000000) : null;
  gtao.enabled = o.ao ?? (name !== 'space');
}

export function setCam(p, l, fov = 45, roll = 0) {
  camera.position.copy(p);
  camera.up.set(Math.sin(roll), Math.cos(roll), 0);
  camera.lookAt(l);
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  sky.position.copy(p);
}
export function render() { composer.render(); }
