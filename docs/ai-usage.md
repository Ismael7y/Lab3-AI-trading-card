# How AI Was Used

This site was built with an AI coding agent: **Cursor's Agent** (Claude), working
inside the Cursor editor. I described what I wanted in plain English, and the
agent wrote and edited the files, ran commands, and tested the result in Cursor's
built-in browser. I made the decisions, reviewed every change, gave feedback, and
made some edits by hand.

Each entry below covers what I asked for, what the AI did, and what I decided or
changed. A separate section lists what the AI got wrong and how it was caught.

> Note: I started Lab 3 in an earlier chat with a different agent, working in
> another folder (Part 1, Round A, the vague prompt). That chat isn't recorded
> here. This log starts when I moved the work into this folder.

---

## Lab 3

### Setup
- **I asked:** check that my GitHub account was connected.
- **AI did:** confirmed my saved GitHub login worked (account `Ismael7y`) and
  found that Git didn't have my name set yet.
- **I did:** ran `git config --global user.name "..."` myself in the terminal.

### Part 1: First prompt (Round B, specific)
- **AI did:** following the lab's specific prompt, created `index.html`,
  `style.css`, and `script.js`: a centered trading card with placeholder
  text, bold colors, rounded corners, and a phone-friendly layout. It stated a
  3-point plan before writing any code.
- **AI added on its own:** a small card-tilt effect that follows the mouse.

### Part 2: Make it yours
- **I gave:** my name, major, Grass type, three stats (Pace 86, Typing 80, Phy 47),
  and my special ability ("Hardstuck Gold").
- **AI did:** added the info with stat bars, and used only my **first name**
  because of the lab's privacy rule (first name and major only on a public
  site).
- **Three small changes I asked for:**
  1. **Green Grass colors:** the AI restyled the whole card.
  2. **Flip to a fun fact:** the AI added a click-to-flip back side (also works
     with Enter and Space). **I edited the wording** to "I built my own computer
     and keyboard."
  3. **An image instead of an emoji:** I wanted a sticker from Apple's Messages
     app. Dragging it out didn't work, so I copied it to my clipboard. The AI then
     pulled the image out of the clipboard and converted it from HEIC (an Apple
     format browsers can't show) to PNG.
- **Glowing aura:** I asked for a Dragon Ball-style aura on the cat. The AI chose
  purple. It took several rounds of my feedback: the first version looked like a
  blob, then it became flames, then I asked for it taller and slower, then for
  the dark outer layer to be removed, and finally for it to be bigger again.

### Part 3: Mini-game
- **I asked:** a copy of World 1-1 from the original Mario game, with a black cat
  instead of Mario.
- **AI did:** built "Cat World 1-1" on an HTML `<canvas>` in plain JavaScript.
  It has the same layout as 1-1 (blocks, four pipes, three pits, staircases, a
  flagpole, a castle), mice as enemies, a score, coins, lives, and a timer, plus
  on-screen buttons for phones.
- **AI decision:** it drew all the art in code instead of copying Nintendo's
  sprites, music, or name, because the site is public.
- **AI testing:** it ran scripted tests in the browser: hitting a ? block,
  breaking a brick, stomping a mouse, dying to a mouse and to a pit, and
  finishing at the flag.
- **Fish bursts (my idea):** I asked for the original game's fireworks easter
  egg, replaced with something cats like. The AI made bursts of fish.
- **My hand edit:** I changed the jump height in `script.js` from `-5.6` to
  `-8.5` myself.

### Part 4: Break and fix
- **I found a bug:** with my higher jump, I could fly over the flagpole and the
  level still ended. I wrote the bug report (`Lab3/bug-report.txt`).
- **AI did:** explained the cause (the game only checked how far right the cat
  was, never how high) and fixed it so the cat has to touch the pole. It then
  tested flying over the pole, touching it partway up, and jumping into it from
  the castle side.

### Part 5: Understanding
- **I wrote** my own explanation of what each file does. The AI checked it and
  suggested two corrections: `index.html` holds the content and structure, and
  `script.js` also runs the card's tilt and flip.

### Part 6: Publish
- **AI did:** explained each Git command before running it, created the
  repository and the first commit, created the GitHub repository, pushed, turned
  on GitHub Pages, and checked that the live site loaded.
- **I decided:** the repository name. I had the AI rename it to
  `Lab3-AI-trading-card`.

---

## Lab 4

### Research
- **I asked:** pull the welcome popup, help pages, and error messages from my
  CSEN 174 team project (SCU Course Planner) to base wireframes on.
- **AI did:** read the project's code **without changing anything**. It wrote a
  reference document with all the text, the layouts, a list of error messages
  (good and bad examples), and accessibility gaps such as the popup having no
  close button and the progress dots giving screen readers nothing to read.

### Planning
- **I described:** a setup popup that asks for major, 3 attributes, special
  ability, card type, and theme; error messages (ratings 0–99, a character limit,
  missing fields); two help pages (Controls and FAQ); a separate game page with
  mobile controls; and a subfolder for the new pages. **I asked the AI to
  document it, not build it yet.**
- **AI did:** wrote [`lab4-plan.md`](lab4-plan.md). It covers the folder
  structure, form rules, exact error wording, help page content, mobile control
  design, an accessibility checklist, and rough wireframes. It also created
  the `pages/` folder.
- **AI added on its own:** the error summary, the 404 page, a "High Contrast"
  theme, and checks for duplicate attribute names. These are suggestions for me
  to accept or reject.

### Building it
- **I asked:** build the plan.
- **AI did:**
  - Split the site into pages: the card on `index.html`, the game on
    `pages/game.html`, and the help pages `pages/controls.html` and
    `pages/faq.html`. Every page shares the same menu and footer. It also added
    a `404.html` page for broken links.
  - Moved the game code from `script.js` into `pages/game.js`. It added a pause
    button, made the game pause by itself when you switch tabs, added a **Run**
    button to the on-screen controls, and added a switch to show or hide those
    controls.
  - Built the 3-step welcome popup and the form with every error message from
    the plan. Errors show next to each field and in a list at the top, and each
    item in the list jumps to its field.
  - Added a new file, `site.js`, that saves the card in the browser and applies
    its colors on every page. It also rewrote `style.css` so all 6 card types
    and 3 themes come from one set of color variables.
- **AI tested it** in Cursor's browser:
  - It typed bad values into the form and checked that every message matched
    the plan word for word.
  - It fixed the errors and checked that they cleared.
  - It saved a Water / Night card, reloaded the page to confirm the card was
    still there, and then edited the card and reset it.
  - On the game page it started the game with the on-screen buttons, moved the
    cat, and paused it.
- **AI added on its own (accessibility fixes):**
  - Lab 3 made the whole card one big button, which hid its text from screen
    readers. Now there's a separate "Show fun fact" button, and screen readers
    only read the side of the card that's showing.
  - A "Skip to main content" link and a yellow focus outline on every page.
  - Screen reader announcements for game events such as "Game over" and lives
    left.
  - The character counter only speaks up near the limit, not on every key press.
  - The preview step lists your card as text for screen readers.
  - The card tilt turns off when your device's "Reduce motion" setting is on.

### Feedback round 1
- **I asked:**
  - Make the card type something you type in, with faded example text
    ("🔥 Fire") that goes away when you start typing.
  - Fix the left button at the bottom of the FAQ and Controls pages, which was
    one solid green with no readable text.
- **AI did:**
  - Replaced the card type choices with a text box. If what you type includes
    one of the 6 type names, the card uses that type's colors.
  - Added two new error messages for the card type: one for leaving it empty and
    one for going over 20 characters.
  - Found the cause of the button bug: the help pages' link color was also
    applied to the button's text, so it came out green on green.
  - Added version numbers to the script and style links, after testing showed
    the browser kept loading old copies of the files.

### Feedback round 2
- **I asked:**
  - Replace the card theme with a main color and an accent color, each with
    presets and a color wheel.
  - Make an emoji required before the card type name, picked from a list.
- **AI asked me** two questions before building: whether to keep the Classic,
  Night, and High Contrast themes (**I chose to remove them**), and whether the
  emoji list should be a grid or a dropdown (**I chose a grid**).
- **AI did:**
  - Added 8 preset swatches plus a Custom option for each color. Custom opens
    the computer's color wheel.
  - Made `site.js` work out every other color on the site from those two
    colors. It darkens colors until text is readable, so even a pale yellow
    header gets dark text.
  - Added a required grid of 16 emoji in front of the card type name, plus new
    error messages for a missing emoji, type name, or color.
- **AI caught in its own screenshots:**
  - The color dots were squashed, because an older form style was overriding
    them.
  - Pale stat bars were hard to see, so they now get darkened just enough to
    stand out.
  - Jumping to the error list could shift the whole popup up the screen.

---

## Where the AI was wrong or needed correcting

| What happened | How it was caught | Fix |
|---------------|-------------------|-----|
| Timer counted down every 0.4 s (copied from the original game), so it seemed too fast | **I noticed** while playing | Changed to real seconds |
| Fish bursts used the original game's rule (last digit 1, 3, or 6) | **I said** I wanted a different rule | Bursts now go off only when the last two digits match (255 gives 5, 11 gives 1) |
| Flying over the flagpole still finished the level | **I found it** after raising the jump | The cat now has to touch the pole |
| First aura looked like a blob, not a Dragon Ball aura | The AI saw it in its own screenshot | Rebuilt as flames |
| Fish bursts were hidden behind the "COURSE CLEAR!" banner | The AI saw it in its own screenshot | Fish are drawn on top |
| Castle battlements would have cut holes in the tower | The AI caught it reviewing its own code | Redrew them only where they belong |
| The setup popup's Back button showed on step 1 | The AI saw it in its own screenshot | A shared style was overriding "hidden"; fixed in `style.css` |
| Opening the popup removed the link between the Major box and its hint text | The AI's own form test | Fixed the error-clearing code |
| The primary button on the FAQ and Controls pages was green text on green | **I noticed** it | The link color no longer applies to buttons |
| Color swatch dots were squashed into thin ovals | The AI saw it in its own screenshot | Made the swatch style more specific than the general form style |
| A pale main color made the stat bars nearly invisible | The AI saw it in its own screenshot | Bars are darkened until they reach 3:1 contrast |

## What I checked myself

- Played the game and the card in the browser after changes.
- Reviewed the wording on the card and edited it.
- Found and reported a real bug.
- Kept personal info off the public site (first name and major only).
