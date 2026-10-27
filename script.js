// Card page: tilt and flip the card, fill it in from the saved data,
// and run the welcome / setup popup. Shared helpers live in site.js.

// =====================================================================
// The card
// =====================================================================

const card = document.getElementById("card");
const cardFront = card.querySelector(".card-front");
const cardBack = card.querySelector(".card-back");
const flipButton = document.getElementById("flip-button");
const cardStatus = document.getElementById("card-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

// Tilt the card a little toward the mouse, like holding a real card
card.addEventListener("mousemove", (event) => {
  if (reduceMotion.matches) return;
  const box = card.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  card.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
});

card.addEventListener("mouseleave", () => {
  card.style.transform = "";
});

// Only the face you can see is read by screen readers
function setFlipped(flipped) {
  card.classList.toggle("flipped", flipped);
  cardFront.setAttribute("aria-hidden", String(flipped));
  cardBack.setAttribute("aria-hidden", String(!flipped));
  flipButton.textContent = flipped ? "↻ Show front" : "↻ Show fun fact";
}

card.addEventListener("click", () => setFlipped(!card.classList.contains("flipped")));
flipButton.addEventListener("click", () => setFlipped(!card.classList.contains("flipped")));

function makeStatRow(stat) {
  const row = document.createElement("li");
  const name = document.createElement("span");
  name.className = "stat-name";
  name.textContent = stat.name;
  const bar = document.createElement("span");
  bar.className = "stat-bar";
  const fill = document.createElement("span");
  fill.className = "stat-fill";
  fill.style.width = `${stat.value}%`;
  bar.append(fill);
  const value = document.createElement("span");
  value.className = "stat-value";
  value.textContent = String(stat.value);
  row.append(name, bar, value);
  return row;
}

// Writes a card's data into a card front. textContent (not innerHTML) keeps
// anything a visitor types from being treated as code.
function renderCard(front, data) {
  front.querySelector(".card-type").textContent = `${data.typeEmoji} ${data.typeName}`;
  front.querySelector(".card-major-value").textContent = data.major;
  front.querySelector(".card-stats").replaceChildren(...data.stats.map(makeStatRow));
  front.querySelector(".card-ability-name").textContent = `Special Ability: ${data.abilityName}`;
  front.querySelector(".card-ability-description").textContent = data.abilityDescription;
}

let currentCard = loadCard();
renderCard(cardFront, currentCard);

// =====================================================================
// Setup popup
// =====================================================================

const dialog = document.getElementById("setup-dialog");
const form = document.getElementById("setup-form");
const dialogTitle = document.getElementById("setup-title");
const stepText = document.getElementById("setup-step-text");
const dots = document.getElementById("setup-dots");
const backButton = document.getElementById("setup-back");
const skipButton = document.getElementById("setup-skip");
const nextButton = document.getElementById("setup-next");
const closeButton = document.getElementById("setup-close");
const dialogBody = dialog.querySelector(".dialog-body");
const errorSummary = document.getElementById("error-summary");
const errorSummaryTitle = document.getElementById("error-summary-title");
const errorSummaryList = document.getElementById("error-summary-list");
const preview = document.getElementById("card-preview");
const previewSummary = document.getElementById("card-preview-summary");
const descriptionInput = document.getElementById("f-ability-description");
const descriptionCount = document.getElementById("f-ability-description-count");
const descriptionLive = document.getElementById("f-ability-description-live");

const LIMITS = { major: 40, statName: 12, abilityName: 30, abilityDescription: 120, type: 20 };
const FIELD_IDS = [
  "f-major",
  "f-stat1-name", "f-stat1-value",
  "f-stat2-name", "f-stat2-value",
  "f-stat3-name", "f-stat3-value",
  "f-ability-name", "f-ability-description",
  "f-type-emoji", "f-type",
  "f-main-color", "f-accent-color",
];

// Fieldsets of radio buttons, and the name their radios share
const GROUPS = {
  "f-type-emoji": "type-emoji",
  "f-main-color": "main-color",
  "f-accent-color": "accent-color",
};

function makeRadio(name, value) {
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.value = value;
  return input;
}

function buildEmojiGrid() {
  document.getElementById("emoji-grid").replaceChildren(...TYPE_EMOJIS.map((emoji) => {
    const label = document.createElement("label");
    label.className = "emoji-choice";
    label.append(makeRadio("type-emoji", emoji), emoji);
    return label;
  }));
}

// Preset swatches plus a "Custom" option that opens the system color wheel
function buildSwatches(containerId, name, presets, customLabel) {
  const options = presets.map((preset) => {
    const label = document.createElement("label");
    label.className = "swatch";
    const dot = document.createElement("span");
    dot.className = "swatch-color";
    dot.style.background = preset.value;
    label.append(makeRadio(name, preset.value), dot, preset.name);
    return label;
  });

  const custom = document.createElement("label");
  custom.className = "swatch";
  const customRadio = makeRadio(name, "custom");
  const wheel = document.createElement("input");
  wheel.type = "color";
  wheel.id = `${name}-custom`;
  wheel.setAttribute("aria-label", customLabel);
  const selectCustom = () => {
    customRadio.checked = true;
    customRadio.dispatchEvent(new Event("change", { bubbles: true }));
  };
  wheel.addEventListener("click", selectCustom);
  wheel.addEventListener("input", selectCustom);
  custom.append(customRadio, wheel, "Custom");

  document.getElementById(containerId).replaceChildren(...options, custom);
}

buildEmojiGrid();
buildSwatches("main-swatches", "main-color", MAIN_COLOR_PRESETS, "Custom main color");
buildSwatches("accent-swatches", "accent-color", ACCENT_COLOR_PRESETS, "Custom accent color");

let mode = "welcome";
let steps = [];
let stepIndex = 0;
let draft = null;
let triedToContinue = false;

function openSetup(newMode) {
  mode = newMode;
  steps = mode === "welcome" ? ["welcome", "build", "preview"] : ["build", "preview"];
  skipButton.textContent = mode === "welcome" ? "Skip setup" : "Cancel";
  fillForm(currentCard);
  // A new visitor picks their own type instead of starting with mine
  if (mode === "welcome") {
    setChoice("type-emoji", "");
    field("f-type").value = "";
  }
  clearAllErrors();
  triedToContinue = false;
  dialog.showModal();
  showStep(0);
}

function showStep(index) {
  stepIndex = index;
  const step = steps[index];
  for (const section of dialog.querySelectorAll("[data-step]")) {
    section.hidden = section.dataset.step !== step;
  }

  const titles = {
    welcome: "Welcome!",
    build: mode === "welcome" ? "Build your card" : "Edit your card",
    preview: "Preview your card",
  };
  dialogTitle.textContent = titles[step];
  stepText.textContent = `Step ${index + 1} of ${steps.length}`;
  dots.replaceChildren(...steps.map((_, i) => {
    const dot = document.createElement("span");
    if (i === index) dot.className = "current";
    return dot;
  }));

  backButton.hidden = index === 0;
  const isLast = index === steps.length - 1;
  nextButton.textContent = isLast ? (mode === "welcome" ? "Create my card" : "Save changes") : "Next →";

  dialogBody.scrollTop = 0;
  // Moving focus to the title makes screen readers announce the new step
  dialogTitle.focus();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const step = steps[stepIndex];

  if (step === "build") {
    triedToContinue = true;
    const errors = validateAll();
    if (errors.length > 0) {
      showErrors(errors);
      return;
    }
    clearAllErrors();
    draft = readForm();
    renderPreview(draft);
  }

  if (stepIndex === steps.length - 1) {
    saveDraft();
  } else {
    showStep(stepIndex + 1);
  }
});

backButton.addEventListener("click", () => showStep(stepIndex - 1));
skipButton.addEventListener("click", () => dialog.close());
closeButton.addEventListener("click", () => dialog.close());

// Escape, ×, Skip, and saving all close the popup; after any of them it won't pop up by itself again
dialog.addEventListener("close", () => {
  writeStorage(WELCOME_SEEN_KEY, "1");
});

document.getElementById("edit-card-button").addEventListener("click", () => openSetup("edit"));

document.getElementById("reset-card-button").addEventListener("click", () => {
  fillForm(DEFAULT_CARD);
  clearAllErrors();
  triedToContinue = false;
  document.getElementById("f-major").focus();
});

function saveDraft() {
  currentCard = draft;
  const saved = saveCard(currentCard);
  renderCard(cardFront, currentCard);
  applyCardLook(currentCard);
  setFlipped(false);
  dialog.close();
  cardStatus.textContent = saved
    ? "Your card was saved."
    : "Your card was updated, but this browser can't save it for next time.";
}

function renderPreview(data) {
  const copy = cardFront.cloneNode(true);
  copy.removeAttribute("aria-hidden");
  renderCard(copy, data);
  preview.replaceChildren(copy);
  applyCardLook(data, preview);

  const rows = [
    ["Major", data.major],
    ...data.stats.map((s) => [s.name, `${s.value} out of 99`]),
    ["Special ability", `${data.abilityName}: ${data.abilityDescription}`],
    ["Card type", `${data.typeEmoji} ${data.typeName}`],
    ["Main color", colorName(data.mainColor, MAIN_COLOR_PRESETS)],
    ["Accent color", colorName(data.accentColor, ACCENT_COLOR_PRESETS)],
  ];
  previewSummary.replaceChildren(...rows.flatMap(([term, detail]) => {
    const dt = document.createElement("dt");
    dt.textContent = term;
    const dd = document.createElement("dd");
    dd.textContent = detail;
    return [dt, dd];
  }));
}

// ---------- Reading and filling the form ----------

function field(id) {
  return document.getElementById(id);
}

function fillForm(data) {
  field("f-major").value = data.major;
  data.stats.forEach((stat, i) => {
    field(`f-stat${i + 1}-name`).value = stat.name;
    field(`f-stat${i + 1}-value`).value = String(stat.value);
  });
  field("f-ability-name").value = data.abilityName;
  descriptionInput.value = data.abilityDescription;
  setChoice("type-emoji", data.typeEmoji);
  field("f-type").value = data.typeName;
  setColorChoice("main-color", data.mainColor);
  setColorChoice("accent-color", data.accentColor);
  updateCharacterCount(false);
}

function setChoice(name, value) {
  for (const radio of form.querySelectorAll(`input[name="${name}"]`)) {
    radio.checked = radio.value === value;
  }
}

// Checks the matching preset, or "Custom" with the color wheel set to that color
function setColorChoice(name, hex) {
  const radios = [...form.querySelectorAll(`input[name="${name}"]`)];
  const preset = radios.find((radio) => radio.value.toLowerCase() === hex.toLowerCase());
  setChoice(name, preset ? preset.value : "custom");
  field(`${name}-custom`).value = hex;
}

function checkedValue(name) {
  const checked = form.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "";
}

function readColor(name) {
  const value = checkedValue(name);
  return value === "custom" ? field(`${name}-custom`).value : value;
}

function colorName(hex, presets) {
  const preset = presets.find((p) => p.value.toLowerCase() === hex.toLowerCase());
  return preset ? preset.name : `Custom (${hex})`;
}

function readForm() {
  return {
    major: field("f-major").value.trim(),
    stats: [1, 2, 3].map((n) => ({
      name: field(`f-stat${n}-name`).value.trim(),
      value: Number(field(`f-stat${n}-value`).value),
    })),
    abilityName: field("f-ability-name").value.trim(),
    abilityDescription: descriptionInput.value.trim(),
    typeEmoji: checkedValue("type-emoji"),
    typeName: field("f-type").value.trim(),
    mainColor: readColor("main-color"),
    accentColor: readColor("accent-color"),
  };
}

// ---------- Checking the form ----------

// Counts emoji as one character each, the way people see them
function lengthOf(text) {
  return Array.from(text).length;
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function statLabel(n) {
  return field(`f-stat${n}-name`).value.trim() || `Attribute ${n}`;
}

// Returns the error message for one field, or null if it's fine
function checkField(id) {
  if (id === "f-major") {
    const value = field(id).value.trim();
    if (!value) return "Please enter your major.";
    if (lengthOf(value) > LIMITS.major) return 'Major can be up to 40 characters. Try an abbreviation, like "CSEN".';
    return null;
  }

  const statName = id.match(/^f-stat(\d)-name$/);
  if (statName) {
    const n = Number(statName[1]);
    const value = field(id).value.trim();
    if (!value) return `Please give attribute ${n} a name, like "Speed".`;
    if (lengthOf(value) > LIMITS.statName) return "Attribute names can be up to 12 characters.";
    for (let earlier = 1; earlier < n; earlier++) {
      if (field(`f-stat${earlier}-name`).value.trim().toLowerCase() === value.toLowerCase()) {
        return `Each attribute needs a different name. "${value}" is used twice.`;
      }
    }
    return null;
  }

  const statValue = id.match(/^f-stat(\d)-value$/);
  if (statValue) {
    const input = field(id);
    const label = statLabel(Number(statValue[1]));
    const raw = input.value.trim();
    if (input.validity.badInput) return `${label} needs a number from 0 to 99.`;
    if (raw === "") return `Please give ${label} a rating from 0 to 99.`;
    const number = Number(raw);
    if (!Number.isFinite(number)) return `${label} needs a number from 0 to 99.`;
    if (!Number.isInteger(number)) return `Use a whole number for ${label}, like 86 (no decimals).`;
    if (number > 99) return `${label} can be at most 99. You entered ${raw}.`;
    if (number < 0) return `${label} can't be negative. Enter a number from 0 to 99.`;
    return null;
  }

  if (id === "f-ability-name") {
    const value = field(id).value.trim();
    if (!value) return "Please name your special ability.";
    if (lengthOf(value) > LIMITS.abilityName) return "Ability names can be up to 30 characters.";
    return null;
  }

  if (id === "f-ability-description") {
    const value = descriptionInput.value.trim();
    const length = lengthOf(value);
    if (!value) return "Please describe what your special ability does.";
    if (length > LIMITS.abilityDescription) {
      const extra = length - LIMITS.abilityDescription;
      return `Descriptions can be up to 120 characters. You're at ${length}. Remove ${plural(extra, "character")}.`;
    }
    return null;
  }

  if (id === "f-type-emoji") return checkedValue("type-emoji") ? null : "Please pick an emoji for your card type.";

  if (id === "f-type") {
    const value = field(id).value.trim();
    if (!value) return 'Please enter a card type name, like "Fire".';
    if (lengthOf(value) > LIMITS.type) return "Card type names can be up to 20 characters.";
    return null;
  }

  if (id === "f-main-color") return readColor("main-color") ? null : "Please choose a main color.";
  if (id === "f-accent-color") return readColor("accent-color") ? null : "Please choose an accent color.";
  return null;
}

function validateAll() {
  const errors = [];
  for (const id of FIELD_IDS) {
    const message = checkField(id);
    if (message) errors.push({ id, message });
  }
  return errors;
}

// ---------- Showing errors ----------

function isGroup(id) {
  return id in GROUPS;
}

// Fields (and groups) are marked invalid on the inputs a screen reader lands on
function invalidTargets(id) {
  return isGroup(id) ? [...field(id).querySelectorAll("input")] : [field(id)];
}

function setFieldError(id, message) {
  const element = field(id);
  const errorId = `${id}-error`;
  let error = document.getElementById(errorId);
  if (element.dataset.describedby === undefined) {
    element.dataset.describedby = element.getAttribute("aria-describedby") || "";
  }
  const original = element.dataset.describedby;

  if (!message) {
    if (error) error.remove();
    invalidTargets(id).forEach((input) => input.removeAttribute("aria-invalid"));
    if (original) element.setAttribute("aria-describedby", original);
    else element.removeAttribute("aria-describedby");
    return;
  }

  if (!error) {
    error = document.createElement("p");
    error.className = "field-error";
    error.id = errorId;
    if (isGroup(id)) element.append(error);
    else if (id === "f-ability-description") descriptionCount.after(error);
    else element.after(error);
  }
  const icon = document.createElement("span");
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = "⚠ ";
  error.replaceChildren(icon, message);

  invalidTargets(id).forEach((input) => input.setAttribute("aria-invalid", "true"));
  element.setAttribute("aria-describedby", `${original} ${errorId}`.trim());
}

function clearAllErrors() {
  FIELD_IDS.forEach((id) => setFieldError(id, null));
  errorSummary.hidden = true;
}

function fillSummary(errors) {
  const things = errors.length === 1 ? "is 1 thing" : `are ${errors.length} things`;
  const goal = mode === "welcome" ? "creating your card" : "saving your card";
  errorSummaryTitle.textContent = `There ${things} to fix before ${goal}:`;
  errorSummaryList.replaceChildren(...errors.map(({ id, message }) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = `#${id}`;
    link.textContent = message;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      focusField(id);
    });
    item.append(link);
    return item;
  }));
}

function showErrors(errors) {
  FIELD_IDS.forEach((id) => {
    const found = errors.find((e) => e.id === id);
    setFieldError(id, found ? found.message : null);
  });
  fillSummary(errors);
  errorSummary.hidden = false;
  // The summary sits at the top of the scrolling area; scrollIntoView would also shift the popup itself
  dialogBody.scrollTop = 0;
  errorSummary.focus({ preventScroll: true });
}

function focusField(id) {
  const target = isGroup(id)
    ? field(id).querySelector("input:checked") || field(id).querySelector("input")
    : field(id);
  target.focus();
}

// Re-check a field when you leave it, and clear its error as soon as it's fixed
function refreshField(id) {
  setFieldError(id, checkField(id));
  if (!errorSummary.hidden) {
    const errors = validateAll();
    if (errors.length === 0) errorSummary.hidden = true;
    else fillSummary(errors);
  }
}

function fieldIdFor(element) {
  const group = Object.keys(GROUPS).find((id) => GROUPS[id] === element.name);
  if (group) return group;
  return FIELD_IDS.includes(element.id) ? element.id : null;
}

form.addEventListener("focusout", (event) => {
  const id = fieldIdFor(event.target);
  if (!id || isGroup(id)) return;
  // Don't complain about empty fields someone is just tabbing past, until they press Next
  if (triedToContinue || event.target.value.trim() !== "") refreshField(id);
});

form.addEventListener("input", (event) => {
  const id = fieldIdFor(event.target);
  if (!id) return;
  if (id === "f-ability-description") updateCharacterCount(true);
  if (document.getElementById(`${id}-error`) && !checkField(id)) refreshField(id);
});

form.addEventListener("change", (event) => {
  const id = fieldIdFor(event.target);
  if (id && isGroup(id) && triedToContinue) refreshField(id);
});

// ---------- Character counter ----------

let countLevel = "ok";

function updateCharacterCount(announceChanges) {
  const length = lengthOf(descriptionInput.value.trim());
  const limit = LIMITS.abilityDescription;
  const level = length > limit ? "over" : length >= limit - 10 ? "near" : "ok";

  descriptionCount.textContent = level === "over"
    ? `${length} / ${limit} characters, ${length - limit} too many`
    : `${length} / ${limit} characters`;
  descriptionCount.classList.toggle("near-limit", level === "near");
  descriptionCount.classList.toggle("over-limit", level === "over");

  // Screen readers hear only when you get close, go over, or come back under
  if (announceChanges && level !== countLevel) {
    if (level === "near") descriptionLive.textContent = `${plural(limit - length, "character")} left.`;
    if (level === "over") descriptionLive.textContent = `Over the limit by ${plural(length - limit, "character")}.`;
    if (level === "ok" && countLevel === "over") descriptionLive.textContent = "Back under the limit.";
  }
  countLevel = level;
}

// ---------- First visit ----------

if (!readStorage(WELCOME_SEEN_KEY)) openSetup("welcome");
