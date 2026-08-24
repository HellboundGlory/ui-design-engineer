<!--
  Project Design Memory & Engineering Specification (DESIGN.md)
  See ui-design-engineer skill for how this file is used and maintained.
-->

# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** A settings workspace for a SaaS product: account owners and admins manage their profile, API credentials, billing plan, and team access from one place.
- **What is the core job the user is doing on this screen/product?** Occasional, high-consequence configuration and record management — not continuous operation. Each tab is a different task shape: editing a profile form, managing a list of security-sensitive credentials, reviewing/changing a commercial plan, and administering a table of people and their access levels.
- **What does success feel like to the user?** Calm and unambiguous. The user should always know exactly what a change will do before committing to it, especially anything destructive (revoking a key, removing a teammate, canceling a plan) or security-sensitive (viewing a raw API key).

## 2. Users & Usage Context

- **Who is the primary user?** A product's account owner or team admin — technically competent, but not necessarily an engineer for every tab (e.g. billing may be reviewed by an ops/finance-minded owner, API keys by a developer, team permissions by whoever manages headcount).
- **How often and in what context do they use this?** Infrequent, deliberate visits — days or weeks apart, at a desk, rarely on mobile but must still work there (e.g. approving a plan change from a phone).
- **What's the cost of a mistake or a slow interaction here?** High. Revoking the wrong API key breaks a production integration; removing the wrong team member locks out a colleague; canceling a plan has real billing/business consequences. This justifies real confirmation friction on destructive actions — the opposite of a "move fast" consumer app.

## 3. Visual Personality

- **In three adjectives:** Quiet, precise, trustworthy.
- **References:** Closer to Stripe's or Linear's settings surfaces than a marketing dashboard — restrained chrome, real typographic hierarchy, no decorative flourishes. Deliberately not a "control-room" aesthetic (this isn't a monitoring tool) and not consumer-playful (this isn't a lifestyle app).

## 4. Archetype / Direction

- **Active archetype(s):** Calm Productivity, as a deliberate blend — base chrome/density/motion follows Calm Productivity, but two areas intentionally borrow higher-contrast, higher-friction treatment where Calm Productivity's "recede and soften" instinct would be actively wrong:
  - **Destructive actions** (revoke key, remove member, cancel plan) get unambiguous red, explicit confirmation dialogs, and (for the highest-stakes actions) type-to-confirm — Calm Productivity's low-stimulus philosophy does not apply to a moment where the user must feel real friction.
  - **API key secrets** get a distinct monospace/masked treatment that reads as "sensitive data," closer to how a credential manager treats a secret than how a note-taking app treats prose.
- **Why this fits:** This product is used infrequently and deliberately, by a competent but non-vigilant user (unlike Precision Technical's expert-under-load user), and its core object is content the user is *configuring*, not processing at volume (rules out Dense Enterprise) or reading for pleasure (rules out Editorial Premium). Calm Productivity's "content over chrome" instinct maps well: the chrome (tab nav, top bar) should recede; the actual settings content (forms, key list, plan details, member table) should read clearly without competing decoration.

## 5. Color & Semantic Tokens

OKLCH throughout — new token system, no existing palette to extend. Deliberately blue, not purple, to avoid the generic AI-gradient association; desaturated enough to stay calm, with enough chroma on `--primary` to read as a confident, intentional accent rather than a token default.

### Light mode (default)
```css
:root {
  --background: oklch(0.985 0.002 95);
  --foreground: oklch(0.22 0.02 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.02 260);
  --primary: oklch(0.47 0.14 245);
  --primary-foreground: oklch(0.98 0.005 245);
  --muted: oklch(0.96 0.004 95);
  --muted-foreground: oklch(0.5 0.02 260);
  --accent: oklch(0.93 0.03 245);
  --accent-foreground: oklch(0.35 0.1 245);
  --border: oklch(0.9 0.006 95);
  --ring: oklch(0.55 0.16 245);
  --status-success: oklch(0.6 0.13 150);
  --status-success-bg: oklch(0.95 0.04 150);
  --status-warning: oklch(0.72 0.15 75);
  --status-warning-bg: oklch(0.96 0.05 85);
  --status-error: oklch(0.55 0.21 25);
  --status-error-bg: oklch(0.96 0.04 25);
  --status-info: oklch(0.58 0.1 230);
  --status-info-bg: oklch(0.95 0.03 230);
}
```

### Dark mode
```css
.dark {
  --background: oklch(0.19 0.012 260);
  --foreground: oklch(0.94 0.005 95);
  --card: oklch(0.23 0.013 260);
  --card-foreground: oklch(0.94 0.005 95);
  --primary: oklch(0.72 0.13 245);
  --primary-foreground: oklch(0.15 0.02 245);
  --muted: oklch(0.27 0.012 260);
  --muted-foreground: oklch(0.68 0.015 260);
  --accent: oklch(0.3 0.04 245);
  --accent-foreground: oklch(0.85 0.06 245);
  --border: oklch(0.32 0.014 260);
  --ring: oklch(0.72 0.13 245);
  --status-success: oklch(0.72 0.14 150);
  --status-success-bg: oklch(0.28 0.05 150);
  --status-warning: oklch(0.78 0.14 80);
  --status-warning-bg: oklch(0.3 0.05 85);
  --status-error: oklch(0.7 0.18 25);
  --status-error-bg: oklch(0.3 0.07 25);
  --status-info: oklch(0.72 0.09 230);
  --status-info-bg: oklch(0.28 0.05 230);
}
```

- **Does this product need a dark mode?** Not required by the task, but implemented as a first-class Project Decision since settings surfaces are commonly used alongside dark-mode product shells; toggle is available in the top bar. Default is light (this is a "reviewed occasionally" surface, not a developer tool where dark-first is the norm).

## 6. Typography

- **Display/heading font stack:** `'Manrope', ui-sans-serif, system-ui, sans-serif` — a warm geometric grotesk, distinct from the reflexive Inter/system-ui default, used for page titles, section headings, and button/nav labels.
- **Body font stack:** `'Inter', ui-sans-serif, system-ui, sans-serif` — used for body copy, form field values, and descriptive text, chosen for its small-size legibility in dense form contexts.
- **Code / data (monospace) font stack:** `'IBM Plex Mono', ui-monospace, monospace` — used specifically for API key values, invoice/reference IDs, and any tabular numeric column. This is a functional choice (fixed character width matters for scanning a masked secret and for aligning numeric columns), not decorative pairing.
- **Scale ratio:** 1.25 (Major Third) — balanced, disciplined, appropriate to a form-and-table-dominant surface with no need for editorial headline drama.
- **Tabular numbers policy:** Enforced in tables and any billing/usage figures (`font-variant-numeric: tabular-nums`, reinforced by the monospace stack in the API key and invoice columns).

## 7. Spacing

- **Spacing grid:** 8px, per Calm Productivity — generous around content sections (24–32px), tight within related clusters (label + input: 8px; icon + text: 8px).
- **Exceptions:** None yet.

## 8. Density

- **Layout density target:** Comfortable.
  - Table row height: 56px (member/key rows carry a name + secondary metadata line, not just a single value).
  - Form control height: 40px.
  - Card/section internal padding: 24px.
  - Container max-width: 880px for form-centric content (Account Profile), 1040px for table-centric content (API Keys, Team, Billing history).

## 9. Geometry

- **Global radius token (`--radius`):** 10px — soft but restrained, per Calm Productivity.
- **Exceptions:** Avatars are full-round. The masked API key "chip" uses a slightly smaller radius (6px) to read as a distinct, code-like element rather than a normal button/input.

## 10. Surfaces & Elevation

- **Elevation model:** Mostly border rules and whitespace, not shadows — a thin 1px `--border` divider separates sections; the only real elevation is on floating chrome (dialogs, dropdown menus, tooltips), which get a soft shadow to signal they're temporarily above the page.
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** Lucide (`lucide-react`) — thin, quiet, consistent stroke.
- **Default stroke width:** 1.75, size 16–18px inline / 20px in nav.
- **Label requirement:** every icon-only control has an `aria-label` — enforced throughout (settings toggle, copy button, danger-zone icon buttons).

## 12. Navigation

- **Primary navigation model:** Persistent vertical tab list on the left (desktop) — a settings-specific pattern (Stripe/GitHub/Linear-style), not a generic top horizontal tab bar, because each tab represents a substantially different task, not a set of peer views of the same object.
- **Narrow viewport adaptation:** Below `md` (768px), the left tab list collapses into a horizontally scrollable top tab bar with icon+label chips, and content becomes single-column full-width. This is a real workflow adaptation (from "always-visible section list" to "swipeable section switcher"), not just a reflow.

## 13. Components

- **Primary component/primitive source:** Radix UI primitives (Tabs, Dialog, Switch, Tooltip, DropdownMenu, Select, Label, Toast), hand-styled directly against this project's tokens in `src/components/ui/` — the same approach shadcn/ui uses (copied, editable source, not an opaque dependency), applied directly without pulling the shadcn CLI scaffold, since this is a small, single-surface greenfield app.
- **Reasoning:** Greenfield project, no existing primitive system (`inspect-project.js` confirmed empty repo) — Radix is the recommended unstyled-by-default engine for a new React/Tailwind app per the component-selection hierarchy.
- **Utility/specialized registries in use:** None — no data grid, chart, or rich-text library needed for this surface.

## 14. Data Visualization

- **Charting engine:** Not applicable. Billing usage is shown as a small set of labeled progress meters (e.g. "3,200 / 10,000 API calls"), which is a more honest representation of a single-value-vs-limit metric than a chart would be.

## 15. Motion

- **Motion engine:** CSS transitions only.
- **Default transition dynamic:** 150–200ms, `ease-out` for entrances, `ease-in` for exits — quick and functional, not springy (Calm Productivity, not Playful Consumer).
- **Reduced-motion compliance:** All transitions wrapped under `prefers-reduced-motion: reduce` guards in the base stylesheet.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px, Tablet 768px, Desktop 1280px, Wide 1600px.
- **Deliberately unsupported viewports:** None.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known accessibility debt:** None at initial build — see `.eval/worker-report.md` for the actual audit results and any residual findings.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never show a full API key value anywhere by default — always masked until an explicit reveal action, and the full value is only ever transiently visible (auto-reveal on create, never persisted client-side beyond the current view state).
- Never use `--status-error` red for anything other than destructive actions or genuine validation/error states — it must stay a reliable "danger" signal.
- Never let a destructive action (revoke key, remove member, cancel plan) execute directly from a single click with no confirmation surface.
- Never introduce a second icon set, a second primitive/component engine, or a second monospace font alongside IBM Plex Mono.

## 19. Component Sources & Exceptions

- **Primary primitives:** Radix UI (`@radix-ui/react-tabs`, `-dialog`, `-switch`, `-tooltip`, `-dropdown-menu`, `-select`, `-label`, `-toast`), styled in `src/components/ui/`.
- **Utility registries:** None.
- **Charting engine:** None (see §14).
- **Documented exceptions:** Used Radix primitives directly rather than running the shadcn CLI scaffold — same underlying approach (owned, styled source), lower footprint for a single-surface app with no growing component catalog yet. If this app grows into a larger product, revisit and consider adopting shadcn's CLI/registry workflow for consistency as more surfaces are added.

## 20. Open Questions / Not Yet Decided

- Real billing/payment provider integration (Stripe Elements, etc.) is out of scope — the Billing tab uses realistic mock data and a plain (non-PCI-handling) card-details form, since no backend exists in this greenfield build.
- Real auth/2FA backend is out of scope — the Account tab's security section is UI-complete but not wired to a real 2FA provider.

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for the Application Settings Workspace. Chose Calm Productivity as the base archetype with a deliberate high-friction exception for destructive actions and a distinct secret/monospace treatment for API keys. Chose blue (`oklch(0.47 0.14 245)`) over purple for `--primary` to avoid the generic AI-gradient association. Chose vertical settings-style tab nav over horizontal tabs given the four sections' genuinely different task shapes. Chose Radix primitives styled directly over the shadcn CLI scaffold, given the project's small initial surface area.
- [2026-08-24]: Recorded `@radix-ui/react-*` packages as a reviewed exception in `ui-design-engineer.config.json` for `check-ui-dependencies.js` — they're separately-published pieces of one primitive engine (Radix), not competing systems.
- [2026-08-24]: Interactive QA (manual browser pass, not caught by `visual-qa.js` since it only renders the default route) found the API Keys, Team, and Invoice tables overflowed their bordered container at desktop width — the masked-secret column's fixed-width monospace content pushed Scope/Last-used/Actions off-screen. Fixed by: (1) shortening the mask to a fixed 10-dot placeholder regardless of actual key length (also closes a minor info-leak — the old mask revealed the real secret length), and (2) wrapping each data table in an `overflow-x-auto` inner container with `min-w-[…]` on the table, so a table too wide for its column set scrolls horizontally instead of clipping. Applied consistently to all three data tables (API keys, team members, invoices).
- [2026-08-24]: Fixed the Timezone `<Select>` trigger truncating awkwardly (wrapping to two lines at `md` width) by adding `truncate` to the value span — confirmed at 768px and 1440px.
