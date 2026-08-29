# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** A self-serve application settings workspace for a B2B SaaS product ("Acme"), covering Account Profile, API Key Management, Billing Plan, and Team Permissions in one multi-tab area.
- **What is the core job the user is doing on this screen/product?** Occasional, deliberate configuration and administration — updating personal info, issuing/revoking API credentials, managing a subscription, and inviting/managing teammates. Not high-frequency operating or monitoring.
- **What does success feel like to the user?** Calm confidence — every field is where they expect it, destructive/high-stakes actions (revoking a key, downgrading a plan, removing a teammate) are clearly flagged before they happen, and nothing feels ambiguous.

## 2. Users & Usage Context

- **Who is the primary user?** A product's own customer — often a founder/admin or a technical teammate (issuing API keys implies some technical fluency), but not a full-time power user of this screen specifically.
- **How often and in what context do they use this?** Infrequently — a few minutes, a handful of times a month, at a desk. Not an all-day tool.
- **What's the cost of a mistake or a slow interaction here?** Potentially high per-action (revoking the wrong API key breaks integrations; removing the wrong teammate locks someone out; downgrading a plan loses seats) even though frequency is low — so confirmation friction on destructive actions is warranted even though overall density stays comfortable.

## 3. Visual Personality

- **Three adjectives:** Quiet, precise, trustworthy.
- **References:** Closer to Stripe's and Linear's settings surfaces (restrained chrome, one accent, generous whitespace, monospace for credentials) than a dense back-office admin grid.

## 4. Archetype / Direction

- **Active archetype(s):** Calm Productivity (primary), blended with Precision Technical conventions specifically for API Key Management (monospace credentials, tabular numerals, status chips) and the Billing invoice table.
- **Why this blend fits:** The overall product is low-frequency, customer-facing self-service — Dense Enterprise's spreadsheet density would be wrong here, and Precision Technical's cockpit intensity would be wrong for the whole surface. But API keys and invoice amounts are exactly the kind of scannable, technical, numeric content Precision Technical's typographic rules (mono, tabular-nums) exist for. Calm Productivity supplies the overall chrome, spacing, and restraint; Precision Technical supplies the typographic treatment for credential/financial data specifically.

## 5. Color & Semantic Tokens

OKLCH tokens, single accent (teal-blue), status colors kept perceptually distinct from the primary accent so "info" never gets mistaken for a clickable primary action.

### Light mode
```css
:root {
  --background: oklch(0.99 0.002 95);
  --foreground: oklch(0.2 0.006 264);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.2 0.006 264);
  --primary: oklch(0.5 0.13 200);
  --primary-foreground: oklch(0.99 0.005 200);
  --muted: oklch(0.965 0.003 95);
  --muted-foreground: oklch(0.47 0.012 264);
  --accent: oklch(0.94 0.03 200);
  --accent-foreground: oklch(0.3 0.08 200);
  --border: oklch(0.9 0.005 95);
  --ring: oklch(0.55 0.13 200);
  --status-success: oklch(0.52 0.13 150);
  --status-warning: oklch(0.62 0.15 70);
  --status-error: oklch(0.55 0.2 25);
  --status-info: oklch(0.53 0.13 255);
}
```

### Dark mode
```css
.dark {
  --background: oklch(0.19 0.006 260);
  --foreground: oklch(0.94 0.004 95);
  --card: oklch(0.23 0.007 260);
  --card-foreground: oklch(0.94 0.004 95);
  --primary: oklch(0.72 0.12 200);
  --primary-foreground: oklch(0.15 0.02 200);
  --muted: oklch(0.27 0.008 260);
  --muted-foreground: oklch(0.66 0.01 264);
  --accent: oklch(0.3 0.05 200);
  --accent-foreground: oklch(0.87 0.06 200);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.72 0.12 200);
  --status-success: oklch(0.68 0.15 150);
  --status-warning: oklch(0.76 0.14 70);
  --status-error: oklch(0.68 0.19 25);
  --status-info: oklch(0.7 0.13 255);
}
```

- **Dark mode:** Yes — a real light/dark/system toggle in the top bar, persisted to `localStorage`, defaulting to the OS preference (`prefers-color-scheme`). Settings tools are used by both light- and dark-preference users; no reason to force one.

## 6. Typography

- **Display font stack:** `"Karla", ui-sans-serif, system-ui, sans-serif` — Calm Productivity explicitly favors weight/spacing over display-sized headlines, so display and body share a family; hierarchy comes from weight (600/700) and size restraint (page titles never exceed 22px). Karla over Inter deliberately: Inter (along with Roboto, Fraunces, Geist, Plus Jakarta Sans, Space Grotesk) is called out by name in this skill's own anti-pattern checks as a face so common in AI-generated UI it reads as a default rather than a choice. Karla is one of the humanist sans options the Calm Productivity archetype file itself names, keeps the same quiet/legible register, but has more distinct letterforms (single-story `a`, slightly squarer terminals) that give the interface a bit more personality without breaking the archetype's restraint.
- **Body font stack:** `"Karla", ui-sans-serif, system-ui, sans-serif`
- **Code / data (monospace) font stack:** `"JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace` — used for API key values/prefixes, invoice amounts, and any tabular numeric column.
- **Scale ratio:** 1.25 (Major Third) — balanced, disciplined, not editorial.
- **Tabular numbers policy:** Enforced in tables and any numeric/credential context (API key tables, billing/invoice amounts, usage stats) via `.tabular-nums` / `font-variant-numeric`.

## 7. Spacing

- **Spacing grid:** 8px.
- **Exceptions:** Tight internal clusters (icon+label, form field + helper text) use 4px sub-steps where the 8px grid would look loose next to small type.

## 8. Density

- **Layout density target:** Comfortable.
  - Table row height: 52px (member/invoice/API-key rows — enough for an avatar + two lines of text where needed).
  - Form control height: 40px.
  - Card/widget internal padding: 24px (20px on narrow viewports).
  - Container max-width: 880px content column, centered, inside a full-width app shell.

## 9. Geometry

- **Global radius token (`--radius`):** 10px (`0.625rem`).
- **Exceptions:** Avatars and status dots are always full-round; the top app bar and tab list are square (no radius) since they're edge-anchored chrome, not floating surfaces.

## 10. Surfaces & Elevation

- **Elevation model:** Mostly border-based (1px `--border` hairlines) with tonal contrast (`--card` vs `--background`) for structural separation. Soft shadows reserved for genuinely floating layers — dialogs, dropdown/select menus, tooltips.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** Lucide (`lucide-react`).
- **Default stroke width:** 1.75, size 16–18px inline with text, 20px for standalone action icons.
- **Label requirement:** icon-only controls require an accessible name — enforced throughout (all icon buttons carry `aria-label` or paired visually-hidden text).

## 12. Navigation

- **Primary navigation model:** Top app bar (product mark, theme toggle, account menu) + a horizontal tab list (Radix Tabs, `role="tablist"`) directly under the page header, synced to the URL (`/account`, `/api-keys`, `/billing`, `/team`) via React Router so each tab is deep-linkable and back/forward-safe.
- **Narrow viewports:** Tab list becomes horizontally scrollable (`overflow-x-auto`) with all tabs still visible/reachable by swipe or arrow-key roving focus rather than collapsing into a select or hamburger — there are only four tabs, which stays scannable at any width.

## 13. Components

- **Primary component/primitive source:** Radix UI primitives, styled directly with Tailwind (shadcn-style: copied/owned in `src/components/ui`, not an opaque dependency).
- **Reasoning:** Greenfield project, no existing system (per `scripts/inspect-project.js`). Radix gives correct keyboard/ARIA behavior for tabs, dialogs, dropdown menus, select, switch, toast, tooltip — all genuinely needed here (key creation dialog, revoke confirmation, role select, invite dialog, copy-to-clipboard toast).
- **Utility/specialized registries in use:** None — every component here is a normalized Radix primitive or bespoke (e.g. the plan comparison cards, the usage meter).

## 14. Data Visualization

- Not applicable — this surface deliberately uses tables and stat rows (API key list, invoice history, team roster, plan usage meter) rather than charts. A billing "usage this period" figure is a labeled meter/progress value, not a chart, per `dashboard-architecture.md` guidance to not force a chart where a direct number is the right answer.

## 15. Motion

- **Motion engine:** CSS transitions only (no JS animation library — nothing here needs spring physics).
- **Default transition dynamic:** 120–160ms, `ease-out` for entrances (dialogs, dropdowns, toasts), 100ms `ease-in` for exits. Matches Calm Productivity's "gentle, unobtrusive, no bounce" guidance.
- **Reduced-motion compliance:** Mandatory — global `prefers-reduced-motion` CSS override in `globals.css`.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px / Tablet 768px / Desktop 1280px / Wide 1600px.
- **Tables (API keys, team roster):** horizontally scroll within their own bounded region (`overflow-x-auto` + `contain: layout` on the wrapper — see §19 exception) rather than reflowing to stacked cards below 640px. Verified at 375px: the page itself never pans sideways, only the table's own scroll region does, and the Member/Name + primary status columns stay visible without scrolling. The billing invoice table has few enough columns that it reflows naturally instead of needing this. Revisited from an earlier draft of this doc that claimed a stacked-card reflow; horizontal scroll was what was actually built and verified.
- **Deliberately unsupported viewport:** None.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known accessibility debt:** None. `scripts/visual-qa.js` ran clean (0 axe violations, no structural hard failures, no page-level horizontal scroll) at 375/768/1440/1920px on all four routes after fixes — see §19 for the two verified false-positive exceptions and §21 for what was found and fixed.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never use `--status-error` red for anything other than destructive actions or genuine error states (never as decoration).
- Never introduce a second icon set, a second primitive engine (e.g. adding MUI or a second headless-UI library), or a second date-formatting approach — use `Intl.DateTimeFormat` everywhere dates are formatted.
- Never show a freshly generated API key secret more than once — it must be masked immediately after the creation dialog closes, matching real API credential UX (GitHub, Stripe, etc.).
- Never let the plan-comparison cards default to a purple/blue gradient "upgrade" treatment — the current plan and the recommended plan are distinguished by border/label, not by a gradient fill.

## 19. Component Sources & Exceptions

- **Primary primitives:** Radix UI (`@radix-ui/react-*`), styled with Tailwind v4 (`@theme` tokens), variants via `class-variance-authority`.
- **Utility registries:** None.
- **Charting engine:** None (not applicable — see §14).
- **Documented exceptions:**
  - `scripts/visual-qa.js` flags 2 "focus-obscured" hard findings and several "undersized target" REVIEW findings on every route. Verified via direct DOM inspection (`tabIndex`, `aria-hidden`, computed style) that these are Radix Select's internal native `<select>` "bubble input" elements — `tabIndex="-1"`, `aria-hidden="true"`, visually clipped — kept only for native form/autofill participation. They are unreachable by keyboard and invisible to assistive tech, so "focus obscured" cannot occur for a real user. This is a known limitation of the checker's generic heuristics (it doesn't special-case `aria-hidden` + `tabIndex="-1"`), not a defect. Confirmed exception, not something to "fix" — doing so would break Radix's native form fallback.
  - The `<a>` skip-link and the hidden avatar-upload `<input type="file">` are intentionally 1×1 via the standard `sr-only` visually-hidden technique (skip-link becomes visible on focus; the file input is triggered by a visible "Change photo" button). Both are reported as advisory-only "undersized target" REVIEW findings, expected and correct.
  - `src/components/ui/table.tsx`'s scroll wrapper carries `[contain:layout]` in addition to `overflow-x-auto`. Without it, a verified, reproducible Chromium quirk let the wrapper's *unscrolled* table width leak into `document.documentElement.scrollWidth`, making the entire page pannable ~350px sideways on a 375px viewport even though the wrapper itself visually clipped/scrolled correctly. `contain: layout` isolates the box's layout from ancestors and eliminates it — confirmed via `window.scrollTo` before/after in a real browser, not just the numeric measurement.

## 20. Open Questions / Not Yet Decided

- Real backend/API integration is out of scope for this build — all data is realistic seeded mock state held in React (see `src/lib/mock-data.ts`). A future session wiring a real API should keep the same component/prop contracts.

## 21. Design Decisions Log

- 2026-08-26: Initialized DESIGN.md for the Acme application settings workspace. Chose Calm Productivity blended with Precision Technical (for credential/financial typography) as the archetype; teal-blue single accent in OKLCH; Radix UI + Tailwind v4 as the component foundation; top app bar + URL-synced horizontal tabs as navigation.
- 2026-08-26: `scripts/visual-qa.js` across 4 routes × 4 viewports surfaced 3 real defects, all fixed and re-verified: (1) the four `--status-*` OKLCH lightness values were too light for 4.5:1 text contrast at their `/10` badge-tint backgrounds — re-tuned per-hue (amber needed the most correction: L 0.62→0.45) using a measured-contrast script rather than guessing, since OKLCH's perceptual L doesn't track WCAG's photometric luminance formula uniformly across hues; (2) dimming a whole revoked-API-key table row via `opacity-60` silently dragged already-borderline text under 4.5:1 — removed in favor of the existing "Revoked" badge, which already communicated the state without touching contrast; (3) the Team Permissions role `<Select>` leaked its rich two-line dropdown-item content (label + description) into the closed trigger, visually overlapping adjacent table rows — fixed by giving `<SelectValue>` explicit children instead of relying on Radix's default (which mirrors the selected item's full rendered subtree). Also fixed a document-level horizontal-scroll Chromium quirk (see §19) and a stale-closure bug in the team invite dialog where submitting without pressing Enter on the last-typed email would silently drop it. Route-split the four feature pages via `React.lazy` after a production build flagged a >500KB single chunk; main chunk dropped from 553KB to 379KB (171KB→122KB gzip).
