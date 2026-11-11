import * as THREE from "./globe/three.module.min.mjs";

const view = document.querySelector("#train-view");
const route = document.querySelector("#route");
const speed = document.querySelector("#train-speed");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const stationX = [0, 25, 50, 75, 100];
const palette = {
  ground: "#456779", edge: "#253b55", grass: "#385c63", water: "#527d9f",
  road: "#38475c", pavement: "#71859a", platform: "#93adbd", rail: "#d4dae1",
  mint: "#ccffa4", silver: "#e2eef3", blue: "#243e59", glass: "#547a9f",
  amber: "#ffd09b", coral: "#f6a589", pine: "#325e62"
};
const terrain = [];
const cities = stationX.map(() => []);
const faces = [];
const colorCache = new Map();

function polygon(list, color, points, layer = 1) {
  list.push({ color, points, layer });
}

function slab(list, x, z, width, depth, y, color, layer = 0) {
  polygon(list, color, [[x, y, z], [x, y, z + depth], [x + width, y, z + depth], [x + width, y, z]], layer);
}

function tint(hex, multiplier) {
  const key = hex + multiplier;
  if (!colorCache.has(key)) {
    const hexValue = new THREE.Color(hex).multiplyScalar(multiplier).getHexString();
    colorCache.set(key, "#" + hexValue);
  }
  return colorCache.get(key);
}

function box(list, x, z, width, depth, base, height, color) {
  const top = base + height;
  const a = [x, base, z], b = [x + width, base, z];
  const c = [x + width, base, z + depth], d = [x, base, z + depth];
  const A = [x, top, z], B = [x + width, top, z];
  const C = [x + width, top, z + depth], D = [x, top, z + depth];
  polygon(list, tint(color, 1.12), [A, D, C, B]);
  polygon(list, tint(color, .58), [a, A, B, b]);
  polygon(list, tint(color, .77), [b, B, C, c]);
  polygon(list, tint(color, .88), [c, C, D, d]);
  polygon(list, tint(color, .68), [d, D, A, a]);
}

function building(list, x, z, w, d, height, color, house) {
  box(list, x, z, w, d, 0, height, color);
  if (house) {
    const left = [x, height + .48, z + d / 2], right = [x + w, height + .48, z + d / 2];
    polygon(list, "#d58d81", [[x, height, z + d], left, right, [x + w, height, z + d]]);
    polygon(list, "#9c6471", [[x + w, height, z], right, left, [x, height, z]]);
    polygon(list, "#bd7c78", [[x + w, height, z + d], right, [x + w, height, z]]);
  } else {
    box(list, x + w * .18, z + d * .14, w * .51, d * .37, height, .22, tint(color, .76));
  }
  for (let floor = .38; floor < height - .12; floor += .57) {
    for (let col = .24; col < w - .16; col += .48) {
      const left = x + col, bottom = floor, front = z + d + .008;
      polygon(list, (Math.floor(col * 10 + floor * 10 + x) % 4 === 0) ? palette.amber : "#6e8aa6",
        [[left, bottom, front], [left + .19, bottom, front], [left + .19, bottom + .18, front], [left, bottom + .18, front]]);
    }
  }
}

function tree(list, x, z, height) {
  const tip = [x, height, z], base = height * .22, r = height * .29;
  const corners = [[x - r, base, z - r], [x + r, base, z - r], [x + r, base, z + r], [x - r, base, z + r]];
  for (let i = 0; i < 4; i += 1) polygon(list, tint(palette.pine, .78 + i * .13), [corners[i], tip, corners[(i + 1) % 4]]);
}

function makeTerrain() {
  slab(terrain, -52, -26, 207, 44, -.36, palette.ground);
  slab(terrain, -52, -25, 207, 10, -.34, palette.grass);
  for (let x = -45; x < 150; x += 7.2) {
    const shade = ["#496c75", "#4f707a", "#426574", "#496773"][Math.abs(Math.round(x * 2)) % 4];
    slab(terrain, x, 4.0, 6.94, 4.4, -.345, shade);
    slab(terrain, x + .15, 8.78, 6.62, 5.8, -.345, shade);
    slab(terrain, x, 3.08, 7.2, .21, -.317, "#668095");
    for (let strip = 0; strip < 4; strip += 1) {
      slab(terrain, x + .4 + strip * 1.4, 9.08, .055, 4.99, -.333, "#557684");
    }
  }
  for (const [x, width] of [[11, 5.2], [33, 3.2], [82, 5]]) {
    slab(terrain, x, -26, width, 44, -.31, palette.water);
    for (let i = 0; i < 7; i += 1) slab(terrain, x + .4 + i % 3 * .45, -24 + i * 5.4, width * .49, .055, -.303, "#6a91ac");
  }
  slab(terrain, -52, -1.12, 207, 2.24, -.13, "#283c55");
  for (let i = -50; i < 154; i += .75) slab(terrain, i, -.89, .12, 1.78, -.095, "#526a80");
  for (const z of [-.54, .54]) slab(terrain, -52, z, 207, .059, -.051, palette.rail);
  for (const [x, width] of [[11, 5.2], [33, 3.2], [82, 5]]) {
    for (const z of [-1.07, 1.02]) {
      for (let offset = .2; offset < width - .15; offset += .72) {
        box(terrain, x + offset, z, .09, .08, -.11, .37, "#91a9c1");
      }
      box(terrain, x, z, width, .055, .22, .055, "#a8b9ce");
    }
  }
  for (let i = 0; i < 102; i += 1) {
    const x = -28 + i * 1.55, z = -8.9 - (i * 31 % 14) * .75;
    if (stationX.some(center => Math.abs(x - center) < 6.5)) continue;
    tree(terrain, x, z, .65 + (i * 7 % 11) * .105);
  }
  for (let i = 0; i < 53; i += 1) {
    const x = -26 + i * 3.15;
    if ((x > 10 && x < 17) || (x > 32 && x < 37) || (x > 81 && x < 88)) continue;
    tree(terrain, x, 3.8 + (i * 13 % 11) * .62, .68 + (i % 5) * .19);
  }
}

function makeCity(center, index) {
  const list = cities[index];
  const town = index === 2;
  const density = [5, 4, 3, 6, 5][index];
  for (const offset of [-4.45, -.9, 2.65]) {
    slab(list, center - 7.1, offset - 8.3, 14.2, .39, -.09, palette.road);
  }
  for (const offset of [-5.4, -.1, 5.2]) {
    slab(list, center + offset, -15, .42, 12, -.08, palette.road);
  }
  slab(list, center - 4.8, -2.42, 9.6, 1.24, -.036, palette.platform, 1);
  slab(list, center - 4.8, -1.27, 9.6, .09, -.026, palette.amber, 1);
  building(list, center - 1.8, -4.05, 3.6, 1.36, .64, "#c0d1db", false);
  box(list, center - 2.55, -2.05, 5.1, .56, .57, .12, "#7facc3");
  for (const x of [-2.2, 0, 2.2]) box(list, center + x, -1.99, .065, .065, 0, .57, palette.silver);
  const facades = ["#a5bdd3", "#819fbd", "#b59caf", "#6a8eaf", "#cfaaa4", "#a2b0c3"];
  for (let row = 0; row < (town ? 2 : 3); row += 1) {
    for (let col = 0; col < density; col += 1) {
      const seed = col * 13 + row * 7 + index * 11;
      const x = center - 6.2 + col * 12.4 / density + (row % 2) * .22;
      const z = -5.1 - row * 3.25 - (seed % 3) * .15;
      const height = town ? .65 + (seed % 3) * .19 : 1.05 + (seed % 10) * (index === 1 ? .27 : .49);
      building(list, x, z, town ? 1.27 : 1.37 + seed % 4 * .16, town ? 1.1 : 1.34 + seed % 3 * .25, height, facades[seed % facades.length], town);
      if (seed % 2 === 0) tree(list, x + 1.66, z + .7, .9);
    }
  }
  if (index === 3 || index === 0) {
    const x = center + 1.2, z = -13.8;
    building(list, x, z, 1.75, 1.68, 6.3, "#9ab4cf", false);
    box(list, x + .76, z + .72, .065, .065, 6.5, .9, "#e1c6c9");
  }
  if (index === 4) {
    building(list, center - 1.6, -10.1, 4.5, 2.1, 1.8, "#dccabd", false);
    box(list, center + .2, -9.38, .9, .75, 1.8, .75, "#e5d7c4");
  }
}

function train(list, x, color) {
  for (let car = 0; car < 3; car += 1) {
    const start = x - 2.3 - car * 1.99;
    box(list, start, -.46, 1.89, .92, 0, .56, palette.silver);
    box(list, start, .466, 1.89, .016, .11, .06, color);
    for (let win = 0; win < 4; win += 1) {
      box(list, start + .16 + win * .37, .468, .22, .016, .32, .13, palette.blue);
    }
  }
  const nose = x + .17;
  polygon(list, palette.silver, [[x - .42, .56, -.46], [x - .42, .56, .46], [nose, .15, .28], [nose, .15, -.28]]);
  polygon(list, "#b1cedf", [[x - .42, 0, .46], [nose, 0, .28], [nose, .15, .28], [x - .42, .56, .46]]);
  polygon(list, "#c5dbeb", [[x - .42, .56, -.46], [nose, .15, -.28], [nose, 0, -.28], [x - .42, 0, -.46]]);
  polygon(list, "#eff9df", [[nose, 0, -.28], [nose, .15, -.28], [nose, .15, .28], [nose, 0, .28]]);
  polygon(list, palette.blue, [[x - .29, .48, -.38], [x - .29, .48, .38], [x - .13, .37, .33], [x - .13, .37, -.33]]);
}

makeTerrain();
stationX.forEach(makeCity);

const camera = new THREE.PerspectiveCamera(42, 1, .1, 130);
const vector = new THREE.Vector3();
const canvas = document.createElement("canvas");
view.append(canvas);
let render;
try {
  const gl = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (gl) render = webglRenderer(canvas, gl);
} catch {}
if (!render) {
  const fallback = document.createElement("canvas");
  canvas.replaceWith(fallback);
  render = canvasRenderer(fallback);
}

function webglRenderer(output, context) {
  const renderer = new THREE.WebGLRenderer({ canvas: output, context, alpha: true, antialias: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.DoubleSide
  }));
  mesh.frustumCulled = false;
  scene.add(mesh);
  const positions = new Float32Array(140000);
  const colors = new Float32Array(140000);
  const vertices = new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage);
  const vertexColors = new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage);
  mesh.geometry.setAttribute("position", vertices);
  mesh.geometry.setAttribute("color", vertexColors);
  const color = new THREE.Color();
  return (sceneFaces, width, height) => {
    const density = Math.min(devicePixelRatio, 1.5);
    if (output.width !== Math.floor(width * density) || output.height !== Math.floor(height * density)) {
      renderer.setPixelRatio(density);
      renderer.setSize(width, height, false);
    }
    let offset = 0;
    for (const { points, color: fill } of sceneFaces) {
      color.set(fill.slice(0, 7));
      for (let i = 1; i < points.length - 1; i += 1) {
        for (const j of [0, i, i + 1]) {
          positions.set(points[j], offset);
          colors.set([color.r, color.g, color.b], offset);
          offset += 3;
        }
      }
    }
    mesh.geometry.setDrawRange(0, offset / 3);
    vertices.needsUpdate = vertexColors.needsUpdate = true;
    renderer.render(scene, camera);
  };
}

function canvasRenderer(output) {
  const context = output.getContext("2d");
  if (!context) return () => {};
  return (sceneFaces, width, height) => {
    const density = Math.min(devicePixelRatio, 1.65);
    const w = Math.round(width * density), h = Math.round(height * density);
    if (output.width !== w || output.height !== h) {
      output.width = w;
      output.height = h;
    }
    context.clearRect(0, 0, w, h);
    const projected = [];
    for (const face of sceneFaces) {
      const screen = face.points.map(point => {
        vector.set(...point).project(camera);
        return [(vector.x + 1) * w / 2, (1 - vector.y) * h / 2, vector.z];
      });
      if (screen.some(point => point[2] > 1) || screen.every(point => point[0] < -1 || point[0] > w + 1) && face.layer > 0) continue;
      const depth = screen.reduce((sum, point) => sum + point[2], 0) / screen.length;
      projected.push({ screen, depth, color: face.color, layer: face.layer });
    }
    projected.sort((a, b) => a.layer - b.layer || (a.layer ? b.depth - a.depth : 0));
    for (const { screen, color } of projected) {
      context.beginPath();
      context.moveTo(screen[0][0], screen[0][1]);
      for (const point of screen.slice(1)) context.lineTo(point[0], point[1]);
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }
  };
}

let current = 0;
let origin = 0;
let target = 0;
let departedAt = 0;
let flashAt = -Infinity;
let rare = false;
let redraw = true;
let lastFrame = 0;
let phase = "intro";
let launch = false;
let lastSpeed = "";
const tripMs = 1550;

function update(state) {
  const next = state.phase === "intro" ? 0 : state.index;
  const startFirst = state.phase === "travel" && state.index === 0 && phase !== "travel";
  if (next !== target || startFirst) {
    origin = startFirst ? -.36 : current;
    target = next;
    departedAt = performance.now();
    launch = startFirst;
  }
  if (state.cue) {
    flashAt = performance.now();
    rare = state.cue === "rare";
  }
  phase = state.phase;
  redraw = true;
}

const smooth = value => value * value * (3 - 2 * value);
const clamp = value => Math.min(1, Math.max(0, value));

function draw(now) {
  requestAnimationFrame(draw);
  const width = view.clientWidth, height = view.clientHeight;
  if (!width || !height || document.hidden || now - lastFrame < 30) return;
  const elapsed = reducedMotion.matches ? 1 : clamp((now - departedAt) / tripMs);
  const traveling = origin !== target && elapsed < 1;
  const pulse = reducedMotion.matches ? 0 : clamp(1 - (now - flashAt) / 750);
  if (!redraw && !traveling && !pulse) return;
  redraw = traveling || pulse > 0;
  lastFrame = now;
  current = origin + (target - origin) * smooth(elapsed);

  const x = current * 25;
  camera.aspect = width / height;
  camera.fov = camera.aspect < 1.25 ? 48 : 42;
  camera.position.set(x + 12, 16.5, 24);
  camera.lookAt(x + 2.9, 1.25, -4.6);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();

  faces.length = 0;
  for (const face of terrain) {
    if (face.layer === 0) {
      const left = Math.max(face.points[0][0], x - 35);
      const right = Math.min(face.points[2][0], x + 38);
      if (right <= left) continue;
      slab(faces, left, face.points[0][2], right - left, face.points[1][2] - face.points[0][2], face.points[0][1], face.color);
    } else if (Math.abs(face.points[0][0] - x) < 27) {
      faces.push(face);
    }
  }
  slab(faces, Math.max(-25, x - 34), .57, Math.min(34, x + 25), .11, -.023, palette.mint);
  for (const [index, city] of cities.entries()) {
    if (Math.abs(stationX[index] - x) > 28) continue;
    let rise = index < target ? 1 : smooth(clamp(1 - Math.abs(current - index) / .51));
    if (phase === "intro" && index === 0) rise = 1;
    if (launch && traveling && index === 0) rise = smooth(elapsed);
    if (rise < .035) continue;
    for (const face of city) {
      if (face.layer === 0) {
        if (rise > .65) faces.push(face);
        continue;
      }
      faces.push({ ...face, points: face.points.map(([px, y, pz]) => [px, Math.max(-.30, y * rise - (1 - rise) * .62), pz]) });
    }
  }
  train(faces, x + .8, pulse && rare ? palette.coral : palette.mint);
  render(faces, width, height);

  const speedLabel = traveling ? `${Math.round(Math.sin(elapsed * Math.PI) * 300)} KM/H` : "AT STATION";
  if (speedLabel !== lastSpeed) {
    speed.textContent = speedLabel;
    lastSpeed = speedLabel;
  }
  route.style.setProperty("--rail-progress", clamp(current / (stationX.length - 1)) * 100 + "%");
}

new ResizeObserver(() => { redraw = true; }).observe(view);
reducedMotion.addEventListener("change", () => { redraw = true; });
window.addEventListener("built-world-route", event => update(event.detail));
if (window.builtWorldRoute) update(window.builtWorldRoute);
requestAnimationFrame(draw);
