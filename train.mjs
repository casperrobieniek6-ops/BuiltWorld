import * as THREE from "./globe/three.module.min.mjs";

const view = document.querySelector("#train-view");
const route = document.querySelector("#route");
const speed = document.querySelector("#train-speed");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const stationX = [0, 25, 50, 75, 100];
const palette = {
  ground: "#62634b", edge: "#333a2d", grass: "#555d3e", water: "#527879",
  road: "#555247", pavement: "#aa9b7f", platform: "#c8bda0", rail: "#ccc5b2",
  mint: "#e6c382", silver: "#e9e2ce", blue: "#354448", glass: "#647c76",
  amber: "#ffd196", coral: "#fa9c74", pine: "#4c6344"
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
    polygon(list, "#ae7053", [[x, height, z + d], left, right, [x + w, height, z + d]]);
    polygon(list, "#8b553f", [[x + w, height, z], right, left, [x, height, z]]);
    polygon(list, "#9d6348", [[x + w, height, z + d], right, [x + w, height, z]]);
  } else {
    box(list, x + w * .18, z + d * .14, w * .51, d * .37, height, .22, tint(color, .76));
  }
  for (let floor = .38; floor < height - .12; floor += .57) {
    for (let col = .24; col < w - .16; col += .48) {
      const left = x + col, bottom = floor, front = z + d + .008;
      polygon(list, (Math.floor(col * 10 + floor * 10 + x) % 4 === 0) ? palette.amber : "#85948a",
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
    const shade = ["#747653", "#7d7654", "#656b4c", "#6d704b"][Math.abs(Math.round(x * 2)) % 4];
    slab(terrain, x, 4.0, 6.94, 4.4, -.345, shade);
    slab(terrain, x + .15, 8.78, 6.62, 5.8, -.345, shade);
    slab(terrain, x, 3.08, 7.2, .21, -.317, "#887e63");
    for (let strip = 0; strip < 4; strip += 1) {
      slab(terrain, x + .4 + strip * 1.4, 9.08, .055, 4.99, -.333, "#918661");
    }
  }
  for (const [x, width] of [[11, 5.2], [33, 3.2], [82, 5]]) {
    slab(terrain, x, -26, width, 44, -.31, palette.water);
    for (let i = 0; i < 7; i += 1) slab(terrain, x + .4 + i % 3 * .45, -24 + i * 5.4, width * .49, .055, -.303, "#739a93");
  }
  slab(terrain, -52, -1.12, 207, 2.24, -.13, "#54493d");
  for (let i = -50; i < 154; i += .75) slab(terrain, i, -.89, .12, 1.78, -.095, "#756754");
  for (const z of [-.54, .54]) slab(terrain, -52, z, 207, .059, -.051, palette.rail);
  for (const [x, width] of [[11, 5.2], [33, 3.2], [82, 5]]) {
    for (const z of [-1.07, 1.02]) {
      for (let offset = .2; offset < width - .15; offset += .72) {
        box(terrain, x + offset, z, .09, .08, -.11, .37, "#a7947a");
      }
      box(terrain, x, z, width, .055, .22, .055, "#c1af90");
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
  const town = index < 2;
  const modern = index >= 3;
  const density = [3, 4, 4, 6, 7][index];
  for (const offset of [-4.45, -.9, 2.65]) {
    slab(list, center - 7.1, offset - 8.3, 14.2, .39, -.09, palette.road);
  }
  for (const offset of [-5.4, -.1, 5.2]) {
    slab(list, center + offset, -15, .42, 12, -.08, palette.road);
  }
  // Station square, sidewalks, and a main street facing the platforms.
  slab(list, center - 7.1, -5.43, 14.2, 2.55, -.068, modern ? "#a49f89" : "#9a8368");
  slab(list, center - 7.1, -5.10, 14.2, .72, -.059, palette.road);
  for (let i = 0; i < 12; i += 1) {
    const x = center - 6.9 + i * 1.2;
    slab(list, x, -4.79, .53, .027, -.047, "#b9a886");
    slab(list, x, -3.19, .58, .04, -.044, "#b9a886");
  }
  for (const x of [center - 5.2, center + 4.7]) {
    for (let step = 0; step < 5; step += 1) slab(list, x, -5.04 + step * .115, .46, .049, -.043, "#d8c7a2");
  }
  for (const offset of [-5.1, -2.6, 1.8, 4.7]) {
    const x = center + offset;
    box(list, x, -3.03, .08, .08, -.02, .9, "#4f503e");
    box(list, x - .06, -3.08, .20, .18, .86, .10, "#edce93");
    box(list, x + .16, -3.34, .48, .16, -.04, .13, "#9a7750");
  }
  for (const [offset, color] of [[-5.2, "#85644a"], [2.8, "#737b61"], [5.4, "#ae8967"]]) {
    box(list, center + offset, -4.9, .65, .31, -.035, .15, color);
    box(list, center + offset + .17, -4.86, .29, .23, .11, .12, "#8d9180");
  }
  slab(list, center - 4.8, -2.42, 9.6, 1.24, -.036, palette.platform, 1);
  slab(list, center - 4.8, -1.27, 9.6, .09, -.026, palette.amber, 1);
  building(list, center - 1.8, -4.05, 3.6, 1.36, modern ? 1.08 : .77, modern ? "#c5c2af" : "#b58768", !modern);
  box(list, center - 2.55, -2.05, modern ? 6.2 : 5.1, modern ? .83 : .56, modern ? .75 : .57, .12, modern ? "#a1ada1" : "#785a42");
  if (!modern) {
    box(list, center - .22, -3.81, .44, .42, .76, .72, "#b58768");
    box(list, center - .28, -3.87, .56, .54, 1.47, .11, "#81533b");
  }
  for (const x of [-2.2, 0, 2.2]) box(list, center + x, -1.99, .065, .065, 0, .57, palette.silver);
  const facades = modern
    ? ["#b2b8a8", "#8d9a90", "#b8a383", "#80918b", "#b48e70", "#acb0a0"]
    : ["#c59d77", "#b88163", "#d2b48e", "#9c765f", "#b89b70", "#c39a78"];
  const awnings = ["#80533e", "#52694a", "#aa7653", "#806b45"];
  for (let row = 0; row < (town ? 2 : 3); row += 1) {
    for (let col = 0; col < density; col += 1) {
      const seed = col * 13 + row * 7 + index * 11;
      const x = center - 6.2 + col * 12.4 / density + (row % 2) * .22;
      const z = -6.63 - row * 3.02 - (seed % 3) * .11;
      const height = town ? .78 + (seed % 3) * .24 : 1.55 + (seed % 10) * (modern ? .51 : .24);
      const width = town ? 1.45 + (seed % 3) * .16 : 1.37 + seed % 4 * .17;
      const depth = town ? 1.23 : 1.34 + seed % 3 * .25;
      building(list, x, z, width, depth, height, facades[seed % facades.length], town && (row !== 0 || index === 0));
      if (row === 0) {
        const front = z + depth + .012;
        box(list, x + .09, front, width - .18, .023, .04, .37, modern ? "#61746d" : "#6b5744");
        box(list, x + .05, front, width - .10, modern ? .17 : .30, .43, .069, awnings[col % awnings.length]);
        for (const dx of [.23, width * .55]) box(list, x + dx, front + .027, .24, .013, .12, .15, "#d7ba81");
      }
      if (seed % 2 === 0) tree(list, x + width + .19, z + .7, .9);
    }
  }
  if (index === 3 || index === 4) {
    const x = center + 1.2, z = -13.8;
    building(list, x, z, 1.75, 1.68, 6.3, "#9ab4cf", false);
    box(list, x + .76, z + .72, .065, .065, 6.5, .9, "#e1c6c9");
  }
  if (index === 4) {
    building(list, center - 1.6, -10.1, 4.5, 2.1, 1.8, "#c1a98a", false);
    box(list, center + .2, -9.38, .9, .75, 1.8, .75, "#dfccb0");
    for (let i = 0; i < 5; i += 1) box(list, center - 3.9 + i * 1.65, -2.11, .075, .075, 0, 1.02, "#a3a18a");
    box(list, center - 4.1, -2.35, 7.2, .90, .98, .12, "#9aa99e");
  }
}

const fleet = [
  { name: "Heritage diesel", threshold: 0, speed: 95, body: "#cfb586", stripe: "#944b45", roof: "#3e4c48", cars: 3, length: 1.85, nose: 0 },
  { name: "Regional railcar", threshold: 25, speed: 130, body: "#d2c3a3", stripe: "#4f775d", roof: "#757867", cars: 3, length: 1.78, nose: 0 },
  { name: "0 Series Shinkansen", threshold: 55, speed: 210, body: "#efe4c8", stripe: "#385b88", roof: "#c7c6b1", cars: 4, length: 2.0, nose: .61 },
  { name: "TGV Sud-Est", threshold: 90, speed: 270, body: "#ce753c", stripe: "#eee0b8", roof: "#b6663b", cars: 4, length: 2.08, nose: .64 },
  { name: "Acela", threshold: 125, speed: 250, body: "#cbd2cd", stripe: "#2c6080", roof: "#a8b0a9", cars: 4, length: 2.10, nose: .78 },
  { name: "ICE 3", threshold: 165, speed: 300, body: "#e6e5d7", stripe: "#a83e39", roof: "#c3c4b6", cars: 4, length: 2.16, nose: .83 },
  { name: "N700S Shinkansen", threshold: 205, speed: 300, body: "#e8e6d8", stripe: "#315886", roof: "#c5c9c2", cars: 4, length: 2.20, nose: 1.13 }
];

function train(list, x, tier, glow) {
  const set = fleet[tier];
  const length = set.length;
  const step = length + .12;
  for (let car = 0; car < set.cars; car += 1) {
    const start = x - length - car * step;
    box(list, start, -.49, length, .98, .065, .63, set.body);
    box(list, start + .04, -.43, length - .08, .86, .695, .09, set.roof);
    for (const z of [-.505, .492]) {
      box(list, start, z, length, .014, .18, .064, set.stripe);
      for (let win = 0; win < 4; win += 1) {
        box(list, start + .17 + win * length * .20, z, .23, .014, .42, .15, palette.blue);
      }
    }
    for (const bogie of [.32, length - .44]) box(list, start + bogie, -.36, .21, .72, -.025, .12, "#203146");
  }

  const tail = x - length - (set.cars - 1) * step;
  box(list, tail - .019, -.34, .026, .68, .35, .18, palette.blue);
  for (const z of [-.33, .26]) box(list, tail - .04, z, .03, .075, .20, .075, "#ff7a70");
  if (!set.nose) {
    box(list, x - .51, -.47, .34, .94, .70, .24, set.body);
    box(list, x - .15, -.32, .021, .64, .73, .15, palette.blue);
    box(list, x - 1.05, -.15, .20, .29, .78, .10, set.roof);
  } else {
    const nose = x + set.nose;
    polygon(list, set.body, [[x, .69, -.49], [x, .69, .49], [nose, .19, .27], [nose, .19, -.27]]);
    polygon(list, tint(set.body, .78), [[x, .07, .49], [nose, .08, .27], [nose, .19, .27], [x, .69, .49]]);
    polygon(list, tint(set.body, .86), [[x, .69, -.49], [nose, .19, -.27], [nose, .08, -.27], [x, .07, -.49]]);
    polygon(list, "#e7d9a7", [[nose, .08, -.27], [nose, .19, -.27], [nose, .19, .27], [nose, .08, .27]]);
    polygon(list, palette.blue, [[x + .07, .66, -.39], [x + .07, .66, .39], [x + .29, .535, .33], [x + .29, .535, -.33]]);
  }
  if (tier === 3 || tier === 4 || tier === 5) {
    const roofX = x - (tier === 3 ? .82 : 3.1);
    polygon(list, "#5b5850", [[roofX - .36, .78, -.13], [roofX + .18, 1.10, -.13], [roofX + .39, 1.10, -.13], [roofX - .25, .78, -.13]]);
    box(list, roofX + .15, -.15, .27, .31, 1.09, .05, "#6a6659");
  }
  if (tier === 3) {
    box(list, x - .43, -.45, .22, .9, .79, .065, "#663d2e");
  }
  if (tier === 2 || tier === 6) {
    const lip = x + set.nose * .76;
    polygon(list, set.stripe, [[x + .04, .31, .46], [lip, .18, .32], [lip, .23, .32], [x + .04, .37, .46]]);
  }
  if (glow) {
    for (let streak = 0; streak < 4; streak += 1) {
      const spread = .19 + streak * .16;
      const length = 1.15 + streak * .19;
      polygon(list, glow, [[tail - length, .018, spread], [tail - .12, .018, spread + .045], [tail - .19, .018, spread - .015]]);
    }
  }
}

makeTerrain();
stationX.forEach(makeCity);

const camera = new THREE.PerspectiveCamera(42, 1, .1, 130);
const vector = new THREE.Vector3();
const nearPoint = new THREE.Vector3();
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
      const points = [];
      for (let i = 0; i < face.points.length; i += 1) {
        const from = face.points[i], to = face.points[(i + 1) % face.points.length];
        const start = -nearPoint.set(...from).applyMatrix4(camera.matrixWorldInverse).z;
        const end = -nearPoint.set(...to).applyMatrix4(camera.matrixWorldInverse).z;
        if (start >= .35) points.push(from);
        if ((start >= .35) !== (end >= .35)) {
          const t = (.35 - start) / (end - start);
          points.push(from.map((coordinate, axis) => coordinate + (to[axis] - coordinate) * t));
        }
      }
      if (points.length < 3) continue;
      const screen = points.map(point => {
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
let points = 0;
let stationPoints = 0;
let boost = 0;
const service = document.querySelector("#train-service");
const upgrade = document.querySelector("#train-next");
const tripMs = 1550;

function update(state) {
  const next = state.phase === "intro" ? 0 : state.index;
  const startFirst = state.phase === "travel" && state.index === 0 && phase !== "travel";
  if (next !== target || startFirst) {
    origin = startFirst ? -.36 : current;
    target = next;
    departedAt = performance.now();
    launch = startFirst;
    stationPoints = state.points;
  }
  points = state.points;
  if (state.phase === "intro" || state.phase === "results") stationPoints = points;
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
  const desiredBoost = phase === "play" || phase === "review"
    ? Math.min(2.6, (points - stationPoints) * .036)
    : 0;
  boost = reducedMotion.matches ? desiredBoost : boost + (desiredBoost - boost) * .24;
  const boosting = Math.abs(desiredBoost - boost) > .02;
  if (!redraw && !traveling && !pulse && !boosting) return;
  redraw = traveling || pulse > 0 || boosting;
  lastFrame = now;
  current = origin + (target - origin) * smooth(elapsed);

  const x = current * 25 + boost;
  camera.aspect = width / height;
  camera.fov = camera.aspect < 1.25 ? 61 : 48;
  camera.position.set(x - 16.5, 12.1, 9.4);
  camera.lookAt(x + 7.2, 1.55, -2.6);
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
    if (phase === "intro" && index === 1) rise = .29;
    if (rise < .035) continue;
    for (const face of city) {
      if (face.layer === 0) {
        if (rise > .65) faces.push(face);
        continue;
      }
      faces.push({ ...face, points: face.points.map(([px, y, pz]) => [px, Math.max(-.30, y * rise - (1 - rise) * .62), pz]) });
    }
  }
  const tier = fleet.findLastIndex(item => points >= item.threshold);
  train(faces, x + .8, tier, pulse ? (rare ? palette.coral : palette.mint) : "");
  if (service.textContent !== fleet[tier].name) service.textContent = fleet[tier].name;
  render(faces, width, height);

  const nextTrain = fleet[tier + 1];
  const upgradeText = nextTrain ? `${nextTrain.threshold - points} pts to ${nextTrain.name}` : "Fleet complete";
  if (upgrade.textContent !== upgradeText) upgrade.textContent = upgradeText;
  const speedLimit = fleet[tier].speed;
  const speedLabel = traveling ? `${Math.round(Math.sin(elapsed * Math.PI) * speedLimit)} KM/H`
    : boosting ? "PULLING AHEAD" : "AT STATION";
  if (speedLabel !== lastSpeed) {
    speed.textContent = speedLabel;
    lastSpeed = speedLabel;
  }
  route.style.setProperty("--rail-progress", clamp((current + boost / 25) / (stationX.length - 1)) * 100 + "%");
}

new ResizeObserver(() => { redraw = true; }).observe(view);
reducedMotion.addEventListener("change", () => { redraw = true; });
window.addEventListener("built-world-route", event => update(event.detail));
if (window.builtWorldRoute) update(window.builtWorldRoute);
requestAnimationFrame(draw);
