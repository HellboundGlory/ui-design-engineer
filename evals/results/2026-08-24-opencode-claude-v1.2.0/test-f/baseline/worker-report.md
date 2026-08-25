# Worker report — Plinth editorial landing page

## Run metadata

- **Worktree:** `eval-test-f-baseline` (branch `eval-test-f-baseline-claude`), greenfield, only `.gitignore` and `.opencode/` present at start.
- **Stack chosen:** Vite + React 19 + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite` plugin, CSS-first `@theme` config — no `tailwind.config.js`). No component library (shadcn/etc.) — the page is small and bespoke enough that a component library would add indirection without payoff. No backend/CMS — the newsletter form is a client-side-only interaction (see Gaps).
- **Fonts:** Google Fonts, self-hosted-via-CDN `<link>` tags: **Fraunces** (variable, optical-size axis, used for all display/editorial type) paired with **Inter** (UI chrome, captions, body/nav text). No system-font fallback used for headlines.
- **Tooling added beyond the brief:** `playwright` as a devDependency, used only for local screenshot verification (see Verification below). It is not part of the shipped app.

## The task, as given

"Build an editorial landing page for a high-end architecture publication featuring a hero section, image gallery grid, and newsletter subscription form." Brand descriptor: "quiet, confident, print-magazine-inspired." Free stack choice, greenfield. Explicitly a no-skill baseline run — built from general front-end/design knowledge only, no design-assistance tooling consulted.

## What I built

A fictional quarterly, **Plinth — A Journal of Architecture & Place**, as a single long-scrolling page: masthead → hero → editor's note (lede) → gallery ("The Collection") → newsletter → footer.

**Typography.** Fraunces at large sizes for headlines and pull-quotes, with its italic used deliberately (one word of the hero headline, the dek, the pull-quote, the newsletter confirmation message) rather than bold, to keep the page's loudest gesture typographic rather than chromatic. Inter carries everything functional — nav, captions, form, plate labels, uppercase tracked kickers. This is a real pairing decision, not a default: Fraunces was picked specifically for its editorial/print pedigree (it's designed to read like a serif from a well-set magazine, not a web-safe serif), and Inter was picked to stay out of its way.

**Layout / composition.** Deliberately not the hero+3-cards+CTA shape:
- **Masthead** is two stacked rows (issue/location meta bar, then wordmark + nav + subscribe), like a real magazine's front matter, not a single centered nav bar.
- **Hero** is an asymmetric 7/5 split — headline block flush to the left margin, a full-bleed "photograph" (placeholder plate) occupying the right ~5/12 of the *viewport* (not the content container), so it genuinely bleeds to the browser edge rather than being boxed. No gradient-behind-text hero; the "photo" and the text never overlap.
- **Lede** section breaks rhythm again: a classic drop-cap editorial paragraph on the left, a bordered pull-quote aside on the right — asymmetric 7/4 split, not centered.
- **Gallery** ("The Collection") is a genuine mosaic, not a uniform 3-up card grid: one large 4×2 feature plate, two stacked half-width plates beside it, a 3/3 pair below, and a full-width closing banner plate. Sizes vary because captions call out "arranged as they ran in print — unevenly, on purpose," which is also literally true of the grid.
- **Newsletter** is styled as a printed subscription insert: full-width dark band (only fully saturated dark section on the page, used once for contrast/pacing), asymmetric heading-left/form-right split mirroring the hero, underlined-not-boxed email input, plain-text submit link styling on the button.
- **Footer** returns to a lighter neutral tone, wordmark repeated, three link columns, fine print — standard masthead-publication footer conventions.

**Color.** Warm paper (`#f2ede1`) / near-black ink (`#1c1a16`) as the base pair, one restrained accent (clay/terracotta, `#a8492d`) used only for kickers, the hairline rule under the hero label, link-hover, and focus states — never as a fill or gradient. A second muted "pine" green and a "stone" tan appear only inside the gallery plates' duotone treatment, to vary the placeholder imagery the way a real photo editor would vary a shoot, not as UI chrome. No purple/blue anywhere.

**Placeholder imagery.** Since there's no real photography, each "plate" (`src/components/Plate.tsx`) is a duotone CSS gradient with a small abstract architectural line-motif (colonnade, facade grid, stair, arch, skylight, tower — `src/components/motifs.tsx`) and a subtle SVG-noise grain overlay, captioned like a real plate ("Plate II," a location, a one-line description). The intent was to keep composition/rhythm honest under placeholder conditions rather than let flat color blocks excuse a generic grid.

## Key decisions and reasoning

- **Why no component library:** the page is ~6 components, all bespoke one-offs (a plate, a masthead, a form). shadcn/ui primitives (buttons, inputs) would have pulled in a rounded-corner, shadow-based visual language that fights the flat/hairline-rule print aesthetic I was going for.
- **Why Tailwind v4 CSS-first config:** avoids a separate `tailwind.config.js`; theme tokens (`--color-*`, `--font-*`) live next to the base styles in `src/index.css`, which kept the design-token decisions in one legible place.
- **Why full-bleed hero image:** the brief explicitly calls out "full-bleed treatment" as a way to avoid the generic template shape; implemented by *not* wrapping the hero section in the site's max-width container, so the grid's right column genuinely touches the viewport edge on wide screens.
- **Why a working (if fake) newsletter interaction:** a static-looking form read as unfinished; the form is a controlled React input with local validation (`required`, `type=email`) and swaps to a confirmation message on submit, with no network call, since there's no backend in scope.

## Verification performed

- `npx tsc -b` — clean, no type errors.
- `npm run lint` (oxlint, with the template's default React/TS rule set) — clean, no warnings or errors.
- `npm run build` (`tsc -b && vite build`) — succeeds; output is a single ~206 KB JS bundle (~64 KB gzip) and ~20 KB CSS.
- **Visual verification:** installed Playwright as a devDependency (chromium binary only, no system deps available/needed in this sandbox — confirmed it launches), served the production build with `vite preview`, and captured screenshots into `.eval/screenshots/`:
  1. `01-desktop-full.png` — full page at 1440px.
  2. `02-desktop-hero-viewport.png` — hero above the fold at 1440px.
  3. `03-tablet-full.png` — full page at 834px (iPad-ish).
  4. `04-mobile-full.png` — full page at 390px (iPhone-ish).
  5. `05-desktop-gallery.png` — gallery section close-up.
  6. `06-desktop-newsletter.png` — newsletter section close-up.
  7. `07-desktop-focus-skiplink.png` — first Tab press, confirming the skip-link becomes visible.
  8. `08-desktop-newsletter-submitted.png` — form after submit, confirming the confirmation-state swap works.
  9. `09-desktop-newsletter-input-focus.png` — email input focus state.
  - Also checked the browser console via Playwright (`page.on('console'/'pageerror')`) on load: **zero errors or warnings**.
- **A real bug was caught and fixed by this screenshot pass:** the gallery plates initially rendered with zero visible height on mobile/tablet (only captions showed) because the placeholder image div's only content was absolutely-positioned (motif/grain/label), so it had no intrinsic height, and the responsive grid only defines an explicit row height at the `lg` breakpoint. Fixed by giving `Plate` a default `min-height` floor for base/`sm` that's removed again at `lg` (`src/components/Plate.tsx`, `imageMinHeight` prop). Re-verified with fresh screenshots after the fix (all three widths now show all seven plates correctly).
- **Contrast:** manually computed WCAG relative-luminance contrast ratios (small Node script, not a tool) for every text/background color pairing actually used in the palette before wiring up components, rather than after. Two failures were caught this way *before* they shipped: `ink-faint` on `paper` (3.19:1) and on `paper-deep` (2.48:1) both failed AA for small text — fixed by swapping those two label/fine-print usages to `ink-soft` (6.25–8.05:1). `clay` on `paper-deep` (3.82:1) failed for the footer link hover state — fixed by switching that hover treatment to `ink` text + `clay` underline instead of `clay` text. Final pairings in use all clear 4.5:1 (or 3:1 for large/decorative-only text).
- **Not verified:** no automated accessibility scan (axe or similar) was run — the accessibility work here is manual (semantic landmarks, one skip link, visible focus states, alt-text-free decorative SVGs marked `aria-hidden`, a labeled form input) but not tool-audited. No cross-browser testing beyond Chromium. No testing with an actual screen reader. No Lighthouse/performance audit. No real-content stress test (the copy is illustrative editorial copy I wrote, not tested against, e.g., a much longer real headline or a non-Latin script). No automated visual regression baseline was set up — the screenshots are one-time manual review artifacts, not a CI gate.

## Known gaps / deliberately out of scope

- **No routing / no other pages.** Nav links ("Features," "Criticism," "Archive," footer columns) and the "Read the Feature" CTA are `href="#"` or in-page anchors — there's nothing behind them. This is a landing page, not a site.
- **No real backend for the newsletter form.** It's a client-only success-state simulation; wiring it to a real ESP (Mailchimp/Buttondown/etc.) is a follow-up.
- **No dark mode.** The brand is print-inspired and light-first by design; a dark variant wasn't requested and would need its own duotone-plate retuning to look intentional rather than inverted.
- **No animation/motion.** Hover states exist (opacity/color transitions) but there's no scroll-triggered reveal or page-load animation. Given "quiet, confident" as the brand descriptor, I judged restraint here to be the correct default rather than a gap, but a follow-up pass could add very subtle motion.
- **Gallery grid is desktop-tuned; mobile/tablet fall back to a simpler uniform stack.** The asymmetric mosaic (large/small/wide plate variety) only activates at the `lg` breakpoint; below that, all seven plates get the same floor height in a single or two-column stack. This is a common, defensible editorial-responsive pattern, but it does mean the "arranged unevenly, on purpose" claim in the section's copy is only true on larger screens.
- **Real typography kerning/optical-size tuning is approximate.** Fraunces has a wide optical-size axis (`opsz`) I'm relying on the browser's default interpolation for rather than hand-tuning per breakpoint.
