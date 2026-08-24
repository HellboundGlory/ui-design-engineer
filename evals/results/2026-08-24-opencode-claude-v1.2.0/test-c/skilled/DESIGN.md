# Project Design Memory (DESIGN.md)

## 1. Product Intent

- **What is this product, in one or two sentences?** A conversational workspace for interacting with an AI coding/ops agent: the user sends prompts, the agent streams a markdown response and executes tools (file reads, shell commands, searches) inline as visible, inspectable steps, and the user can attach files as context.
- **What is the core job the user is doing on this screen/product?** Operating and supervising an autonomous agent — reading its reasoning as it streams, verifying what actions it actually took (not just trusting prose claims), and intervening (new prompt, attachment) when needed.
- **What does success feel like to the user?** "I can see exactly what the agent is doing and trust the outcome" — legibility and traceability of tool execution, not just a pleasant chat aesthetic.

## 2. Users & Usage Context

- **Who is the primary user?** A technical operator (developer/engineer) already comfortable with terminals, diffs, and tool output — not a general consumer.
- **How often and in what context do they use this?** Many times a day, at a desk, often alongside code — long sessions, desktop-first.
- **What's the cost of a mistake or a slow interaction here?** High: misreading whether a tool call actually succeeded, or missing that one failed, can mean trusting bad output. State legibility is the primary design constraint, ahead of decoration.

## 3. Visual Personality

- **In three adjectives:** instrumented, legible, quietly confident.
- **References:** Closer to Claude Code / Warp / a terminal-adjacent dev tool than to a consumer chat app (Messages, Intercom widgets). Deliberately different from the "rounded bubble + purple gradient" generic AI-chatbot template look.

## 4. Archetype / Direction

- **Active archetype(s):** Precision Technical (primary), with a narrow Calm Productivity concession for message prose readability (comfortable line-length/leading in the transcript body so long streamed answers stay readable, rather than terminal-dense line-height everywhere).
- **Why this archetype fits:** The defining UI element is a tool-call execution card whose entire job is communicating machine state (pending/running/complete/error) unambiguously and consistently — exactly the "cockpit" reasoning Precision Technical is built for. The audience is technical, the cost of ambiguous state is high, and dark-first is a legitimate, expected default for a developer tool (per the archetype's stated exception).

## 5. Color & Semantic Tokens

Dark mode is the default and primary-designed mode (developer tool exception, `anti-patterns-catalog.md` §Color). Light mode is implemented and fully token-driven but is the secondary mode.

### Dark mode (default)
```css
.dark {
  --background: oklch(0.15 0.008 250);
  --foreground: oklch(0.96 0.004 250);
  --card: oklch(0.19 0.01 250);
  --card-foreground: oklch(0.96 0.004 250);
  --primary: oklch(0.78 0.14 195);         /* cyan-teal — deliberately not purple/blue-violet */
  --primary-foreground: oklch(0.15 0.03 195);
  --muted: oklch(0.23 0.01 250);
  --muted-foreground: oklch(0.64 0.012 250);
  --accent: oklch(0.26 0.012 250);
  --accent-foreground: oklch(0.96 0.004 250);
  --border: oklch(1 0 0 / 10%);
  --ring: oklch(0.78 0.14 195);
  --status-success: oklch(0.72 0.16 150);
  --status-warning: oklch(0.80 0.15 80);
  --status-error: oklch(0.68 0.20 25);
  --status-info: oklch(0.70 0.13 250);
}
```

### Light mode
```css
:root {
  --background: oklch(0.99 0.003 250);
  --foreground: oklch(0.18 0.01 250);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.18 0.01 250);
  --primary: oklch(0.55 0.14 195);
  --primary-foreground: oklch(0.99 0 0);
  --muted: oklch(0.95 0.005 250);
  --muted-foreground: oklch(0.45 0.01 250);
  --accent: oklch(0.94 0.008 250);
  --accent-foreground: oklch(0.18 0.01 250);
  --border: oklch(0.90 0.006 250);
  --ring: oklch(0.55 0.14 195);
  --status-success: oklch(0.50 0.15 150);
  --status-warning: oklch(0.58 0.15 75);
  --status-error: oklch(0.55 0.20 25);
  --status-info: oklch(0.50 0.13 250);
}
```

- **Does this product need a dark mode at all, and which is the default?** Dark is the default (`<html class="dark">`); a toggle in the top bar switches to light. Both are fully implemented via tokens — no hardcoded per-mode values in components.
- Primary (teal) is deliberately a different hue from every status color so it never reads as "warning" or "success" by accident — status color always means the same thing everywhere (tool-call cards, attachment errors, connection dot).

## 6. Typography

- **Display font stack:** Inter (`next/font/google`), ui-sans-serif fallback.
- **Body font stack:** Inter — same family as display, differentiated by weight/size only. A second display face would be pure decoration for a utility transcript UI like this.
- **Code / data (monospace) font stack:** JetBrains Mono, ui-monospace fallback. Used for: code blocks, tool-call names, tool input/output payloads, timestamps, file sizes, token counts.
- **Scale ratio:** 1.2 (Minor Third) — tight, per Precision Technical, since the transcript needs several nested text sizes (message body, tool card header, tool card mono payload, timestamps) without each jump costing much vertical space.
- **Tabular numbers policy:** Enforced on all live-updating numerics (elapsed-time counters on running tool calls, attachment file sizes, timestamps) via `.tabular-nums`.

## 7. Spacing

- **Spacing grid:** 4px base, per Precision Technical density.
- **Exceptions:** Transcript message vertical rhythm uses slightly larger multiples (16/24px) than the tool-card internals (4/8px) — the Calm Productivity concession from §4: prose needs more breathing room than an instrument cluster.

## 8. Density

- **Layout density target:** Compact-to-comfortable hybrid.
  - Form control height: 40px (input bar), 32px (toolbar icon buttons) — sized up slightly from the archetype's 32px floor because these are direct-manipulation targets (WCAG 2.5.8 target size), not dense table rows.
  - Tool-call card internal padding: 8-12px.
  - Container max-width: transcript column caps at 760px for prose readability; sidebar is a fixed 260px rail; both sit inside a full-bleed flex shell (no centered "marketing" max-width wrapper around the whole app).

## 9. Geometry

- **Global radius token (`--radius`):** 8px (`0.5rem`) — soft enough to read as a considered product, tight enough to stay "operator-grade" rather than consumer-rounded. Derived scale: sm=4px, md=6px, lg=8px, xl=12px.
- **Exceptions:** Avatars/status dots are full-round (identity/state glyphs, not containers). Code blocks use `--radius-md`. Tool-call cards use `--radius-lg`.

## 10. Surfaces & Elevation

- **Elevation model:** Border rules. 1px low-opacity borders separate the sidebar, top bar, transcript, and tool-call cards. Shadows are reserved for genuinely floating layers (the attachment-error toast, tooltips, the model-picker popover).
- **Glassmorphism policy:** Forbidden.

## 11. Iconography

- **Primary icon set:** Lucide (`lucide-react`) — used everywhere, no mixing with a second icon set.
- **Default stroke width:** 1.75, size 16px in dense contexts (tool card headers, toolbar), 18-20px for primary actions (send button).
- **Label requirement:** every icon-only control (attach, remove-attachment, collapse toggle, theme toggle, send-while-empty) has an `aria-label`.

## 12. Navigation

- **Primary navigation model:** Persistent sidebar (session list) + top bar (agent identity, connection status, theme toggle). No hamburger — this is a desktop-first operator tool per Precision Technical navigation guidance.
- **How does navigation adapt at narrow viewports?** Below 768px the sidebar becomes an off-canvas panel opened by a menu button in the top bar (a real workflow change, not just reflow); the transcript and input bar become full width.

## 13. Components

- **Primary component/primitive source:** Radix primitives (`@radix-ui/react-collapsible`, `@radix-ui/react-tooltip`, `@radix-ui/react-slot`) with fully bespoke Tailwind styling — i.e. an unstyled-primitive approach in the spirit of shadcn/ui, hand-built rather than scaffolded from the shadcn CLI (no `components.json`/registry pull was needed for the small set of primitives this UI actually uses).
- **Reasoning — registry vs. bespoke (required by this task's brief):** Evaluated `assistant-ui` (a specialized registry purpose-built for AI chat shells, selection-hierarchy level 6) against a bespoke build (level 7). Decision: **bespoke**, for three concrete reasons:
  1. `assistant-ui` ships an opinionated runtime/thread/message state model designed to bind to a real streaming backend (Vercel AI SDK, LangGraph, custom runtime adapters). This project has no backend — the brief calls for demonstrating the *interface states* (streaming markdown, tool-call lifecycle, attachments) with mocked/simulated data. Adopting its runtime would mean building a fake backend adapter just to satisfy a state-management API this project doesn't need, which is accidental complexity in the wrong direction.
  2. The single highest-scoring requirement in this brief is that tool-call cards *visibly and unambiguously* communicate pending/running/complete/error state. That's precisely the part of the UI where full control over markup, motion, and status-color mapping matters most — a registry's own opinionated card markup would need aggressive normalization (color, radius, motion, icon set) to match this project's token system anyway, at which point most of the value of "not writing it myself" is already gone.
  3. Bundle/API-fit: pulling in `assistant-ui` for a self-contained demo with no LLM backend is exactly the "narrow the source, don't reach for the whole library speculatively" case `component-selection.md` warns against (level 6 should be for something a base primitive set genuinely can't cover — a chat transcript with markdown + collapsible cards is well within reach of Radix primitives + `react-markdown`).
  - Where a registry-equivalent *was* worth it: `react-markdown` + `remark-gfm` + `rehype-highlight`/`lowlight` for markdown/code rendering — parsing GFM markdown and tokenizing code correctly is not something to hand-roll; this is the "narrowest source that satisfies the need" call, not a chat-shell framework.
- **Utility/specialized registries in use, if any:** None beyond the above (no shadcn CLI/registry pull, no assistant-ui).

## 14. Data Visualization

- **Charting engine:** Not applicable — no charts in this interface.

## 15. Motion

- **Motion engine:** CSS transitions only (no JS motion library — none of the interactions here need spring physics).
- **Default transition dynamic:** 120-160ms, ease-out for expand/collapse and hover/active state changes, per Precision Technical ("state changes communicated through color and typography rather than animation"). The "running" tool-call indicator uses a slow (1.4s) opacity pulse, not a spinner-heavy animation.
- **Reduced-motion compliance:** Implemented globally (`prefers-reduced-motion` collapses transition/animation durations to ~0) and the running-state pulse falls back to a static "Running…" label with no animation.

## 16. Responsive Behavior

- **Breakpoint scale:** Mobile 375px, Tablet 768px, Desktop 1280px, Wide 1600px.
- **Any viewport this product deliberately does not support?** None excluded; sidebar becomes off-canvas below 768px as noted in §12.

## 17. Accessibility

- **Target:** WCAG 2.2 AA.
- **Known accessibility debt, if inheriting an existing codebase:** N/A — greenfield.
- **Project-specific commitments:** Tool-call state is never color-only — every state also has a text label and a distinct icon. The streaming assistant message region uses `aria-live="polite"` scoped narrowly (see Engineering notes in worker-report.md) so screen reader users get updates without being flooded token-by-token.

## 18. Project-Specific Anti-Patterns (STRICT NEVER)

- Never render a tool-call card whose only state signal is color (icon + text label always accompany the color).
- Never use the primary teal accent for status meaning (success/warning/error/info) — primary is reserved for user actions only, so it never gets confused with a status signal.
- Never wrap the assistant's markdown response in a bordered "bubble" card — it renders as flowing text with an avatar, matching how the archetype's operators actually read long technical output.
- Never introduce a second icon set or a second monospace font.

## 19. Component Sources & Exceptions

- **Primary primitives:** Radix (`Collapsible`, `Tooltip`, `Slot`), hand-styled.
- **Utility registries:** None (see §13 reasoning).
- **Charting engine:** N/A.
- **Documented exceptions:** Code blocks use `rehype-highlight` (built on `lowlight`) with its default bundled `common` language grammar set (~35 mainstream languages: JS/TS/JSX, Python, bash, JSON, CSS, HTML, Markdown, etc.) rather than the full ~190-grammar `highlight.js` set, to keep the bundle addition proportionate to what a demo agent transcript actually needs. This exceeds the ~15KB single-component guardrail but is justified: syntax-highlighted code is a named success criterion, and the theme itself is hand-written against project tokens (`src/app/highlight.css`) rather than an imported third-party color theme.

## 20. Open Questions / Not Yet Decided

- Real backend/streaming-transport integration (SSE/WebSocket wiring) is intentionally out of scope — this build simulates streaming client-side to demonstrate the interface states. Documented, not hidden.
- Multi-session persistence (the sidebar's session list) is mocked/static; no backing store was in scope for this brief.

## 21. Design Decisions Log

- [2026-08-24]: Initialized DESIGN.md for the AI Agent Chat Workspace. Chose Precision Technical archetype (dark-first) blended narrowly with Calm Productivity for transcript prose readability. Chose bespoke component build over `assistant-ui` (reasoning in §13). Chose teal primary / amber-green-red-blue status quad, explicitly non-purple, non-gradient. Chose Inter + JetBrains Mono pairing, 1.2 modular scale, 4px spacing grid, 8px global radius.
