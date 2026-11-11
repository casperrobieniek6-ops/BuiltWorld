import * as THREE from "./globe/three.module.min.mjs";

const view = document.querySelector("#train-view");
const route = document.querySelector("#route");
const speed = document.querySelector("#train-speed");
const motion = matchMedia("(prefers-reduced-motion: reduce)");
const stationCount = 5;
const colors = {
  sky: "#141c37", violet: "#373a5b", hills: "#303e5d", foothills: "#254351",
  ground: "#172b38", rails: "#a0a6aa", silver: "#e8efe6", mint: "#c9f896",
  dark: "#172a40", glass: "#1d4964", light: "#fff5cd", orange: "#ffb680"
};

function skyline(index) {
  return .15 + ((index * 37 + 17) % 63) / 100;
}

function engineShape(context, x, y, unit) {
  context.beginPath();
  context.moveTo(x - 2.85 * unit, y);
  context.lineTo(x + 2.8 * unit, y);
  context.quadraticCurveTo(x + 3.45 * unit, y, x + 3.47 * unit, y - .13 * unit);
  context.quadraticCurveTo(x + 3.16 * unit, y - .59 * unit, x + 2.57 * unit, y - .73 * unit);
  context.lineTo(x - 2.85 * unit, y - .73 * unit);
  context.closePath();
}

function canvasScene(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  return ({ progress, pulse, rare, running, now, cleared }) => {
    const w = canvas.width, h = canvas.height;
    const railY = h * .72;
    const u = Math.min(w / 29, h / 10);
    const x = w * (.17 + .66 * progress);
    const light = rare ? colors.orange : colors.mint;
    ctx.clearRect(0, 0, w, h);

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#101933");
    sky.addColorStop(.7, "#425375");
    sky.addColorStop(1, "#d89082");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 36; i += 1) {
      ctx.fillStyle = i % 5 === 0 ? "#f9e6b7b0" : "#b6cbea63";
      ctx.fillRect((i * 1073 % 1979) * w / 1979, (i * 739 % 997) * h * .53 / 997, i % 5 === 0 ? 2 : 1, i % 5 === 0 ? 2 : 1);
    }
    const sunX = w * .79, sunY = h * .25;
    const glow = ctx.createRadialGradient(sunX, sunY, h * .025, sunX, sunY, h * .21);
    glow.addColorStop(0, "#ffd4a7ed");
    glow.addColorStop(.36, "#f7b69448");
    glow.addColorStop(1, "#ffb39000");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(sunX, sunY, h * .06, 0, Math.PI * 2);
    ctx.fillStyle = "#f9ccb1";
    ctx.fill();

    const parallax = running ? Math.sin(now * .002) * .007 : 0;
    for (const [layer, color] of [colors.violet, colors.hills, colors.foothills].entries()) {
      ctx.beginPath();
      ctx.moveTo(0, railY);
      for (let i = -2; i <= 30; i += 1) {
        const px = i / 28;
        const offset = progress * .13 * (layer + 1) + parallax * layer;
        const py = .53 + layer * .046 + Math.sin((px + offset) * 12 + layer * 1.9) * .07
          + Math.sin((px + offset) * 26 + layer) * .022;
        ctx.lineTo(px * w, py * h);
      }
      ctx.lineTo(w, railY);
      ctx.fillStyle = color;
      ctx.fill();
    }

    for (let i = 0; i < 45; i += 1) {
      const px = w * (.017 + i / 46);
      const city = i < 10 || i > 37;
      const town = i > 22 && i < 29;
      if (!city && !town) {
        if (i % 2) continue;
        const tall = h * (.045 + skyline(i) * .12);
        ctx.fillStyle = "#162e3d";
        ctx.beginPath();
        ctx.moveTo(px, railY - tall);
        ctx.lineTo(px - tall * .24, railY);
        ctx.lineTo(px + tall * .24, railY);
        ctx.fill();
        continue;
      }
      const tall = h * (city ? .15 : .065) * (skyline(i) + .24);
      const wide = w * (city ? .019 : .015);
      ctx.fillStyle = city ? "#1a3044" : "#263746";
      ctx.fillRect(px, railY - tall, wide, tall);
      if (!city) {
        ctx.beginPath();
        ctx.moveTo(px - 2, railY - tall);
        ctx.lineTo(px + wide / 2, railY - tall - u * .24);
        ctx.lineTo(px + wide + 2, railY - tall);
        ctx.fill();
      }
      ctx.fillStyle = "#ffcc877e";
      for (let row = 1; row * 7 < tall - 1; row += 1) {
        if ((row + i) % 3) ctx.fillRect(px + wide * .24, railY - tall + row * 7 - 3, Math.max(1, wide * .22), 2);
      }
    }

    ctx.fillStyle = "#152639";
    ctx.fillRect(0, railY, w, h - railY);
    const litEnd = x + 3.45 * u;
    for (let i = 0; i < stationCount; i += 1) {
      const sx = w * (.17 + .66 * i / (stationCount - 1));
      ctx.fillStyle = cleared[i] ? colors.mint : "#6e889d";
      ctx.fillRect(sx - 1, railY + h * .09, 2, h * .095);
      ctx.fillRect(sx - 3, railY + h * .18, 6, 2);
    }
    for (let i = 0; i < 50; i += 1) {
      ctx.fillStyle = i % 2 ? "#375168" : "#273e53";
      ctx.fillRect(i * w / 49, railY, Math.max(2, w / 130), h * .072);
    }
    ctx.fillStyle = colors.rails;
    ctx.fillRect(0, railY, w, Math.max(1, h * .009));
    ctx.fillStyle = "#6d879c";
    ctx.fillRect(0, railY + h * .065, w, Math.max(1, h * .009));
    ctx.fillStyle = "#b1f29c";
    ctx.fillRect(0, railY + h * .065, Math.max(0, litEnd), Math.max(1, h * .009));

    if (running) {
      ctx.strokeStyle = "#c1e5ff52";
      ctx.lineWidth = Math.max(1, u * .043);
      for (let i = 0; i < 7; i += 1) {
        const offset = ((now * .25 + i * 79) % (w * .56));
        const y = railY - u * (.2 + (i % 4) * .17);
        ctx.beginPath();
        ctx.moveTo(x - u * 3 - offset, y);
        ctx.lineTo(x - u * 4 - offset, y);
        ctx.stroke();
      }
    }

    ctx.shadowColor = "#afff9c84";
    ctx.shadowBlur = pulse > 0 ? 18 * pulse : 5;
    engineShape(ctx, x, railY - 2, u);
    const body = ctx.createLinearGradient(0, railY - u, 0, railY);
    body.addColorStop(0, "#f3f8ee");
    body.addColorStop(.76, "#b9d1cf");
    body.addColorStop(1, "#7999a4");
    ctx.fillStyle = body;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save();
    engineShape(ctx, x, railY - 2, u);
    ctx.clip();
    ctx.fillStyle = colors.dark;
    ctx.fillRect(x - 3 * u, railY - .29 * u, 6.5 * u, .13 * u);
    ctx.fillStyle = light;
    ctx.fillRect(x - 3 * u, railY - .19 * u, 6.5 * u, .06 * u);
    for (let i = 0; i < 10; i += 1) {
      if (i === 5) continue;
      ctx.fillStyle = i % 3 ? colors.glass : "#355b70";
      ctx.fillRect(x + (i * .5 - 2.68) * u, railY - .59 * u, .33 * u, .18 * u);
    }
    ctx.fillStyle = colors.glass;
    ctx.beginPath();
    ctx.moveTo(x + 2.57 * u, railY - .63 * u);
    ctx.lineTo(x + 3.11 * u, railY - .43 * u);
    ctx.lineTo(x + 2.65 * u, railY - .42 * u);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = colors.light;
    ctx.fillRect(x + 3.14 * u, railY - .2 * u, .20 * u, .07 * u);
  };
}

function threeScene(canvas, context) {
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: true, alpha: true });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-16, 16, 5, -5, .1, 100);
  const material = color => new THREE.MeshLambertMaterial({ color });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(90, 36), new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: "varying vec2 uvSky; void main(){uvSky=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
    fragmentShader: "varying vec2 uvSky; void main(){vec3 a=vec3(.65,.34,.34);vec3 b=vec3(.035,.061,.17);gl_FragColor=vec4(mix(a,b,smoothstep(.25,.78,uvSky.y)),1.);}"
  }));
  sky.position.set(0, 4, -22);
  scene.add(sky);
  scene.add(new THREE.HemisphereLight(0xfaf7ed, 0x57738f, 2.1));
  const sun = new THREE.DirectionalLight(0xffcc9c, 2.4);
  sun.position.set(10, 12, -3);
  scene.add(sun);

  const box = (parent, width, height, depth, color, x, y, z) => {
    const object = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color));
    object.position.set(x, y, z);
    parent.add(object);
    return object;
  };
  const disc = new THREE.Mesh(new THREE.CircleGeometry(1.12, 48), new THREE.MeshBasicMaterial({ color: 0xffc7a0 }));
  disc.position.set(12.8, 6.2, -18);
  scene.add(disc);

  const landscape = new THREE.Group();
  scene.add(landscape);
  for (let layer = 0; layer < 3; layer += 1) {
    const ridge = new THREE.Shape();
    ridge.moveTo(-45, -3);
    for (let i = 0; i <= 90; i += 1) {
      const x = i - 45;
      ridge.lineTo(x, 1.6 - layer * .55 + Math.sin(x * .29 + layer * 2) * 1.15 + Math.sin(x * .68 + layer) * .37);
    }
    ridge.lineTo(45, -3);
    ridge.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(ridge), new THREE.MeshBasicMaterial({ color: [colors.violet, colors.hills, colors.foothills][layer] }));
    mesh.position.z = -13 + layer * 2.5;
    landscape.add(mesh);
  }
  for (let i = 0; i < 55; i += 1) {
    const x = -24 + i * .9;
    const urban = i < 17 || i > 39;
    if (urban) {
      const tall = .33 + skyline(i) * 2.3;
      box(landscape, .58, tall, .67, "#243951", x, -1 + tall / 2, -4 - i % 3 * .5);
      for (let j = .25; j < tall - .08; j += .34) {
        if ((i + Math.round(j * 10)) % 3) box(landscape, .10, .083, .018, "#ffc28a", x - .09, -1 + j, -3.64 - i % 3 * .5);
      }
    } else if (i % 2 === 0) {
      const tree = new THREE.Mesh(new THREE.ConeGeometry(.23, .82, 5), material("#1d4c49"));
      tree.position.set(x, -.54, -3 - (i % 5) * .24);
      landscape.add(tree);
    }
  }
  box(scene, 65, .38, 10, "#263c4e", 0, -1.24, -1);
  box(scene, 65, .08, 1.7, "#425469", 0, -.99, 0);
  for (const z of [-.54, .54]) box(scene, 65, .045, .055, "#bac5c6", 0, -.92, z);
  for (let i = -38; i <= 38; i += 1) box(scene, .12, .035, 1.42, "#718294", i * .8, -.95, 0);
  const energized = box(scene, 1, .018, .052, colors.mint, 0, -.884, .58);

  const train = new THREE.Group();
  scene.add(train);
  const profile = new THREE.Shape();
  profile.moveTo(-3.25, 0);
  profile.lineTo(2.55, 0);
  profile.quadraticCurveTo(3.5, .025, 3.5, .22);
  profile.quadraticCurveTo(3.16, .66, 2.46, .84);
  profile.lineTo(-3.25, .84);
  profile.closePath();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(profile, { depth: .69, bevelEnabled: true, bevelThickness: .06, bevelSize: .065, bevelSegments: 2 }), material(colors.silver));
  body.position.z = -.345;
  train.add(body);
  for (const z of [-.41, .41]) {
    box(train, 5.95, .125, .024, colors.dark, -.19, .24, z);
    box(train, 5.95, .05, .025, colors.mint, -.19, .15, z);
    for (let i = 0; i < 11; i += 1) {
      if (i === 5) continue;
      box(train, .29, .175, .025, colors.glass, -2.93 + i * .50, .57, z);
    }
    box(train, .26, .16, .025, colors.glass, 2.56, .56, z * .94).rotation.z = -.25;
    for (const x of [-2.2, -.9, .9, 2.3]) box(train, .23, .15, .11, colors.dark, x, -.015, z * .76);
  }
  const headlight = box(train, .17, .07, .40, colors.light, 3.23, .16, .04);

  return ({ progress, pulse, rare }) => {
    const width = canvas.clientWidth, height = canvas.clientHeight;
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio, 1.65);
    if (canvas.width !== Math.floor(width * pixelRatio) || canvas.height !== Math.floor(height * pixelRatio)) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    const span = 14;
    const vertical = span * height / width;
    camera.left = -span;
    camera.right = span;
    camera.top = Math.max(3.3, vertical);
    camera.bottom = -camera.top;
    camera.position.set(0, 5.2, 20);
    camera.lookAt(0, 1.1, 0);
    camera.updateProjectionMatrix();
    train.position.set(-9.2 + 18.4 * progress, -.88, 0);
    landscape.position.x = (0.5 - progress) * 3.8;
    const litLength = 20 + train.position.x;
    energized.scale.x = litLength;
    energized.position.x = -20 + litLength / 2;
    headlight.material.emissive.set(rare ? colors.orange : colors.mint);
    headlight.material.emissiveIntensity = .3 + pulse * 2.5;
    renderer.render(scene, camera);
  };
}

let canvas = document.createElement("canvas");
view.append(canvas);
let render;
try {
  const context = canvas.getContext("webgl2", { alpha: true, antialias: true });
  if (context) render = threeScene(canvas, context);
} catch {
  canvas.remove();
  canvas = document.createElement("canvas");
  view.append(canvas);
}
if (!render) {
  render = canvasScene(canvas);
  new ResizeObserver(() => {
    const scale = Math.min(devicePixelRatio, 1.7);
    canvas.width = Math.round(view.clientWidth * scale);
    canvas.height = Math.round(view.clientHeight * scale);
    redraw = true;
  }).observe(view);
} else {
  new ResizeObserver(() => { redraw = true; }).observe(view);
}

let progress = 0;
let origin = 0;
let target = 0;
let departedAt = 0;
let flashAt = -Infinity;
let rare = false;
let redraw = true;
let last = 0;
let cleared = [];
let lastSpeed = "";
const tripMs = 1150;

function update(state) {
  const next = state.phase === "intro" ? 0 : state.index / (stationCount - 1);
  if (next !== target) {
    origin = progress;
    target = next;
    departedAt = performance.now();
  }
  if (state.cue) {
    flashAt = performance.now();
    rare = state.cue === "rare";
  }
  cleared = state.cleared;
  redraw = true;
}

function frame(now) {
  requestAnimationFrame(frame);
  if (!render || document.hidden || !view.clientWidth || now - last < 28) return;
  const elapsed = Math.min(1, Math.max(0, (now - departedAt) / tripMs));
  const traveling = origin !== target && elapsed < 1 && !motion.matches;
  const pulse = motion.matches ? 0 : Math.max(0, 1 - (now - flashAt) / 800);
  if (!redraw && !traveling && !pulse) return;
  redraw = traveling || pulse > 0;
  last = now;
  const eased = motion.matches ? 1 : elapsed * elapsed * (3 - 2 * elapsed);
  progress = origin + (target - origin) * eased;
  const speedText = traveling ? `${Math.round(Math.sin(elapsed * Math.PI) * 300)} KM/H` : "AT STATION";
  if (speedText !== lastSpeed) {
    speed.textContent = speedText;
    lastSpeed = speedText;
  }
  route.style.setProperty("--rail-progress", progress * 100 + "%");
  render({ progress, pulse, rare, running: traveling, now, cleared });
}
window.addEventListener("built-world-route", event => update(event.detail));
if (window.builtWorldRoute) update(window.builtWorldRoute);
motion.addEventListener("change", () => { redraw = true; });
requestAnimationFrame(frame);
