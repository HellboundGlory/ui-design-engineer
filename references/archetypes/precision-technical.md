# Archetype: Precision Technical

## When this reasoning applies

The product is a tool an expert uses for hours at a time to monitor, debug, configure, or operate a system: observability dashboards, API/infra consoles, trading and fintech terminals, developer tooling, network/security consoles, data platforms, admin backends for technical products. The user's success metric is "I found the anomaly fast" or "I configured this correctly the first time," not "I enjoyed browsing this." Trust is built through legibility and consistency, not warmth.

Do not reach for this archetype just because a request mentions "dashboard" — a marketing analytics dashboard for a non-technical marketer may want **Dense Enterprise** or even **Calm Productivity** instead. Precision Technical is for *technical operators*, not every data screen.

## Design intent

Every pixel should feel instrumented. The interface reads like a cockpit: nothing decorative, everything legible at a glance, state changes communicated through color and typography rather than animation. The emotional register is competence and control, not delight.

## Starting values (override freely in DESIGN.md)

- **Density**: Compact. Table rows 32px, form controls 32–36px, widget padding 8–12px.
- **Spacing scale**: 4px grid — increments feel too generous on an 8px grid at this density.
- **Radius**: Tight, 2–6px. Rounded corners should be barely perceptible; they exist to soften edges, not to signal friendliness.
- **Typography**: A neutral, high-legibility sans (Inter, IBM Plex Sans, Geist Sans) for UI chrome; a true monospace (JetBrains Mono, IBM Plex Mono, Berkeley Mono) for anything numeric, tabular, or code-adjacent — IDs, timestamps, latencies, log lines. Tabular figures (`font-variant-numeric: tabular-nums`) are mandatory wherever numbers update live, or digit widths will jitter and the eye will lose its place.
- **Contrast**: High. This is a "used under fluorescent light at 2am during an incident" interface — don't soften contrast for aesthetics.
- **Color**: Restrained neutral base (near-black/near-white or true dark-slate greys), one brand accent used sparingly for primary actions, and a disciplined status palette (success/warning/error/info) that is *the same everywhere* — a red badge means the same severity in the table as it does in the chart as it does in the alert banner.
- **Surfaces**: Border-based separation over shadows. A 1px border at low-opacity foreground color reads as "structure"; a soft drop shadow reads as "marketing card." Reserve elevation shadows for genuinely floating layers (popovers, menus).
- **Iconography**: Small (14–16px), thin stroke (1.5–1.75), used as scannable glyphs next to labels — never as decoration.

## Data visualization

Charts are instruments, not illustrations. Favor line charts for trends over time, bar charts for comparison, and heatmaps for activity density. Always show axes, units, and a legend when more than one series is present. Never render a sparkline without a way to see the underlying numbers (tooltip, adjacent value, or click-through). See `references/data-visualization.md` for series limits and chart selection.

## Motion

Minimal and functional: state transitions (row expand, panel open, value update) should be fast (100–150ms) and linear or ease-out — no springs, no bounce. Motion here communicates "the system responded," not personality. Respect `prefers-reduced-motion` by cutting non-essential transitions entirely rather than just slowing them.

## Navigation tendencies

Persistent sidebar or top rail with dense, scannable labels. Command palettes (Cmd+K) are a strong fit — technical users expect keyboard-first navigation. Avoid hiding primary navigation behind hamburger menus even on smaller viewports if the product is desktop-first (many of these tools are never used on a phone).

## Common mistakes agents make with this archetype

- Applying generous consumer-app padding "for breathing room," which halves the information density the user actually needs.
- Rounding everything `rounded-xl` because it looks modern — it reads as consumer, not operator-grade.
- Using color decoratively (gradient headers, colored card backgrounds) instead of reserving color for status meaning.
- Building fake/decorative sparklines instead of wiring real data.
- Skipping the mono font on numeric columns, causing tabular jitter.

## When NOT to use this archetype

Skip it when the audience is non-technical (marketing dashboards for executives, consumer settings pages), when the product's brand identity is deliberately warm or playful, or when the task is a low-frequency, high-stakes single flow (onboarding, checkout) where calm reassurance matters more than density.
