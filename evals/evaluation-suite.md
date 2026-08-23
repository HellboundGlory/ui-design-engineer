# Evaluation Suite

Twelve benchmark tasks for testing whether the `ui-design-engineer` skill actually changes agent output, and where it still falls short. See `README.md` in this directory for how to run these and the scoring rubric. Tests **H**, **K**, and **L** are the highest-priority signal — they test non-drift, non-shadcn preservation, and tool-independence, which are the three failure modes competitor tools handle worst.

---

### Test A — High-Throughput Analytics Dashboard

**Prompt:** "Build a real-time API traffic analytics dashboard with error rate trends, throughput charts, latency percentiles, and an active endpoint table."
**Setup:** Greenfield React + Tailwind project, no existing DESIGN.md.
**Success conditions:** Chooses (or reasons toward) an appropriate archetype rather than defaulting to a generic 3-card KPI row; groups related metrics rather than fragmenting into individual cards; uses tabular numerals in numeric columns; charts are wired to real (even if mocked) data with axes/legends, not decorative; endpoint table supports sort/filter.
**Failure conditions:** Produces the generic three-column KPI card + two chart cards + table card layout regardless of the data's actual needs; decorative sparklines with no underlying data; low information density from over-padding.
**Scoring areas:** Hierarchy & Layout, Visual Identity & Non-Slop, Design System Memory, Engineering Quality.

---

### Test B — Developer Observability & Log Viewer

**Prompt:** "Build a developer observability log streaming panel with log severity filtering (INFO, WARN, ERROR), JSON payload inspector, keyboard shortcut support, and search."
**Setup:** Existing React project with an established dark-mode design system already in place.
**Success conditions:** Preserves the existing design system rather than introducing new tokens/components; severity levels use consistent, meaningfully differentiated color coding; JSON inspector is genuinely usable (collapsible, syntax-aware) not a raw `<pre>` dump; keyboard shortcuts are real and documented, not just implied by a shortcut hint UI element.
**Failure conditions:** Visual drift from the existing system; keyboard shortcuts mentioned in the UI but not wired; severity colors indistinguishable or inconsistent with any existing status color usage.
**Scoring areas:** Design System Memory & Non-Drift, Engineering Quality, Accessibility.

---

### Test C — Conversational AI Workspace

**Prompt:** "Build an AI agent chat interface with streaming markdown text, collapsible tool-call execution cards, file attachments, and a prompt input bar."
**Setup:** Greenfield Next.js + Tailwind project.
**Success conditions:** Tool-call cards communicate state (pending/running/complete/error) clearly; markdown rendering handles code blocks, lists, and streaming partial content without layout jank; input bar supports multiline input and a clear send affordance; considers whether an existing specialized registry (e.g., assistant-ui) is justified versus bespoke build, per the component selection hierarchy.
**Failure conditions:** Generic chat-bubble styling indistinguishable from a thousand chat templates; tool-call cards that don't actually communicate execution state; attachment UI with no error/size-limit handling.
**Scoring areas:** Visual Identity & Non-Slop, Hierarchy & Layout, Engineering Quality.

---

### Test D — Application Settings Workspace

**Prompt:** "Build a multi-tab application settings workspace covering Account Profile, API Key Management, Billing Plan, and Team Permissions."
**Setup:** Greenfield React + Tailwind project.
**Success conditions:** Sensible information architecture across tabs (not just visually similar forms repeated 4 times); destructive actions (revoke key, remove team member, cancel plan) have appropriate confirmation friction; form validation and error states are designed, not just happy-path; API key display handles the reveal/copy/regenerate pattern securely (masked by default).
**Failure conditions:** All four tabs look identical in structure regardless of very different content needs; no confirmation on destructive actions; API keys shown in plaintext by default.
**Scoring areas:** Hierarchy & Layout, Accessibility, Engineering Quality.

---

### Test E — Enterprise Data Administration Grid

**Prompt:** "Build an enterprise customer administration system with multi-column sorting, row selection, bulk actions menu, status badge chips, and pagination."
**Setup:** Greenfield project, told the audience is internal ops staff using this all day.
**Success conditions:** Reaches for Dense Enterprise archetype reasoning (or an explicit justified alternative); genuinely dense, scannable table, not a card-grid reinterpretation of tabular data; bulk action bar appears contextually on selection; status chips are consistent and low-visual-weight, not attention-grabbing.
**Failure conditions:** Card-based reinterpretation of what should be a table; generous consumer-app padding inappropriate for 8-hour daily use; no bulk-action support despite row selection existing.
**Scoring areas:** Visual Identity & Non-Slop (density-appropriateness specifically), Hierarchy & Layout, Accessibility.

---

### Test F — Editorial Creative Landing Page

**Prompt:** "Build an editorial landing page for a high-end architecture publication featuring a hero section, image gallery grid, and newsletter subscription form."
**Setup:** Greenfield project, brand described as "quiet, confident, print-magazine-inspired."
**Success conditions:** Reaches for Editorial Premium reasoning; commits to a real display typography choice, not a system-font default; breaks from the generic hero+3-cards+CTA template shape with asymmetry or full-bleed treatment; restrained color, photography/typography-led rather than gradient/icon-led.
**Failure conditions:** Generic SaaS marketing template shape; purple/blue gradient hero; centered-everything layout with no rhythm variation; system-font headlines.
**Scoring areas:** Visual Identity & Non-Slop, Hierarchy & Layout.

---

### Test G — Refactoring Legacy Interface

**Prompt:** "Refactor this unstyled HTML table and messy form controls into a cohesive, accessible modern interface matching our project tokens." (Provide a bare, unstyled HTML table + form as input.)
**Setup:** Existing project with an established DESIGN.md and token system.
**Success conditions:** Resulting interface uses the project's actual tokens (verified via `scripts/validate-design-tokens.js` / `audit-hardcoded-colors.js`), not a fresh palette; semantic HTML preserved/improved rather than replaced with div soup; accessibility improved, not just visually modernized.
**Failure conditions:** New hardcoded colors introduced instead of using project tokens; loses semantic structure (table becomes a div grid) without a good reason; accessibility regressions during the "modernization."
**Scoring areas:** Design System Memory & Non-Drift, Accessibility, Engineering Quality.

---

### Test H — Non-Drifting Feature Addition ⭐ high priority

**Prompt:** "Add a Webhook Configuration modal to our existing billing settings page." (Provide an existing, polished billing interface with an established visual language.)
**Setup:** Existing, visually polished project with clear established conventions (radius, spacing, color, component patterns) but no explicit DESIGN.md.
**Success conditions:** Agent runs `scripts/inspect-project.js`, infers the existing visual conventions by reading actual code (not just assuming defaults), and the new modal is visually indistinguishable in quality/style from hand-built neighboring components — same radius, same spacing rhythm, same button/input styling, same color usage. Ideally, the agent proposes instantiating a DESIGN.md capturing what it inferred, for future consistency.
**Failure conditions:** The new modal is functionally correct but visibly different — different radius, different shadow treatment, a different font weight scale, a component pulled from a registry without normalization. This is the single most damaging failure mode for real-world adoption and should be weighted heavily.
**Scoring areas:** Design System Memory & Non-Drift (primary), Engineering Quality, Visual QA Loop Execution.

---

### Test I — Multimodal Vision-to-Code Recreation

**Prompt:** "Recreate this interface screenshot as a responsive React component matching our local Tailwind tokens." (Provide a screenshot of an existing polished interface.)
**Setup:** Existing project with a token system that differs from the screenshot's own palette (i.e., the screenshot is a *reference for layout/composition*, not a literal palette to copy).
**Success conditions:** Layout, spacing, and component composition are faithfully recreated; colors are mapped to the *project's own* semantic tokens rather than the screenshot's literal hex values, unless told otherwise; responsive behavior is reasoned about even though the screenshot only shows one viewport.
**Failure conditions:** Hardcodes colors sampled directly from the screenshot instead of using project tokens; treats the screenshot as single-viewport truth with no responsive reasoning.
**Scoring areas:** Design System Memory & Non-Drift, Engineering Quality, Responsiveness.

---

### Test J — Archetype Divergence Benchmark

**Prompt:** "Build a User Profile Card twice: once in a precise, technical, data-dense direction, and once in a warm, playful, consumer direction." (No project context — greenfield, direction is the whole point.)
**Success conditions:** The two outputs are genuinely, substantially different — different typography personality, different radius, different density, different color approach, different motion — not the same component with a palette swap. Each direction should independently read as a coherent, considered design, not a caricature of the archetype.
**Failure conditions:** Two visually similar cards with only the accent color changed; either direction reading as a shallow stereotype rather than a genuine design point of view; either direction failing its own accessibility baseline in pursuit of the aesthetic.
**Scoring areas:** Visual Identity & Non-Slop (primary — this is specifically testing range, not just one good output), Hierarchy & Layout.

---

### Test K — Existing Non-shadcn Design System ⭐ high priority

**Prompt:** "Add a major feature page to our application." (Provide an existing, polished application built entirely on Mantine, MUI, Primer, or a custom internal component library — explicitly *not* shadcn/Tailwind.)
**Success conditions:** The agent identifies the existing system via `scripts/inspect-project.js` / `references/component-selection.md`'s hierarchy, and builds the entire new feature using that system's components and theming API. No shadcn, no Radix, no Tailwind utility classes introduced alongside the existing system's own styling approach.
**Failure conditions:** Introduces shadcn/ui, Tailwind, or Radix primitives into a project that didn't have them, creating two competing component/styling systems in one app — this is an explicit, named failure mode the skill exists to prevent, and any occurrence should be treated as a critical failure regardless of how polished the new page looks in isolation.
**Scoring areas:** Design System Memory & Non-Drift (primary, and should gate the score — a beautiful page that violates this test is still a failure), Engineering Quality.

---

### Test L — Limited Tool Environment ⭐ high priority

**Prompt:** "Design and implement a user interface for [any Test A-style request]." Run in an environment where no browser-rendering MCP, no component-discovery MCP, and no accessibility-audit MCP are configured, and `playwright`/`axe-core` are not installed as project dependencies.
**Success conditions:** The agent correctly detects the missing capabilities (via attempting `scripts/visual-qa.js` and observing its graceful, explicit failure message) and falls through to the documented fallback chain: local script attempts, static reference tables, and the manual checklists in `checklists/`. It explicitly reports that visual QA was a manual/static review, not an automated one — never claiming a screenshot or axe scan happened when it didn't.
**Failure conditions:** The agent silently skips visual/accessibility QA without saying so; fabricates or implies that a rendering/axe pass occurred; stalls or fails the task entirely instead of degrading gracefully through the fallback chain.
**Scoring areas:** Visual QA Loop Execution (primary — specifically testing honest degradation, not perfect output), Accessibility.
