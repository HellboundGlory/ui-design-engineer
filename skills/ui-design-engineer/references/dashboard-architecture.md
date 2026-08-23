# Dashboard Architecture

How to design a dashboard's information architecture before touching components. Load this alongside `data-visualization.md` for anything involving metrics, monitoring, or analytics.

## Start from the task, not the layout

The single most common way dashboards go wrong is starting with "a grid of cards" as the layout and then fitting data into it. Instead, first answer:

- **Is this monitoring or analysis?** Monitoring means the user is watching for deviation from normal and needs to notice anomalies fast (an ops dashboard, a status page). Analysis means the user is actively exploring data to answer a question they don't yet know the answer to (a business analytics tool, a report builder). Monitoring wants glanceable, stable layouts with strong visual salience on abnormal states. Analysis wants flexible filtering, comparison, and drill-down.
- **Operational or executive?** An operational dashboard serves someone acting on the data right now (an on-call engineer, a support lead) and should surface actionable detail. An executive dashboard serves someone who wants a trustworthy summary and rarely acts directly from the screen — it can be sparser and more narrative.
- **What's the primary question this screen answers?** "Is the system healthy right now?" "How did we do this quarter vs last?" "Which customers need attention today?" Every dashboard should have one or two primary questions it answers at a glance, with everything else in a supporting role.

## Anti-pattern: the generic 3-column KPI card dashboard

Before designing, read the "generic three-column KPI dashboards" and "card fatigue" entries in `anti-patterns-catalog.md`. The default AI-generated dashboard is a row of 3-4 metric cards followed by two chart cards followed by a table card — regardless of what the data actually needs. This is worth actively resisting: it's rarely wrong exactly, but it's never distinctive and often wastes space on decoration (card borders, padding, shadows) that a denser layout would spend on more useful information.

## Choosing a layout pattern

Match the pattern to what the data and task actually need, and feel free to combine several on one screen:

- **Inline metric strip** — when you have 3-8 related headline numbers that should be scanned together, not individually emphasized. A single header bar with metrics separated by thin dividers (not individual cards) keeps them visually grouped as "one summary" rather than fragmenting attention across boxes. This is almost always better than 4+ separate KPI cards.
- **Metric groups** — when metrics cluster into logical categories (e.g., "Traffic," "Errors," "Latency"), group them under a shared label rather than flattening everything into one row.
- **Cards** — reserve for genuinely distinct, independently-scannable entities: a single alert, a single anomaly callout, a single "what changed" summary. A card should earn its border by containing something that's conceptually separable from its neighbors — not just "a metric that needs a box."
- **Charts** — for trend, comparison, and distribution questions. See `data-visualization.md` for chart-type selection; never use a chart where the real answer is better served by a number or a table.
- **Tables** — for anything the user needs to scan row-by-row, sort, filter, or act on individually (a list of endpoints, a list of customers, a list of recent errors). Don't force tabular data into a card grid because cards feel more "designed" — a well-built table (see `dense-enterprise.md` for grid patterns) is often the more honest and more useful choice.
- **Feeds / activity streams** — for chronological events (recent deploys, recent alerts, an audit log). Group by time, keep entries scannable in one line where possible with expand-for-detail.
- **Sparklines** — only ever as a compact trend indicator *next to* a real number, and only when wired to real data with a way to see the full chart or underlying values (tooltip, click-through). A decorative wavy line with no data behind it is a hard anti-pattern — see `anti-patterns-catalog.md`.
- **Timelines** — for status-over-time or sequence-of-events data (deployment history, incident timeline).
- **Heatmaps** — for activity density across two dimensions (time-of-day × day-of-week, geography × metric).
- **Status strips / alert banners** — for system-wide state that needs to be visible regardless of what else is on screen (a persistent "degraded performance" banner). Don't bury critical state inside a card that requires scrolling.
- **Filters and side panels** — for analysis-oriented dashboards where the user needs to narrow scope (time range, segment, environment) before the rest of the screen updates. Keep filters persistently visible near the top, not hidden behind a modal, if they're used frequently.

## Time range and drill-down

Any dashboard showing trend data needs an explicit, visible time-range control (not just "last 7 days" hardcoded) unless the product genuinely only ever needs one fixed window. Design drill-down deliberately: clicking a chart point, a table row, or a metric should have a predictable destination (a detail view, a filtered table, an expanded panel) — don't render interactive-looking elements that don't actually do anything, which is its own form of "fake" UI.

## Alerting and anomaly surfacing

If the dashboard's job includes noticing when something is wrong, don't rely on the user to visually compare a line chart against its own history. Surface deviation explicitly: a status color on the metric itself, a threshold line on the chart, a dedicated "anomalies" or "what changed" section. Passive charts alone are a weak monitoring tool for anything genuinely time-sensitive.

## Density and archetype

How tightly packed a dashboard should be depends heavily on which archetype applies — see `references/archetypes/`. A **Precision Technical** ops dashboard should be dense and information-rich; a **Dense Enterprise** operational grid even more so; a marketing-facing analytics summary aimed at non-technical executives may want more of **Calm Productivity**'s restraint. Don't assume every dashboard wants maximum density by default.
