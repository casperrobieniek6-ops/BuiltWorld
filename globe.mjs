import * as THREE from "./globe/three.module.min.mjs";

const stops = [
  { name: "Chicago", lat: 41.88, lon: -87.63 },
  { name: "Lisbon", lat: 38.72, lon: -9.14 },
  { name: "Rotterdam", lat: 51.92, lon: 4.48 },
  { name: "Warsaw", lat: 52.23, lon: 21.01 },
  { name: "San Francisco", lat: 37.77, lon: -122.42 }
];

const panel = document.querySelector("#route");
const viewport = document.querySelector("#earth-view");
const motion = matchMedia("(prefers-reduced-motion: reduce)");

function position(lat, lon, radius = 1) {
  const phi = THREE.MathUtils.degToRad(lat);
  const theta = THREE.MathUtils.degToRad(lon);
  return new THREE.Vector3(Math.cos(phi) * Math.cos(theta), Math.sin(phi), -Math.cos(phi) * Math.sin(theta)).multiplyScalar(radius);
}

function interpolate(from, to, progress) {
  const angle = from.angleTo(to);
  if (angle < .001) return to.clone();
  const weight = Math.sin(angle);
  return from.clone().multiplyScalar(Math.sin((1 - progress) * angle) / weight)
    .addScaledVector(to, Math.sin(progress * angle) / weight).normalize();
}

function createGlobe() {
  const canvas = document.createElement("canvas");
  const attributes = { alpha: true, antialias: true, powerPreference: "low-power" };
  const context = canvas.getContext("webgl2", attributes) || canvas.getContext("webgl", attributes);
  if (!context) throw new Error("WebGL unavailable");
  const renderer = new THREE.WebGLRenderer({ canvas, context, ...attributes });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  viewport.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  const points = stops.map(stop => position(stop.lat, stop.lon));
  const center = position(24, -40);
  const axis = new THREE.Vector3(0, 1, 0);
  const normal = new THREE.Vector3(0, 0, 1);
  let current = center.clone();
  let from = current.clone();
  let target = center.clone();
  let movedAt = performance.now();
  let pulseAt = -Infinity;
  let pulseStop = 0;
  let state = { phase: "intro", index: 0, cleared: [] };
  let visible = true;

  const texture = new THREE.TextureLoader().load(new URL("./globe/earth.webp", import.meta.url).href, () => {
    panel.classList.add("earth-ready");
  });
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1, 72, 48),
    new THREE.MeshStandardMaterial({ map: texture, roughness: .86, color: 0xffffff })
  ));
  scene.add(new THREE.HemisphereLight(0xeaffec, 0x45776d, 2.15));
  const sun = new THREE.DirectionalLight(0xffe8b6, 1.45);
  scene.add(sun);

  const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(1.025, 64, 48), new THREE.ShaderMaterial({
    uniforms: { tint: { value: new THREE.Color("#82f6cf") } },
    vertexShader: `
      varying vec3 viewNormal;
      varying vec3 viewDirection;
      void main() {
        vec4 view = modelViewMatrix * vec4(position, 1.0);
        viewNormal = normalize(normalMatrix * normal);
        viewDirection = normalize(-view.xyz);
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: `
      uniform vec3 tint;
      varying vec3 viewNormal;
      varying vec3 viewDirection;
      void main() {
        float edge = pow(1.0 - abs(dot(normalize(viewNormal), normalize(viewDirection))), 3.1);
        gl_FragColor = vec4(tint, edge * .48);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(atmosphere);

  const markers = points.map(point => {
    const marker = new THREE.Mesh(new THREE.SphereGeometry(.024, 14, 10), new THREE.MeshBasicMaterial({ color: 0x7b9a8c }));
    marker.position.copy(point).multiplyScalar(1.025);
    scene.add(marker);
    return marker;
  });

  const legs = points.slice(1).map((point, i) => {
    const samples = Array.from({ length: 51 }, (_, n) => {
      const t = n / 50;
      return interpolate(points[i], point, t).multiplyScalar(1.025 + Math.sin(Math.PI * t) * .13);
    });
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(samples), new THREE.LineBasicMaterial({ color: 0x669a86, transparent: true, opacity: .55 }));
    scene.add(line);
    return line;
  });

  const ring = new THREE.Mesh(new THREE.RingGeometry(.035, .043, 32), new THREE.MeshBasicMaterial({
    color: 0xd5ec87, side: THREE.DoubleSide, transparent: true, depthWrite: false
  }));
  scene.add(ring);

  function update(next) {
    if (next.index !== state.index || ["intro", "travel", "results"].includes(next.phase) && next.phase !== state.phase) {
      from = current.clone();
      target = next.phase === "intro" || next.phase === "results" ? center : points[next.index];
      movedAt = performance.now();
    }
    if (next.cue) {
      pulseAt = performance.now();
      pulseStop = next.index;
      ring.material.color.set(next.cue === "rare" ? 0xffa16f : 0xd5ec87);
    }
    state = next;
    markers.forEach((marker, index) => {
      const active = state.phase !== "intro" && state.phase !== "results" && index === state.index;
      marker.material.color.set(state.cleared[index] ? 0xd5ec87 : active ? 0xffad74 : 0x9bc5b0);
      marker.scale.setScalar(active ? 1.38 : 1);
    });
    legs.forEach((leg, index) => {
      const traveled = state.phase === "results" || (state.phase !== "intro" && index < state.index);
      leg.material.color.set(traveled ? 0xd5ec87 : 0x73b5a1);
      leg.material.opacity = traveled ? .94 : .46;
    });
  }

  new ResizeObserver(() => {
    const { clientWidth: width, clientHeight: height } = viewport;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }).observe(viewport);

  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(viewport);

  renderer.domElement.addEventListener("webglcontextlost", event => {
    event.preventDefault();
    panel.classList.remove("earth-ready");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => panel.classList.add("earth-ready"));

  renderer.setAnimationLoop(now => {
    if (document.hidden || !visible) return;
    const t = motion.matches ? 1 : Math.min((now - movedAt) / 980, 1);
    current = interpolate(from, target, t * t * (3 - 2 * t));
    const overview = state.phase === "intro" || state.phase === "results";
    const cameraDirection = overview && !motion.matches
      ? current.clone().applyAxisAngle(axis, Math.min((now - movedAt) / 1000, 60) * .065)
      : current;
    const distance = 3.8 * Math.max(1, .85 / camera.aspect);
    camera.position.copy(cameraDirection).multiplyScalar(distance);
    camera.lookAt(0, 0, 0);
    sun.position.copy(camera.position).add(new THREE.Vector3(1, 3, 0));
    const pulse = (now - pulseAt) / 850;
    ring.visible = !motion.matches && pulse >= 0 && pulse < 1;
    if (ring.visible) {
      const point = points[pulseStop];
      ring.position.copy(point).multiplyScalar(1.044);
      ring.quaternion.setFromUnitVectors(normal, point);
      ring.scale.setScalar(1 + pulse * 3.5);
      ring.material.opacity = (1 - pulse) * .95;
    }
    renderer.render(scene, camera);
  });

  return update;
}

function createCanvasGlobe() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) return () => {};
  viewport.prepend(canvas);
  const image = new Image();
  const size = 256;
  const sphere = document.createElement("canvas");
  sphere.width = sphere.height = size;
  const surface = sphere.getContext("2d");
  const frame = surface.createImageData(size, size);
  const pixels = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = (x + .5) * 2 / size - 1;
      const v = 1 - (y + .5) * 2 / size;
      if (u * u + v * v >= 1) continue;
      const depth = Math.sqrt(1 - u * u - v * v);
      pixels.push({ u, v, depth, offset: (y * size + x) * 4, light: .70 + Math.max(0, -.24 * u + .43 * v + .85 * depth) * .48 });
    }
  }

  const center = position(24, -40);
  const axis = new THREE.Vector3(0, 1, 0);
  const points = stops.map(stop => position(stop.lat, stop.lon));
  const legs = points.slice(1).map((point, index) => Array.from({ length: 51 }, (_, step) => {
    const t = step / 50;
    return interpolate(points[index], point, t).multiplyScalar(1.014 + Math.sin(t * Math.PI) * .11);
  }));

  let state = { phase: "intro", index: 0, cleared: [] };
  let from = center.clone();
  let current = center.clone();
  let target = center.clone();
  let changedAt = performance.now();
  let pulsedAt = -Infinity;
  let pulseColor = "#d5ec87";
  let texture;
  let redraw = true;
  let visible = true;
  let lastFrame = 0;

  image.onload = () => {
    const map = document.createElement("canvas");
    map.width = image.width;
    map.height = image.height;
    const mapContext = map.getContext("2d", { willReadFrequently: true });
    mapContext.drawImage(image, 0, 0);
    texture = mapContext.getImageData(0, 0, map.width, map.height);
    panel.classList.add("earth-ready");
    redraw = true;
  };
  image.src = new URL("./globe/earth.webp", import.meta.url).href;

  new ResizeObserver(() => {
    const scale = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(viewport.clientWidth * scale);
    canvas.height = Math.round(viewport.clientHeight * scale);
    redraw = true;
  }).observe(viewport);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; redraw = true; }).observe(viewport);
  motion.addEventListener("change", () => { redraw = true; });

  function draw(now) {
    requestAnimationFrame(draw);
    if (!visible || !texture || document.hidden || !canvas.width || now - lastFrame < 33) return;
    const overview = state.phase === "intro" || state.phase === "results";
    const t = motion.matches ? 1 : Math.min((now - changedAt) / 980, 1);
    const pulse = (now - pulsedAt) / 850;
    const orbiting = overview && !motion.matches && now - changedAt < 60000;
    const pulsing = !motion.matches && pulse >= 0 && pulse < 1;
    if (!redraw && t === 1 && !orbiting && !pulsing) return;
    redraw = t < 1 || pulsing || orbiting;
    lastFrame = now;
    current = interpolate(from, target, t * t * (3 - 2 * t));
    const forward = orbiting ? current.clone().applyAxisAngle(axis, (now - changedAt) * .000065) : current;
    const right = axis.clone().cross(forward).normalize();
    const up = forward.clone().cross(right).normalize();
    const { width, height, data } = texture;

    for (const { u, v, depth, offset, light } of pixels) {
      const x = right.x * u + up.x * v + forward.x * depth;
      const y = up.y * v + forward.y * depth;
      const z = right.z * u + up.z * v + forward.z * depth;
      const lon = Math.atan2(-z, x);
      const lat = Math.asin(Math.max(-1, Math.min(1, y)));
      const tx = Math.min(width - 1, Math.floor((lon / (2 * Math.PI) + .5) * width));
      const ty = Math.min(height - 1, Math.floor((.5 - lat / Math.PI) * height));
      const sample = (ty * width + tx) * 4;
      frame.data[offset] = data[sample] * light;
      frame.data[offset + 1] = data[sample + 1] * light;
      frame.data[offset + 2] = data[sample + 2] * light;
      frame.data[offset + 3] = 255;
    }
    surface.putImageData(frame, 0, 0);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx * .82, cy * .83);
    context.clearRect(0, 0, canvas.width, canvas.height);
    const glow = context.createRadialGradient(cx, cy, radius * .94, cx, cy, radius * 1.14);
    glow.addColorStop(0, "#69dab488");
    glow.addColorStop(1, "#69dab400");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(sphere, cx - radius, cy - radius, radius * 2, radius * 2);
    context.beginPath();
    context.arc(cx, cy, radius, 0, Math.PI * 2);
    context.strokeStyle = "#8adfbc91";
    context.lineWidth = 1;
    context.stroke();

    const project = point => [cx + point.dot(right) * radius, cy - point.dot(up) * radius, point.dot(forward)];
    legs.forEach((leg, index) => {
      context.beginPath();
      let pen = false;
      for (const point of leg) {
        const [x, y, z] = project(point);
        const outside = Math.hypot(x - cx, y - cy) > radius;
        if (z < 0 && !outside) { pen = false; continue; }
        if (pen) context.lineTo(x, y);
        else context.moveTo(x, y);
        pen = true;
      }
      const traveled = state.phase === "results" || (state.phase !== "intro" && index < state.index);
      context.strokeStyle = traveled ? "#d5ec87" : "#84cdb491";
      context.lineWidth = traveled ? 1.8 : 1.15;
      context.setLineDash(traveled ? [] : [3, 4]);
      context.stroke();
    });
    context.setLineDash([]);

    points.forEach((point, index) => {
      const [x, y, z] = project(point);
      if (z <= 0) return;
      const active = !overview && index === state.index;
      context.beginPath();
      context.arc(x, y, active ? 5 : 3.5, 0, Math.PI * 2);
      context.fillStyle = state.cleared[index] ? "#d5ec87" : active ? "#ffad74" : "#d7fae9";
      context.fill();
      if (!active || !pulsing) return;
      context.beginPath();
      context.arc(x, y, 7 + 23 * pulse, 0, Math.PI * 2);
      context.strokeStyle = pulseColor;
      context.globalAlpha = 1 - pulse;
      context.stroke();
      context.globalAlpha = 1;
    });
  }
  requestAnimationFrame(draw);
  return next => {
    if (next.index !== state.index || ["intro", "travel", "results"].includes(next.phase) && next.phase !== state.phase) {
      from = current.clone();
      target = next.phase === "intro" || next.phase === "results" ? center : points[next.index];
      changedAt = performance.now();
    }
    if (next.cue) {
      pulsedAt = performance.now();
      pulseColor = next.cue === "rare" ? "#ffa16f" : "#d5ec87";
    }
    state = next;
    redraw = true;
  };
}

let update;
try { update = createGlobe(); }
catch { update = createCanvasGlobe(); }
window.addEventListener("built-world-route", event => update(event.detail));
if (window.builtWorldRoute) update(window.builtWorldRoute);
