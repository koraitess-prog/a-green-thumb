let plant;
let holding = false;
let holdThickness = 1;
let katsumiFont;
let fullTitle = "GREEN THUMB";
let titleStartTime;
const TYPE_SPEED = 65;
let currentGrowthPerFrame = 2;
let paperTexture;
let vibInterval = null;
let holdStartTime = 0;

const CONFIG = {
  get buttonRadius() {
    return max(52, min(72, windowWidth * 0.09));
  },
  growthMax: 24,
  growthAcceleration: 0.5,
  rewindPerFrame: 150,
  maxBranches: 11000,
  maxTips: 10000,
  baseStep: 30,
  minBranchWidth: 0.010,
  maxBranchWidth: 3,
  splitChance: 0.20,
  leafChance: 0.5,
  leafSize: 12,
  thickenSpeed: 220,
  thickenMax: 1.7,
  thickenDelay: 10,
  thickenRamp: 0.001
};

const PALETTE = {
  bg: "#FDFCF6",
  button: "#183000",
  buttonHover: "#2F510D",
  buttonPressed: "#1E3803",
  buttonRing: "#315d06",
  stemA: "#2D4B05",
  stemB: "#3C5918",
  leafA: "#618F00",
  leafB: "#214B07"
};

function preload() {
  katsumiFont = loadFont('KATSUMI.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  createPaperTexture();
  angleMode(RADIANS);
  smooth();
  plant = new PlantSystem();
  titleStartTime = millis();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopVibration();
  });
}

function draw() {
  background(PALETTE.bg);
  image(paperTexture, 0, 0);

  plant.update();
  plant.display();

  drawTitle();
  drawCenterButton();
}

// ─── Title ───────────────────────────────────────────────────────────────────

function drawTitle() {
  push();
  textAlign(CENTER, CENTER);
  textFont(katsumiFont);
  textStyle(NORMAL);
  noStroke();
  fill('#254600');

  let elapsed = millis() - titleStartTime;
  let charCount = floor(elapsed / TYPE_SPEED);
  let typedText = fullTitle.substring(0, charCount);

  let s = min(width * 0.36, height * 0.17, 138);
  textSize(s);
  textLeading(s * 0.86);

  let titleCY = height * 0.24;
  text(typedText, width / 2, titleCY);

  if (frameCount % 30 < 15 && charCount < fullTitle.length) {
    let lines = typedText.split("\n");
    let currentLine = lines[lines.length - 1];
    let lineIndex = lines.length - 1;
    let cursorX = width / 2 + textWidth(currentLine) / 2 + 7;
    let lineOffsetY = lineIndex * s * 0.86;
    let cursorCY = titleCY - (s * 0.86 * 0.5) + lineOffsetY + s * 0.43;
    stroke('#254600');
    strokeWeight(2);
    line(cursorX, cursorCY - s * 0.38, cursorX, cursorCY + s * 0.12);
  }

  pop();
}

// ─── Paper texture ────────────────────────────────────────────────────────────

function createPaperTexture() {
  paperTexture = createGraphics(width, height);
  paperTexture.background(245, 242, 232);
  paperTexture.noStroke();

  for (let i = 0; i < width * height * 0.015; i++) {
    let x = random(width);
    let y = random(height);
    let shade = random(120, 210);
    let alpha = random(18, 55);
    paperTexture.fill(shade, shade, shade, alpha);
    paperTexture.circle(x, y, random(0.8, 3.2));
  }

  paperTexture.strokeWeight(0.6);
  for (let i = 0; i < 1800; i++) {
    let x = random(width);
    let y = random(height);
    let len = random(10, 38);
    paperTexture.stroke(130, 125, 110, random(20, 45));
    paperTexture.line(x, y, x + len, y + random(-3, 3));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createPaperTexture();
  plant = new PlantSystem();
}

// ─── Button ───────────────────────────────────────────────────────────────────

function drawCenterButton() {
  const cx = width / 2;
  const cy = height / 1.5;
  const r = CONFIG.buttonRadius;
  const ctx = drawingContext;
  const pressed = holding;
  const hovered = !pressed && pointerInsideButton(mouseX, mouseY);
  

  const baseGreen = hovered ? "#3D5C1A" : "#344F14";

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = "transparent";

  noStroke();

  if (!pressed) {
    ctx.shadowBlur    = hovered ? 18 : 14;
    ctx.shadowOffsetX = hovered ? 5  : 4;
    ctx.shadowOffsetY = hovered ? 8  : 6;
    ctx.shadowColor   = "rgba(18, 30, 6, 0.38)";
    fill(baseGreen);
    circle(cx, cy, r * 2);

    ctx.shadowBlur    = hovered ? 16 : 12;
    ctx.shadowOffsetX = hovered ? -5 : -4;
    ctx.shadowOffsetY = hovered ? -7 : -5;
    ctx.shadowColor   = "rgba(210, 235, 175, 0.22)";
    fill(baseGreen);
    circle(cx, cy, r * 2);

    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0; ctx.shadowColor = "transparent";
    fill(baseGreen);
    circle(cx, cy, r * 2);

  } else {
    const pressedGreen = "#2A4010";
    fill(pressedGreen);
    circle(cx, cy, r * 2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    ctx.shadowBlur    = 14;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.shadowColor   = "rgba(10, 18, 3, 0.45)";
    fill(pressedGreen);
    circle(cx, cy, r * 2);

    ctx.shadowBlur    = 10;
    ctx.shadowOffsetX = -4;
    ctx.shadowOffsetY = -4;
    ctx.shadowColor   = "rgba(160, 200, 100, 0.10)";
    fill(pressedGreen);
    circle(cx, cy, r * 2);

    ctx.restore();

    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0; ctx.shadowColor = "transparent";
    fill(pressedGreen);
    circle(cx, cy, r * 1.92);
  }

  // ── FIX: always reset shadow state when done so nothing else inherits it ──
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = "transparent";
    push();
  textAlign(CENTER, CENTER);
  textFont(katsumiFont);
  textSize(r * 0.34);
  noStroke();
  fill(245, 242, 232, pressed ? 210 : 235);
  text("HOLD", cx, cy + (pressed ? 1.5 : 0));
  pop();
}

function pointerInsideButton(px, py) {
  return dist(px, py, width / 2, height / 1.5) <= CONFIG.buttonRadius;
}

// ─── Vibration ────────────────────────────────────────────────────────────────

function startVibration() {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  if (vibInterval !== null) { clearInterval(vibInterval); vibInterval = null; }
  navigator.vibrate(25);
  vibInterval = setInterval(() => { navigator.vibrate(200); }, 300);
}

function stopVibration() {
  if (vibInterval !== null) { clearInterval(vibInterval); vibInterval = null; }
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(0);
  }
}

// ─── Interaction ──────────────────────────────────────────────────────────────

function startHolding(px, py) {
  if (!pointerInsideButton(px, py)) return false;
  if (holding) return true;
  holding = true;
  holdStartTime = millis();
  currentGrowthPerFrame = 5;
  plant.restart();
  startVibration();
  return true;
}

function stopHolding() {
  if (!holding) return;
  holding = false;
  stopVibration();
}

function mousePressed()  { startHolding(mouseX, mouseY); }
function mouseReleased() { stopHolding(); }

function touchStarted() {
  if (touches.length > 0) startHolding(touches[0].x, touches[0].y);
  return false;
}
function touchEnded() {
  if (touches.length === 0) stopHolding();
  return false;
}

// ─── Plant system ─────────────────────────────────────────────────────────────

class PlantSystem {
  constructor() {
    // Offscreen buffer — stable (fully aged) segments are drawn here once
    // and never redrawn, saving thousands of draw calls per frame.
    this.plantBuffer = createGraphics(width, height);
    this.plantBuffer.clear();
    this.segBufPtr       = 0;     // next index in this.segments to cache
    this.bufferDirty     = false; // true after a rewind — buffer must be rebuilt
    this.lastRenderedCount = 0;
    this.restart();
  }

  restart() {
    this.cx = width / 2;
    this.cy = height / 1.5;
    this.segments = [];
    this.leaves   = [];
    this.tips     = [];
    this.visibleCount  = 0;
    this.totalCreated  = 0;
    this.colonySpawnTimer = 0; // ← FIX: missing reset caused wrong colony timing on re-press
    currentGrowthPerFrame = 5;

    // Full buffer reset on every restart
    this.plantBuffer.clear();
    this.segBufPtr     = 0;
    this.bufferDirty   = false;
    this.lastRenderedCount = 0;

    let starters = int(random(6, 10));
    for (let i = 0; i < starters; i++) {
      let a = map(i, 0, starters, 0, TWO_PI) + random(-0.2, 0.2);
      this.tips.push(this.makeTip(this.cx, this.cy, a, random(3.5, 5.5), 0));
    }
  }

  makeTip(x, y, angle, widthValue, depth) {
    return {
      x, y, angle,
      width: widthValue,
      depth,
      life: int(random(500, 1100)),
      wiggleSeed: random(10)
    };
  }

  spawnEdgeColony() {
    let edge = floor(random(4));
    let ox, oy, baseAngle;
    if (edge === 0) {
      ox = random(width);  oy = random(-20, 20);
      baseAngle = random(PI * 0.1, PI * 0.9);
    } else if (edge === 1) {
      ox = random(width - 20, width + 20);  oy = random(height);
      baseAngle = random(PI * 0.6, PI * 1.4);
    } else if (edge === 2) {
      ox = random(width);  oy = random(height - 20, height + 20);
      baseAngle = random(PI * 1.1, PI * 1.9);
    } else {
      ox = random(-20, 20);  oy = random(height);
      baseAngle = random(-PI * 0.4, PI * 0.4);
    }
    let count = int(random(3, 7));
    for (let i = 0; i < count; i++) {
      this.tips.push(this.makeTip(ox, oy, baseAngle + random(-0.6, 0.6), random(2.5, 4.5), 0));
    }
  }

  spawnInteriorColony() {
    let ox = random(width * 0.1, width * 0.9);
    let oy = random(height * 0.1, height * 0.9);
    let count = int(random(4, 8));
    for (let i = 0; i < count; i++) {
      this.tips.push(this.makeTip(ox, oy, random(TWO_PI), random(2.0, 4.0), 1));
    }
  }

  nextOrder() { return this.totalCreated++; }

  update() {
    if (holding) {
      let holdSeconds = (millis() - holdStartTime) / 1000;

      currentGrowthPerFrame = min(CONFIG.growthMax, currentGrowthPerFrame + CONFIG.growthAcceleration);

      let steps = floor(currentGrowthPerFrame);
      if (random() < (currentGrowthPerFrame - steps)) steps++;
      for (let i = 0; i < steps; i++) this.growStep();

      this.visibleCount = min(this.totalCreated, this.visibleCount + currentGrowthPerFrame * 1.25);

      this.colonySpawnTimer++;
      let edgeInterval     = max(4,  floor(map(holdSeconds,  2, 10, 80, 10)));
      let interiorInterval = max(6,  floor(map(holdSeconds,  5, 15, 60,  8)));

      if (holdSeconds > 2 && this.colonySpawnTimer % edgeInterval === 0) {
        let bursts = holdSeconds > 6 ? int(random(2, 4)) : 1;
        for (let b = 0; b < bursts; b++) this.spawnEdgeColony();
      }
      if (holdSeconds > 5 && this.colonySpawnTimer % interiorInterval === 0) {
        let bursts = holdSeconds > 10 ? int(random(2, 5)) : 1;
        for (let b = 0; b < bursts; b++) this.spawnInteriorColony();
      }
    } else {
      currentGrowthPerFrame = max(2, currentGrowthPerFrame - 0.8);
      this.visibleCount = max(0, this.visibleCount - CONFIG.rewindPerFrame);
    }
  }

  growStep() {
    if (this.tips.length === 0 || random() < 0.008) {
      let starters = int(random(2, 5));
      for (let i = 0; i < starters; i++) {
        this.tips.push(this.makeTip(this.cx, this.cy, random(TWO_PI), random(3.5, 5.5), 0));
      }
    }

    if (this.segments.length >= CONFIG.maxBranches) return;
    if (this.tips.length === 0) return;

    let newTips = [];

    for (let tip of this.tips) {
      if (tip.life <= 0 || tip.width < CONFIG.minBranchWidth) continue;

      let noiseTurn  = map(noise(tip.wiggleSeed, frameCount * 0.01), 0, 1, -0.18, 0.12);
      let driftScale = tip.depth === 0 ? 0.6 : 0.9;
      let drift      = random(-0.9, 0.9) * driftScale;
      let a          = tip.angle + noiseTurn + drift;

      let step = CONFIG.baseStep * random(0.8, 1.25) * map(tip.depth, 0, 8, 1.1, 0.7);
      let nx = tip.x + cos(a) * step;
      let ny = tip.y + sin(a) * step;

      let seg = {
        x1: tip.x, y1: tip.y, x2: nx, y2: ny,
        w1: tip.width,
        w2: tip.width * random(0.94, 0.99),
        order: this.nextOrder(),
        c1: random([PALETTE.stemA, PALETTE.stemB]),
        jitterSeed: random(1000)
      };
      this.segments.push(seg);

      if (random() < CONFIG.leafChance) this.leaves.push(this.makeLeaf(seg));

      tip.x = nx; tip.y = ny; tip.angle = a;
      tip.width *= random(0.975, 0.992);
      tip.life--;
      newTips.push(tip);

      if (random() < CONFIG.splitChance && this.tips.length + newTips.length < CONFIG.maxTips) {
        let dir = random([-1, 1]);
        newTips.push(this.makeTip(nx, ny, a + random(0.25, 0.8) * dir, tip.width * random(0.75, 0.92), tip.depth + 1));
      }
    }

    this.tips = newTips;
  }

  makeLeaf(seg) {
    let t = random(0.5, 1);
    let x = lerp(seg.x1, seg.x2, t);
    let y = lerp(seg.y1, seg.y2, t);
    let stemAngle = atan2(seg.y2 - seg.y1, seg.x2 - seg.x1);
    let side      = random([-1, 1]);
    let leafType  = random(["round", "long", "tiny", "pointed", "teardrop", "double"]);

    let len = 18, wid = 8;
    if (leafType === "round")    { len = random(12, 20); wid = random(10, 18); }
    if (leafType === "long")     { len = random(22, 38); wid = random(5,  10); }
    if (leafType === "tiny")     { len = random(8,  14); wid = random(4,   8); }
    if (leafType === "pointed")  { len = random(20, 34); wid = random(7,  12); }
    if (leafType === "teardrop") { len = random(16, 30); wid = random(8,  14); }
    if (leafType === "double")   { len = random(18, 28); wid = random(6,  12); }

    return {
      x, y, type: leafType,
      angle: stemAngle + side * random(0.35, 1.45),
      len, wid,
      curve: random(-0.18, 0.18),
      asym: random(0.85, 1.2),
      windOffset: random(TWO_PI),
      windAmount: random(0.03, 0.12),
      colorA: random([PALETTE.leafA, PALETTE.leafB]),
      order: this.nextOrder()
    };
  }

  // ── display ─────────────────────────────────────────────────────────────────
  // Strategy:
  //   • Segments older than STABLE_AGE frames are "stable" — their width and
  //     position will never change again. We draw them ONCE into plantBuffer
  //     and never touch them again (segBufPtr tracks our progress).
  //   • The "frontier" (newer segments still growing/thickening) is redrawn
  //     every frame on the main canvas as before.
  //   • Leaves are always redrawn live because they have per-frame wind animation.
  //   • During rewind, visibleCount falls. We skip the buffer and draw
  //     everything fresh (rewind is brief, perf is acceptable), then mark
  //     bufferDirty so the buffer is cleared before the next grow cycle.

  display() {
    const STABLE_AGE = CONFIG.thickenSpeed + 1;
    const isRewinding = this.visibleCount < this.lastRenderedCount - 0.5;

    if (isRewinding) {
      // ── REWIND: draw everything live, no buffer involvement ────────────────
      for (let seg of this.segments) {
        let g = constrain(this.visibleCount - seg.order, 0, 1);
        if (g > 0) this.drawSegment(seg, g);
      }
      for (let leaf of this.leaves) {
        let g = constrain(this.visibleCount - leaf.order, 0, 1);
        if (g > 0.8) this.drawLeaf(leaf);
      }
      this.bufferDirty = true; // buffer is now ahead of visibleCount — must rebuild

    } else {
      // ── GROW: use buffer for stable content ───────────────────────────────

      // Returning from a rewind: clear the buffer and restart caching from [0]
      if (this.bufferDirty) {
        this.plantBuffer.clear();
        this.segBufPtr   = 0;
        this.bufferDirty = false;
      }

      // Promote newly stable segments into the buffer.
      // "Stable" = their order is far enough behind visibleCount that
      // thicknessMul has already reached CONFIG.thickenMax and won't change.
      let stableThreshold = floor(this.visibleCount) - STABLE_AGE;
      while (
        this.segBufPtr < this.segments.length &&
        this.segments[this.segBufPtr].order < stableThreshold
      ) {
        this._cacheSegment(this.segments[this.segBufPtr]);
        this.segBufPtr++;
      }

      // Blit the stable buffer — one cheap image() call replaces thousands of line() calls
      image(this.plantBuffer, 0, 0);

      // Draw only the frontier (still-changing) segments on the main canvas
      for (let i = this.segBufPtr; i < this.segments.length; i++) {
        let seg = this.segments[i];
        let g   = constrain(this.visibleCount - seg.order, 0, 1);
        if (g > 0) this.drawSegment(seg, g);
      }

      // Leaves always live — wind animation changes every frame
      for (let leaf of this.leaves) {
        let g = constrain(this.visibleCount - leaf.order, 0, 1);
        if (g > 0.8) this.drawLeaf(leaf);
      }
    }

    this.lastRenderedCount = this.visibleCount;
  }

  // Draw one fully-aged segment into plantBuffer at its final (thickenMax) width.
  // Called at most once per segment, ever.
  _cacheSegment(seg) {
    let pb  = this.plantBuffer;
    let mul = CONFIG.thickenMax; // segment is fully aged — use final thickness

    pb.stroke(seg.c1);
    pb.strokeCap(ROUND);

    let d     = dist(seg.x1, seg.y1, seg.x2, seg.y2);
    let parts = max(2, floor(d / 2.2));

    for (let i = 0; i < parts; i++) {
      let t  = i / (parts - 1);
      let x  = lerp(seg.x1, seg.x2, t);
      let y  = lerp(seg.y1, seg.y2, t);
      let w  = lerp(seg.w1, seg.w2, t) * mul;
      let jx = map(noise(seg.jitterSeed,      t * 8), 0, 1, -0.35, 0.35);
      let jy = map(noise(seg.jitterSeed + 50, t * 8), 0, 1, -0.35, 0.35);
      pb.strokeWeight(max(0.2, w));
      pb.line(x + jx, y + jy, x + jx + 0.1, y + jy + 0.1);
    }

    pb.strokeWeight(seg.w1 * mul);
    pb.line(seg.x1, seg.y1, seg.x2, seg.y2);
  }

  drawSegment(seg, growAmount) {
    stroke(seg.c1);
    strokeCap(ROUND);

    let smoothGrow = growAmount * growAmount * (3 - 2 * growAmount);
    let xEnd = lerp(seg.x1, seg.x2, smoothGrow);
    let yEnd = lerp(seg.y1, seg.y2, smoothGrow);

    let ageOnScreen  = max(0, this.visibleCount - seg.order);
    let thicknessMul = map(ageOnScreen, 0, CONFIG.thickenSpeed, 1, CONFIG.thickenMax, true);

    let d     = dist(seg.x1, seg.y1, xEnd, yEnd);
    let parts = max(2, floor(d / 2.2));

    for (let i = 0; i < parts; i++) {
      let t  = i / (parts - 1);
      let x  = lerp(seg.x1, xEnd, t);
      let y  = lerp(seg.y1, yEnd, t);
      let w  = lerp(seg.w1, seg.w2, t) * thicknessMul;
      let jx = map(noise(seg.jitterSeed,      t * 8), 0, 1, -0.35, 0.35);
      let jy = map(noise(seg.jitterSeed + 50, t * 8), 0, 1, -0.35, 0.35);
      strokeWeight(max(0.2, w));
      line(x + jx, y + jy, x + jx + 0.1, y + jy + 0.1);
    }

    strokeWeight(seg.w1 * thicknessMul);
    line(seg.x1, seg.y1, xEnd, yEnd);
  }

  drawLeaf(leaf) {
    push();
    translate(leaf.x, leaf.y);
    let wind = sin(frameCount * 0.03 + leaf.windOffset) * leaf.windAmount;
    rotate(leaf.angle + wind + leaf.curve);

    let c = color(leaf.colorA);
    noStroke();
    fill(red(c), green(c), blue(c), 155);

    if (leaf.type === "round") {
      ellipse(leaf.len * 0.35, 0, leaf.len * 0.85, leaf.wid * 1.15);
    }
    if (leaf.type === "long") {
      beginShape();
      vertex(0, 0);
      bezierVertex(leaf.len*0.28, -leaf.wid*0.9,  leaf.len*0.8, -leaf.wid*0.25, leaf.len, 0);
      bezierVertex(leaf.len*0.8,   leaf.wid*0.25, leaf.len*0.28, leaf.wid*0.9,  0, 0);
      endShape(CLOSE);
    }
    if (leaf.type === "tiny") {
      ellipse(leaf.len * 0.25, 0, leaf.len * 0.55, leaf.wid * 0.8);
      ellipse(leaf.len * 0.55, 0, leaf.len * 0.4,  leaf.wid * 0.55);
    }
    if (leaf.type === "pointed") {
      beginShape();
      vertex(0, 0);
      bezierVertex(leaf.len*0.22, -leaf.wid*leaf.asym, leaf.len*0.78, -leaf.wid*0.18, leaf.len, 0);
      bezierVertex(leaf.len*0.78,  leaf.wid*0.18,      leaf.len*0.22,  leaf.wid*leaf.asym, 0, 0);
      endShape(CLOSE);
    }
    if (leaf.type === "teardrop") {
      beginShape();
      vertex(0, 0);
      bezierVertex(leaf.len*0.16, -leaf.wid*0.95, leaf.len*0.55, -leaf.wid*0.75, leaf.len*0.9, 0);
      bezierVertex(leaf.len*0.55,  leaf.wid*0.75, leaf.len*0.16,  leaf.wid*0.95, 0, 0);
      endShape(CLOSE);
    }
    if (leaf.type === "double") {
      ellipse(leaf.len*0.22, -leaf.wid*0.18, leaf.len*0.55, leaf.wid*0.85);
      ellipse(leaf.len*0.22,  leaf.wid*0.18, leaf.len*0.55, leaf.wid*0.85);
      ellipse(leaf.len*0.62,  0,             leaf.len*0.45, leaf.wid*0.6);
    }

    stroke(255, 255, 255, 40);
    strokeWeight(0.7);
    line(0, 0, leaf.len * 0.92, 0);
    pop();
  }
}