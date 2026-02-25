/**
 * Space Canvas - Mô phỏng bay trong không gian (PixiJS)
 * Cấu trúc: Application → layers (background, stars, nebulae, planets, asteroids)
 */

import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';

// --- Cấu hình chiếu 3D → 2D ---
const FOCAL = 600;
const DEPTH = 2200;

function project(ox, oy, z, centerX, centerY) {
  const scale = FOCAL / z;
  return {
    x: ox * scale + centerX,
    y: oy * scale + centerY,
    scale,
  };
}

// --- Tạo texture từ Canvas (gradient) ---
function createBackgroundTexture(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.8
  );
  g.addColorStop(0, 'rgba(0,6,30,0.9)');
  g.addColorStop(1, 'rgba(0,0,8,0)');
  ctx.fillStyle = '#00000a';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  return Texture.from(canvas);
}

function createPlanetTexture(bodyHex, ringHex, hasRing, size = 128) {
  const canvas = document.createElement('canvas');
  const r = size / 2;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const lighten = (hex, amt) => {
    const rr = Math.min(255, (hex >> 16) + amt);
    const gg = Math.min(255, ((hex >> 8) & 0xff) + amt);
    const bb = Math.min(255, (hex & 0xff) + amt);
    return `rgb(${rr},${gg},${bb})`;
  };
  const darken = (hex, amt) => {
    const rr = Math.max(0, (hex >> 16) - amt);
    const gg = Math.max(0, ((hex >> 8) & 0xff) - amt);
    const bb = Math.max(0, (hex & 0xff) - amt);
    return `rgb(${rr},${gg},${bb})`;
  };

  if (hasRing && ringHex) {
    ctx.save();
    ctx.translate(r, r);
    ctx.scale(1, 0.28);
    const rg = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 2.2);
    rg.addColorStop(0, `#${ringHex.toString(16).padStart(6, '0')}bb`);
    rg.addColorStop(0.5, `#${ringHex.toString(16).padStart(6, '0')}55`);
    rg.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.restore();
  }

  const pg = ctx.createRadialGradient(r - r * 0.3, r - r * 0.3, 0, r, r, r);
  pg.addColorStop(0, lighten(bodyHex, 70));
  pg.addColorStop(0.55, `#${bodyHex.toString(16).padStart(6, '0')}`);
  pg.addColorStop(1, darken(bodyHex, 50));
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fillStyle = pg;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.globalAlpha = 0.12;
  for (let band = 0; band < 3; band++) {
    const by = r + (band - 1) * r * 0.55;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, by - r * 0.09, size, r * 0.18);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  const atm = ctx.createRadialGradient(r, r, r * 0.75, r, r, r * 1.4);
  atm.addColorStop(0, 'transparent');
  atm.addColorStop(1, `#${bodyHex.toString(16).padStart(6, '0')}44`);
  ctx.beginPath();
  ctx.arc(r, r, r * 1.4, 0, Math.PI * 2);
  ctx.fillStyle = atm;
  ctx.fill();

  return Texture.from(canvas);
}

function createNebulaTexture(r, g, b, size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const half = size / 2;
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, half);
  grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
  grad.addColorStop(0.4, `rgba(${r},${g},${b},0.30)`);
  grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.save();
  ctx.translate(half, half);
  ctx.scale(1, 0.4);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(0, 0, half, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return Texture.from(canvas);
}

// --- Dữ liệu và factory ---
const PLANET_CONFIGS = [
  { body: 0x3a6bbf, ring: 0x5588ee, hasRing: true },
  { body: 0xbf6a3a, ring: null, hasRing: false },
  { body: 0x3abf88, ring: null, hasRing: false },
  { body: 0xa03abf, ring: 0xcc66ff, hasRing: true },
  { body: 0xbf3a55, ring: null, hasRing: false },
];

const NEBULA_COLORS = [
  [80, 0, 220], [220, 30, 80], [0, 160, 220], [160, 80, 220], [40, 210, 150],
];

function createStar() {
  return {
    ox: (Math.random() - 0.5) * DEPTH * 1.4,
    oy: (Math.random() - 0.5) * DEPTH * 1.4,
    z: Math.random() * DEPTH + 60,
    pz: 0,
    size: Math.random() * 1.8 + 0.3,
    hue: Math.random() < 0.15 ? (Math.random() < 0.5 ? 200 : 40) : 0,
  };
}

function createPlanetData() {
  const cfg = PLANET_CONFIGS[Math.floor(Math.random() * PLANET_CONFIGS.length)];
  const angle = Math.random() * Math.PI * 2;
  const spread = 300 + Math.random() * 500;
  return {
    ox: Math.cos(angle) * spread,
    oy: Math.sin(angle) * spread,
    z: DEPTH * (0.7 + Math.random() * 0.3),
    baseR: 45 + Math.random() * 80,
    ...cfg,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.003,
  };
}

function createAsteroidData() {
  const angle = Math.random() * Math.PI * 2;
  const spread = 80 + Math.random() * 600;
  const verts = 7 + Math.floor(Math.random() * 5);
  const shape = [];
  for (let i = 0; i < verts; i++) shape.push(0.55 + Math.random() * 0.45);
  return {
    ox: Math.cos(angle) * spread,
    oy: Math.sin(angle) * spread,
    z: DEPTH * (0.5 + Math.random() * 0.5),
    baseR: 8 + Math.random() * 22,
    rot: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.025,
    shape,
    verts,
  };
}

function createNebulaData() {
  const angle = Math.random() * Math.PI * 2;
  const spread = 100 + Math.random() * 500;
  const [r, g, b] = NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)];
  return {
    ox: Math.cos(angle) * spread,
    oy: Math.sin(angle) * spread,
    z: DEPTH * (0.55 + Math.random() * 0.4),
    baseW: 260 + Math.random() * 300,
    baseH: 80 + Math.random() * 120,
    r, g, b,
    angle: Math.random() * Math.PI,
    alpha: 0,
    maxAlpha: 0.1 + Math.random() * 0.12,
    life: 0,
    maxLife: 400 + Math.random() * 300,
  };
}

// --- Màu sao theo hue (hex + alpha 0-1) ---
function getStarFill(hue, alpha) {
  const a = Math.min(1, alpha);
  if (hue === 200) return { color: 0xb4d2ff, alpha: a };
  if (hue === 40) return { color: 0xffe6a0, alpha: a };
  return { color: 0xffffff, alpha: a };
}

// --- State ---
let app = null;
let speed = 5;
const stars = [];
const planets = [];
const asteroids = [];
const nebulae = [];
let backgroundSprite = null;
let starsGraphics = null;
let planetTextures = null;
/** true khi dùng ảnh universe-bg.jpg làm nền */
let useImageBackground = false;

const STAR_COUNT = 480;
const UNIVERSE_BG_URL = '/universe-bg.jpg';
/** Nền ảnh phóng to thêm để khi nghiêng không lộ góc; animation nghiêng ± độ */
const BG_OVERSCALE = 1.15;
const BG_TILT_DEG = 2.2;
const BG_TILT_PERIOD_MS = 12000;
let bgTiltTime = 0;

/** Scale sprite ảnh nền để cover viewport, hơi to hơn (BG_OVERSCALE) để có chỗ nghiêng nhẹ */
function setBackgroundCover() {
  if (!app || !backgroundSprite || !backgroundSprite.texture) return;
  const w = app.screen.width;
  const h = app.screen.height;
  const tex = backgroundSprite.texture;
  const tw = tex.width;
  const th = tex.height;
  if (tw <= 0 || th <= 0) return;
  const scale = Math.max(w / tw, h / th) * BG_OVERSCALE;
  backgroundSprite.anchor.set(0.5);
  backgroundSprite.position.set(w / 2, h / 2);
  backgroundSprite.width = tw * scale;
  backgroundSprite.height = th * scale;
}

function resize() {
  if (!app) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  app.renderer.resize(w, h);
  if (backgroundSprite) {
    if (useImageBackground) {
      setBackgroundCover();
    } else {
      backgroundSprite.anchor.set(0, 0);
      backgroundSprite.position.set(0, 0);
      backgroundSprite.texture = createBackgroundTexture(w, h);
      backgroundSprite.width = w;
      backgroundSprite.height = h;
    }
  }
}

function drawStars(centerX, centerY) {
  starsGraphics.clear();
  for (const s of stars) {
    s.pz = s.z;
    s.z -= speed;
    if (s.z <= 10) {
      const a = Math.random() * Math.PI * 2;
      const d = 80 + Math.random() * 700;
      s.ox = Math.cos(a) * d;
      s.oy = Math.sin(a) * d;
      s.z = DEPTH;
      s.pz = DEPTH;
    }
    const cur = project(s.ox, s.oy, s.z, centerX, centerY);
    const prv = project(s.ox, s.oy, s.pz, centerX, centerY);
    if (cur.x < -10 || cur.x > app.screen.width + 10 || cur.y < -10 || cur.y > app.screen.height + 10) continue;
    const depth01 = 1 - s.z / DEPTH;
    const sz = Math.max(0.2, depth01 * 2.8 * s.size);
    const bright = depth01;
    const streakLen = Math.hypot(cur.x - prv.x, cur.y - prv.y);
    if (streakLen > 1.5) {
      const alpha = Math.min(1, bright * 0.8);
      starsGraphics.lineStyle({ width: Math.max(0.3, sz * 0.45), color: 0xffffff, alpha });
      starsGraphics.moveTo(prv.x, prv.y);
      starsGraphics.lineTo(cur.x, cur.y);
    } else {
      const fill = getStarFill(s.hue, Math.min(1, 0.3 + bright * 0.9));
      starsGraphics.beginFill(fill.color, fill.alpha);
      starsGraphics.drawCircle(cur.x, cur.y, sz);
      starsGraphics.endFill();
    }
  }
}

function updatePlanets(centerX, centerY) {
  if (Math.random() < 0.001 && planets.length < 3) {
    const data = createPlanetData();
    const key = `${data.body}-${data.hasRing ? data.ring : 'n'}`;
    if (!planetTextures[key]) {
      planetTextures[key] = createPlanetTexture(data.body, data.ring || 0, data.hasRing);
    }
    const sprite = new Sprite(planetTextures[key]);
    sprite.anchor.set(0.5);
    planets.push({ data, sprite });
    app.stage.getChildByName('planets').addChild(sprite);
  }
  for (let i = planets.length - 1; i >= 0; i--) {
    const { data, sprite } = planets[i];
    data.z -= speed * 0.55;
    data.rot += data.rotSpeed;
    if (data.z <= 10) {
      app.stage.getChildByName('planets').removeChild(sprite);
      sprite.destroy();
      planets.splice(i, 1);
      continue;
    }
    const cur = project(data.ox, data.oy, data.z, centerX, centerY);
    const r = data.baseR * (FOCAL / data.z);
    const depth01 = 1 - data.z / DEPTH;
    const fadeIn = Math.min(1, depth01 * 6);
    if (fadeIn < 0.01) continue;
    sprite.position.set(cur.x, cur.y);
    sprite.scale.set(r / 64);
    sprite.alpha = fadeIn;
  }
}

function updateAsteroids(centerX, centerY) {
  if (Math.random() < 0.008 && asteroids.length < 10) {
    const data = createAsteroidData();
    const g = new Graphics();
    asteroids.push({ data, graphics: g });
    app.stage.getChildByName('asteroids').addChild(g);
  }
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const { data, graphics } = asteroids[i];
    data.z -= speed * 1.3;
    data.rot += data.rotSpeed;
    if (data.z <= 10) {
      app.stage.getChildByName('asteroids').removeChild(graphics);
      graphics.destroy();
      asteroids.splice(i, 1);
      continue;
    }
    const cur = project(data.ox, data.oy, data.z, centerX, centerY);
    const r = data.baseR * (FOCAL / data.z);
    const depth01 = 1 - data.z / DEPTH;
    const fadeIn = Math.min(1, depth01 * 8);
    if (fadeIn < 0.01) continue;

    graphics.clear();
    graphics.position.set(cur.x, cur.y);
    graphics.rotation = data.rot;
    graphics.alpha = fadeIn;

    // Trail (local coords: từ previous đến current)
    if (depth01 > 0.4 && speed > 3) {
      const prv = project(data.ox, data.oy, data.z + speed * 4, centerX, centerY);
      graphics.lineStyle({ width: Math.max(0.5, r * 0.6), color: 0xb4a08c, alpha: fadeIn * 0.4 });
      graphics.moveTo(prv.x - cur.x, prv.y - cur.y);
      graphics.lineTo(0, 0);
    }

    // Polygon body (fill + stroke)
    const path = [];
    for (let j = 0; j < data.verts; j++) {
      const ang = (j / data.verts) * Math.PI * 2;
      path.push(Math.cos(ang) * r * data.shape[j], Math.sin(ang) * r * data.shape[j]);
    }
    graphics.lineStyle({ width: 0.6, color: 0xc8c8c8, alpha: 0.25 });
    graphics.beginFill(0x9a9a9a);
    graphics.drawPolygon(path);
    graphics.endFill();
    graphics.lineStyle(0);

    // Craters
    graphics.beginFill(0x111111, 0.35);
    graphics.drawCircle(r * 0.25, -r * 0.2, r * 0.18);
    graphics.drawCircle(-r * 0.3, r * 0.15, r * 0.12);
    graphics.endFill();
  }
}

function trySpawnNebula() {
  if (nebulae.length >= 2 || Math.random() > 0.004) return;
  const data = createNebulaData();
  const tex = createNebulaTexture(data.r, data.g, data.b);
  const sprite = new Sprite(tex);
  sprite.anchor.set(0.5);
  nebulae.push({ data, sprite });
  app.stage.getChildByName('nebulae').addChild(sprite);
}

function updateNebulae(centerX, centerY) {
  trySpawnNebula();
  for (let i = nebulae.length - 1; i >= 0; i--) {
    const { data, sprite } = nebulae[i];
    data.z -= speed * 0.35;
    data.life++;
    const life01 = data.life / data.maxLife;
    if (life01 >= 1 || data.z <= 30) {
      app.stage.getChildByName('nebulae').removeChild(sprite);
      sprite.destroy();
      nebulae.splice(i, 1);
      continue;
    }
    const fadeIn = Math.min(1, life01 * 5);
    const fadeOut = Math.min(1, (1 - life01) * 5);
    data.alpha += (data.maxAlpha - data.alpha) * 0.02;
    const cur = project(data.ox, data.oy, data.z, centerX, centerY);
    if (cur.x < -data.baseW || cur.x > app.screen.width + data.baseW ||
        cur.y < -data.baseH || cur.y > app.screen.height + data.baseH) continue;
    const scl = FOCAL / data.z;
    sprite.position.set(cur.x, cur.y);
    sprite.scale.set((data.baseW * scl) / 256, (data.baseH * scl) / 256);
    sprite.rotation = data.angle;
    sprite.alpha = data.alpha * fadeIn * fadeOut;
  }
}

function tick(ticker) {
  const centerX = app.screen.width / 2;
  const centerY = app.screen.height / 2;
  if (useImageBackground && backgroundSprite) {
    const dt = ticker?.deltaTime ?? 16.67;
    bgTiltTime += dt;
    const t = (bgTiltTime / BG_TILT_PERIOD_MS) * Math.PI * 2;
    backgroundSprite.rotation = (Math.sin(t) * BG_TILT_DEG * Math.PI) / 180;
  }
  drawStars(centerX, centerY);
  updateNebulae(centerX, centerY);
  updatePlanets(centerX, centerY);
  updateAsteroids(centerX, centerY);
}

export function startSpaceCanvas() {
  const canvas = document.getElementById('spaceCanvas');
  if (!canvas) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  app = new Application({
    view: canvas,
    width: w,
    height: h,
    backgroundAlpha: 0,
  });

  app.stage.sortableChildren = true;

  const bg = new Container();
  bg.name = 'background';
  bg.zIndex = 0;
  const neb = new Container();
  neb.name = 'nebulae';
  neb.zIndex = 1;
  const starLayer = new Container();
  starLayer.name = 'stars';
  starLayer.zIndex = 2;
  const plan = new Container();
  plan.name = 'planets';
  plan.zIndex = 3;
  const ast = new Container();
  ast.name = 'asteroids';
  ast.zIndex = 4;

  app.stage.addChild(bg);
  app.stage.addChild(neb);
  app.stage.addChild(starLayer);
  app.stage.addChild(plan);
  app.stage.addChild(ast);

  backgroundSprite = new Sprite(createBackgroundTexture(w, h));
  backgroundSprite.width = w;
  backgroundSprite.height = h;
  bg.addChild(backgroundSprite);

  const imageTexture = Texture.from(UNIVERSE_BG_URL);
  const applyImageBg = () => {
    useImageBackground = true;
    backgroundSprite.texture = imageTexture;
    setBackgroundCover();
  };
  imageTexture.baseTexture.once('loaded', applyImageBg);
  imageTexture.baseTexture.once('error', () => { useImageBackground = false; });
  if (imageTexture.baseTexture.valid) applyImageBg();

  starsGraphics = new Graphics();
  starLayer.addChild(starsGraphics);

  planetTextures = {};
  for (let i = 0; i < 2; i++) {
    const data = createPlanetData();
    const key = `${data.body}-${data.hasRing ? data.ring : 'n'}`;
    if (!planetTextures[key]) {
      planetTextures[key] = createPlanetTexture(data.body, data.ring || 0, data.hasRing);
    }
    const sprite = new Sprite(planetTextures[key]);
    sprite.anchor.set(0.5);
    planets.push({ data, sprite });
    plan.addChild(sprite);
  }
  for (let i = 0; i < 6; i++) {
    const data = createAsteroidData();
    const g = new Graphics();
    asteroids.push({ data, graphics: g });
    ast.addChild(g);
  }
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(createStar());
  }

  window.addEventListener('resize', resize);
  app.ticker.add(tick);
}

export function setSpaceSpeed(value) {
  speed = value;
}

export function getSpaceSpeed() {
  return speed;
}
