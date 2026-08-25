# Worker Report — User Profile Card, Two Directions

## 1. Run Metadata

- **Worker:** Claude (Sonnet 5), acting as a baseline (no-skill) worker
- **Mode:** Baseline (no skill) — the `ui-design-engineer` skill/slash-command was deliberately not invoked, not read, and not referenced at any point
- **Branch:** `eval-test-j-baseline-claude`
- **Base commit:** `e4f0a0f` ("Add ui-design-engineer opencode bridge command")
- **Worktree path:** `/home/james/orca/workspaces/ui-design-engineer-eval-greenfield/eval-test-j-baseline`
- **Framework/tooling chosen:** Vite + React 18 + TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`), `react-router-dom` v6 for the three routes, ESLint (flat config, `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`).
  - **Why:** This is the stack I default to for a small greenfield UI demo — fast dev server, first-class TypeScript, and Tailwind gives me fine-grained control over the divergent visual languages the task calls for without fighting a component library's opinions. React Router was added specifically so both directions could live at distinct, linkable routes (`/technical`, `/playful`) plus a side-by-side `/` comparison view, per the task's requirement that both be viewable and directly comparable.
  - The `npm create vite` scaffolding wizard wouldn't run non-interactively in this shell (it kept cancelling), so I hand-wrote the Vite/TS/ESLint config files instead of using the generator — functionally equivalent output.

## 2. The Task As Given

> "Build a User Profile Card twice: once in a precise, technical, data-dense direction, and once in a warm, playful, consumer direction." Build both as separate, clearly-labeled components/pages so both can be viewed and compared directly (e.g. a route or toggle showing each).

No other product context was given; I invented concrete framing for each direction rather than building generic/stereotyped versions.

## 3. What I Built

Three routes sharing one app shell (`src/App.tsx`):
- `/` — side-by-side comparison of both cards with framing copy
- `/technical` — the technical direction alone
- `/playful` — the playful direction alone
- A top nav (`Compare / Orbit (Technical) / Kindred (Playful)`) switches between them.

### Direction A — "Orbit" (precise, technical, data-dense)
`src/components/TechnicalProfileCard.tsx`, data in `src/data/engineerProfile.ts`

Framing: an internal on-call/infrastructure directory card for an SRE-style platform. The imagined viewer is an incident commander scanning the roster under time pressure — the card has to answer "who owns what, how reliable are they, are they online" in one glance, not express personality.

- **Typography:** Space Grotesk for headings/labels (technical-but-humanist sans), JetBrains Mono for all numeric/data values and code-like tokens (service names, timezone, handle) — the mono/sans split is what makes it read as "data" vs. "label."
- **Color:** near-black zinc-900/950 surface, zinc-200/500 text hierarchy, a single semantic accent (emerald for "operational," would shift to amber/rose for degraded/offline — the type supports all three states even though only one is shown).
- **Density:** a 3-column stat grid (uptime SLA, p50/p99 latency, incidents/90d, services owned, on-call hours), a 2x2 meta grid (role/team/location/timezone), and a wrapped tag list of six owned services — deliberately more numbers than a typical "profile card" to sell the data-dense brief.
- **Radius:** none. Every surface is a hard rectangle (`border`, no `rounded-*` at all) reinforcing a technical, instrumentation-panel feel.
- **Motion:** essentially none — the only animation is a slow, subtle pulsing status dot (`animate-pulse-dot`, 2.4s) signaling "live," and 100–150ms color-only transitions on link hover. No transforms, no scale, no shadow growth.

### Direction B — "Kindred" (warm, playful, consumer)
`src/components/PlayfulProfileCard.tsx`, data in `src/data/readerProfile.ts`

Framing: a social reading-tracker app. The imagined viewer is a friend tapping into someone's profile — the card should communicate warmth and personality (mood, streak, current book, friend circle) before any precise metric.

- **Typography:** Quicksand (rounded, friendly display face) for the name and stat numbers, Nunito for body/labels — both are warm humanist sans-serifs, opposite in character from the technical card's mono/geometric pairing.
- **Color:** a soft peach/rose/amber gradient background, multicolor pastel genre pills (rose/violet/amber/teal), a near-black pill button for the primary CTA for contrast. Nothing monochrome.
- **Density:** intentionally sparse — avatar + mood emoji, one bio line, two big stat tiles (streak, books this year), one "currently reading" module with a progress bar, four genre pills, three badge icons, four stacked friend avatars. Far fewer numbers than the technical card; each element is emotionally legible on its own.
- **Radius:** large and consistent — `rounded-[28px]` on the card, `rounded-full` on avatars/pills/buttons, `rounded-2xl` on inner modules. Soft everywhere, no hard corners.
- **Motion:** the whole card lifts and its shadow grows on hover (`hover:-translate-y-1`, 300ms); the streak flame emoji wiggles/scales on card hover (`animate-flame-wiggle`); the Follow button scales up on hover/focus and down on press; badge icons scale slightly on hover. Motion here is decorative and reward-oriented, the opposite of the technical card's near-total stillness.

**Why they diverge this way:** the two systems were built from different assumptions about what the viewer needs in the first 200ms — scannable proof-of-reliability under pressure vs. an emotional read of a person — and every axis (type pairing, palette, density, corner radius, motion budget) was pushed in the corresponding direction rather than varied cosmetically on a single shared template. Deliberately, the two components do not share a base "Card" component or a shared color/spacing token file — sharing infrastructure would have pulled both toward a compromise aesthetic, which defeats the point of the exercise.

## 4. Approach / Reasoning

1. Scaffolded Vite + React + TS + Tailwind v4 + ESLint by hand (interactive `create-vite` wouldn't run headless).
2. Picked two concrete, unrelated product contexts (an internal SRE tool vs. a consumer reading app) so the divergence in tone had a real reason to exist, rather than styling the same fictional "user" two ways.
3. Wrote independent TypeScript domain types (`EngineerProfile`, `ReaderProfile`) with mock data reflecting each context's actual fields — deliberately not a shared generic `Profile` interface, since the two products don't actually track the same information.
4. Built each card as a fully self-contained component with its own typography/color/spacing choices, then assembled a shared app shell (nav + routes) only at the page level so both are independently viewable and also comparable side by side.
5. Verified the build, lint, and the running app in a real browser (see §5), including a couple of viewport widths and a keyboard-focus pass, before writing this report.

## 5. Checks Actually Performed

**Automated:**
- `npm install` — succeeded (191 packages; npm reported 4 vulnerabilities, moderate/high, in transitive deps — not investigated further, noted as a gap below).
- `npm run build` (`tsc -b && vite build`) — **passed**, no type errors. Output: `dist/index.html`, `dist/assets/index-*.css` (29.6kb), `dist/assets/index-*.js` (179.7kb), built in ~400ms.
- `npm run lint` (ESLint flat config) — **passed**, zero warnings/errors.

**Manual, in a real Chrome browser via the MCP browser tools** (dev server on `localhost:5183`):
- Loaded `/` (compare), `/technical`, and `/playful` and visually confirmed both cards render correctly, side by side and individually. Screenshots: `.eval/screenshots/01-compare-desktop-1268w.jpg`, `02-technical-desktop-1268w.jpg`, `03-playful-desktop-1268w.jpg`.
- Checked responsive behavior at two widths: a desktop-ish width (~1268px, the default window content area — OS-level `resize_window` calls did not actually change the render viewport in this environment, confirmed via `window.innerWidth` before/after) and a narrower ~500px width achieved via Chrome DevTools' device-toolbar toggle (`Ctrl+Shift+M`), confirmed via `window.innerWidth`. At 500px the compare page correctly collapses from the two-column `lg:grid-cols-2` layout to a single stacked column, and both cards reflow/wrap their text without overflow. Screenshots: `04-playful-narrow-500w.jpg`, `05-compare-narrow-500w-single-column.jpg`.
  - **Honesty note:** I attempted to hit an exact 375px mobile width via `resize_window` and it did not take effect (window stayed at its prior size); I did not chase this further than the DevTools-toolbar workaround, so true small-phone width (≤375px) was not directly screenshotted, only reasoned about from the Tailwind classes used (all elements use relative widths / `flex-wrap` / `max-w-md`, so I expect it to hold, but I did not visually confirm it).
- Basic keyboard/focus pass on both cards: tabbed from a fresh page load and confirmed via `document.activeElement` in the JS console that focus order is skip-link → nav links (Compare/Orbit/Kindred) → in-card interactive elements (Follow button on the playful card; email/github links on the technical card). Took screenshots confirming a visible focus ring in both cases: `06-playful-focus-skip-link.jpg`, `07-playful-focus-follow-button.jpg`, `08-technical-focus-email-link.jpg`. I did not do a full screen-reader pass (e.g. VoiceOver/NVDA) — only visual focus-ring and DOM-order verification.
- Checked the browser console for errors after a fresh load: no errors, only benign Vite HMR debug logs and two React Router v6→v7 future-flag deprecation warnings (expected, harmless, not addressed since they don't affect current behavior).

All screenshots referenced above are saved under `.eval/screenshots/` in this worktree.

## 6. Unresolved Issues / Known Gaps / Deliberate Scope Cuts

- **Exact 375px viewport not directly verified** — see note in §5. I'm reasonably confident in the layout based on the CSS used but did not get a screenshot at that exact width.
- **No automated tests** (unit/e2e) were written — out of scope for a two-static-view demo; verification was build + lint + manual browser check only.
- **`npm audit` reported 4 vulnerabilities** (3 moderate, 1 high) in transitive dependencies from the scaffolding toolchain. I did not run `npm audit fix` or investigate which packages, since this is a throwaway comparison demo, not a shipped product — flagging it rather than silently ignoring it.
- **No dark-mode variant** — both cards are fixed-palette (the technical card is inherently dark, the playful card is inherently light); no `prefers-color-scheme` handling was built since it wasn't asked for and would have diluted the point of each direction's fixed palette choice.
- **No screen-reader (VoiceOver/NVDA) pass** — only visual focus-ring/keyboard-order checks were performed, not actual assistive-tech testing.
- **Avatar images are CSS-generated initials, not photos** — deliberate choice to keep the demo self-contained without external image dependencies; this is a reasonable stand-in but a real product would use actual avatar photos.
- Did not commit or push anything, per instructions — the worktree is left with uncommitted changes, screenshots, and this report in place.
