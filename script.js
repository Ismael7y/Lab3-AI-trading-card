// Find the card on the page
const card = document.getElementById("card");

// Tilt the card a little toward the mouse, like holding a real card
card.addEventListener("mousemove", (event) => {
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
});

// Straighten the card when the mouse leaves
card.addEventListener("mouseleave", () => {
  card.style.transform = "";
});

// Flip the card over when it's clicked
card.addEventListener("click", () => {
  card.classList.toggle("flipped");
});

// Let keyboard users flip it too, with Enter or Space
card.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    card.classList.toggle("flipped");
  }
});


// =====================================================================
// Cat World 1-1: a small platformer inspired by the first level of a
// classic 1985 game. All the art is drawn with code, square by square.
// =====================================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// The level is a grid of 16x16 "tiles". The screen shows 16 x 15 tiles.
const TILE = 16;
const ROWS = 15;
const COLS = 212;
const VIEW_W = 256;
const VIEW_H = 240;
const FLAG_COL = 198;
const CASTLE_DOOR_X = 204 * TILE;

// The canvas is twice as big as the game so the text looks sharp
ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);

// ---------- Sprites (pixel art) ----------
// Each letter is one pixel. "." means see-through.

const CAT_HEAD_AND_BODY = [
  "................",
  "..........k...k.",
  "..........kk.kk.",
  ".k........kkkkk.",
  ".k.......kkekekk",
  "..k......kkkpkkk",
  "..k.......wwwww.",
  "..k...kkkkkkkk..",
  "...kkkkkkkkkkk..",
  "....kkkkkkkkkk..",
  "....kkkkkkkkkk..",
  "....kkkkkkkkkk..",
];
const CAT_STEP_1 = CAT_HEAD_AND_BODY.concat([
  "....kkk.....kkk.",
  "....kk.......kk.",
  "....kk.......kk.",
  "....kk.......kk.",
]);
const CAT_STEP_2 = CAT_HEAD_AND_BODY.concat([
  ".....kkk..kkk...",
  "......kk..kk....",
  ".....kk....kk...",
  "....kk......kk..",
]);
const CAT_JUMP = CAT_HEAD_AND_BODY.concat([
  "...kkk.....kkk..",
  "..kk.........kk.",
  ".kk...........k.",
  "................",
]);
const CAT_COLORS = { k: "#111111", e: "#c6ff3d", p: "#ff8fb1", w: "#e9ecef" };

const MOUSE_TOP = [
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
  "...dd...........",
  "..dppd..........",
  "..dddmmmmmm.....",
  ".dkmmmmmmmmm....",
  "pmmmmmmmmmmmm...",
  ".mmmmmmmmmmmmd..",
  "..mmmmmmmmmmm.dd",
  "...mmmmmmmmm...d",
];
const MOUSE_STEP_1 = MOUSE_TOP.concat(["....dd...dd.....", "...dd.....dd...."]);
const MOUSE_STEP_2 = MOUSE_TOP.concat([".....dd.dd......", ".....dd.dd......"]);
const MOUSE_COLORS = { m: "#9e9e9e", d: "#5f5f5f", p: "#ff8fb1", k: "#111111" };

// Little fish for the celebration bursts
const FISH = [
  "..oooo.o",
  ".kooooo.",
  ".oooooo.",
  "..oooo.o",
];
const FISH_COLORS = ["#ff922b", "#4dabf7", "#f783ac", "#ffd43b"];

function drawSprite(rows, colors, x, y, flipX, flipY) {
  for (let r = 0; r < rows.length; r++) {
    const width = rows[r].length;
    for (let c = 0; c < width; c++) {
      const color = colors[rows[r][c]];
      if (!color) continue;
      const px = flipX ? width - 1 - c : c;
      const py = flipY ? rows.length - 1 - r : r;
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x) + px, Math.round(y) + py, 1, 1);
    }
  }
}

// ---------- Building the level ----------
// Tile letters: G ground, B brick, ? question block, U used block,
// S stair block, T/Y pipe top (left/right), p/q pipe body (left/right)

function buildLevel() {
  const grid = [];
  for (let y = 0; y < ROWS; y++) grid.push(new Array(COLS).fill(" "));
  const set = (x, y, tile) => { grid[y][x] = tile; };
  const pipe = (x, height) => {
    set(x, 13 - height, "T");
    set(x + 1, 13 - height, "Y");
    for (let y = 14 - height; y <= 12; y++) {
      set(x, y, "p");
      set(x + 1, y, "q");
    }
  };
  const stairs = (x, height) => {
    for (let i = 0; i < height; i++) set(x, 12 - i, "S");
  };

  // Ground, with three pits to jump over
  const pits = [69, 70, 86, 87, 88, 153, 154];
  for (let x = 0; x < COLS; x++) {
    if (!pits.includes(x)) {
      set(x, 13, "G");
      set(x, 14, "G");
    }
  }

  set(16, 9, "?");
  set(20, 9, "B"); set(21, 9, "?"); set(22, 9, "B"); set(23, 9, "?"); set(24, 9, "B");
  set(22, 5, "?");
  pipe(28, 2); pipe(38, 3); pipe(46, 4); pipe(57, 4);

  set(77, 9, "B"); set(78, 9, "?"); set(79, 9, "B");
  for (let x = 80; x <= 87; x++) set(x, 5, "B");
  for (let x = 91; x <= 93; x++) set(x, 5, "B");
  set(94, 5, "?"); set(94, 9, "B");
  set(100, 9, "B"); set(101, 9, "B");
  set(106, 9, "?"); set(109, 9, "?"); set(109, 5, "?"); set(112, 9, "?");
  set(118, 9, "B");
  for (let x = 121; x <= 123; x++) set(x, 5, "B");
  set(128, 5, "B"); set(129, 5, "?"); set(130, 5, "?"); set(131, 5, "B");
  set(129, 9, "B"); set(130, 9, "B");

  for (let i = 0; i < 4; i++) stairs(134 + i, i + 1);
  for (let i = 0; i < 4; i++) stairs(140 + i, 4 - i);
  for (let i = 0; i < 4; i++) stairs(148 + i, i + 1);
  stairs(152, 4);
  for (let i = 0; i < 4; i++) stairs(155 + i, 4 - i);

  pipe(163, 2);
  set(168, 9, "B"); set(169, 9, "B"); set(170, 9, "?"); set(171, 9, "B");
  pipe(179, 2);

  for (let i = 0; i < 8; i++) stairs(181 + i, i + 1);
  stairs(189, 8);
  stairs(FLAG_COL, 1);

  return grid;
}

// Where each mouse starts: [column, the row it stands on]
const MOUSE_STARTS = [
  [22, 13], [40, 13], [51, 13], [52.5, 13], [80, 5], [82, 5],
  [97, 13], [98.5, 13], [107, 13], [108.5, 13], [114, 13], [115.5, 13],
  [124, 13], [125.5, 13], [128, 13], [129.5, 13], [174, 13], [175.5, 13],
];

// ---------- Game state ----------

let level, player, mice, effects, camX, flagY;
let fishBurstsLeft = 0, fishBurstTimer = 0;
let score = 0, coins = 0, lives = 3, time = 400, timeTick = 0;
let state = "title";
let stateTimer = 0;
let frame = 0;
const keys = { left: false, right: false, jump: false, run: false };

function resetLevel() {
  level = buildLevel();
  // jumpHeld starts true so the key that started the game doesn't make the cat jump
  player = { x: 3 * TILE, y: 13 * TILE - 14, w: 12, h: 14, vx: 0, vy: 0,
             onGround: false, facing: 1, jumpHeld: true };
  mice = MOUSE_STARTS.map(([col, row]) => ({
    x: col * TILE + 1, y: row * TILE - 10, w: 14, h: 10,
    vx: -0.5, vy: 0, active: false, dead: null, timer: 0,
  }));
  effects = [];
  camX = 0;
  flagY = 3 * TILE;
  time = 400;
  timeTick = 0;
  fishBurstsLeft = 0;
  fishBurstTimer = 0;
}

function newGame() {
  score = 0;
  coins = 0;
  lives = 3;
  resetLevel();
  state = "playing";
}

function celebrationDone() {
  const stillFlying = effects.some((fx) => fx.type === "launch" || fx.type === "fish");
  return state === "clear" && time === 0 && fishBurstsLeft === 0 && !stillFlying;
}

function canStart() {
  return state === "title" || state === "gameover" || celebrationDone();
}

// ---------- Tiles and collisions ----------

function tileAt(col, row) {
  if (col < 0 || col >= COLS) return "S";
  if (row < 0 || row >= ROWS) return " ";
  return level[row][col];
}

function isSolid(col, row) {
  return tileAt(col, row) !== " ";
}

// Move sideways, then push back out of any wall we ran into
function moveX(thing) {
  thing.x += thing.vx;
  const top = Math.floor(thing.y / TILE);
  const bottom = Math.floor((thing.y + thing.h - 0.001) / TILE);
  if (thing.vx > 0) {
    const col = Math.floor((thing.x + thing.w - 0.001) / TILE);
    for (let row = top; row <= bottom; row++) {
      if (isSolid(col, row)) { thing.x = col * TILE - thing.w; thing.vx = 0; return; }
    }
  } else if (thing.vx < 0) {
    const col = Math.floor(thing.x / TILE);
    for (let row = top; row <= bottom; row++) {
      if (isSolid(col, row)) { thing.x = (col + 1) * TILE; thing.vx = 0; return; }
    }
  }
}

// Move up/down, then land on the floor or bonk on a ceiling.
// Returns the blocks that were hit from below, if any.
function moveY(thing) {
  thing.y += thing.vy;
  thing.onGround = false;
  const left = Math.floor(thing.x / TILE);
  const right = Math.floor((thing.x + thing.w - 0.001) / TILE);
  if (thing.vy > 0) {
    const row = Math.floor((thing.y + thing.h - 0.001) / TILE);
    for (let col = left; col <= right; col++) {
      if (isSolid(col, row)) {
        thing.y = row * TILE - thing.h;
        thing.vy = 0;
        thing.onGround = true;
        return null;
      }
    }
  } else if (thing.vy < 0) {
    const row = Math.floor(thing.y / TILE);
    const hitCols = [];
    for (let col = left; col <= right; col++) {
      if (isSolid(col, row)) hitCols.push(col);
    }
    if (hitCols.length > 0) {
      thing.y = (row + 1) * TILE;
      thing.vy = 0;
      return { row, cols: hitCols };
    }
  }
  return null;
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// What happens when the cat headbutts a block
function bumpBlock(hit) {
  const centerCol = Math.floor((player.x + player.w / 2) / TILE);
  const col = hit.cols.includes(centerCol) ? centerCol : hit.cols[0];
  const row = hit.row;
  const tile = tileAt(col, row);

  if (tile === "?") {
    level[row][col] = "U";
    coins++;
    score += 200;
    effects.push({ type: "coin", x: col * TILE + 4, y: row * TILE - 8, vy: -4, life: 30 });
  } else if (tile === "B") {
    level[row][col] = " ";
    score += 50;
    for (let i = 0; i < 4; i++) {
      effects.push({
        type: "debris",
        x: col * TILE + (i % 2) * 8, y: row * TILE + (i < 2 ? 0 : 8),
        vx: i % 2 ? 1.2 : -1.2, vy: i < 2 ? -5 : -3.5, life: 60,
      });
    }
  }

  // Any mouse standing on that block gets knocked away
  for (const mouse of mice) {
    const onTop = Math.abs(mouse.y + mouse.h - row * TILE) < 2;
    const above = mouse.x + mouse.w > col * TILE && mouse.x < (col + 1) * TILE;
    if (!mouse.dead && onTop && above) knockAway(mouse);
  }
}

function knockAway(mouse) {
  mouse.dead = "flip";
  mouse.vy = -3;
  score += 100;
  effects.push({ type: "text", text: "100", x: mouse.x, y: mouse.y - 8, life: 40 });
}

// ---------- Updating each frame ----------

function updatePlayer() {
  const p = player;
  const maxSpeed = keys.run ? 2.6 : 1.6;
  const accel = p.onGround ? 0.12 : 0.08;

  if (keys.left && !keys.right) {
    p.vx = Math.max(p.vx - accel, -maxSpeed);
    p.facing = -1;
  } else if (keys.right && !keys.left) {
    p.vx = Math.min(p.vx + accel, maxSpeed);
    p.facing = 1;
  } else if (p.vx > 0) {
    p.vx = Math.max(0, p.vx - 0.1);
  } else {
    p.vx = Math.min(0, p.vx + 0.1);
  }

  // Jump only on a fresh press, so holding the key doesn't bunny-hop
  if (keys.jump && !p.jumpHeld && p.onGround) p.vy = -5.6;
  p.jumpHeld = keys.jump;

  // Holding jump makes gravity weaker on the way up, for higher jumps
  const gravity = keys.jump && p.vy < 0 ? 0.18 : 0.38;
  p.vy = Math.min(p.vy + gravity, 5);

  moveX(p);
  // Like the original, you can't walk back past the left edge of the screen
  if (p.x < camX) { p.x = camX; p.vx = Math.max(p.vx, 0); }

  const hit = moveY(p);
  if (hit) bumpBlock(hit);

  if (p.y > VIEW_H) loseLife(true);
}

function updateMice() {
  for (const mouse of mice) {
    if (!mouse.active) {
      if (mouse.x < camX + VIEW_W + TILE) mouse.active = true;
      else continue;
    }
    if (mouse.dead === "squash") { mouse.timer--; continue; }
    if (mouse.dead === "flip") { mouse.vy += 0.3; mouse.y += mouse.vy; continue; }

    const direction = mouse.vx;
    moveX(mouse);
    if (mouse.vx === 0) mouse.vx = -direction;  // turn around at walls
    mouse.vy = Math.min(mouse.vy + 0.3, 4);
    moveY(mouse);
  }

  // Mice that bump into each other turn around
  for (let i = 0; i < mice.length; i++) {
    for (let j = i + 1; j < mice.length; j++) {
      const a = mice[i], b = mice[j];
      if (a.dead || b.dead || !a.active || !b.active || !overlaps(a, b)) continue;
      a.vx = a.x < b.x ? -0.5 : 0.5;
      b.vx = -a.vx;
    }
  }

  mice = mice.filter((m) => m.y < VIEW_H && !(m.dead === "squash" && m.timer <= 0));
}

function checkMouseHits() {
  for (const mouse of mice) {
    if (mouse.dead || !mouse.active || !overlaps(player, mouse)) continue;
    const landingOnTop = player.vy > 0 && player.y + player.h - mouse.y < 8;
    if (landingOnTop) {
      mouse.dead = "squash";
      mouse.timer = 30;
      player.vy = keys.jump ? -5 : -3.5;
      score += 100;
      effects.push({ type: "text", text: "100", x: mouse.x, y: mouse.y - 8, life: 40 });
    } else {
      loseLife(false);
      return;
    }
  }
}

function loseLife(fellInPit) {
  state = "dying";
  stateTimer = 150;
  player.vx = 0;
  player.vy = fellInPit ? 0 : -5;
}

// A fish burst: a fish shoots up from the castle, then pops into a ring of fish
function launchFishBurst() {
  effects.push({
    type: "launch",
    x: (201 + Math.random() * 6) * TILE,
    y: 12 * TILE,
    vy: -3.5,
    life: 30 + Math.floor(Math.random() * 15),
    colors: { o: FISH_COLORS[Math.floor(Math.random() * FISH_COLORS.length)], k: "#111111" },
  });
}

function popFishBurst(launch) {
  effects.push({ type: "flash", x: launch.x, y: launch.y, life: 10 });
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    effects.push({
      type: "fish",
      x: launch.x, y: launch.y,
      vx: Math.cos(angle) * 1.6, vy: Math.sin(angle) * 1.6,
      life: 60,
      colors: launch.colors,
    });
  }
  score += 500;
  effects.push({ type: "text", text: "500", x: launch.x - 6, y: launch.y + 12, life: 40 });
}

function updateEffects() {
  const popped = [];
  for (const fx of effects) {
    fx.life--;
    if (fx.type === "coin") { fx.y += fx.vy; fx.vy += 0.25; }
    if (fx.type === "debris") { fx.x += fx.vx; fx.y += fx.vy; fx.vy += 0.3; }
    if (fx.type === "text") fx.y -= 0.5;
    if (fx.type === "launch") {
      fx.y += fx.vy;
      if (fx.life <= 0) popped.push(fx);
    }
    if (fx.type === "fish") {
      fx.x += fx.vx;
      fx.y += fx.vy;
      fx.vx *= 0.98;
      fx.vy += 0.04;
    }
  }
  effects = effects.filter((fx) => fx.life > 0);
  popped.forEach(popFishBurst);
}

function updateCamera() {
  const target = player.x - 112;
  camX = Math.max(camX, Math.min(target, COLS * TILE - VIEW_W));
}

function update() {
  frame++;

  if (state === "playing") {
    updatePlayer();
    if (state !== "playing") return;
    updateMice();
    checkMouseHits();
    if (state !== "playing") return;

    // The game runs 60 frames a second, so this counts down once per second
    timeTick++;
    if (timeTick >= 60) {
      timeTick = 0;
      time--;
      if (time <= 0) { loseLife(false); return; }
    }

    // Touched the flagpole: the cat has to actually overlap the pole,
    // from the ball on top down to the block at the bottom
    const pole = { x: FLAG_COL * TILE + 7, y: 2 * TILE + 3, w: 2, h: 10 * TILE - 3 };
    if (overlaps(player, pole)) {
      state = "flag";
      player.x = FLAG_COL * TILE + 8 - player.w;
      player.vx = 0;
      player.vy = 0;
      const bonus = player.y < 5 * TILE ? 5000 : player.y < 8 * TILE ? 2000 : player.y < 10 * TILE ? 800 : 400;
      score += bonus;
      effects.push({ type: "text", text: String(bonus), x: player.x + 16, y: player.y, life: 60 });

      // Secret: if the timer's last two digits match (like 255 or 11),
      // that many fish bursts go off over the castle
      const ones = time % 10;
      const tens = Math.floor(time / 10) % 10;
      if (time >= 10 && ones === tens) fishBurstsLeft = ones;
    }
  } else if (state === "dying") {
    player.vy += 0.25;
    player.y += player.vy;
    stateTimer--;
    if (stateTimer <= 0) {
      lives--;
      if (lives <= 0) {
        state = "gameover";
      } else {
        resetLevel();
        state = "playing";
      }
    }
  } else if (state === "flag") {
    // Slide down the pole
    player.y = Math.min(player.y + 2, 12 * TILE - player.h);
    flagY = Math.min(flagY + 2, 11 * TILE);
    if (player.y >= 12 * TILE - player.h && flagY >= 11 * TILE) state = "walk";
  } else if (state === "walk") {
    // Walk into the castle on its own
    player.facing = 1;
    player.vx = 1.2;
    player.vy = Math.min(player.vy + 0.38, 5);
    moveX(player);
    moveY(player);
    if (player.x >= CASTLE_DOOR_X) state = "clear";
  } else if (state === "clear") {
    // Leftover time turns into points
    if (time > 0) {
      time--;
      score += 50;
    } else if (fishBurstsLeft > 0) {
      fishBurstTimer--;
      if (fishBurstTimer <= 0) {
        launchFishBurst();
        fishBurstsLeft--;
        fishBurstTimer = 40;
      }
    }
  }

  updateEffects();
  if (state === "playing" || state === "flag" || state === "walk") updateCamera();
}

// ---------- Drawing ----------

function drawText(text, x, y, size, align) {
  ctx.font = `bold ${size}px monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = "top";
  ctx.fillStyle = "#000";
  ctx.fillText(text, x + 1, y + 1);
  ctx.fillStyle = "#fff";
  ctx.fillText(text, x, y);
}

function drawBumps(x, y, sizes, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  sizes.forEach((r, i) => {
    const cx = x + i * 12;
    ctx.moveTo(cx + r, y);
    ctx.arc(cx, y, r, Math.PI, 0);
  });
  ctx.fill();
}

function drawScenery() {
  const groundY = 13 * TILE;
  // Hills
  ctx.fillStyle = "#00a800";
  for (const col of [0, 48, 96, 144, 192]) {
    ctx.beginPath();
    ctx.ellipse(col * TILE + 40, groundY, 40, 35, 0, Math.PI, 0);
    ctx.fill();
  }
  for (const col of [16, 64, 112, 160]) {
    ctx.beginPath();
    ctx.ellipse(col * TILE + 24, groundY, 24, 19, 0, Math.PI, 0);
    ctx.fill();
  }
  // Bushes
  for (const col of [11, 23, 41, 59, 71, 89, 107, 119, 137, 157, 167, 205]) {
    drawBumps(col * TILE, groundY, [8, 10, 8], "#80d010");
  }
  // Clouds
  for (const col of [8, 19, 27, 36, 56, 67, 75, 84, 104, 115, 123, 132, 152, 163, 171, 180, 200]) {
    const y = (col % 3 === 0 ? 2 : 3) * TILE;
    drawBumps(col * TILE, y + 10, [8, 11, 8], "#ffffff");
    ctx.fillRect(col * TILE - 8, y + 10, 40, 6);
  }
}

function drawBrick(x, y) {
  ctx.fillStyle = "#c84c0c";
  ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = "#fcbcb0";
  ctx.fillRect(x, y, 16, 1);
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y + 7, 16, 1);
  ctx.fillRect(x, y + 15, 16, 1);
  ctx.fillRect(x + 7, y, 1, 7);
  ctx.fillRect(x + 3, y + 8, 1, 7);
  ctx.fillRect(x + 11, y + 8, 1, 7);
}

function drawBevelBlock(x, y, color, light, dark) {
  ctx.fillStyle = dark;
  ctx.fillRect(x, y, 16, 16);
  ctx.fillStyle = light;
  ctx.fillRect(x, y, 15, 15);
  ctx.fillStyle = color;
  ctx.fillRect(x + 1, y + 1, 14, 14);
}

function drawTile(tile, x, y) {
  switch (tile) {
    case "G":
      drawBevelBlock(x, y, "#c84c0c", "#fcbcb0", "#000");
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 8, y + 1, 1, 7);
      ctx.fillRect(x + 1, y + 8, 7, 1);
      break;
    case "B":
      drawBrick(x, y);
      break;
    case "S":
      drawBevelBlock(x, y, "#c84c0c", "#fcbcb0", "#000");
      break;
    case "?": {
      const shine = Math.floor(frame / 20) % 3 === 0 ? "#fcd860" : "#f8b800";
      drawBevelBlock(x, y, shine, "#fce0a8", "#c84c0c");
      ctx.fillStyle = "#c84c0c";
      ctx.fillRect(x + 5, y + 3, 6, 2);
      ctx.fillRect(x + 10, y + 5, 2, 3);
      ctx.fillRect(x + 7, y + 8, 3, 2);
      ctx.fillRect(x + 7, y + 11, 2, 2);
      break;
    }
    case "U":
      drawBevelBlock(x, y, "#a0522d", "#c88a5a", "#000");
      break;
    case "T":
      ctx.fillStyle = "#004a00"; ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = "#00a800"; ctx.fillRect(x + 1, y + 1, 15, 14);
      ctx.fillStyle = "#80d010"; ctx.fillRect(x + 3, y + 1, 3, 14);
      break;
    case "Y":
      ctx.fillStyle = "#004a00"; ctx.fillRect(x, y, 16, 16);
      ctx.fillStyle = "#00a800"; ctx.fillRect(x, y + 1, 15, 14);
      ctx.fillStyle = "#006800"; ctx.fillRect(x + 9, y + 1, 4, 14);
      break;
    case "p":
      ctx.fillStyle = "#004a00"; ctx.fillRect(x + 2, y, 14, 16);
      ctx.fillStyle = "#00a800"; ctx.fillRect(x + 3, y, 13, 16);
      ctx.fillStyle = "#80d010"; ctx.fillRect(x + 5, y, 3, 16);
      break;
    case "q":
      ctx.fillStyle = "#004a00"; ctx.fillRect(x, y, 14, 16);
      ctx.fillStyle = "#00a800"; ctx.fillRect(x, y, 13, 16);
      ctx.fillStyle = "#006800"; ctx.fillRect(x + 7, y, 4, 16);
      break;
  }
}

function drawTiles() {
  const firstCol = Math.floor(camX / TILE);
  for (let row = 0; row < ROWS; row++) {
    for (let col = firstCol; col <= firstCol + VIEW_W / TILE + 1; col++) {
      const tile = tileAt(col, row);
      if (tile !== " ") drawTile(tile, col * TILE, row * TILE);
    }
  }
}

function drawFlagAndCastle() {
  const poleX = FLAG_COL * TILE + 7;
  ctx.fillStyle = "#80d010";
  ctx.fillRect(poleX, 2 * TILE + 8, 2, 10 * TILE - 8);
  ctx.fillStyle = "#00a800";
  ctx.beginPath();
  ctx.arc(poleX + 1, 2 * TILE + 6, 3, 0, Math.PI * 2);
  ctx.fill();

  // White flag with a green paw dot
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.moveTo(poleX, flagY);
  ctx.lineTo(poleX - 15, flagY + 7);
  ctx.lineTo(poleX, flagY + 14);
  ctx.fill();
  ctx.fillStyle = "#2b8a3e";
  ctx.beginPath();
  ctx.arc(poleX - 5, flagY + 7, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Castle made of bricks
  for (let col = 202; col <= 206; col++) {
    for (let row = 10; row <= 12; row++) drawBrick(col * TILE, row * TILE);
  }
  for (let col = 203; col <= 205; col++) {
    for (let row = 8; row <= 9; row++) drawBrick(col * TILE, row * TILE);
  }
  // Battlements: the bumpy tops of the walls
  const battlements = [[202, 9], [206, 9], [203, 7], [204, 7], [205, 7]];
  for (const [col, row] of battlements) {
    drawBrick(col * TILE, row * TILE + 8);
    ctx.fillStyle = "#5c94fc";
    ctx.fillRect(col * TILE + 4, row * TILE + 8, 8, 8);
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(204 * TILE + 2, 11 * TILE + 4, 12, 28);
  ctx.beginPath();
  ctx.arc(204 * TILE + 8, 11 * TILE + 4, 6, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(203 * TILE + 6, 8 * TILE + 4, 4, 8);
  ctx.fillRect(205 * TILE + 6, 8 * TILE + 4, 4, 8);
}

function drawEffects() {
  for (const fx of effects) {
    if (fx.type === "coin") {
      ctx.fillStyle = "#f8b800";
      ctx.beginPath();
      ctx.ellipse(fx.x + 4, fx.y + 7, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fcd860";
      ctx.fillRect(fx.x + 3, fx.y + 3, 2, 8);
    } else if (fx.type === "debris") {
      ctx.fillStyle = "#c84c0c";
      ctx.fillRect(fx.x, fx.y, 5, 5);
    } else if (fx.type === "text") {
      drawText(fx.text, fx.x, fx.y, 7, "left");
    } else if (fx.type === "launch") {
      drawSprite(FISH, fx.colors, fx.x - 4, fx.y, false, false);
    } else if (fx.type === "flash") {
      ctx.fillStyle = `rgba(255, 255, 255, ${fx.life / 10})`;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, (10 - fx.life) * 2 + 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.type === "fish") {
      ctx.globalAlpha = Math.min(1, fx.life / 20);
      drawSprite(FISH, fx.colors, fx.x - 4, fx.y - 2, fx.vx > 0, false);
      ctx.globalAlpha = 1;
    }
  }
}

function drawMice() {
  for (const mouse of mice) {
    if (mouse.x > camX + VIEW_W || mouse.x + 16 < camX) continue;
    if (mouse.dead === "squash") {
      ctx.fillStyle = "#9e9e9e";
      ctx.fillRect(mouse.x, mouse.y + mouse.h - 4, mouse.w, 4);
      ctx.fillStyle = "#5f5f5f";
      ctx.fillRect(mouse.x, mouse.y + mouse.h - 1, mouse.w, 1);
      continue;
    }
    const sprite = Math.floor(frame / 10) % 2 === 0 ? MOUSE_STEP_1 : MOUSE_STEP_2;
    drawSprite(sprite, MOUSE_COLORS, mouse.x - 1, mouse.y - 6, mouse.vx > 0, mouse.dead === "flip");
  }
}

function drawPlayer() {
  const p = player;
  let sprite = CAT_STEP_1;
  if (state === "playing" && !p.onGround) {
    sprite = CAT_JUMP;
  } else if (Math.abs(p.vx) > 0.1) {
    const speed = keys.run ? 5 : 8;
    sprite = Math.floor(frame / speed) % 2 === 0 ? CAT_STEP_1 : CAT_STEP_2;
  }
  drawSprite(sprite, CAT_COLORS, p.x - 2, p.y - 2, p.facing < 0, state === "dying");
}

function drawHud() {
  drawText("SCORE", 8, 6, 8, "left");
  drawText(String(score).padStart(6, "0"), 8, 15, 8, "left");
  drawText("COINS", 64, 6, 8, "left");
  drawText("x" + String(coins).padStart(2, "0"), 64, 15, 8, "left");
  drawText("WORLD", 116, 6, 8, "left");
  drawText("1-1", 116, 15, 8, "left");
  drawText("TIME", 168, 6, 8, "left");
  drawText(String(time), 168, 15, 8, "left");
  drawText("LIVES", 214, 6, 8, "left");
  drawText(String(lives), 214, 15, 8, "left");
}

function drawMessage(title, subtitle) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 80, VIEW_W, 70);
  drawText(title, VIEW_W / 2, 92, 16, "center");
  if (subtitle) drawText(subtitle, VIEW_W / 2, 120, 8, "center");
}

function draw() {
  ctx.fillStyle = "#5c94fc";
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  // Everything in the level scrolls with the camera
  ctx.save();
  ctx.translate(-Math.round(camX), 0);
  drawScenery();
  drawTiles();
  drawFlagAndCastle();
  drawMice();
  if (state !== "clear") drawPlayer();
  ctx.restore();

  drawHud();
  if (state === "title") drawMessage("CAT WORLD 1-1", "Click here or press Enter to start");
  if (state === "gameover") drawMessage("GAME OVER", "Press Enter to try again");
  if (state === "clear") drawMessage("COURSE CLEAR!", celebrationDone() ? "Press Enter to play again" : "");

  // Effects go on top of the messages so the fish bursts aren't hidden
  ctx.save();
  ctx.translate(-Math.round(camX), 0);
  drawEffects();
  ctx.restore();
}

// ---------- Controls ----------

const KEY_ACTIONS = {
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  ArrowUp: "jump", KeyW: "jump", Space: "jump", KeyZ: "jump",
  ShiftLeft: "run", ShiftRight: "run", KeyX: "run",
};

canvas.addEventListener("keydown", (event) => {
  const action = KEY_ACTIONS[event.code];
  if (action) {
    keys[action] = true;
    event.preventDefault();  // stop arrow keys and Space from scrolling the page
  }
  if ((event.code === "Enter" || event.code === "Space") && canStart()) {
    event.preventDefault();
    newGame();
  }
});

canvas.addEventListener("keyup", (event) => {
  const action = KEY_ACTIONS[event.code];
  if (action) keys[action] = false;
});

// Let go of every key if the player clicks somewhere else
canvas.addEventListener("blur", () => {
  for (const action in keys) keys[action] = false;
});

canvas.addEventListener("click", () => {
  canvas.focus();
  if (canStart()) newGame();
});

document.querySelectorAll(".touch-controls button").forEach((button) => {
  const action = button.dataset.key;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    keys[action] = true;
    if (canStart()) newGame();
  });
  for (const type of ["pointerup", "pointerleave", "pointercancel"]) {
    button.addEventListener(type, () => { keys[action] = false; });
  }
});

// ---------- Game loop ----------
// Runs update() 60 times a second no matter how fast the screen refreshes

const STEP = 1000 / 60;
let lastTime = 0;
let leftover = 0;

function loop(now) {
  leftover += Math.min(now - lastTime, 100);
  lastTime = now;
  while (leftover >= STEP) {
    update();
    leftover -= STEP;
  }
  draw();
  requestAnimationFrame(loop);
}

resetLevel();
requestAnimationFrame((now) => {
  lastTime = now;
  loop(now);
});
