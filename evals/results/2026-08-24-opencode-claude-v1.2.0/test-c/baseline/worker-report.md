# Worker report — AI agent chat interface (baseline, no-skill arm)

## Run metadata

- **Stack:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4. Scaffolded with `create-next-app` into this worktree (had to scaffold into a scratch directory first and merge in, since `create-next-app` refuses a target containing existing files — the pre-existing `.gitignore` and `.opencode/` were preserved).
- **Dependencies added beyond the scaffold, and why:**
  - `react-markdown` + `remark-gfm` — streaming-safe markdown rendering with GFM tables/lists/strikethrough. Chosen over a hand-rolled parser because partial/incomplete markdown during streaming is a known-hard edge case and `react-markdown`'s remark-based AST handles unterminated constructs (e.g. an open code fence mid-stream) gracefully without extra work.
  - `react-syntax-highlighter` (`PrismLight`, not the full `Prism` bundle) — code block highlighting. Only explicitly registered a handful of languages (tsx, ts, js, jsx, json, bash, diff, css, markdown, python) rather than importing the ~200-language bundle, to keep the client bundle down; unregistered languages fall back to a plain monospace block instead of throwing.
  - `lucide-react` — icon set for status glyphs, tool icons, composer controls.
  - `playwright` (dev-only) — self-installed for manual visual verification via screenshots (see below). Not wired into CI/test scripts, just used as a one-off verification tool.
- No component registry (shadcn CLI, Vercel AI Elements, assistant-ui, etc.) was pulled in — see "Key decisions" below for the reasoning.

## The task as given

Build an AI agent chat interface with streaming markdown text, collapsible tool-call execution cards, file attachments, and a prompt input bar, on a greenfield Next.js + Tailwind stack, establishing the entire visual direction from scratch.

## What I built and why

The app is a single-page "Agent Console" (`src/app/page.tsx` → `ChatApp`) with:

- **`ChatApp`** (`src/components/chat/ChatApp.tsx`) — top-level state owner: message list, composer text/attachments, streaming/abort state.
- **Message model** (`src/lib/types.ts`): assistant messages are an ordered list of *blocks* (`text` | `tool-call`), not a flat string + a separate tool-call bucket. This mirrors how real agent transcripts interleave prose and tool execution ("I'll search the codebase... [tool card] ...found it, here's the fix... [tool card]"), and is the main structural decision that makes the tool-call cards feel load-bearing rather than decorative.
- **`mock-agent.ts`** — a small scripted streaming engine (`runAgentTurn`) that emits an event stream (`text-delta`, `tool-call-start/running/complete/error`, `message-done`) consumed by a pure reducer (`chat-reducer.ts`). It picks between a few scenarios (a clean edit-and-test flow, a research/summary flow, and an **error-recovery flow** — triggered by words like "bug"/"error"/"broken" — where a `run_tests` tool call genuinely fails, the agent narrates the failure, patches, and re-runs). This was deliberate: the brief calls out that tool-call cards must *actually* communicate state, so the mock needed a real failure path, not just three colors nobody ever sees.
- **`ToolCallCard`** — status is encoded redundantly (icon shape + color + text badge + live elapsed timer + indeterminate progress bar while running), not by color alone. Cards auto-collapse ~1.1s after reaching `complete` to keep a long transcript scannable, but force back open on `error` and respect a manual user toggle that overrides the auto-behavior. Input/output are rendered as real (mocked) JSON/log text in monospace, not lorem ipsum.
- **`MarkdownContent` / `CodeBlock`** — code fences get a header (language + copy button) and syntax highlighting; the block-splitting scheme means a growing/streaming code block doesn't force the whole message to re-layout — only the block whose text changed re-renders.
- **Attachments** (`lib/attachments.ts`, `AttachmentChip`, composer tray) — real validation: 10 MB per-file cap, a blocked-extension denylist (`.exe`, `.zip`, `.sh`, etc.), a 6-file-per-message cap, simulated async upload with a progress bar, and a hard block on sending while any attachment is `uploading` or `error` (the composer footer text says as much, and I caught + fixed a bug during verification where the `error` case wasn't actually wired into the send-guard — see Checks below).
- **`PromptInputBar`** — auto-growing textarea (caps at 200px, then scrolls), Enter-to-send / Shift+Enter-for-newline, drag-and-drop file zone, a Send button that swaps to a Stop (square) button while streaming, wired to an `AbortController` so generation can actually be cancelled mid-stream.
- **Visual direction:** a dark-first "developer console" aesthetic rather than a symmetric two-tone chat-bubble UI — assistant turns render as unbubbled flowing content (like a document) with a small avatar, while only the user turn gets a bubble (right-aligned, tinted, not a bright solid color). Status colors (slate/amber/emerald/rose) are kept separate from the product accent (teal), and a light/dark toggle is implemented via a `data-theme` attribute + blocking inline script (no flash-of-wrong-theme), persisted to `localStorage`.

## Key decisions

**Bespoke build vs. a chat-UI registry:** I considered shadcn's chat blocks / Vercel AI Elements / assistant-ui. I decided against pulling one in: the brief's core differentiator (tool-call cards that *actually* communicate state, an interleaved block model, a non-generic visual identity) is exactly the part those registries are weakest at — they're built around a plain message-bubble primitive and would have meant fighting the library's assumptions rather than using them. Given this is a greenfield project with no existing design system to respect, a bespoke build let the tool-call state machine and the block-interleaving model drive the component design directly. `react-markdown` and `react-syntax-highlighter` were kept because they're rendering utilities, not visual systems — they don't impose a look.

## Checks actually performed

- `npx tsc --noEmit` — clean.
- `npm run lint` (ESLint 9 flat config with `eslint-config-next` + the newer `react-hooks` purity/effect rules) — clean. This caught three real issues I fixed: an impure `Date.now()` call during render in a timer hook, a `setState` called synchronously in an effect body (theme init — replaced with a lazy `useState` initializer that reads the DOM once), and the same pattern in the tool-card collapse logic (replaced with React's "adjust state during render" pattern for the error-forces-expand case).
- `npm run build` (production build) — clean, static output.
- **Manual visual verification via a self-installed, headless Playwright script** (`.eval/scripts/shoot.mjs`) driving a production build on `localhost:4173`. This is real browser rendering, not a mock. It walked: empty state in both themes, attaching a valid file and an 11 MB file (confirms the 10 MB limit and error UI fire for real), removing the errored attachment and confirming send re-enables, sending a message that triggers the error-recovery scenario, and capturing the pending→running→complete→**failed** tool-card states, the streamed diff code block, the final multi-block response, manually re-expanding an auto-collapsed card, and a full transcript in light mode. Screenshots are in `.eval/screenshots/01`–`10`, referenced by number above. This pass is also what caught the `error`-attachment send-guard bug and a misleading `Loader2` icon being used as a *static* tool-type icon (looked like a permanent spinner on a completed "Re-running test suite" card) — both fixed before the final screenshot pass.

**What I did NOT verify:** no automated accessibility audit (no axe-core/Lighthouse run — I relied on semantic markup, `aria-label`/`aria-expanded`/`role="group"` attributes, and visible focus states by code review only, not a screen reader pass). No keyboard-only end-to-end walkthrough. No cross-browser testing (Chromium only, via Playwright's fallback build for this OS — no official Playwright browser support here, so no Firefox/WebKit pass either). No mobile/narrow-viewport screenshot, though the layout uses relative widths and `max-w` constraints that should reflow reasonably. No unit or component tests were written. No real backend — streaming, tool execution, and uploads are all client-simulated, as the brief allowed.

## Known gaps / deliberately out of scope

No message editing or regenerate, no conversation persistence (refresh loses history — no localStorage/IndexedDB), no multi-conversation/sidebar, no i18n, no virtualization for very long transcripts, no PDF/image content preview beyond a thumbnail, and the syntax-highlighter language set is intentionally small (bundle-size trade-off) with a plain-text fallback for anything else.
