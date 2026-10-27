// Shared by every page: remembers the visitor's card and applies its colors.
// Loaded in <head> so the right colors show before the page draws.

const CARD_STORAGE_KEY = "tradingCard";
const WELCOME_SEEN_KEY = "tradingCardWelcomeSeen";

const TYPE_EMOJIS = [
  "🔥", "💧", "🌿", "⚡", "🌀", "☕", "❄️", "🌙",
  "☀️", "🪨", "👻", "🐉", "🐱", "🎮", "💀", "⭐",
];

const MAIN_COLOR_PRESETS = [
  { name: "Green", value: "#2b8a3e" },
  { name: "Red", value: "#c92a2a" },
  { name: "Blue", value: "#1864ab" },
  { name: "Yellow", value: "#fcc419" },
  { name: "Purple", value: "#6741d9" },
  { name: "Brown", value: "#6f4e37" },
  { name: "Pink", value: "#d6336c" },
  { name: "Black", value: "#212529" },
];

const ACCENT_COLOR_PRESETS = [
  { name: "Lime", value: "#a9e34b" },
  { name: "Orange", value: "#ff922b" },
  { name: "Sky", value: "#74c0fc" },
  { name: "Gold", value: "#ffe066" },
  { name: "Lilac", value: "#e599f7" },
  { name: "Tan", value: "#d4a373" },
  { name: "Mint", value: "#96f2d7" },
  { name: "Silver", value: "#ced4da" },
];

const DEFAULT_CARD = {
  major: "CSEN",
  stats: [
    { name: "Pace", value: 86 },
    { name: "Typing", value: 80 },
    { name: "Phy", value: 47 },
  ],
  abilityName: "Hardstuck Gold",
  abilityDescription: "Pops off on pistol round, then ghosts the rest of the game.",
  typeEmoji: "🌿",
  typeName: "Grass",
  mainColor: "#2b8a3e",
  accentColor: "#a9e34b",
};

// localStorage can be turned off (some private browsing modes), so never let it crash the page
function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function copyCard(card) {
  return JSON.parse(JSON.stringify(card));
}

function isHexColor(value) {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function looksLikeCard(card) {
  return Boolean(card) &&
    typeof card.major === "string" &&
    Array.isArray(card.stats) && card.stats.length === 3 &&
    card.stats.every((s) => typeof s.name === "string" && Number.isInteger(s.value)) &&
    typeof card.abilityName === "string" &&
    typeof card.abilityDescription === "string" &&
    typeof card.typeEmoji === "string" &&
    typeof card.typeName === "string" &&
    isHexColor(card.mainColor) &&
    isHexColor(card.accentColor);
}

function loadCard() {
  try {
    const saved = JSON.parse(readStorage(CARD_STORAGE_KEY));
    if (looksLikeCard(saved)) return saved;
  } catch {
    // A broken saved card falls back to the default one
  }
  return copyCard(DEFAULT_CARD);
}

function saveCard(card) {
  return writeStorage(CARD_STORAGE_KEY, JSON.stringify(card));
}

// ---------- Colors ----------
// The visitor only picks two colors. Everything else is worked out from them,
// darkening where needed so text always passes WCAG AA contrast (4.5:1).

const WHITE = "#ffffff";
const BLACK = "#000000";
const TEXT = "#212529";

function toRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function toHex(rgb) {
  return "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

// amount 0 gives the first color, 1 gives the second
function mix(hexA, hexB, amount) {
  const a = toRgb(hexA);
  const b = toRgb(hexB);
  return toHex(a.map((c, i) => c + (b[i] - c) * amount));
}

function luminance(hex) {
  const [r, g, b] = toRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(hexA, hexB) {
  const [light, dark] = [luminance(hexA), luminance(hexB)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Darkens a color step by step until it's readable against the background.
// Text needs 4.5:1; shapes like the stat bars only need 3:1.
function darkenUntilReadable(hex, background, ratio = 4.5) {
  for (let amount = 0; amount <= 1; amount += 0.05) {
    const color = mix(hex, BLACK, amount);
    if (contrast(color, background) >= ratio) return color;
  }
  return BLACK;
}

function cardColors(main, accent) {
  const card = mix(WHITE, accent, 0.12);
  const dark = darkenUntilReadable(main, card);
  const pageEdge = darkenUntilReadable(main, WHITE);
  const pageDeep = mix(pageEdge, BLACK, 0.55);
  const track = mix(WHITE, accent, 0.4);
  return {
    "--c-page1": pageDeep,
    "--c-page2": pageEdge,
    "--c-bar": pageDeep,
    "--c-card": card,
    "--c-main": main,
    "--c-on-main": contrast(main, WHITE) >= contrast(main, TEXT) ? WHITE : TEXT,
    "--c-dark": dark,
    "--c-tint": mix(WHITE, accent, 0.25),
    "--c-track": track,
    "--c-fill": darkenUntilReadable(main, track, 3),
    "--c-art1": dark,
    "--c-art2": accent,
    "--c-badge-text": darkenUntilReadable(main, WHITE),
  };
}

function applyCardLook(card, element = document.documentElement) {
  const colors = cardColors(card.mainColor, card.accentColor);
  for (const [name, value] of Object.entries(colors)) {
    element.style.setProperty(name, value);
  }
}

applyCardLook(loadCard());
