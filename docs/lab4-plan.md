# Lab 4 Plan: Welcome, Help, and Error Messages

**Status:** built. Small differences from this plan: the inputs don't use
`maxlength` (it would block typing before the "too long" messages could show),
the game help text also lists P for pause, and `site.js` was added for the code
every page shares.

**Goal:** improve the accessibility and polish of the Lab 3 trading card site by
adding a welcome/setup popup, two help pages (Controls and FAQ), and clear error
messages, and by splitting the card and the mini-game into separate pages.

**Inspiration:** the welcome carousel, tutorial pages, and error messages from my
CSEN 174 team project, SCU Course Planner. Notes on what it did well and what
it got wrong are in `Lab3/lab4-reference-scu-course-planner.md` (kept outside
this repo). This plan reuses its good ideas and fixes its gaps, such as the
welcome popup having no way to close it or skip ahead.

---

## 1. Site map and folder structure

```
my-card/
├── index.html          Card page (home). Shows the card + welcome/setup popup
├── style.css           Shared styles for every page
├── script.js           Card page only: tilt, flip, setup popup, validation
├── sticker.png
├── 404.html            Optional: "page not found" error page (GitHub Pages
│                       only uses it if it sits at the site root)
├── pages/
│   ├── game.html       Cat World 1-1 + on-screen mobile controls
│   ├── game.js         Game code, moved out of script.js
│   ├── controls.html   Help page 1: Controls
│   └── faq.html        Help page 2: FAQ
└── docs/
    ├── lab4-plan.md    This document
    └── ai-usage.md     How AI was used, step by step
```

- Pages in `pages/` link to shared files with `../` (for example
  `../style.css` and `../index.html`).
- Every page gets the same **header navigation**: Card · Play the game ·
  Controls · FAQ. The current page is marked with `aria-current="page"`.
- Every page gets the same **footer**: "Hand-directed by me, built with AI".
- Each page has its own `<title>`, such as "Controls · Ismael's Trading Card",
  so browser tabs and screen readers can tell the pages apart.

### Splitting the card and the game

- The card stays on `index.html`. Below it goes a large **"Play Cat World 1-1 →"**
  button that links to `pages/game.html`.
- `game.html` has a **"← Back to my card"** link and a **"How to play"** link to
  `controls.html`.
- The game code moves from `script.js` into `pages/game.js`, so the card page no
  longer loads the game and each file is easier to read.

---

## 2. Welcome / setup popup (first visit)

Opens automatically the **first time** someone visits `index.html`. The site
remembers that it has been shown using the browser's `localStorage`, and stores
the card the visitor builds there too. Afterwards, an **"Edit my card"** button
on the card page reopens it.

### Layout (modeled on the 174 carousel, with its gaps fixed)

- Dimmed background with a centered card-style popup, using the current type's
  colors.
- Header: the step title, plus a **close (×) button** in the corner.
- Text progress indicator, **"Step 2 of 3"**, next to the visual dots, so screen
  readers know where you are.
- Footer: **Back**, **Skip setup**, and **Next** (the last step says **Create my card**).
- **Escape** closes the popup, the same as Skip. Focus moves into the popup when
  it opens and stays inside it until it closes. When it closes, focus returns to
  the button that opened it.

### Steps

1. **Welcome**
   "Welcome! This is a digital trading card, plus a mini-game you can play.
   Let's build your card. It takes about a minute." Includes links to the
   Controls and FAQ pages, which open in the same tab.
2. **Build your card** (the form; see section 3)
3. **Preview and finish:** a live preview of the card with **Back** to make
   changes or **Create my card** to save.

**Skip setup** keeps the default card (my own card) and doesn't show the popup
again.

---

## 3. Setup form fields

| Field | Input type | Rules |
|-------|-----------|-------|
| Major | Text | Required, 1–40 characters |
| Attribute 1 name | Text | Required, 1–12 characters (e.g., "Pace") |
| Attribute 1 rating | Number | Required, whole number 0–99 |
| Attribute 2 name / rating | Text / Number | Same rules |
| Attribute 3 name / rating | Text / Number | Same rules |
| Special ability name | Text | Required, 1–30 characters |
| Special ability description | Text area | Required, 1–120 characters, live character counter |
| Card type emoji | Grid of 16 emoji buttons | Required: pick one (🔥 💧 🌿 ⚡ 🌀 ☕ ❄️ 🌙 ☀️ 🪨 👻 🐉 🐱 🎮 💀 ⭐) |
| Card type name | Text, with faded example text "Fire" that disappears as you type | Required, 1–20 characters. Shown after the emoji, like "🔥 Fire" |
| Main color | 8 preset swatches + Custom (color wheel) | Required. Used for the header, buttons, and stat bars |
| Accent color | 8 preset swatches + Custom (color wheel) | Required. Used for the card's background tint and the picture box |

- No name field. Following the lab rule, the public site shows only a first
  name (already on the card) and a major.
- The three attribute names must be different from one another.
- Leading and trailing spaces are trimmed before checking a field, so a field of
  only spaces counts as empty.

### Card colors

The visitor picks only a main color and an accent color. `site.js` works out
every other color from those two (page background, card background, header
text, stat bars). It darkens colors until text passes WCAG AA contrast (4.5:1),
and the stat bars pass 3:1 against their track, so any custom pick stays
readable. The Classic, Night, and High Contrast themes from the first build
were replaced by these pickers.

---

## 4. Error messages

### Principles

- Every message says **what's wrong and how to fix it**, in plain words. No codes,
  no technical terms.
- Errors appear **next to the field** and in an **error summary** at the top of
  the form. Each item in the summary is a link that jumps to its field.
- Errors are shown in **text plus an icon** (⚠), not by color alone.
- When someone presses Next with errors: the summary appears, it's announced to
  screen readers (`role="alert"`), and focus moves to it.
- Invalid fields get `aria-invalid="true"`, and the error text is linked with
  `aria-describedby` so screen readers read it with the field.
- Typed values are **never cleared** when there's an error.
- Errors show when leaving a field (on blur) and when pressing Next, not on every
  keystroke. The only live feedback is the character counter.
- The form uses `novalidate` so these custom messages replace the browser's
  default popups. The HTML attributes (`required`, `min="0"`, `max="99"`,
  `maxlength`) stay as a backup.

### Message list

| Situation | Message |
|-----------|---------|
| Major left empty | Please enter your major. |
| Major too long | Major can be up to 40 characters. Try an abbreviation, like "CSEN". |
| Attribute name empty | Please give attribute 2 a name, like "Speed". |
| Attribute name too long | Attribute names can be up to 12 characters. |
| Two attributes with the same name | Each attribute needs a different name. "Pace" is used twice. |
| Rating empty | Please give Pace a rating from 0 to 99. |
| Rating above 99 | Pace can be at most 99. You entered 120. |
| Rating below 0 | Pace can't be negative. Enter a number from 0 to 99. |
| Rating has a decimal | Use a whole number for Pace, like 86 (no decimals). |
| Rating isn't a number | Pace needs a number from 0 to 99. |
| Ability name empty | Please name your special ability. |
| Ability name too long | Ability names can be up to 30 characters. |
| Ability description empty | Please describe what your special ability does. |
| Ability description too long | Descriptions can be up to 120 characters. You're at 134. Remove 14 characters. |
| No type emoji picked | Please pick an emoji for your card type. |
| Card type name left empty | Please enter a card type name, like "Fire". |
| Card type name too long | Card type names can be up to 20 characters. |
| No main color picked | Please choose a main color. |
| No accent color picked | Please choose an accent color. |
| Summary heading | There are 3 things to fix before creating your card: |

**Character counter** (under the description, updated as you type and announced
politely with `aria-live="polite"`): "87 / 120 characters". It turns into a
warning style at 110 or more, and at 121 or more it reads "134 / 120 characters,
14 too many".

### Bonus: 404 page

An optional `404.html` for broken links, which the 174 project lacked:
"This page doesn't exist. It may have been moved, or the link has a typo."
It includes buttons for **Go to my card** and **Play the game**.

---

## 5. Help page 1: Controls (`pages/controls.html`)

**Purpose:** everything needed to play, without guessing.

Sections:
1. **Goal:** reach the flagpole at the end of World 1-1 before the timer runs out.
2. **Keyboard controls** (a table):

   | Action | Keys |
   |--------|------|
   | Move left / right | ← → or A / D |
   | Jump (hold for higher) | Space, ↑, W, or Z |
   | Run | Shift or X |
   | Start / restart | Enter, or click the game |

3. **Touch controls:** a picture of the on-screen buttons with what each one does.
4. **Rules:** stomp mice from above; touching one from the side costs a life.
   You have 3 lives and 400 seconds. ? blocks give coins and bricks break.
   You can't walk back past the left edge of the screen.
5. **Scoring:** coins 200, bricks 50, mice 100. The flagpole bonus depends on
   height (400 / 800 / 2000 / 5000), and leftover seconds are worth 50 each.
6. **Secret** (inside a collapsed `<details>` labelled "Spoiler"): if the
   timer's last two digits match when you touch the flag (like 255 or 11), that
   many fish bursts go off, worth 500 each.
7. A **"Play now →"** button that links to `game.html`.

---

## 6. Help page 2: FAQ (`pages/faq.html`)

Each question is a `<details>`/`<summary>` element, so it works with a keyboard
and screen readers without any JavaScript. Each one opens to a short answer.

Draft questions:
- What is this site?
- How do I change my card after setting it up? (The **Edit my card** button.)
- Where is my card saved? Can other people see it? (Only in your own browser,
  through `localStorage`. It isn't sent anywhere, and visitors see the default
  card.)
- How do I reset my card to start over?
- Why can't a rating go above 99?
- Why does my card look different on another device or browser? (It's saved per
  browser.)
- Does it work on a phone? (Yes. See the touch controls.)
- The game won't respond to my keys. (Click the game first so it has focus.)
- I jumped over the flagpole. Why didn't I finish? (You have to touch the pole.)
- Can I turn off the animations? (The site follows your device's
  "Reduce motion" setting.)
- How was this site made? (Link to `docs/ai-usage.md` on GitHub.)

---

## 7. Game page and on-screen mobile controls (`pages/game.html`)

Today the touch buttons (◀ ⤒ ▶) only appear on touch screens, and there's no
run button. The plan:

- **Layout:** the game canvas on top. Below it, **◀ ▶** on the left and
  **Run** plus **Jump** on the right, like a handheld console.
- **Size:** every button at least **48 × 48 px**, with space between them, so
  they meet the touch-target guidelines.
- **Multi-touch:** holding ▶ and tapping Jump at the same time must work
  (pointer events, one per button).
- **Show/hide toggle:** a "Show on-screen controls" switch, on by default for
  touch screens. It also lets keyboard-free desktop users play with a mouse.
- **Labels:** each button has an `aria-label` ("Move left", "Jump", and so on).
  Holding a button never selects text or scrolls the page.
- **Pause button**, plus an automatic pause when the tab is hidden or the game
  loses focus. "Paused" is shown on the canvas.
- **Help text** under the game: "Controls: ← → move · Space jump · Shift run",
  with a link to the full Controls page.
- **Screen reader text:** a live region announces big events such as "Course
  clear", "Game over", and "Lives: 2".

---

## 8. Accessibility checklist (every page)

- [ ] `lang="en"` and a unique `<title>` on every page
- [ ] Landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`
- [ ] A "Skip to main content" link as the first focusable element
- [ ] Headings in order, one `<h1>` per page
- [ ] Visible focus outline on every interactive element
- [ ] Everything usable by keyboard alone (Tab, Enter, Space, Escape)
- [ ] WCAG AA color contrast for text, for any colors the visitor picks
- [ ] Information never shown by color alone
- [ ] Alt text on images (the sticker already has it)
- [ ] Respect `prefers-reduced-motion` (the aura already does)
- [ ] Text can be zoomed to 200% without breaking the layout
- [ ] Touch targets of at least 48 × 48 px

---

## 9. Wireframe sketches (rough)

**Card page with the setup popup open (step 2):**
```
┌──────────────────────────────────────────┐
│  Build your card                     [×] │
│  Step 2 of 3   ● ● ○                     │
├──────────────────────────────────────────┤
│ ⚠ There are 2 things to fix:             │
│   • Pace can be at most 99 (link)        │
│   • Please choose a card type (link)     │
│                                          │
│ Major  [ CSEN                         ]  │
│ Attribute 1 [ Pace     ]  Rating [ 120 ] │
│   ⚠ Pace can be at most 99. You entered 120.
│ Attribute 2 [ Typing   ]  Rating [ 80  ] │
│ Attribute 3 [ Phy      ]  Rating [ 47  ] │
│ Ability name [ Hardstuck Gold         ]  │
│ Description [                         ]  │
│             87 / 120 characters          │
│ Type   ( )Fire ( )Water ( )Grass ...     │
│   ⚠ Please choose a card type.           │
│ Theme  (•)Classic ( )Night ( )High Contrast
├──────────────────────────────────────────┤
│ [Back]          [Skip setup]   [Next →]  │
└──────────────────────────────────────────┘
```

**Game page (phone):**
```
┌───────────────────────────┐
│ Card · Game · Controls · FAQ
│ ← Back to my card         │
│ ┌───────────────────────┐ │
│ │      game canvas      │ │
│ └───────────────────────┘ │
│  [◀] [▶]      [Run][Jump] │
│  [⏸ Pause]  How to play → │
└───────────────────────────┘
```

---

## 10. Open questions

- Should visitors also be able to change the first name and sticker, or should
  those stay fixed as mine?
- Should the setup popup appear for every new visitor, or only once per
  browser? (Planned: once per browser.)
- Do the card colors also apply to the game page? (Built: yes, every page uses them.)
