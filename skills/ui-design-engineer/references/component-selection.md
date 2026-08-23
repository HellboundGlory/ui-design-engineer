# Component Selection & Normalization

How to decide where a component comes from, and how to make an imported component look like it was built for this product rather than pasted in from somewhere else.

## The core principle

**Components serve the design; the design serves the product.** Never start component selection by asking "which shadcn blocks are available" — start by knowing what the interface needs to do (from the IA and design intent work), then find the *narrowest* source that satisfies it. Reaching for a registry before you know what you're building is how products end up looking like every other AI-generated app that reached for the same registry.

## Selection hierarchy — always search top-down

1. **Existing local component.** Search the project's own `/components/ui`, `/components/common`, or equivalent directories first. If a `Button` or `Modal` already exists, use it — do not create a parallel one because a registry's version looks nicer in isolation.
2. **Existing project design-system component.** If the project already uses an established system (Mantine, Chakra, MUI, Ant Design, Fluent, Primer, an internal company component package), that system *is* the project's design system. Use its components and its theming API. This level is where the skill most often needs to actively resist its own defaults — see "Respecting non-shadcn systems" below.
3. **Existing project primitive/library.** If the project has unstyled primitives configured (Radix, Base UI, React Aria, headlessui) without a full component layer on top, build on those rather than introducing a second primitive engine.
4. **Existing configured registry.** If `components.json` or an equivalent already points at a registry (shadcn, a custom internal registry), pull new components from that registry rather than a different one — consistency with what's already installed outranks a marginally better alternative registry.
5. **Reference-stack primitive (shadcn/ui).** For a *greenfield* React/Tailwind project with no existing primitive system, shadcn/ui (on Radix or Base UI) is the recommended default: accessible-by-default, unstyled-by-default, and copied into the repo as editable source rather than an opaque dependency.
6. **Compatible specialized registry/library.** For something genuinely specialized that a base primitive set doesn't cover well — complex data grids, rich motion primitives, an AI chat shell — a targeted registry (Origin UI, Motion Primitives, assistant-ui, TanStack Table) is appropriate. Pull the specific piece needed, not the whole library speculatively.
7. **Bespoke implementation.** When no available option fits without unacceptable bundle weight, API mismatch, or visual incompatibility, build it directly (custom SVG, plain CSS/JS). This is not a last resort to be ashamed of — a hand-rolled 40-line component is often better engineering than a 200KB dependency for one control.

Search *every* level above the one you're about to use before installing something new. Skipping straight to level 5 or 6 because it's fast is exactly how visual drift and duplicate primitive engines enter a codebase.

## Respecting non-shadcn systems (important — a common failure mode)

If a project is already built on Mantine, MUI, Chakra, Fluent, Primer, or a custom internal system, **do not introduce shadcn or Tailwind-first primitives into it**, even if shadcn is this skill's reference stack and even if it would be technically easier to reach for. Two component/theming systems in one app means two sets of interaction patterns, two sets of focus-ring styles, two visual languages competing on the same screen — this is one of the most visible and jarring forms of visual drift a user can encounter. Build the new feature in the existing system's idioms: use its theming API to introduce any new tokens, its component composition patterns, its existing form/validation conventions. The bar for introducing a second primitive engine is "this is architecturally justified and the team has agreed to it," not "this is faster for me to build."

## Dependency & integration principles (Default)

- **One primitive engine per project.** Prefer keeping a single primitive system rather than accumulating Radix + MUI + a custom set "because each has a nice modal." Every additional engine is a permanent maintenance and consistency cost.
- **Reuse the existing date/time, form, and validation libraries.** Don't introduce `date-fns` into a project that already standardized on `dayjs`, or a second form library alongside `react-hook-form` because a new component's example used Formik. For a genuinely new React/shadcn project with no existing standard, React Day Picker + `date-fns` is a reasonable default pairing.
- **Bundle budget guardrail (Heuristic, not a hard ban).** Treat any single new UI component that adds more than ~15KB gzipped as a moment to pause and ask whether it's justified, not as an automatic rejection — a genuinely necessary rich-text editor or chart library can reasonably exceed this. Isolate anything heavy (3D, shader effects, large chart libraries) behind a dynamic/lazy import so it doesn't tax the initial page load for users who never reach that view.
- Run `scripts/check-ui-dependencies.js` after adding a new UI dependency — it flags duplicate primitive packages and unusually heavy additions as review triggers, not hard failures.

## Component normalization pipeline

Any component pulled from an external registry or copy-pasted from documentation arrives with *someone else's* design decisions baked in. Before it's considered done, run it through normalization so the final interface reads as one product, not five libraries glued together:

1. **Color normalization.** Replace hardcoded color classes and hex values (`bg-blue-600`, `#1e293b`) with the project's semantic tokens (`bg-primary`, `text-foreground`). See `design-system-tokens.md`.
2. **Geometry normalization.** Replace arbitrary radius classes (`rounded-xl`, `rounded-2xl`) with the project's radius token (`rounded-[var(--radius)]` or its Tailwind theme equivalent). A pasted-in component with its own radius is one of the fastest ways to make a UI look assembled rather than designed.
3. **Iconography normalization.** Swap any icons from a different icon set into the project's standardized set, matching stroke width and sizing conventions. Two icon sets in one interface (e.g., Heroicons next to Lucide) is immediately visible to users even if they can't articulate why something looks off.
4. **Typography normalization.** Replace any font-family or font-size overrides the pasted component brought with it with the project's type scale.
5. **Motion normalization.** Match the project's established transition timing/easing (see `motion-microinteractions.md`), and confirm the component respects `prefers-reduced-motion` — many copy-pasted animated components don't, by default.
6. **Interaction-state and accessibility normalization.** Confirm focus rings, hover/active states, keyboard behavior, and ARIA attributes match the project's conventions and pass the accessibility baseline (`accessibility-wcag.md`) — don't assume a popular registry component is accessible out of the box; verify it.
7. **API convention normalization.** Adjust prop naming, composition pattern (children vs. render props vs. compound components), and file organization to match how the rest of the codebase structures its components.

A component that looks perfect in the registry's own demo but skips this pipeline is very often the visible seam a user notices first — slightly different radius, a stray blue instead of the brand primary, an icon that doesn't quite match the others nearby.
